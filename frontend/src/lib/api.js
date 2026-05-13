const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:8000" : "");
const TOKEN_KEY = "gym_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = (data && (data.detail || data.message)) || res.statusText;
    const err = new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  me: () => request("/auth/me"),
  submitReport: (payload) => request("/reports", { method: "POST", body: payload }),
  listReports: () => request("/reports"),
  getReport: (id) => request(`/reports/${id}`),
  listUsers: () => request("/auth/users"),
  createUser: (payload) => request("/auth/users", { method: "POST", body: payload }),
  updateUser: (id, payload) => request(`/auth/users/${id}`, { method: "PATCH", body: payload }),
  deleteUser: (id) => request(`/auth/users/${id}`, { method: "DELETE" }),
};
