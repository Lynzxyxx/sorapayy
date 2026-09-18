import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import SEO from "../../components/SEO";

const emptyForm = {
  name: "", category: "Instagram", basePrice: "", marginPercent: "",
  unit: 100, minOrder: 100, maxOrder: 10000, description: "", active: true,
};

export default function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    if (!user) return;
    setLoading(true);
    const idToken = await user.getIdToken();
    const res = await fetch("/api/admin/products", { headers: { Authorization: `Bearer ${idToken}` } });
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name, category: p.category, basePrice: p.basePrice, marginPercent: p.marginPercent,
      unit: p.unit, minOrder: p.minOrder, maxOrder: p.maxOrder, description: p.description || "", active: p.active,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submitForm(e) {
    e.preventDefault();
    const idToken = await user.getIdToken();
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ id: editingId, ...form }),
    });
    resetForm();
    loadProducts();
  }

  async function deleteProduct(id) {
    if (!confirm("Hapus layanan ini?")) return;
    const idToken = await user.getIdToken();
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ id }),
    });
    loadProducts();
  }

  return (
    <AdminLayout title="Produk / Layanan">
      <SEO title="Admin Produk" />
      <div className="grid" style={{ gridTemplateColumns: "1fr 1.4fr", gap: 24 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Layanan" : "Tambah Layanan Baru"}</h3>
          <form onSubmit={submitForm}>
            <div className="form-group">
              <label>Nama Layanan</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Instagram Followers Indonesia" />
            </div>
            <div className="form-group">
              <label>Kategori / Platform</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {["Instagram", "TikTok", "YouTube", "Facebook", "X / Twitter", "WhatsApp", "Lainnya"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Harga Modal (per unit)</label>
              <input type="number" required value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Margin (%)</label>
              <input type="number" required value={form.marginPercent} onChange={(e) => setForm({ ...form, marginPercent: Number(e.target.value) })} placeholder="Kosongkan untuk pakai margin default global" />
            </div>
            <div className="form-group">
              <label>Unit (per berapa, mis. 100 / 1000)</label>
              <input type="number" required value={form.unit} onChange={(e) => setForm({ ...form, unit: Number(e.target.value) })} />
            </div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="form-group">
                <label>Min Order</label>
                <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Max Order</label>
                <input type="number" value={form.maxOrder} onChange={(e) => setForm({ ...form, maxOrder: Number(e.target.value) })} />
              </div>
            </div>
            <div className="form-group">
              <label>Deskripsi</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} style={{ width: "auto" }} />
              <label style={{ margin: 0 }}>Aktifkan layanan</label>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>{editingId ? "Simpan Perubahan" : "Tambah Layanan"}</button>
              {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Batal</button>}
            </div>
          </form>
        </div>

        <div className="card" style={{ padding: 0, overflow: "auto" }}>
          <table>
            <thead>
              <tr><th>Nama</th><th>Kategori</th><th>Harga Jual</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} style={{ textAlign: "center" }}>Memuat...</td></tr>}
              {!loading && products.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-dim)" }}>Belum ada layanan.</td></tr>
              )}
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>Rp{p.price}/{p.unit}</td>
                  <td><span className={`badge ${p.active ? "badge-success" : "badge-muted"}`}>{p.active ? "Aktif" : "Nonaktif"}</span></td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
