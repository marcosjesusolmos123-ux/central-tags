import "./StatCard.css";
export function StatCard({ label, value, detail }) { return <article className="admin-stat-card"><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</article>; }
