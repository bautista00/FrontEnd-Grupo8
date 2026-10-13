import { crearUbicacion, guardarDatosPublicacion, guardarPeriodo, eliminarPeriodo } from './publicacionesApi'
import { datosPublicacion, datosUbicacion, periodoDesdeApi, valoresIniciales } from '../components/publicaciones/publicationFormData'

export default function guardarPublicacion(apiUrl, token, { valores, base }) {
  let confirmados = { ...base, periodos: [...(base.periodos ?? [])] }
  let pasosGuardados = 0
  let recurso = 'publicación'
  let secuencia = Promise.resolve()

  if (!base.idPublicacion) {
    const ubicacion = datosUbicacion(valores)
    if (!base.idUbicacion || JSON.stringify(base.ubicacionGuardada) !== JSON.stringify(ubicacion)) {
      secuencia = secuencia.then(() => {
        recurso = 'ubicación'
        return crearUbicacion(apiUrl, token, ubicacion)
      }).then((datos) => {
        confirmados = { ...confirmados, ...datos, ubicacionGuardada: ubicacion }
        pasosGuardados++
      })
    }
    secuencia = secuencia.then(() => {
      recurso = 'publicación'
      return guardarDatosPublicacion(apiUrl, token, null, datosPublicacion(valores, confirmados.idUbicacion))
    }).then((datos) => {
      confirmados = { ...confirmados, ...datos }
      pasosGuardados++
    })
  } else if (JSON.stringify(datosPublicacion(valores, base.idUbicacion)) !== JSON.stringify(datosPublicacion(valoresIniciales(base), base.idUbicacion))) {
    secuencia = secuencia.then(() => {
      recurso = 'publicación'
      return guardarDatosPublicacion(apiUrl, token, base.idPublicacion, datosPublicacion(valores, base.idUbicacion))
    }).then((datos) => {
      confirmados = { ...confirmados, ...datos }
      pasosGuardados++
    })
  }

  valores.periodos.forEach((periodo) => {
    const anterior = confirmados.periodos.find((item) => item.idDisponibilidad && item.idDisponibilidad === periodo.idDisponibilidad)
    if (anterior?.desde === periodo.desde && anterior?.hasta === periodo.hasta) return
    secuencia = secuencia.then(() => {
      recurso = 'períodos'
      return guardarPeriodo(apiUrl, token, periodo.idDisponibilidad, { idPublicacion: confirmados.idPublicacion, fechaInicio: periodo.desde, fechaFin: periodo.hasta })
    }).then((datos) => {
      const guardado = { ...periodoDesdeApi(datos), clave: periodo.clave }
      confirmados.periodos = anterior
        ? confirmados.periodos.map((item) => item.idDisponibilidad === anterior.idDisponibilidad ? guardado : item)
        : [...confirmados.periodos, guardado]
      pasosGuardados++
    })
  })
  ;(base.periodos ?? []).filter((periodo) => !valores.periodos.some((item) => item.idDisponibilidad === periodo.idDisponibilidad)).forEach((periodo) => {
    secuencia = secuencia.then(() => {
      recurso = 'períodos'
      return eliminarPeriodo(apiUrl, token, periodo.idDisponibilidad)
    }).then(() => {
      confirmados.periodos = confirmados.periodos.filter((item) => item.idDisponibilidad !== periodo.idDisponibilidad)
      pasosGuardados++
    })
  })
  return secuencia.then(() => confirmados).catch((error) => {
    error.confirmados = confirmados
    error.parcial = pasosGuardados > 0
    error.recurso = recurso
    error.incierto = !error.status || error.status >= 500
    throw error
  })
}
