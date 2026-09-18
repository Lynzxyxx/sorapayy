import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import SEO from "../../components/SEO";

const statusOptions = ["pending", "processing", "completed", "cancelled"];
const statusBadge = {
  pending: "badge-muted",
  processing: "badge-warning",
  completed: "badge-success",
  cancelled: "badge-danger",
};

export default function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    if (!user) return;
    setLoading(true);
    const idToken = await user.getIdToken();
    const res = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${idToken}` } });
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function updateStatus(orderId, status) {
    const idToken = await user.getIdToken();
    await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ orderId, status }),
    });
    loadOrders();
  }

  return (
    <AdminLayout title="Manajemen Pesanan">
      <SEO title="Admin Pesanan" />
      <div className="card" style={{ padding: 0, overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>User</th><th>Layanan</th><th>Target</th><th>Qty</th><th>Status</th><th>Ubah Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ textAlign: "center" }}>Memuat...</td></tr>}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-dim)" }}>Belum ada pesanan.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.userEmail}</td>
                <td>{o.productName}</td>
                <td>{o.target}</td>
                <td>{o.quantity}</td>
                <td><span className={`badge ${statusBadge[o.status] || "badge-muted"}`}>{o.status}</span></td>
                <td>
                  <select
                    defaultValue={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    style={{ padding: "6px 10px", borderRadius: 8, background: "var(--bg-soft)", border: "1px solid var(--border)", color: "var(--text)" }}
                  >
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
