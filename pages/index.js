import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import ServiceCard from "../components/ServiceCard";

const services = [
  { icon: "IG", title: "Instagram", desc: "Followers, Likes, Views, Comments — proses instan & aman untuk akun kamu." },
  { icon: "TT", title: "TikTok", desc: "Followers, Likes, Views, Share untuk mendongkrak performa video TikTok kamu." },
  { icon: "YT", title: "YouTube", desc: "Subscribers, Views, Likes untuk mempercepat pertumbuhan channel." },
  { icon: "FB", title: "Facebook", desc: "Page Likes, Followers, Post Engagement untuk bisnis & personal." },
  { icon: "TW", title: "X / Twitter", desc: "Followers, Likes, Retweet untuk meningkatkan reach akun kamu." },
  { icon: "WA", title: "WhatsApp", desc: "Member Channel & layanan penunjang promosi WhatsApp Business." },
];

export default function Home() {
  return (
    <>
      <SEO />
      <Navbar />

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="pill">⚡ Proses Otomatis 24 Jam</span>
            <h1>Panel Suntik Sosmed Tercepat &amp; Termurah — SoraPay</h1>
            <p>
              Tambah followers, likes, views, dan engagement untuk semua
              platform media sosial favoritmu. Deposit otomatis via QRIS,
              order diproses real-time, dan dashboard transparan untuk
              memantau setiap pesanan.
            </p>
            <div className="hero-cta">
              <a href="/register" className="btn btn-primary">Daftar Gratis</a>
              <a href="#layanan" className="btn btn-ghost">Lihat Layanan</a>
            </div>
            <div className="stat-row">
              <div className="stat"><b>50rb+</b><span>Order Selesai</span></div>
              <div className="stat"><b>99.9%</b><span>Uptime Panel</span></div>
              <div className="stat"><b>24/7</b><span>Proses Otomatis</span></div>
            </div>
          </div>

          <div className="hero-card">
            <h3 style={{ marginTop: 0 }}>Contoh Layanan</h3>
            <div className="row"><span>Instagram Followers</span><b>Rp120 / 100</b></div>
            <div className="row"><span>TikTok Likes</span><b>Rp80 / 100</b></div>
            <div className="row"><span>YouTube Views</span><b>Rp45 / 1000</b></div>
            <div className="row"><span>Instagram Views</span><b className="muted">Rp10 / 1000</b></div>
            <a href="/register" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
              Mulai Order Sekarang
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="layanan">
        <div className="container">
          <h2 className="section-title">Platform yang Kami Dukung</h2>
          <p className="section-sub">
            Semua layanan dikelola langsung dari panel admin kami dan bisa
            ditambah kapan saja sesuai kebutuhan pasar.
          </p>
          <div className="grid grid-3">
            {services.map((s) => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Kenapa Pilih SoraPay?</h2>
          <div className="grid grid-4">
            <div className="card">
              <div className="icon-badge">1</div>
              <h3>Deposit Otomatis</h3>
              <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Top up saldo via QRIS, saldo masuk otomatis tanpa konfirmasi manual.</p>
            </div>
            <div className="card">
              <div className="icon-badge">2</div>
              <h3>Harga Transparan</h3>
              <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Semua harga sudah termasuk margin, tidak ada biaya tersembunyi.</p>
            </div>
            <div className="card">
              <div className="icon-badge">3</div>
              <h3>Status Real-time</h3>
              <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Pantau status pesanan: diproses, selesai, atau dibatalkan.</p>
            </div>
            <div className="card">
              <div className="icon-badge">4</div>
              <h3>Support Cepat</h3>
              <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Tim admin siap membantu kendala akun & pesanan kamu.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <h2 className="section-title">Pertanyaan Umum</h2>
          <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="card">
              <b>Apakah SoraPay aman digunakan?</b>
              <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 0 }}>
                Ya, kami tidak pernah meminta password akun media sosial kamu.
                Order hanya membutuhkan link/username publik.
              </p>
            </div>
            <div className="card">
              <b>Berapa lama proses order selesai?</b>
              <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 0 }}>
                Rata-rata order diproses otomatis dalam hitungan menit,
                tergantung antrian layanan yang dipilih.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
