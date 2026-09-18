// Polling manual dari client jika buatqris.site tidak punya webhook —
// cek status transaksi lalu update saldo user kalau sudah dibayar.
import { requireUser, adminDb } from "../../../lib/firebaseAdmin";
import { checkQrisStatus } from "../../../lib/qris";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireUser(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.message });

  const { depositId } = req.body || {};
  if (!depositId) return res.status(400).json({ error: "depositId wajib diisi." });

  try {
    const depositRef = adminDb.collection("deposits").doc(depositId);
    const snap = await depositRef.get();
    if (!snap.exists || snap.data().uid !== auth.decoded.uid) {
      return res.status(404).json({ error: "Deposit tidak ditemukan." });
    }

    const deposit = snap.data();
    if (deposit.status === "paid") return res.status(200).json({ paid: true });

    const { isPaid } = await checkQrisStatus(deposit.transactionId);
    if (!isPaid) return res.status(200).json({ paid: false });

    await adminDb.runTransaction(async (tx) => {
      const userRef = adminDb.collection("users").doc(deposit.uid);
      const userSnap = await tx.get(userRef);
      const currentBalance = userSnap.exists ? (userSnap.data().balance || 0) : 0;
      tx.update(userRef, { balance: currentBalance + deposit.amount });
      tx.update(depositRef, { status: "paid", paidAt: FieldValue.serverTimestamp() });
    });

    return res.status(200).json({ paid: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
