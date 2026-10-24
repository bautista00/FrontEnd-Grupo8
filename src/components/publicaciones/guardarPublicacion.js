import enviar from './enviarPublicacion'
import { cambiaronDatos, datosPublicacion, datosUbicacion, periodoDesdeApi } from './publicationFormData'

export default function guardarPublicacion({ valores, publicacion, token }) {
  let guardada = { ...publicacion, periodos: [...(publicacion?.periodos ?? [])] }
  let recurso = 'publicación'
  let parcial = false
  let pedidos = Promise.resolve()

  if (!guardada.idPublicacion) {
    const ubicacion = datosUbicacion(valores)
    if (JSON.stringify(ubicacion) !== JSON.stringify(guardada.ubicacionGuardada)) {
      pedidos = pedidos.then(() => {
        recurso = 'ubicación'
        return enviar('/ubicaciones', 'POST', token, ubicacion)
      }).then((respuesta) => {
        guardada = { ...guardada, ...respuesta, ubicacionGuardada: ubicacion }
        parcial = true
      })
    }
    pedidos = pedidos.then(() => {
      recurso = 'publicación'
      return enviar('/publicaciones', 'POST', token, datosPublicacion(valores, guardada.idUbicacion))
    }).then((respuesta) => {
      guardada = { ...guardada, ...respuesta }
      parcial = true
    })
  } else if (cambiaronDatos(valores, guardada)) {
    pedidos = pedidos.then(() => enviar(`/publicaciones/${guardada.idPublicacion}`, 'PUT', token,
      datosPublicacion(valores, guardada.idUbicacion))).then((respuesta) => {
      guardada = { ...guardada, ...respuesta }
      parcial = true
    })
  }

  valores.periodos.filter((periodo) => !periodo.idDisponibilidad).forEach((periodo) => {
    pedidos = pedidos.then(() => {
      recurso = 'períodos'
      return enviar('/disponibilidades', 'POST', token, {
        idPublicacion: guardada.idPublicacion, fechaInicio: periodo.desde, fechaFin: periodo.hasta,
      })
    }).then((respuesta) => {
      guardada.periodos = [...guardada.periodos, { ...periodoDesdeApi(respuesta), clave: periodo.clave }]
      parcial = true
    })
  })

  ;(publicacion?.periodos ?? []).filter((periodo) =>
    !valores.periodos.some((actual) => actual.idDisponibilidad === periodo.idDisponibilidad)).forEach((periodo) => {
    pedidos = pedidos.then(() => {
      recurso = 'períodos'
      return enviar(`/disponibilidades/${periodo.idDisponibilidad}`, 'DELETE', token)
    }).then(() => {
      guardada.periodos = guardada.periodos.filter((actual) => actual.idDisponibilidad !== periodo.idDisponibilidad)
      parcial = true
    })
  })

  return pedidos.then(() => guardada).catch((error) => {
    error.guardada = guardada
    error.parcial = parcial
    error.recurso = recurso
    throw error
  })
}
