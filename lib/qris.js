// =========================================================
// ADAPTER DEPOSIT OTOMATIS — buatqris.site
// =========================================================
// STATUS: masih tebakan berdasarkan pola umum API (Bearer token
// auth). Dokumentasi resmi publik buatqris.site tidak ditemukan.
// Kalau masih error 400/401/404 setelah env var diisi, cek pesan
// error ASLI dari server di Vercel → tab "Logs" (bukan Build Logs)
// saat mencoba deposit — pesan itu biasanya menunjukkan persis
// field/endpoint mana yang salah, lalu sesuaikan file ini.
// =========================================================

const BASE_URL = process.env.QRIS_API_BASE_URL || "https://api.buatqris.site";
const SECRET_TOKEN = process.env.QRIS_SECRET_TOKEN;
const ACCOUNT_ID = process.env.QRIS_ACCOUNT_ID;

// Membuat tagihan QRIS baru untuk deposit user.
export async function createQrisDeposit({ amount, referenceId, note }) {
  if (!SECRET_TOKEN || !ACCOUNT_ID) {
    throw new Error(
      "QRIS_SECRET_TOKEN / QRIS_ACCOUNT_ID belum diisi di Environment Variables."
    );
  }

  const res = await fetch(`${BASE_URL}/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SECRET_TOKEN}`, // TODO: sesuaikan kalau ternyata pakai skema lain
    },
    body: JSON.stringify({
      account_id: ACCOUNT_ID,
      amount,
      reference_id: referenceId,
      note,
    }),
  });

  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { raw };
  }

  if (!res.ok) {
    // Lempar pesan asli dari server supaya muncul di Vercel Logs —
    // ini kunci untuk tahu field/endpoint mana yang perlu diperbaiki.
    throw new Error(
      `Gagal membuat QRIS (${res.status}): ${JSON.stringify(data)}`
    );
  }

  return {
    qrString: data.qr_string || data.qris_string || null,
    qrImageUrl: data.qr_image_url || data.image_url || null,
    transactionId: data.transaction_id || data.trx_id || data.id,
    raw: data,
  };
}

// Mengecek status pembayaran QRIS berdasarkan transactionId.
export async function checkQrisStatus(transactionId) {
  if (!SECRET_TOKEN || !ACCOUNT_ID) {
    throw new Error(
      "QRIS_SECRET_TOKEN / QRIS_ACCOUNT_ID belum diisi di Environment Variables."
    );
  }

  const res = await fetch(
    `${BASE_URL}/v1/transactions/${encodeURIComponent(transactionId)}`,
    {
      headers: { Authorization: `Bearer ${SECRET_TOKEN}` },
    }
  );

  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { raw };
  }

  if (!res.ok) {
    throw new Error(`Gagal cek status QRIS (${res.status}): ${JSON.stringify(data)}`);
  }

  const isPaid =
    data.status === "PAID" || data.status === "success" || data.paid === true;

  return { isPaid, raw: data };
}

// Verifikasi signature webhook (kalau buatqris.site menyediakannya).
export function verifyQrisWebhookSignature(req) {
  const secret = process.env.QRIS_WEBHOOK_SECRET;
  if (!secret) return true; // sementara lewatkan jika belum dikonfigurasi
  const signature = req.headers["x-webhook-signature"]; // TODO: sesuaikan nama header asli
  return signature === secret; // TODO: ganti dengan verifikasi HMAC yang sesuai jika ada
}
