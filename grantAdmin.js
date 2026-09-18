/**
 * Jalankan SEKALI secara lokal (bukan di server produksi) untuk menjadikan
 * sebuah akun sebagai admin panel SoraPay.
 *
 * Langkah:
 * 1. Daftar akun terlebih dahulu lewat halaman /register di website
 *    (pakai email admin Anda, mis. gilang8301@gmail.com, dan password
 *    yang Anda inginkan — password ini hanya Anda yang tahu, tidak
 *    pernah disimpan di file/kode manapun).
 * 2. Download service account key dari:
 *    Firebase Console > Project Settings > Service Accounts >
 *    Generate New Private Key. Simpan sebagai serviceAccountKey.json
 *    di root folder proyek ini (JANGAN commit / upload file ini).
 * 3. Jalankan:
 *      node scripts/grantAdmin.js gilang8301@gmail.com
 *    atau
 *      npm run grant-admin -- gilang8301@gmail.com
 */
const admin = require("firebase-admin");
const path = require("path");

const email = process.argv[2];
if (!email) {
  console.error("Penggunaan: node scripts/grantAdmin.js email@akun.com");
  process.exit(1);
}

const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
});

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ ${email} sekarang adalah admin. Minta dia logout & login ulang di website.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Gagal:", err.message);
    console.error("Pastikan akun sudah pernah daftar lewat halaman /register terlebih dahulu.");
    process.exit(1);
  }
})();
