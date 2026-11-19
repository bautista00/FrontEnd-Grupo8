/**
 * Funciones auxiliares para comunicarse con el backend y conservar sus mensajes de error.
 */

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// Configuración de axios con el token del usuario para los thunks de Redux (sin sesión no manda el header).
export const conToken = (token) => (token ? { headers: { Authorization: `Bearer ${token}` } } : {})

// Momento (en ms) en que vence el token JWT, según su campo "exp". Si no se puede leer, se toma como vencido.
export function vencimientoToken(token) {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return Number.isFinite(exp) ? exp * 1000 : 0
  } catch {
    return 0
  }
}

// Hay sesión solo si hay token y todavía no venció
export const tokenVigente = (token) => Boolean(token) && vencimientoToken(token) > Date.now()

// Mensaje de un error de axios: el que mandó el backend o, si no hay, el indicado.
export function mensajeDe(error, porDefecto) {
  return error.response?.data?.mensaje || error.response?.data?.message || porDefecto
}

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