import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseClient";

// Dokumen config/maintenance di Firestore berbentuk:
// { enabled: boolean, startTime: "2026-09-18T20:00", endTime: "2026-09-18T22:00", message: "..." }
export async function getMaintenanceStatus() {
  try {
    const snap = await getDoc(doc(db, "config", "maintenance"));
    if (!snap.exists()) return { active: false };

    const data = snap.data();
    if (!data.enabled) return { active: false, ...data };

    const now = new Date();
    const start = data.startTime ? new Date(data.startTime) : null;
    const end = data.endTime ? new Date(data.endTime) : null;

    const withinWindow =
      (!start || now >= start) && (!end || now <= end);

    return { active: withinWindow, ...data };
  } catch (e) {
    return { active: false };
  }
}
