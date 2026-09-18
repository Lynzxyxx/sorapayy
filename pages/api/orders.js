import { adminDb, requireAdmin } from "../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const VALID_STATUSES = ["pending", "processing", "completed", "cancelled"];

export default async function handler(req, res) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.message });

  if (req.method === "GET") {
    const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").limit(200).get();
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.status(200).json({ orders });
  }

  if (req.method === "POST") {
    const { orderId, status } = req.body || {};
    if (!orderId || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "orderId / status tidak valid." });
    }

    const orderRef = adminDb.collection("orders").doc(orderId);
    const snap = await orderRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Order tidak ditemukan." });

    const order = snap.data();

    // Jika dibatalkan setelah sebelumnya memotong saldo, kembalikan dananya.
    if (status === "cancelled" && order.status !== "cancelled") {
      const userRef = adminDb.collection("users").doc(order.uid);
      await adminDb.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        const currentBalance = userSnap.exists ? (userSnap.data().balance || 0) : 0;
        tx.update(userRef, { balance: currentBalance + (order.cost || 0) });
        tx.update(orderRef, { status, updatedAt: FieldValue.serverTimestamp() });
      });
    } else {
      await orderRef.update({ status, updatedAt: FieldValue.serverTimestamp() });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
