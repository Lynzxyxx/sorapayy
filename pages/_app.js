import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import { AuthProvider, useAuth } from "../lib/AuthContext";
import { getMaintenanceStatus } from "../lib/maintenance";

function MaintenanceGate({ children }) {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState({ active: false, checked: false });

  useEffect(() => {
    getMaintenanceStatus().then((s) => setStatus({ ...s, checked: true }));
  }, []);

  const isAllowedPath = ["/login", "/admin"].some((p) => router.pathname.startsWith(p));

  if (!status.checked || authLoading) return children;

  if (status.active && !isAdmin && !isAllowedPath) {
    return (
      <div className="maintenance-wrap">
        <div>
          <h1 style={{ fontSize: 32 }}>🛠️ Sedang Maintenance</h1>
          <p style={{ color: "var(--text-dim)", maxWidth: 480, margin: "10px auto" }}>
            {status.message || "SoraPay sedang dalam perbaikan sistem. Silakan kembali beberapa saat lagi."}
          </p>
          {status.endTime && (
            <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
              Estimasi selesai: {new Date(status.endTime).toLocaleString("id-ID")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return children;
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <MaintenanceGate>
        <Component {...pageProps} />
      </MaintenanceGate>
    </AuthProvider>
  );
}
