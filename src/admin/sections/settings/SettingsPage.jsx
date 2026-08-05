import { AdminState } from "../../components/AdminState/AdminState.jsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.jsx";
import "./settings.css";

export function SettingsPage() {
  return <section className="settings-page"><PageHeader eyebrow="Sistema" title="Configuración" description="Espacio reservado para parámetros administrativos gestionados por el servidor." /><div className="admin-grid admin-grid--two"><article className="admin-panel"><h2>Conexión del servidor</h2><div className="admin-kv"><div><span>Origen</span><strong>VITE_CENTRAL_TAGS_SERVER_URL</strong></div><div><span>Autenticación</span><strong>Firebase ID Token</strong></div></div></article><article className="admin-panel"><h2>Estado de integración</h2><AdminState title="Endpoint pendiente" message="Central Tags Server no expone actualmente una ruta administrativa de configuración. No se creó ningún endpoint ficticio." /></article></div></section>;
}
