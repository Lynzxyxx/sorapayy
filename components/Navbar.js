import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebaseClient";
import { useAuth } from "../lib/AuthContext";

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  return (
    <div className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="logo">
          <span className="logo-badge">S</span>
          SoraPay
        </Link>
        <div className="nav-links">
          <Link href="/#layanan">Layanan</Link>
          <Link href="/#faq">FAQ</Link>
          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              {isAdmin && <Link href="/admin">Admin Panel</Link>}
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Masuk
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
