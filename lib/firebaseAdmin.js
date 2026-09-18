// Firebase Admin SDK — HANYA dipakai di server (pages/api/**).
// Jangan pernah import file ini dari komponen React / client code.
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

// Verifikasi token dari header Authorization: Bearer <idToken>
// dan pastikan user tsb admin (custom claim admin === true).
export async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return { ok: false, status: 401, message: "Token tidak ditemukan" };
  }
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.admin) {
      return { ok: false, status: 403, message: "Akun ini bukan admin" };
    }
    return { ok: true, decoded };
  } catch (e) {
    return { ok: false, status: 401, message: "Token tidak valid" };
  }
}

// Verifikasi token dan kembalikan user biasa (tidak wajib admin)
export async function requireUser(req) {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return { ok: false, status: 401, message: "Token tidak ditemukan" };
  }
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return { ok: true, decoded };
  } catch (e) {
    return { ok: false, status: 401, message: "Token tidak valid" };
  }
}
