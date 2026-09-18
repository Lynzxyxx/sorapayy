import { adminDb, requireAdmin } from "../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// Data disimpan di 2 koleksi:
// - "products"     -> field publik (boleh dibaca user biasa): name, category,
//                      price (harga jual final), unit, minOrder, maxOrder,
//                      description, active
// - "productCosts" -> field rahasia (HANYA admin, id dokumen sama dengan
//                      products): basePrice (harga modal), marginPercent
// Ini supaya harga modal & margin tidak bisa dilihat lewat Firestore oleh
// user biasa walau mereka baca koleksi "products" langsung dari client.

async function getDefaultMargin() {
  const snap = await adminDb.collection("config").doc("settings").get();
  return snap.exists ? (snap.data().marginPercent ?? 20) : 20;
}

function computeSellPrice(basePrice, marginPercent, defaultMargin) {
  const margin =
    marginPercent !== "" && marginPercent !== null && marginPercent !== undefined
      ? Number(marginPercent)
      : defaultMargin;
  return Math.ceil(Number(basePrice) * (1 + margin / 100));
}

export default async function handler(req, res) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.message });

  if (req.method === "GET") {
    const [productsSnap, costsSnap] = await Promise.all([
      adminDb.collection("products").orderBy("createdAt", "desc").get(),
      adminDb.collection("productCosts").get(),
    ]);
    const costsById = {};
    costsSnap.forEach((d) => (costsById[d.id] = d.data()));

    const products = productsSnap.docs.map((d) => {
      const data = d.data();
      const cost = costsById[d.id] || {};
      return { id: d.id, ...data, basePrice: cost.basePrice, marginPercent: cost.marginPercent };
    });
    return res.status(200).json({ products });
  }

  if (req.method === "POST") {
    const {
      id, name, category, basePrice, marginPercent, unit,
      minOrder, maxOrder, description, active,
    } = req.body || {};

    if (!name || basePrice === undefined || basePrice === "") {
      return res.status(400).json({ error: "Nama dan harga modal wajib diisi." });
    }

    const defaultMargin = await getDefaultMargin();
    const price = computeSellPrice(basePrice, marginPercent, defaultMargin);

    const publicPayload = {
      name,
      category: category || "Lainnya",
      price,
      unit: Number(unit) || 100,
      minOrder: Number(minOrder) || 1,
      maxOrder: Number(maxOrder) || 100000,
      description: description || "",
      active: active !== false,
      updatedAt: FieldValue.serverTimestamp(),
    };

    const costPayload = {
      basePrice: Number(basePrice),
      marginPercent: marginPercent === "" || marginPercent === undefined ? null : Number(marginPercent),
    };

    const docId = id || adminDb.collection("products").doc().id;

    await Promise.all([
      adminDb.collection("products").doc(docId).set(
        id ? publicPayload : { ...publicPayload, createdAt: FieldValue.serverTimestamp() },
        { merge: !!id }
      ),
      adminDb.collection("productCosts").doc(docId).set(costPayload, { merge: true }),
    ]);

    return res.status(200).json({ success: true, id: docId });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id wajib diisi." });
    await Promise.all([
      adminDb.collection("products").doc(id).delete(),
      adminDb.collection("productCosts").doc(id).delete(),
    ]);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
