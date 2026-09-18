# SoraPay — Panel Suntik Sosmed (SMM Panel)

Starter proyek Next.js + Firebase untuk website jasa layanan media sosial
(followers, likes, views, dll), lengkap dengan dashboard user, panel admin,
deposit saldo otomatis via QRIS, dan mode maintenance terjadwal.

## ⚠️ Baca dulu sebelum pakai

1. **Desain ini orisinal**, terinspirasi dari pola umum SMM panel — bukan
   hasil menyalin kode/aset dari fayupedia.com atau situs lain. Kalau mau
   menyesuaikan warna/logo lebih dekat ke selera Anda, edit
   `styles/globals.css` dan `components/`.
2. **Password admin tidak pernah disimpan di kode.** Firebase Authentication
   menyimpan password secara terenkripsi dan tidak bisa dibaca ulang oleh
   siapa pun, termasuk Anda sebagai admin/developer. Status "admin" diberikan
   lewat *custom claim*, bukan lewat password yang dihardcode. Lihat langkah
   "Menjadikan Akun sebagai Admin" di bawah.
3. **Integrasi deposit QRIS (`lib/qris.js`) masih perlu disesuaikan.** Saat
   proyek ini dibuat, dokumentasi resmi buatqris.site tidak saya temukan
   secara publik, jadi endpoint & nama field di file itu adalah template umum
   gateway QRIS. Buka dashboard buatqris.site Anda, cek dokumentasi API-nya,
   lalu sesuaikan bagian yang ditandai `// TODO` di `lib/qris.js` dan
   `pages/api/deposit/webhook.js` sebelum dipakai transaksi sungguhan.

## 1. Install dependencies

```bash
npm install
```

## 2. Setup project Firebase

1. Buat project baru di [Firebase Console](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → aktifkan **Email/Password** dan
   **Google**.
3. **Firestore Database** → buat database (mode production).
4. **Project Settings → General** → tambahkan Web App, salin konfigurasinya
   ke `.env.local` (lihat langkah 3).
5. **Project Settings → Service Accounts** → "Generate New Private Key" →
   simpan file JSON yang terdownload sebagai `serviceAccountKey.json` di
   root folder proyek ini (jangan pernah di-commit/upload ke publik — file
   ini sudah masuk `.gitignore`).

## 3. Environment variables

Salin `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Isi bagian `NEXT_PUBLIC_FIREBASE_*` dari konfigurasi Web App Firebase Anda.

Untuk `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, dan `FIREBASE_PRIVATE_KEY`,
ambil dari file `serviceAccountKey.json` yang tadi didownload:

```json
{
  "project_id": "...",      // -> FIREBASE_PROJECT_ID
  "client_email": "...",    // -> FIREBASE_CLIENT_EMAIL
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

`FIREBASE_PRIVATE_KEY` harus satu baris dengan `\n` literal, contoh:

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

## 4. Deploy Firestore Security Rules

Install Firebase CLI kalau belum ada, lalu:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # pilih project Anda, pakai firestore.rules & firestore.indexes.json yang sudah ada
firebase deploy --only firestore:rules,firestore:indexes
```

`firestore.indexes.json` berisi composite index yang dibutuhkan query riwayat
order per-user (filter `uid` + urutkan `createdAt`). Tanpa index ini, halaman
Dashboard user akan menampilkan error di console browser saat memuat riwayat
order — Firestore biasanya juga memberi link otomatis di error tsb untuk
membuat index yang sama secara manual lewat Firebase Console kalau Anda
lebih suka cara itu.

## 5. Menjadikan akun sebagai Admin

1. Jalankan proyek (`npm run dev`), buka `/register`, daftar akun dengan
   email admin Anda (mis. `gilang8301@gmail.com`) dan password pilihan Anda.
2. Pastikan `serviceAccountKey.json` sudah ada di root folder (langkah 2.5).
3. Jalankan:
   ```bash
   npm run grant-admin -- gilang8301@gmail.com
   ```
4. Logout & login ulang di website — menu "Admin Panel" akan muncul di navbar,
   dan `/admin` bisa diakses.

Anda bisa jalankan `grant-admin` untuk email lain juga kalau ingin menambah
admin lebih dari satu.

## 6. Jalankan lokal

```bash
npm run dev
```

Buka http://localhost:3000

## 7. Deploy ke Vercel

1. Push proyek ini ke GitHub/GitLab (pastikan `.env.local` dan
   `serviceAccountKey.json` **tidak ikut ter-commit** — sudah ada di
   `.gitignore`).
2. Import repo di [vercel.com](https://vercel.com/new).
3. Di **Settings → Environment Variables**, tambahkan semua variabel yang
   ada di `.env.example` (isi dengan nilai asli Anda) — termasuk yang
   `NEXT_PUBLIC_*` maupun yang rahasia (`FIREBASE_PRIVATE_KEY`,
   `QRIS_API_KEY`, dll). Vercel akan meng-encrypt env var ini dan tidak
   ditampilkan lagi setelah disimpan.
4. Deploy. Setelah live, tambahkan domain Vercel Anda ke
   **Firebase Console → Authentication → Settings → Authorized domains**
   supaya login Google/Email berfungsi.

## 8. SEO ("SoraPay" muncul di Google)

- Metadata (title, description, Open Graph, JSON-LD) sudah diatur di
  `components/SEO.js` dan dipakai di setiap halaman.
- `public/robots.txt` dan `public/sitemap.xml` sudah disediakan — update
  domain di dalamnya sesuai domain final Anda.
- Setelah deploy, daftarkan domain Anda ke
  [Google Search Console](https://search.google.com/search-console) dan
  submit `sitemap.xml` supaya lebih cepat terindeks saat orang mencari
  "SoraPay".
- SEO butuh waktu (biasanya beberapa hari–minggu) untuk mulai muncul di
  hasil pencarian setelah domain live & terindeks — tidak instan begitu
  di-deploy.

## Struktur Fitur Admin (`/admin`)

- **Overview** — ringkasan jumlah user, order, layanan.
- **Pengguna** — daftar email, nama, saldo, status; ban/unban akun (akun
  yang dibanned otomatis tidak bisa login & tidak bisa order).
- **Pesanan** — ubah status pesanan: pending → processing → completed /
  cancelled (dibatalkan otomatis mengembalikan saldo user).
- **Produk/Layanan** — tambah/edit/hapus layanan lengkap dengan kategori,
  harga modal, margin, unit, min/max order.
- **Mode Maintenance** — aktifkan/nonaktifkan, atur jam mulai & selesai,
  pesan yang ditampilkan ke user (admin tetap bisa akses situs saat
  maintenance aktif).
- **Margin & Pengaturan** — margin default (%) yang dipakai layanan yang
  tidak diisi margin khusus.

## Catatan Keamanan

- Semua aksi sensitif (ban user, ubah status order, ubah saldo, kelola
  produk) hanya bisa lewat API route (`pages/api/admin/**`) yang memverifikasi
  token Firebase + custom claim `admin`, bukan lewat Firestore client
  langsung — jadi tidak bisa dimanipulasi dari browser.
- Harga modal & margin disimpan terpisah di koleksi `productCosts` yang
  hanya bisa dibaca admin (lihat `firestore.rules`), user biasa hanya
  melihat harga jual akhir.
