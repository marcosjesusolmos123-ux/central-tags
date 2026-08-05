import { useCallback } from "react";
import { adminApi } from "../../services/adminApi.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { AdminState } from "../../components/AdminState/AdminState.jsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.jsx";
import { StatCard } from "../../components/StatCard/StatCard.jsx";
import "./plans.css";

export function PlansPage() {
  const load = useCallback((signal) => adminApi.getUsers({ page: 1, limit: 100 }, { signal }), []);
  const query = useAdminQuery(load, "plans");
  if (query.status === "loading") return <AdminState type="loading" title="Cargando planes" />;
  if (query.status === "error") return <AdminState type="error" title="No se pudieron cargar los planes" message={query.error.message} action={<button className="admin-button" onClick={query.reload}>Reintentar</button>} />;
  const users = query.data.items || [];
  const monthly = users.filter((user) => user.plan === "monthly").length;
  return <section className="plans-page"><PageHeader eyebrow="Suscripciones" title="Planes" description="Resumen derivado de usuarios; el servidor no expone un catálogo de planes independiente." />{users.length ? <><div className="admin-grid admin-grid--stats"><StatCard label="Usuarios analizados" value={users.length} /><StatCard label="Plan free" value={users.length - monthly} /><StatCard label="Plan mensual" value={monthly} /><StatCard label="Planes vencidos" value={users.filter((user) => user.planExpired).length} /></div><article className="admin-panel plans-page__panel"><h2>Operaciones preparadas</h2><p className="admin-section-note">Activación y renovación están disponibles en el servicio mediante los endpoints reales <code>/plan/activate</code> y <code>/plan/renew</code>. Los formularios y confirmaciones quedan pendientes para la fase de lógica de negocio.</p></article></> : <AdminState title="Sin datos de planes" message="No hay usuarios disponibles para construir el resumen." />}</section>;
}
