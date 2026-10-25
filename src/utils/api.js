/**
 * Funciones auxiliares para comunicarse con el backend y conservar sus mensajes de error.
 */

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// Lee el mensaje del backend y lo convierte en un Error que recibirá el catch de la vista.
async function errorDe(respuesta, mensajeError) {
  const cuerpo = await respuesta.json().catch(() => ({}))
  return new Error(cuerpo.mensaje || cuerpo.message || mensajeError)
}

// Hace un GET y devuelve el JSON de la respuesta.
export async function obtener(ruta, token) {
  const respuesta = await fetch(API_URL + ruta, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!respuesta.ok) throw await errorDe(respuesta, 'No se pudo obtener la información del servidor.')
  return respuesta.json()
}

// Envía datos en JSON. Una respuesta 204 se devuelve como null porque no tiene cuerpo.
export async function enviar(ruta, metodo, token, datos, mensajeError = 'No se pudo guardar. Intentá nuevamente.') {
  const respuesta = await fetch(API_URL + ruta, {
    method: metodo,
    headers: { ...(token && { Authorization: `Bearer ${token}` }), 'Content-Type': 'application/json' },
    body: datos ? JSON.stringify(datos) : undefined,
  })
  if (!respuesta.ok) throw await errorDe(respuesta, mensajeError)
  return respuesta.status === 204 ? null : respuesta.json()
}

// Envía FormData; el navegador agrega el Content-Type correspondiente.
export async function subirArchivo(ruta, metodo, token, formData, mensajeError = 'No se pudo subir el archivo.') {
  const respuesta = await fetch(API_URL + ruta, {
    method: metodo,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!respuesta.ok) throw await errorDe(respuesta, mensajeError)
  return respuesta.status === 204 ? null : respuesta.json()
}