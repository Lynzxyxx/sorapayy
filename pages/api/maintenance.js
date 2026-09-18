import { adminDb, requireAdmin } from "../../../lib/firebaseAdmin";

export default async function handler(req, res) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.message });

  const ref = adminDb.collection("config").doc("maintenance");

  if (req.method === "GET") {
    const snap = await ref.get();
    return res.status(200).json({ config: snap.exists ? snap.data() : { enabled: false } });
  }

  if (req.method === "POST") {
    const { enabled, startTime, endTime, message } = req.body || {};
    await ref.set(
      { enabled: !!enabled, startTime: startTime || "", endTime: endTime || "", message: message || "" },
      { merge: true }
    );
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
