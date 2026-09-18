import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  collection, onSnapshot, orderBy, query, where,
} from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { useAuth } from "../lib/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const statusBadge = {
  pending: { label: "Menunggu", cls: "badge-muted" },
  processing: { label: "Diproses", cls: "badge-warning" },
  completed: { label: "Selesai", cls: "badge-success" },
  cancelled: { label: "Dibatalkan", cls: "badge-danger" },
};

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [target, setTarget] = useState("");
  const [qty, setQty] = useState(100);
  const [msg, setMsg] = useState("");

  const [depositAmount, setDepositAmount] = useState(10000);
  const [depositInfo, setDepositInfo] = useState(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "products"), where("active", "==", true)),
      (snap) => setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      query(collection(db, "orders"), where("uid", "==", user.uid), orderBy("createdAt", "desc")),
      (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [user]);

  async function submitOrder(e) {
    e.preventDefault();
    setMsg("");
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ productId: selectedProduct, target, quantity: Number(qty) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat order");
      setMsg("✅ Order berhasil dibuat!");
      setTarget("");
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  }

  async function createDeposit(e) {
    e.preventDefault();
    if (!user) return;
    setDepositLoading(true);
    setDepositInfo(null);
    setDepositPaid(false);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/deposit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ amount: Number(depositAmount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat deposit");
      setDepositInfo(data);
    } catch (err) {
      setDepositInfo({ error: err.message });
    } finally {
      setDepositLoading(false);
    }
  }

  // Polling otomatis setiap 5 detik untuk cek apakah QRIS sudah dibayar —
  // berguna sebagai fallback jika buatqris.site tidak mendukung webhook.
  // Berhenti otomatis setelah 10 menit (120 x 5 detik) supaya tidak boros request.
  useEffect(() => {
    if (!depositInfo?.depositId || depositPaid || !user) return;

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/deposit/status", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ depositId: depositInfo.depositId }),
        });
        const data = await res.json();
        if (data.paid) {
          setDepositPaid(true);
          clearInterval(interval);
        }
      } catch (e) {
        // abaikan, coba lagi di interval berikutnya
      }
      if (attempts >= 120) clearInterval(interval);
    }, 5000);

    return () => clearInterval(interval);
  }, [depositInfo?.depositId, depositPaid, user]);

  if (loading || !user) return null;

  return (
    <>
      <SEO title="Dashboard" path="/dashboard" />
      <Navbar />
      <div className="container section">
        <h2 className="section-title">Halo, {profile?.displayName || user.email} 👋</h2>
        <p className="section-sub">Saldo kamu saat ini: <b>Rp{(profile?.balance || 0).toLocaleString("id-ID")}</b></p>

        <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", gap: 24 }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Buat Order Baru</h3>
            {msg && <div className={`alert ${msg.startsWith("✅") ? "alert-success" : "alert-error"}`}>{msg}</div>}
            <form onSubmit={submitOrder}>
              <div className="form-group">
                <label>Layanan</label>
                <select required value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                  <option value="">Pilih layanan</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Rp{p.price}/{p.unit || "100"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Link / Username Target</label>
                <input required value={target} onChange={(e) => setTarget(e.target.value)} placeholder="https://instagram.com/akunkamu" />
              </div>
              <div className="form-group">
                <label>Jumlah</label>
                <input type="number" min={1} required value={qty} onChange={(e) => setQty(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-block">Order Sekarang</button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Deposit Saldo (QRIS)</h3>
            <form onSubmit={createDeposit}>
              <div className="form-group">
                <label>Nominal (Rp)</label>
                <input type="number" min={1000} step={1000} required value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-block" disabled={depositLoading}>
                {depositLoading ? "Membuat QRIS..." : "Buat Kode QRIS"}
              </button>
            </form>
            {depositInfo?.error && <div className="alert alert-error" style={{ marginTop: 12 }}>{depositInfo.error}</div>}
            {depositInfo?.qrImageUrl && !depositPaid && (
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <img src={depositInfo.qrImageUrl} alt="QRIS" style={{ maxWidth: 220, margin: "0 auto", borderRadius: 10 }} />
                <p style={{ fontSize: 13, color: "var(--text-dim)" }}>
                  Scan lalu bayar sesuai nominal. Halaman ini otomatis mengecek
                  status pembayaran setiap 5 detik — saldo akan masuk sendiri
                  begitu pembayaran terkonfirmasi.
                </p>
                <span className="badge badge-warning">⏳ Menunggu pembayaran...</span>
              </div>
            )}
            {depositPaid && (
              <div className="alert alert-success" style={{ marginTop: 16, textAlign: "center" }}>
                ✅ Pembayaran diterima! Saldo kamu sudah diperbarui.
              </div>
            )}
          </div>
        </div>

        <h3 style={{ marginTop: 40 }}>Riwayat Order</h3>
        <div className="card" style={{ padding: 0, overflow: "auto" }}>
          <table>
            <thead>
              <tr><th>Layanan</th><th>Target</th><th>Jumlah</th><th>Status</th><th>Tanggal</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-dim)" }}>Belum ada order.</td></tr>
              )}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.productName}</td>
                  <td>{o.target}</td>
                  <td>{o.quantity}</td>
                  <td><span className={`badge ${statusBadge[o.status]?.cls || "badge-muted"}`}>{statusBadge[o.status]?.label || o.status}</span></td>
                  <td>{o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString("id-ID") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
}
