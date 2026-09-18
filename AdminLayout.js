import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebaseClient";
import ProtectedAdminRoute from "./ProtectedAdminRoute";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Pengguna" },
  { href: "/admin/orders", label: "Pesanan" },
  { href: "/admin/products", label: "Produk / Layanan" },
  { href: "/admin/maintenance", label: "Mode Maintenance" },
  { href: "/admin/settings", label: "Margin & Pengaturan" },
];

export default function AdminLayout({ children, title }) {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  return (
    <ProtectedAdminRoute>
      <div className="admin-layout">
        <div className="admin-sidebar">
          <div className="logo" style={{ marginBottom: 24 }}>
            <span className="logo-badge">S</span>
            SoraPay Admin
          </div>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={router.pathname === l.href ? "active" : ""}>
              {l.label}
            </Link>
          ))}
          <button className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 20 }} onClick={handleLogout}>
            Keluar
          </button>
        </div>
        <div className="admin-content">
          {title && <h2 className="section-title">{title}</h2>}
          {children}
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
