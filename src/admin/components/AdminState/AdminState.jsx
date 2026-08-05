import "./AdminState.css";

export function AdminState({ type = "empty", title, message, action, fullPage = false }) {
  return <div className={`admin-state admin-state--${type}${fullPage ? " admin-state--full" : ""}`}>{type === "loading" && <span className="admin-state__spinner" aria-hidden="true" />}<h2>{title}</h2>{message && <p>{message}</p>}{action}</div>;
}
