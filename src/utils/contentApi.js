import { API_BASE_URL } from "../config/api";

const token = () => localStorage.getItem("sya_admin_token");

export function resolveImageUrl(value) {
  const image = String(value || "").trim().replace(/\\/g, "/");
  if (!image) return "";
  if (/^https?:/i.test(image)) {
    try {
      const parsed = new URL(image);
      const driveFile = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      const driveId = driveFile?.[1] || parsed.searchParams.get("id");
      if (parsed.hostname.includes("drive.google.com") && driveId) {
        return `https://drive.google.com/uc?export=view&id=${encodeURIComponent(driveId)}`;
      }
      const mediaUrl = parsed.searchParams.get("mediaurl");
      if (mediaUrl) return mediaUrl;
    } catch {
      return image;
    }
    return image;
  }
  if (/^(data:|blob:)/i.test(image)) return image;
  if (image.startsWith("public/")) return encodeURI(`/${image.slice(7)}`);
  if (image.startsWith("/")) return encodeURI(image);
  return encodeURI(`/${image.replace(/^\.\//, "")}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    let message = "No se pudo completar la solicitud";
    try {
      const data = JSON.parse(body);
      message = data.message || data.error || message;
    } catch {
      if (body.trim()) message = body.slice(0, 180);
    }

    if (response.status === 401) {
      message = "La sesión administrativa expiró. Inicia sesión nuevamente.";
    } else if (response.status === 403) {
      message = "Tu usuario no tiene permiso para modificar este contenido.";
    }

    throw new Error(`${message} (HTTP ${response.status})`);
  }

  return response.json();
}

export function getPublicContent(type) {
  return request(`/api/contenido/${type}`);
}

export function getAdminContent(type) {
  return request(`/api/admin/contenido/${type}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export function createContent(type, content) {
  return request(`/api/admin/contenido/${type}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}` },
    body: JSON.stringify(content),
  });
}

export function updateContent(type, id, content) {
  return request(`/api/admin/contenido/${type}/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token()}` },
    body: JSON.stringify(content),
  });
}

export function deleteContent(type, id) {
  return request(`/api/admin/contenido/${type}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token()}` },
  });
}
