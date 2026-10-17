const URL = 'http://localhost:8080'

// GET al backend: devuelve el JSON o lanza un error si la respuesta no es OK.
// El token se manda solo si hay sesión.
export function obtener(ruta, token) {
  return fetch(URL + ruta, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    .then((respuesta) => {
      if (!respuesta.ok) throw new Error('No se pudo obtener la información del servidor.')
      return respuesta.json()
    })
}

// POST, PUT o DELETE al backend. Si falla, usamos el mensaje que manda el backend (si hay)
export function enviar(ruta, metodo, token, datos, mensajeError = 'No se pudo guardar. Intentá nuevamente.') {
  return fetch(URL + ruta, {
    method: metodo,
    headers: { ...(token && { Authorization: `Bearer ${token}` }), 'Content-Type': 'application/json' },
    body: datos ? JSON.stringify(datos) : undefined,
  }).then((respuesta) => {
    if (!respuesta.ok) {
      return respuesta.json()
        .catch(() => ({}))
        .then((error) => { throw new Error(error.message || mensajeError) })
    }
    // 204 = sin contenido (por ejemplo, al borrar)
    return respuesta.status === 204 ? null : respuesta.json()
  })
}
