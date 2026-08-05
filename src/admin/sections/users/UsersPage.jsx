import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../services/adminApi.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { AdminState } from "../../components/AdminState/AdminState.jsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.jsx";
import "./users.css";

export function UsersPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const load = useCallback((signal) => adminApi.getUsers({ search, page: 1, limit: 25 }, { signal }), [search]);
  const query = useAdminQuery(load, `users:${search}`);
  const openUser = (uid) => navigate(`/admin/usuarios/${uid}`);
  return <section className="users-page"><PageHeader eyebrow="Gestión" title="Usuarios" description="Listado y búsqueda provistos por GET /admin/users." /><form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); }}><input className="admin-input users-page__search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Buscar por correo" /><button className="admin-button" type="submit">Buscar</button></form>{query.status === "loading" && <AdminState type="loading" title="Cargando usuarios" />}{query.status === "error" && <AdminState type="error" title="No se pudieron cargar los usuarios" message={query.error.message} action={<button className="admin-button" onClick={query.reload}>Reintentar</button>} />}{query.status === "success" && !query.data.items?.length && <AdminState title="Sin usuarios" message={search ? "No hay resultados para la búsqueda actual." : "El servidor no devolvió usuarios."} />}{query.status === "success" && query.data.items?.length > 0 && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Usuario</th><th>Plan</th><th>OCR</th><th>Uso</th><th>Rol</th></tr></thead><tbody>{query.data.items.map((user) => <tr className="users-page__row" key={user.uid} tabIndex="0" onClick={() => openUser(user.uid)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openUser(user.uid); } }}><td><Link className="admin-link" to={`/admin/usuarios/${user.uid}`} onClick={(event) => event.stopPropagation()}>{user.email || "Sin correo"}</Link><small className="users-page__uid">{user.uid}</small></td><td><span className="admin-badge">{user.plan}</span></td><td><span className={`admin-badge ${user.ocrAvailable ? "admin-badge--success" : "admin-badge--warning"}`}>{user.ocrAvailable ? "Disponible" : "No disponible"}</span></td><td>{user.ocrUsed} / {user.ocrLimit}</td><td>{user.isAdmin ? "Administrador" : "Usuario"}</td></tr>)}</tbody></table></div>}</section>;
}
