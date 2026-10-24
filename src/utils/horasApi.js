import { API_BASE_URL } from "../config/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("sya_admin_token") || ""}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "No se pudo completar la solicitud");
  return data;
}

export function getHourRecords(fecha = "") {
  const query = fecha ? `?fecha=${encodeURIComponent(fecha)}` : "";
  return request(`/api/admin/registros-horas${query}`);
}

export function createHourRecord(record) {
  return request("/api/admin/registros-horas", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export function updateHourRecord(id, record) {
  return request(`/api/admin/registros-horas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(record),
  });
}

export function deleteHourRecord(id) {
  return request(`/api/admin/registros-horas/${id}`, { method: "DELETE" });
}
