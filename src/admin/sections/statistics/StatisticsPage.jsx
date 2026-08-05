import { useCallback } from "react";
import { adminApi } from "../../services/adminApi.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { AdminState } from "../../components/AdminState/AdminState.jsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.jsx";
import { StatCard } from "../../components/StatCard/StatCard.jsx";
import "./statistics.css";

export function StatisticsPage() {
  const load = useCallback((signal) => adminApi.getDashboard({ signal }), []);
  const query = useAdminQuery(load, "statistics");
  if (query.status === "loading") return <AdminState type="loading" title="Cargando estadísticas" />;
  if (query.status === "error") return <AdminState type="error" title="No se pudieron cargar las estadísticas" message={query.error.message} action={<button className="admin-button" onClick={query.reload}>Reintentar</button>} />;
  const data = query.data;
  return <section className="statistics-page"><PageHeader eyebrow="Analítica" title="Estadísticas" description="Indicadores disponibles actualmente en GET /admin/dashboard. Todas las fechas se interpretan en UTC." /><div className="admin-grid admin-grid--stats"><StatCard label="Promedio por usuario" value={data.averageOcrPerUser ?? 0} /><StatCard label="OCR histórico" value={data.ocrProcessedAllTime ?? 0} /><StatCard label="OCR mensual" value={data.ocrProcessedCurrentMonth ?? 0} /><StatCard label="Unidades gratuitas" value={data.estimatedVisionCostCurrentMonth?.globalMonthlyFreeUnits ?? 0} /></div><AdminState title="Series históricas pendientes" message="El servidor actual ofrece acumulados y ranking, pero no un endpoint de series temporales. La sección queda preparada para incorporarlo sin inventar datos." /></section>;
}
