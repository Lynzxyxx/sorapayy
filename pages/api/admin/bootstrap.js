// =========================================================
// BOOTSTRAP ADMIN — cara mengangkat akun jadi admin TANPA
// perlu terminal/Node.js lokal (cocok dipakai dari HP).
//
// Cara pakai (SEKALI SAJA saat setup awal):
// 1. Di Vercel, tambahkan Environment Variable baru:
//    Key   : ADMIN_BOOTSTRAP_SECRET
//    Value : buat kode rahasia sendiri yang panjang & acak,
//            mis. "sora-rahasia-9f8x2k1m" (JANGAN pakai contoh ini,
//            buat sendiri yang tidak ada yang tahu)
// 2. Redeploy project.
// 3. Daftar dulu akun admin lewat halaman /register seperti biasa.
// 4. Buka URL ini lewat browser HP (ganti sesuai domain & data Anda):
//    https://domain-anda.vercel.app/api/admin/bootstrap?email=gilang8301@gmail.com&secret=KODE_RAHASIA_ANDA
// 5. Kalau berhasil, akan muncul pesan sukses. Logout & login ulang
//    di website supaya status admin aktif.
// 6. SETELAH BERHASIL, HAPUS/GANTI nilai ADMIN_BOOTSTRAP_SECRET di
//    Vercel (atau hapus endpoint ini dari kode) supaya tidak ada
//    yang bisa memakainya lagi untuk mengangkat diri jadi admin.
// =========================================================
import { adminAuth } from "../../../lib/firebaseAdmin";

export default async function handler(req, res) {
  const email = req.method === "GET" ? req.query.email : req.body?.email;
  const secret = req.method === "GET" ? req.query.secret : req.body?.secret;

  const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

  if (!expectedSecret) {
    return res.status(500).json({
      error: "ADMIN_BOOTSTRAP_SECRET belum diset di Environment Variables Vercel.",
    });
  }

  if (!secret || secret !== expectedSecret) {
    return res.status(403).json({ error: "Kode rahasia salah atau tidak diisi." });
  }

  if (!email) {
    return res.status(400).json({ error: "Parameter email wajib diisi." });
  }

  try {
    const user = await adminAuth.getUserByEmail(email);
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    return res.status(200).json({
      success: true,
      message: `${email} sekarang admin. Logout & login ulang di website untuk mengaktifkan akses admin.`,
    });
  } catch (err) {
    return res.status(404).json({
      error: "Akun dengan email tersebut belum terdaftar. Daftar dulu lewat halaman /register.",
      detail: err.message,
    });
  }
        }
