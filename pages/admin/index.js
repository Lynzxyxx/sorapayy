import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "../../lib/firebaseClient";
import AdminLayout from "../../components/AdminLayout";
import SEO from "../../components/SEO";

export default function AdminOverview() {
  const [counts, setCounts] = useState({ users: 0, orders: 0, products: 0 });

  useEffect(() => {
    (async () => {
      const [users, orders, products] = await Promise.all([
        getCountFromServer(collection(db, "users")),
        getCountFromServer(collection(db, "orders")),
        getCountFromServer(collection(db, "products")),
      ]);
      setCounts({
        users: users.data().count,
        orders: orders.data().count,
        products: products.data().count,
      });
    })();
  }, []);

  return (
    <AdminLayout title="Overview">
      <SEO title="Admin Overview" />
      <div className="grid grid-3">
        <div className="card">
          <div className="icon-badge">U</div>
          <h3 style={{ margin: "0 0 4px" }}>{counts.users}</h3>
          <p style={{ color: "var(--text-dim)", margin: 0 }}>Total Pengguna</p>
        </div>
        <div className="card">
          <div className="icon-badge">O</div>
          <h3 style={{ margin: "0 0 4px" }}>{counts.orders}</h3>
          <p style={{ color: "var(--text-dim)", margin: 0 }}>Total Pesanan</p>
        </div>
        <div className="card">
          <div className="icon-badge">P</div>
          <h3 style={{ margin: "0 0 4px" }}>{counts.products}</h3>
          <p style={{ color: "var(--text-dim)", margin: 0 }}>Layanan Aktif</p>
        </div>
      </div>
    </AdminLayout>
  );
}
