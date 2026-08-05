import { auth } from "../../firebase.js";

const ADMIN_API_URL = import.meta.env.VITE_CENTRAL_TAGS_SERVER_URL || "https://central-tags-server.onrender.com";

export class AdminApiError extends Error {
  constructor(message, { status = 0, code = "ADMIN_REQUEST_FAILED" } = {}) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
  }
}

function queryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  return query.toString() ? `?${query}` : "";
}

async function adminRequest(path, options = {}) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new AdminApiError("No hay una sesión autenticada.", { status: 401, code: "AUTH_REQUIRED" });
  const idToken = await currentUser.getIdToken();
  const response = await fetch(`${ADMIN_API_URL}/admin${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${idToken}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new AdminApiError(data.message || "La operación administrativa falló.", { status: response.status, code: data.code });
  return data;
}

const withBody = (method, body) => ({ method, body: JSON.stringify(body) });

export const adminApi = {
  getSession: (options) => adminRequest("/session", options),
  getDashboard: (options) => adminRequest("/dashboard", options),
  getUsers: (params, options) => adminRequest(`/users${queryString(params)}`, options),
  getUser: (uid, options) => adminRequest(`/users/${encodeURIComponent(uid)}`, options),
  getAuditEvents: (params, options) => adminRequest(`/audit-events${queryString(params)}`, options),
  setOcrEnabled: (uid, enabled) => adminRequest(`/users/${encodeURIComponent(uid)}/ocr/${enabled ? "enable" : "disable"}`, { method: "POST" }),
  activatePlan: (uid, payload) => adminRequest(`/users/${encodeURIComponent(uid)}/plan/activate`, withBody("POST", payload)),
  renewPlan: (uid, payload) => adminRequest(`/users/${encodeURIComponent(uid)}/plan/renew`, withBody("POST", payload)),
  changeOcrLimit: (uid, ocrLimit) => adminRequest(`/users/${encodeURIComponent(uid)}/ocr/limit`, withBody("PATCH", { ocrLimit })),
  resetOcrUsage: (uid) => adminRequest(`/users/${encodeURIComponent(uid)}/ocr/reset`, { method: "POST" }),
  grantAdmin: (email) => adminRequest("/admins/grant", withBody("POST", { email })),
  revokeAdmin: (email) => adminRequest("/admins/revoke", withBody("POST", { email })),
};
