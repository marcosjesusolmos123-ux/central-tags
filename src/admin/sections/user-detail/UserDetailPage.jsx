import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "../../services/adminApi.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { AdminState } from "../../components/AdminState/AdminState.jsx";
import { PageHeader } from "../../components/PageHeader/PageHeader.jsx";
import { StatCard } from "../../components/StatCard/StatCard.jsx";
import "./user-detail.css";

const date = (value) => value ? new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value)) : "—";
const initialMonthlyPlan = { ocrLimit: "", planStartsAt: "", planExpiresAt: "" };

export function UserDetailPage() {
  const { uid } = useParams();
  const [busyAction, setBusyAction] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [planType, setPlanType] = useState("monthly");
  const [activation, setActivation] = useState(initialMonthlyPlan);
  const [renewal, setRenewal] = useState(initialMonthlyPlan);
  const [limit, setLimit] = useState("");
  const load = useCallback((signal) => adminApi.getUser(uid, { signal }), [uid]);
  const query = useAdminQuery(load, `user:${uid}`);

  const runAction = async (name, confirmation, operation, successMessage) => {
    if (!window.confirm(confirmation)) return;
    setBusyAction(name);
    setFeedback(null);
    try {
      await operation();
      setFeedback({ type: "success", message: successMessage });
      query.reload();
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "La operación no pudo completarse." });
    } finally {
      setBusyAction("");
    }
  };

  const positiveInteger = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  };

  const submitActivation = (event) => {
    event.preventDefault();
    const ocrLimit = positiveInteger(activation.ocrLimit);
    if (planType === "monthly" && (!ocrLimit || !activation.planStartsAt || !activation.planExpiresAt)) {
      setFeedback({ type: "error", message: "Completá un límite positivo y ambas fechas para activar el plan monthly." });
      return;
    }
    const payload = planType === "free" ? { plan: "free" } : { plan: "monthly", ocrLimit, planStartsAt: activation.planStartsAt, planExpiresAt: activation.planExpiresAt };
    runAction("activate-plan", `¿Confirmás activar el plan ${planType} y reiniciar el contador OCR?`, () => adminApi.activatePlan(uid, payload), "Plan activado correctamente.");
  };

  const submitRenewal = (event) => {
    event.preventDefault();
    const ocrLimit = positiveInteger(renewal.ocrLimit);
    if (!ocrLimit || !renewal.planStartsAt || !renewal.planExpiresAt) {
      setFeedback({ type: "error", message: "Completá un límite positivo y ambas fechas para renovar el plan." });
      return;
    }
    runAction("renew-plan", "¿Confirmás renovar el plan monthly y reiniciar el contador OCR?", () => adminApi.renewPlan(uid, { ocrLimit, planStartsAt: renewal.planStartsAt, planExpiresAt: renewal.planExpiresAt }), "Plan renovado correctamente.");
  };

  const submitLimit = (event) => {
    event.preventDefault();
    const ocrLimit = positiveInteger(limit);
    if (!ocrLimit) {
      setFeedback({ type: "error", message: "Ingresá un límite entero positivo." });
      return;
    }
    runAction("change-limit", `¿Confirmás cambiar el límite OCR a ${ocrLimit}?`, () => adminApi.changeOcrLimit(uid, ocrLimit), "Límite actualizado correctamente.");
  };

  if (query.status === "loading") return <AdminState type="loading" title="Cargando ficha" />;
  if (query.status === "error") return <AdminState type="error" title="No se pudo cargar el usuario" message={query.error.message} action={<Link className="admin-button admin-link" to="/admin/usuarios">Volver</Link>} />;
  const user = query.data.user;
  const disabled = Boolean(busyAction);

  return <section className="user-detail-page">
    <PageHeader eyebrow="Ficha de usuario" title={user.email || "Usuario sin correo"} description={`UID: ${user.uid}`} actions={<Link className="admin-button admin-link" to="/admin/usuarios">← Usuarios</Link>} />
    {feedback && <div className={`user-detail-page__feedback user-detail-page__feedback--${feedback.type}`} role="status">{feedback.message}</div>}
    <div className="admin-grid admin-grid--stats"><StatCard label="Uso OCR" value={`${user.ocrUsed} / ${user.ocrLimit}`} /><StatCard label="Restantes" value={user.ocrRemaining ?? 0} /><StatCard label="Plan" value={user.plan} /><StatCard label="Estado" value={user.ocrAvailable ? "Activo" : "Bloqueado"} /></div>
    <div className="admin-grid admin-grid--two user-detail-page__content">
      <article className="admin-panel"><h2>Cuenta y plan</h2><div className="admin-kv"><div><span>Correo</span><strong>{user.email || "Sin correo"}</strong></div><div><span>UID</span><strong>{user.uid}</strong></div><div><span>Administrador</span><strong>{user.isAdmin ? "Sí" : "No"}</strong></div><div><span>Alta</span><strong>{date(user.createdAt)}</strong></div><div><span>OCR configurado</span><strong>{user.ocrEnabled ? "Activado" : "Desactivado"}</strong></div><div><span>Plan actual</span><strong>{user.plan}</strong></div><div><span>Inicio del plan</span><strong>{date(user.planStartsAt)}</strong></div><div><span>Vencimiento</span><strong>{date(user.planExpiresAt)}</strong></div></div></article>
      <article className="admin-panel"><h2>Resumen de uso</h2><div className="admin-kv"><div><span>Utilizados</span><strong>{user.ocrUsed ?? 0}</strong></div><div><span>Límite</span><strong>{user.ocrLimit ?? 0}</strong></div><div><span>Restantes</span><strong>{user.ocrRemaining ?? 0}</strong></div><div><span>Hoy</span><strong>{user.usage?.today ?? 0}</strong></div><div><span>Últimos 7 días</span><strong>{user.usage?.last7Days ?? 0}</strong></div><div><span>Mes actual</span><strong>{user.usage?.currentMonth ?? 0}</strong></div></div></article>
    </div>
    <article className="admin-panel user-detail-page__operations"><h2>Operaciones OCR y permisos</h2><div className="user-detail-page__button-grid"><button className="admin-button" type="button" disabled={disabled} onClick={() => runAction("enable-ocr", "¿Confirmás activar el OCR para este usuario?", () => adminApi.setOcrEnabled(uid, true), "OCR activado correctamente.")}>Activar OCR</button><button className="admin-button user-detail-page__danger" type="button" disabled={disabled} onClick={() => runAction("disable-ocr", "¿Confirmás desactivar el OCR para este usuario?", () => adminApi.setOcrEnabled(uid, false), "OCR desactivado correctamente.")}>Desactivar OCR</button><button className="admin-button" type="button" disabled={disabled} onClick={() => runAction("reset-ocr", "¿Confirmás reiniciar el contador OCR a cero?", () => adminApi.resetOcrUsage(uid), "Contador OCR reiniciado correctamente.")}>Reiniciar contador</button><button className="admin-button" type="button" disabled={disabled || user.isAdmin || !user.email} onClick={() => runAction("grant-admin", `¿Confirmás dar permisos de administrador a ${user.email}?`, () => adminApi.grantAdmin(user.email), "Permisos de administrador concedidos.")}>Dar permisos de administrador</button><button className="admin-button user-detail-page__danger" type="button" disabled={disabled || !user.isAdmin || !user.email} onClick={() => runAction("revoke-admin", `¿Confirmás quitar los permisos de administrador a ${user.email}?`, () => adminApi.revokeAdmin(user.email), "Permisos de administrador retirados.")}>Quitar permisos de administrador</button></div>{busyAction && <p className="admin-section-note">Procesando operación…</p>}</article>
    <div className="admin-grid admin-grid--two user-detail-page__forms">
      <form className="admin-panel user-detail-page__form" onSubmit={submitActivation}><h2>Activar plan</h2><label>Plan<select className="admin-select" value={planType} onChange={(event) => setPlanType(event.target.value)} disabled={disabled}><option value="monthly">monthly</option><option value="free">free</option></select></label>{planType === "monthly" && <><label>Límite OCR<input className="admin-input" type="number" min="1" step="1" value={activation.ocrLimit} onChange={(event) => setActivation({ ...activation, ocrLimit: event.target.value })} required /></label><label>Inicio<input className="admin-input" type="date" value={activation.planStartsAt} onChange={(event) => setActivation({ ...activation, planStartsAt: event.target.value })} required /></label><label>Vencimiento<input className="admin-input" type="date" value={activation.planExpiresAt} onChange={(event) => setActivation({ ...activation, planExpiresAt: event.target.value })} required /></label></>}<button className="admin-button" type="submit" disabled={disabled}>Activar plan</button></form>
      <form className="admin-panel user-detail-page__form" onSubmit={submitRenewal}><h2>Renovar plan monthly</h2><label>Nuevo límite OCR<input className="admin-input" type="number" min="1" step="1" value={renewal.ocrLimit} onChange={(event) => setRenewal({ ...renewal, ocrLimit: event.target.value })} required /></label><label>Nuevo inicio<input className="admin-input" type="date" value={renewal.planStartsAt} onChange={(event) => setRenewal({ ...renewal, planStartsAt: event.target.value })} required /></label><label>Nuevo vencimiento<input className="admin-input" type="date" value={renewal.planExpiresAt} onChange={(event) => setRenewal({ ...renewal, planExpiresAt: event.target.value })} required /></label><button className="admin-button" type="submit" disabled={disabled}>Renovar plan</button></form>
      <form className="admin-panel user-detail-page__form" onSubmit={submitLimit}><h2>Cambiar límite</h2><label>Nuevo límite OCR<input className="admin-input" type="number" min="1" step="1" value={limit} onChange={(event) => setLimit(event.target.value)} required /></label><button className="admin-button" type="submit" disabled={disabled}>Cambiar límite</button></form>
    </div>
  </section>;
}
