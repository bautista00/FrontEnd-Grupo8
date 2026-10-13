export const API_PUBLICACIONES = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

function pedir(apiUrl, token, ruta, method = 'GET', datos) {
  return fetch(apiUrl + ruta, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(datos ? { 'Content-Type': 'application/json' } : {}) },
    ...(datos ? { body: JSON.stringify(datos) } : {}),
  }).then((respuesta) => {
    if (respuesta.ok) return respuesta.status === 204 ? null : respuesta.json()
    return respuesta.text().then((texto) => {
      let mensaje = 'No se pudo completar la operación. Intentá nuevamente.'
      try {
        const datosError = JSON.parse(texto)
        if (typeof datosError.message === 'string' && datosError.message !== 'No message available') mensaje = datosError.message
      } catch {
        if (texto && !texto.includes('<') && texto.length < 300) mensaje = texto
      }
      if (respuesta.status === 401) mensaje = 'La sesión venció o no es válida. Volvé a iniciar sesión.'
      if (respuesta.status === 403) mensaje = 'No tenés permiso para realizar esta operación.'
      const error = new Error(mensaje)
      error.status = respuesta.status
      throw error
    })
  }).catch((error) => {
    if (error.status) throw error
    throw new Error('No pudimos obtener la respuesta del servidor. Revisá la conexión e intentá nuevamente.')
  })
}

export function consultarUsuario(apiUrl, token) {
  return pedir(apiUrl, token, '/usuarios/me')
}

export function consultarMisPublicaciones(apiUrl, token, { pagina = 0, estado = 'TODAS', busqueda = '' }) {
  const parametros = new URLSearchParams({ page: pagina, size: 10 })
  if (estado !== 'TODAS') parametros.set('estado', estado)
  if (busqueda.trim()) parametros.set('busqueda', busqueda.trim())
  return pedir(apiUrl, token, '/publicaciones/mias?' + parametros)
}

export function consultarVehiculos(apiUrl, token, pagina) {
  return pedir(apiUrl, token, `/vehiculo/mios?page=${pagina}&size=10`)
}

export function consultarPublicacion(apiUrl, token, id) {
  return pedir(apiUrl, token, '/publicaciones/' + id)
}

export function consultarVehiculo(apiUrl, token, id) {
  return pedir(apiUrl, token, '/vehiculo/' + id)
}

export function consultarUbicacion(apiUrl, token, id) {
  return pedir(apiUrl, token, '/ubicaciones/' + id)
}

export function consultarPeriodos(apiUrl, token, id) {
  return pedir(apiUrl, token, '/disponibilidades/publicacion/' + id)
}

export function consultarImagenes(apiUrl, token, id) {
  return pedir(apiUrl, token, '/imagen-vehiculo/por-vehiculo/' + id)
}

export function cambiarEstadoPublicacion(apiUrl, token, id, accion) {
  if (!['pausar', 'reactivar', 'desactivar'].includes(accion)) return Promise.reject(new Error('Acción inválida.'))
  return pedir(apiUrl, token, '/publicaciones/' + id + (accion === 'desactivar' ? '' : '/' + accion), accion === 'desactivar' ? 'DELETE' : 'PUT')
}

export function crearUbicacion(apiUrl, token, datos) {
  return pedir(apiUrl, token, '/ubicaciones', 'POST', datos)
}

export function guardarDatosPublicacion(apiUrl, token, id, datos) {
  return pedir(apiUrl, token, '/publicaciones' + (id ? '/' + id : ''), id ? 'PUT' : 'POST', datos)
}

export function guardarPeriodo(apiUrl, token, id, datos) {
  return pedir(apiUrl, token, '/disponibilidades' + (id ? '/' + id : ''), id ? 'PUT' : 'POST', datos)
}

export function eliminarPeriodo(apiUrl, token, id) {
  return pedir(apiUrl, token, '/disponibilidades/' + id, 'DELETE')
}
