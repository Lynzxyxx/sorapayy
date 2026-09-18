// =========================================================
// ADAPTER DEPOSIT OTOMATIS — buatqris.site
// =========================================================
// PENTING: Saya tidak menemukan dokumentasi resmi/publik dari
// buatqris.site saat proyek ini dibuat, jadi endpoint & nama
// field di bawah ini adalah TEMPLATE UMUM gateway QRIS (mirip
// kebanyakan provider sejenis). Sebelum dipakai, WAJIB:
//   1. Buka dokumentasi resmi di dashboard buatqris.site Anda
//   2. Sesuaikan CREATE_ENDPOINT, STATUS_ENDPOINT, cara autentikasi
//      (biasanya header "Authorization" atau "X-API-KEY"), dan
//      nama field request/response di bawah ini.
//   3. Kalau mereka menyediakan webhook, arahkan ke:
//      https://domainanda.com/api/deposit/webhook
//      lalu sesuaikan verifikasi signature-nya di
//      pages/api/deposit/webhook.js
// =========================================================

const BASE_URL = process.env.QRIS_API_BASE_URL; // contoh: https://buatqris.site/api
const API_KEY = process.env.QRIS_API_KEY;
const MERCHANT_ID = process.env.QRIS_MERCHANT_ID; // isi jika providernya butuh merchant/username

// Membuat tagihan QRIS baru untuk deposit user.
// Sesuaikan path & payload persis sesuai dokumentasi buatqris.site.
export async function createQrisDeposit({ amount, referenceId, note }) {
  if (!BASE_URL || !API_KEY) {
    throw new Error(
      "QRIS_API_BASE_URL / QRIS_API_KEY belum diisi di Environment Variables."
    );
  }

  const res = await fetch(`${BASE_URL}/create-transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`, // TODO: sesuaikan skema auth aslinya
    },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      amount,
      reference_id: referenceId,
      note,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gagal membuat QRIS (${res.status}): ${text}`);
  }

  const data = await res.json();

  // TODO: sesuaikan nama field ini dengan response asli buatqris.site
  return {
    qrString: data.qr_string || data.qris_string || null,
    qrImageUrl: data.qr_image_url || data.image_url || null,
    transactionId: data.transaction_id || data.trx_id || data.id,
    raw: data,
  };
}

// Mengecek status pembayaran QRIS berdasarkan transactionId.
export async function checkQrisStatus(transactionId) {
  if (!BASE_URL || !API_KEY) {
    throw new Error(
      "QRIS_API_BASE_URL / QRIS_API_KEY belum diisi di Environment Variables."
    );
  }

  const res = await fetch(
    `${BASE_URL}/check-status?transaction_id=${encodeURIComponent(transactionId)}`,
    {
      headers: { Authorization: `Bearer ${API_KEY}` }, // TODO: sesuaikan skema auth aslinya
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gagal cek status QRIS (${res.status}): ${text}`);
  }

  const data = await res.json();

  // TODO: sesuaikan nilai/status field ini dengan response asli buatqris.site
  const isPaid =
    data.status === "PAID" || data.status === "success" || data.paid === true;

  return { isPaid, raw: data };
}

// Verifikasi signature webhook (kalau buatqris.site menyediakannya).
// Isi sesuai metode verifikasi resmi mereka (HMAC, secret header, dll).
export function verifyQrisWebhookSignature(req) {
  const secret = process.env.QRIS_WEBHOOK_SECRET;
  if (!secret) return true; // sementara lewatkan jika belum dikonfigurasi
  const signature = req.headers["x-webhook-signature"]; // TODO: sesuaikan nama header asli
  return signature === secret; // TODO: ganti dengan verifikasi HMAC yang sesuai jika ada
}
