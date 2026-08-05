import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

const navigation = [
  ["/admin", "Dashboard", "⌂"], ["/admin/usuarios", "Usuarios", "◎"],
  ["/admin/administradores", "Administradores", "◇"], ["/admin/planes", "Planes", "▤"],
  ["/admin/ocr", "OCR", "◉"], ["/admin/estadisticas", "Estadísticas", "⌁"],
  ["/admin/auditoria", "Auditoría", "≡"], ["/admin/configuracion", "Configuración", "⚙"],
];

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${menuOpen ? " admin-sidebar--open" : ""}`}>
        <div className="admin-brand"><span>CT</span><div><strong>Central Tags</strong><small>Panel administrador</small></div></div>
        <nav aria-label="Navegación administrativa">{navigation.map(([to, label, icon]) => <NavLink key={to} to={to} end={to === "/admin"} onClick={() => setMenuOpen(false)}><span aria-hidden="true">{icon}</span>{label}</NavLink>)}</nav>
        <a className="admin-sidebar__back" href="/">← Volver a Central Tags</a>
      </aside>
      {menuOpen && <button className="admin-sidebar-backdrop" aria-label="Cerrar navegación" onClick={() => setMenuOpen(false)} />}
      <div className="admin-workspace">
        <div className="admin-mobile-bar"><button type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir navegación">☰</button><strong>Central Tags Admin</strong></div>
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
}
