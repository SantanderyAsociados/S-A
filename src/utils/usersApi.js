import { API_BASE_URL } from "../config/api";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("sya_admin_token")}`,
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "No se pudo completar la solicitud");
  return data;
}

export function getUsers() {
  return request("/api/admin/usuarios");
}

export function createUser(user) {
  return request("/api/admin/usuarios", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function updateUser(id, changes) {
  return request(`/api/admin/usuarios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deleteUser(id) {
  return request(`/api/admin/usuarios/${id}`, { method: "DELETE" });
}
