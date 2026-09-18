import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebaseClient";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function ensureUserDoc(user) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        balance: 0,
        banned: false,
        createdAt: serverTimestamp(),
      });
    } else if (snap.data().banned) {
      setError("Akun kamu telah dibanned. Hubungi admin untuk info lebih lanjut.");
      await auth.signOut();
      throw new Error("banned");
    }
  }

  async function handleEmailLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(cred.user);
      router.push("/dashboard");
    } catch (err) {
      if (err.message !== "banned") {
        setError("Email atau password salah.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(cred.user);
      router.push("/dashboard");
    } catch (err) {
      if (err.message !== "banned") {
        setError("Gagal masuk dengan Google. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title="Masuk" path="/login" />
      <Navbar />
      <div className="auth-wrap">
        <div className="auth-card">
          <h2>Masuk ke SoraPay</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-ghost btn-block" onClick={handleGoogleLogin} disabled={loading}>
            Masuk dengan Google
          </button>
          <div className="divider">atau pakai email</div>
          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
          <p style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 16 }}>
            Belum punya akun? <Link href="/register" style={{ color: "var(--primary-2)" }}>Daftar di sini</Link>
          </p>
        </div>
      </div>
    </>
  );
}
