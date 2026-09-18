import { requireUser, adminDb } from "../../../lib/firebaseAdmin";
import { createQrisDeposit } from "../../../lib/qris";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireUser(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.message });

  const { amount } = req.body || {};
  if (!amount || amount < 1000) {
    return res.status(400).json({ error: "Nominal deposit minimal Rp1.000." });
  }

  try {
    const depositRef = adminDb.collection("deposits").doc();

    const qris = await createQrisDeposit({
      amount,
      referenceId: depositRef.id,
      note: `Deposit SoraPay - ${auth.decoded.uid}`,
    });

    await depositRef.set({
      uid: auth.decoded.uid,
      amount,
      status: "pending",
      transactionId: qris.transactionId,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      depositId: depositRef.id,
      qrString: qris.qrString,
      qrImageUrl: qris.qrImageUrl,
      transactionId: qris.transactionId,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Gagal membuat deposit QRIS." });
  }
}
