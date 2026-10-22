export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// El backend responde los errores como { "mensaje": "..." }.
// Si no hay cuerpo (por ejemplo un 401 del filtro JWT), usamos el mensaje por defecto.
async function errorDe(respuesta, mensajeError) {
  const cuerpo = await respuesta.json().catch(() => ({}))
  return new Error(cuerpo.mensaje || cuerpo.message || mensajeError)
}

// GET: devuelve el JSON. El token se manda solo si hay sesión.
export async function obtener(ruta, token) {
  const respuesta = await fetch(API_URL + ruta, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!respuesta.ok) throw await errorDe(respuesta, 'No se pudo obtener la información del servidor.')
  return respuesta.json()
}

// POST, PUT o DELETE con JSON.
export async function enviar(ruta, metodo, token, datos, mensajeError = 'No se pudo guardar. Intentá nuevamente.') {
  const respuesta = await fetch(API_URL + ruta, {
    method: metodo,
    headers: { ...(token && { Authorization: `Bearer ${token}` }), 'Content-Type': 'application/json' },
    body: datos ? JSON.stringify(datos) : undefined,
  })
  if (!respuesta.ok) throw await errorDe(respuesta, mensajeError)
  return respuesta.status === 204 ? null : respuesta.json()
}

// Subida de archivos (FormData). No se pone Content-Type: lo arma el navegador.
export async function subirArchivo(ruta, metodo, token, formData, mensajeError = 'No se pudo subir el archivo.') {
  const respuesta = await fetch(API_URL + ruta, {
    method: metodo,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!respuesta.ok) throw await errorDe(respuesta, mensajeError)
  return respuesta.status === 204 ? null : respuesta.json()
}