import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import SEO from "../../components/SEO";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    if (!user) return;
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function toggleBan(targetUid, banned) {
    const idToken = await user.getIdToken();
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ uid: targetUid, banned: !banned }),
    });
    loadUsers();
  }

  return (
    <AdminLayout title="Manajemen Pengguna">
      <SEO title="Admin Pengguna" />
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card" style={{ padding: 0, overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Nama</th>
              <th>Saldo</th>
              <th>Status</th>
              <th>Terdaftar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-dim)" }}>Memuat...</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-dim)" }}>Belum ada pengguna.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.uid}>
                <td>{u.email}</td>
                <td>{u.displayName || "-"}</td>
                <td>Rp{(u.balance || 0).toLocaleString("id-ID")}</td>
                <td>
                  <span className={`badge ${u.banned ? "badge-danger" : "badge-success"}`}>
                    {u.banned ? "Dibanned" : "Aktif"}
                  </span>
                </td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID") : "-"}</td>
                <td>
                  <button
                    className={`btn btn-sm ${u.banned ? "btn-ghost" : "btn-danger"}`}
                    onClick={() => toggleBan(u.uid, u.banned)}
                  >
                    {u.banned ? "Buka Ban" : "Ban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 12 }}>
        Catatan: password pengguna tidak pernah disimpan atau ditampilkan di sini —
        Firebase Authentication menyimpannya secara terenkripsi dan tidak bisa
        dibaca ulang oleh siapa pun, termasuk admin.
      </p>
    </AdminLayout>
  );
}
