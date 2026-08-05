import { useCallback, useState } from "react";
import { adminApi } from "../../services/adminApi.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { AdminState } from "../../components/AdminState/AdminState.jsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.jsx";
import "./audit.css";

const actions = ["", "OCR_ENABLED", "OCR_DISABLED", "PLAN_ACTIVATED", "PLAN_RENEWED", "OCR_LIMIT_CHANGED", "OCR_USAGE_RESET", "ADMIN_GRANTED", "ADMIN_REVOKED"];
const formatDate = (value) => value ? new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value)) : "Pendiente";

export function AuditPage() {
  const [action, setAction] = useState("");
  const load = useCallback((signal) => adminApi.getAuditEvents({ page: 1, limit: 25, action }, { signal }), [action]);
  const query = useAdminQuery(load, `audit:${action}`);
  return <section className="audit-page"><PageHeader eyebrow="Trazabilidad" title="Auditoría" description="Eventos administrativos registrados por Central Tags Server, ordenados del más reciente al más antiguo." /><div className="admin-toolbar"><select className="admin-select" value={action} onChange={(event) => setAction(event.target.value)}>{actions.map((item) => <option key={item || "all"} value={item}>{item || "Todas las acciones"}</option>)}</select></div>{query.status === "loading" && <AdminState type="loading" title="Cargando auditoría" />}{query.status === "error" && <AdminState type="error" title="No se pudo cargar la auditoría" message={query.error.message} action={<button className="admin-button" onClick={query.reload}>Reintentar</button>} />}{query.status === "success" && !query.data.items?.length && <AdminState title="Sin eventos" message="No hay eventos para los filtros seleccionados." />}{query.status === "success" && query.data.items?.length > 0 && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Fecha UTC</th><th>Acción</th><th>Administrador</th><th>Objetivo</th></tr></thead><tbody>{query.data.items.map((event) => <tr key={event.id}><td>{formatDate(event.createdAt)}</td><td><span className="admin-badge">{event.action}</span></td><td>{event.adminEmail || event.adminUid}</td><td>{event.targetEmail || event.targetUid}</td></tr>)}</tbody></table></div>}</section>;
}
