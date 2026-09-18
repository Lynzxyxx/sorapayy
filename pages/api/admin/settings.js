import { adminDb, requireAdmin } from "../../../lib/firebaseAdmin";

export default async function handler(req, res) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.message });

  const ref = adminDb.collection("config").doc("settings");

  if (req.method === "GET") {
    const snap = await ref.get();
    return res.status(200).json({ marginPercent: snap.exists ? (snap.data().marginPercent ?? 20) : 20 });
  }

  if (req.method === "POST") {
    const { marginPercent } = req.body || {};
    if (marginPercent === undefined || Number.isNaN(Number(marginPercent))) {
      return res.status(400).json({ error: "marginPercent wajib diisi angka." });
    }
    await ref.set({ marginPercent: Number(marginPercent) }, { merge: true });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
