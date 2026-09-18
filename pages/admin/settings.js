import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import SEO from "../../components/SEO";

export default function AdminSettings() {
  const { user } = useAuth();
  const [marginPercent, setMarginPercent] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${idToken}` } });
      const data = await res.json();
      if (typeof data.marginPercent === "number") setMarginPercent(data.marginPercent);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function saveSettings(e) {
    e.preventDefault();
    const idToken = await user.getIdToken();
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ marginPercent: Number(marginPercent) }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <AdminLayout title="Margin & Pengaturan">Memuat...</AdminLayout>;

  return (
    <AdminLayout title="Margin & Pengaturan">
      <SEO title="Admin Pengaturan" />
      <div className="card" style={{ maxWidth: 480 }}>
        {saved && <div className="alert alert-success">Margin default disimpan.</div>}
        <form onSubmit={saveSettings}>
          <div className="form-group">
            <label>Margin Default (%)</label>
            <input
              type="number"
              min={0}
              value={marginPercent}
              onChange={(e) => setMarginPercent(e.target.value)}
            />
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6 }}>
              Margin ini dipakai otomatis untuk layanan yang tidak diisi margin
              khusus di halaman Produk. Harga jual = harga modal + margin (%).
            </p>
          </div>
          <button className="btn btn-primary btn-block">Simpan</button>
        </form>
      </div>
    </AdminLayout>
  );
}
