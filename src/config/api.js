export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://backend-production-8223.up.railway.app";

export async function obtenerContenido(tipo) {
  const response = await fetch(
    `${API_BASE_URL}/api/contenido/${tipo}`
  );

  if (!response.ok) {
    throw new Error("No se pudo cargar el contenido");
  }

  return response.json();
}

export async function obtenerConfiguracion() {
  const response = await fetch(
    `${API_BASE_URL}/api/configuracion`
  );

  if (!response.ok) {
    throw new Error("No se pudo cargar la configuración");
  }

  return response.json();
}

export async function iniciarSesion(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al iniciar sesión");
  }

  return data;
}

export async function enviarMensaje(datos) {
  const response = await fetch(`${API_BASE_URL}/api/mensajes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo enviar el mensaje");
  }

  return data;
}