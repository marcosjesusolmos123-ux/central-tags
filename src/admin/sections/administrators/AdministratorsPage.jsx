import { useCallback } from "react";
import { adminApi } from "../../services/adminApi.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { AdminState } from "../../components/AdminState/AdminState.jsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.jsx";
import "./administrators.css";

export function AdministratorsPage() {
  const load = useCallback((signal) => adminApi.getUsers({ page: 1, limit: 100 }, { signal }), []);
  const query = useAdminQuery(load, "administrators");
  const administrators = query.data?.items?.filter((user) => user.isAdmin) || [];
  return <section className="administrators-page"><PageHeader eyebrow="Accesos" title="Administradores" description="Vista derivada del listado real de usuarios. Las operaciones grant/revoke ya están centralizadas en el servicio API." />{query.status === "loading" && <AdminState type="loading" title="Cargando administradores" />}{query.status === "error" && <AdminState type="error" title="No se pudieron cargar los administradores" message={query.error.message} action={<button className="admin-button" onClick={query.reload}>Reintentar</button>} />}{query.status === "success" && !administrators.length && <AdminState title="Sin administradores en esta página" message="El backend no ofrece un endpoint para listar administradores; esta vista filtra la primera página de usuarios disponible." />}{administrators.length > 0 && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Correo</th><th>UID</th><th>Estado</th></tr></thead><tbody>{administrators.map((user) => <tr key={user.uid}><td>{user.email || "Sin correo"}</td><td>{user.uid}</td><td><span className="admin-badge admin-badge--success">Administrador</span></td></tr>)}</tbody></table></div>}<p className="admin-section-note administrators-page__note">Pendiente de interfaz: conceder y revocar permisos con confirmación. Endpoints disponibles: POST /admin/admins/grant y POST /admin/admins/revoke.</p></section>;
}
