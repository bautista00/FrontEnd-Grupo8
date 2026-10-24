import { API_URL } from '../../utils/api'

// Conservamos el estado HTTP para distinguir un rechazo de una respuesta perdida.
export default function enviarPublicacion(ruta, metodo, token, datos) {
  return fetch(API_URL + ruta, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: datos ? JSON.stringify(datos) : undefined,
  }).then((respuesta) => {
    if (!respuesta.ok) {
      return respuesta.json().catch(() => ({})).then((cuerpo) => {
        const error = new Error(cuerpo.mensaje || cuerpo.message || 'No se pudo guardar. Intentá nuevamente.')
        error.status = respuesta.status
        throw error
      })
    }
    return respuesta.status === 204 ? null : respuesta.json()
  })
}
