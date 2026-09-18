import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebaseClient";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function createUserDoc(user, displayName) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || "",
        balance: 0,
        banned: false,
        createdAt: serverTimestamp(),
      });
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await createUserDoc(cred.user, name);
      router.push("/dashboard");
    } catch (err) {
      setError(err.code === "auth/email-already-in-use"
        ? "Email sudah terdaftar."
        : "Gagal mendaftar. Periksa kembali data kamu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await createUserDoc(cred.user);
      router.push("/dashboard");
    } catch (err) {
      setError("Gagal mendaftar dengan Google. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title="Daftar" path="/register" />
      <Navbar />
      <div className="auth-wrap">
        <div className="auth-card">
          <h2>Buat Akun SoraPay</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-ghost btn-block" onClick={handleGoogleRegister} disabled={loading}>
            Daftar dengan Google
          </button>
          <div className="divider">atau pakai email</div>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nama</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 16 }}>
            Sudah punya akun? <Link href="/login" style={{ color: "var(--primary-2)" }}>Masuk di sini</Link>
          </p>
        </div>
      </div>
    </>
  );
}
