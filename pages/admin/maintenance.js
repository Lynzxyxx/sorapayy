import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import SEO from "../../components/SEO";

export default function AdminMaintenance() {
  const { user } = useAuth();
  const [form, setForm] = useState({ enabled: false, startTime: "", endTime: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/maintenance", { headers: { Authorization: `Bearer ${idToken}` } });
      const data = await res.json();
      if (data.config) setForm({ ...form, ...data.config });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function saveConfig(e) {
    e.preventDefault();
    const idToken = await user.getIdToken();
    await fetch("/api/admin/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <AdminLayout title="Mode Maintenance">Memuat...</AdminLayout>;

  return (
    <AdminLayout title="Mode Maintenance">
      <SEO title="Admin Maintenance" />
      <div className="card" style={{ maxWidth: 520 }}>
        {saved && <div className="alert alert-success">Pengaturan maintenance disimpan.</div>}
        <form onSubmit={saveConfig}>
          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              style={{ width: "auto" }}
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            />
            <label style={{ margin: 0 }}>Aktifkan mode maintenance</label>
          </div>
          <div className="form-group">
            <label>Waktu Mulai</label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Waktu Selesai</label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Pesan untuk pengguna</label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Website sedang dalam perbaikan, akan kembali normal pukul..."
            />
          </div>
          <button className="btn btn-primary btn-block">Simpan Pengaturan</button>
        </form>
      </div>
    </AdminLayout>
  );
}
