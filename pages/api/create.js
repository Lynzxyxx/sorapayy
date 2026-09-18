import { adminDb, requireUser } from "../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireUser(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.message });

  const { productId, target, quantity } = req.body || {};
  if (!productId || !target || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "Data order tidak lengkap." });
  }

  const uid = auth.decoded.uid;

  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const userRef = adminDb.collection("users").doc(uid);
      const productRef = adminDb.collection("products").doc(productId);

      const [userSnap, productSnap] = await Promise.all([tx.get(userRef), tx.get(productRef)]);

      if (!userSnap.exists) throw new Error("User tidak ditemukan.");
      if (userSnap.data().banned) throw new Error("Akun kamu sedang dibanned.");
      if (!productSnap.exists || !productSnap.data().active) throw new Error("Layanan tidak tersedia.");

      const product = productSnap.data();
      // price = harga per "unit" (mis. per 100), margin sudah ditambahkan saat admin set harga
      const totalCost = Math.ceil((product.price / (product.unit || 100)) * quantity);

      const currentBalance = userSnap.data().balance || 0;
      if (currentBalance < totalCost) throw new Error("Saldo tidak mencukupi.");

      const orderRef = adminDb.collection("orders").doc();
      tx.update(userRef, { balance: currentBalance - totalCost });
      tx.set(orderRef, {
        uid,
        userEmail: userSnap.data().email,
        productId,
        productName: product.name,
        target,
        quantity: Number(quantity),
        cost: totalCost,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { orderId: orderRef.id, totalCost };
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(400).json({ error: err.message || "Gagal membuat order." });
  }
}
