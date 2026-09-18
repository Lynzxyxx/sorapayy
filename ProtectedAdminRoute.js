import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../lib/AuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/login");
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="maintenance-wrap">
        <p>Memeriksa akses admin...</p>
      </div>
    );
  }

  return children;
}
