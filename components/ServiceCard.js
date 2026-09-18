export default function ServiceCard({ icon, title, desc }) {
  return (
    <div className="card">
      <div className="icon-badge">{icon}</div>
      <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
      <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}
