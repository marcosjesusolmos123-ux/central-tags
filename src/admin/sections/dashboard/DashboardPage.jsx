import { useCallback } from "react";
import { adminApi } from "../../services/adminApi.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { AdminState } from "../../components/AdminState/AdminState.jsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.jsx";
import { StatCard } from "../../components/StatCard/StatCard.jsx";
import "./dashboard.css";

export function DashboardPage() {
  const load = useCallback((signal) => adminApi.getDashboard({ signal }), []);
  const query = useAdminQuery(load, "dashboard");
  if (query.status === "loading") return <AdminState type="loading" title="Cargando dashboard" />;
  if (query.status === "error") return <AdminState type="error" title="No se pudo cargar el dashboard" message={query.error.message} action={<button className="admin-button" onClick={query.reload}>Reintentar</button>} />;
  const data = query.data;
  return <section className="dashboard-page"><PageHeader eyebrow="Resumen" title="Dashboard" description="Estado general de usuarios y consumo OCR informado por Central Tags Server." /><div className="admin-grid admin-grid--stats"><StatCard label="Usuarios" value={data.totalUsers ?? 0} /><StatCard label="OCR activo" value={data.usersWithOcrActive ?? 0} /><StatCard label="Procesados hoy" value={data.ocrProcessedToday ?? 0} detail="UTC" /><StatCard label="Procesados este mes" value={data.ocrProcessedCurrentMonth ?? 0} detail="UTC" /></div><div className="admin-grid admin-grid--two dashboard-page__details"><article className="admin-panel"><h2>Usuarios con mayor uso</h2>{data.topUsers?.length ? <ol className="dashboard-ranking">{data.topUsers.map((user) => <li key={user.uid}><span>{user.email || user.uid}</span><strong>{user.ocrUsed}</strong></li>)}</ol> : <AdminState title="Sin actividad OCR" message="Todavía no hay consumos para mostrar." />}</article><article className="admin-panel"><h2>Estimación mensual de Vision</h2><div className="dashboard-cost"><strong>{data.estimatedVisionCostCurrentMonth?.amount ?? 0} {data.estimatedVisionCostCurrentMonth?.currency || ""}</strong><span>{data.estimatedVisionCostCurrentMonth?.billableUnits ?? 0} unidades facturables</span><p>{data.estimatedVisionCostCurrentMonth?.disclaimer}</p></div></article></div></section>;
}
