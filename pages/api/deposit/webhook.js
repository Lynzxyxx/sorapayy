// Endpoint ini yang didaftarkan sebagai Webhook URL di dashboard buatqris.site
// (jika mereka menyediakan fitur webhook). Sesuaikan verifyQrisWebhookSignature
// dan nama field payload dengan dokumentasi resmi mereka.
import { adminDb } from "../../../lib/firebaseAdmin";
import { verifyQrisWebhookSignature } from "../../../lib/qris";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!verifyQrisWebhookSignature(req)) {
    return res.status(401).json({ error: "Signature tidak valid." });
  }

  // TODO: sesuaikan nama field payload webhook asli buatqris.site
  const { transaction_id: transactionId, status } = req.body || {};
  const isPaid = status === "PAID" || status === "success";

  if (!transactionId || !isPaid) {
    return res.status(200).json({ received: true });
  }

  try {
    const depositsSnap = await adminDb
      .collection("deposits")
      .where("transactionId", "==", transactionId)
      .limit(1)
      .get();

    if (depositsSnap.empty) return res.status(200).json({ received: true });

    const depositDoc = depositsSnap.docs[0];
    const deposit = depositDoc.data();

    if (deposit.status === "paid") {
      return res.status(200).json({ received: true }); // sudah diproses sebelumnya
    }

    await adminDb.runTransaction(async (tx) => {
      const userRef = adminDb.collection("users").doc(deposit.uid);
      const userSnap = await tx.get(userRef);
      const currentBalance = userSnap.exists ? (userSnap.data().balance || 0) : 0;

      tx.update(userRef, { balance: currentBalance + deposit.amount });
      tx.update(depositDoc.ref, { status: "paid", paidAt: FieldValue.serverTimestamp() });
    });

    return res.status(200).json({ received: true, credited: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
