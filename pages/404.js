import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Halaman Tidak Ditemukan" />
      <Navbar />
      <div className="maintenance-wrap">
        <div>
          <h1 style={{ fontSize: 64, margin: 0 }}>404</h1>
          <p style={{ color: "var(--text-dim)", margin: "10px 0 24px" }}>
            Halaman yang kamu cari tidak ditemukan.
          </p>
          <Link href="/" className="btn btn-primary">Kembali ke Beranda</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
