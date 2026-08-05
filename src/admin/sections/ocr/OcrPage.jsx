import { useCallback } from "react";
import { adminApi } from "../../services/adminApi.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { AdminState } from "../../components/AdminState/AdminState.jsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.jsx";
import { StatCard } from "../../components/StatCard/StatCard.jsx";
import "./ocr.css";

export function OcrPage() {
  const load = useCallback((signal) => adminApi.getDashboard({ signal }), []);
  const query = useAdminQuery(load, "ocr");
  if (query.status === "loading") return <AdminState type="loading" title="Cargando estado OCR" />;
  if (query.status === "error") return <AdminState type="error" title="No se pudo cargar OCR" message={query.error.message} action={<button className="admin-button" onClick={query.reload}>Reintentar</button>} />;
  const data = query.data;
  return <section className="ocr-page"><PageHeader eyebrow="Operación" title="OCR" description="Métricas administrativas. El procesamiento OCR existente no fue modificado." /><div className="admin-grid admin-grid--stats"><StatCard label="Usuarios activos" value={data.usersWithOcrActive ?? 0} /><StatCard label="Hoy" value={data.ocrProcessedToday ?? 0} /><StatCard label="Mes actual" value={data.ocrProcessedCurrentMonth ?? 0} /><StatCard label="Histórico" value={data.ocrProcessedAllTime ?? 0} /></div><article className="admin-panel ocr-page__panel"><h2>Controles preparados</h2><p className="admin-section-note">El cliente API contiene habilitar/deshabilitar OCR, cambiar límite y reiniciar uso usando exclusivamente los endpoints existentes. No se activaron acciones para evitar introducir lógica de confirmación incompleta.</p></article></section>;
}
