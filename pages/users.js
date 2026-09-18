import { adminAuth, adminDb, requireAdmin } from "../../../lib/firebaseAdmin";

export default async function handler(req, res) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.message });

  if (req.method === "GET") {
    const snap = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    const users = snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: data.uid || d.id,
        email: data.email,
        displayName: data.displayName || "",
        balance: data.balance || 0,
        banned: !!data.banned,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      };
    });
    return res.status(200).json({ users });
  }

  if (req.method === "POST") {
    const { uid, banned } = req.body || {};
    if (!uid || typeof banned !== "boolean") {
      return res.status(400).json({ error: "uid dan banned wajib diisi." });
    }

    // Update flag di Firestore (dibaca oleh app saat login/order)
    await adminDb.collection("users").doc(uid).update({ banned });

    // Nonaktifkan juga akses login-nya langsung lewat Firebase Auth
    try {
      await adminAuth.updateUser(uid, { disabled: banned });
    } catch (e) {
      // lanjutkan meski gagal disable di Auth (misal user dihapus manual)
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
