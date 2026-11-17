import axios from 'axios'
import { API_URL, conToken } from '../../utils/api'
import { cambiaronDatos, datosPublicacion, datosUbicacion, periodoDesdeApi } from './datosFormularioPublicacion'

export default async function guardarPublicacion({ valores, publicacion, token }) {
  let guardada = { ...publicacion, periodos: [...(publicacion?.periodos ?? [])] }
  let recurso = 'publicación'
  let parcial = false
  const config = conToken(token)

  try {
    if (!guardada.idPublicacion) {
      const ubicacion = datosUbicacion(valores)
      if (JSON.stringify(ubicacion) !== JSON.stringify(guardada.ubicacionGuardada)) {
        recurso = 'ubicación'
        const { data } = await axios.post(`${API_URL}/ubicaciones`, ubicacion, config)
        if (!data?.idUbicacion) throw new Error('No recibimos la ubicación creada.')
        guardada = { ...guardada, ...data, ubicacionGuardada: ubicacion }
        parcial = true
      }
      recurso = 'publicación'
      const { data } = await axios.post(`${API_URL}/publicaciones`, datosPublicacion(valores, guardada.idUbicacion), config)
      if (!data?.idPublicacion) throw new Error('No recibimos la publicación creada.')
      guardada = { ...guardada, ...data }
      parcial = true
    } else if (cambiaronDatos(valores, guardada)) {
      const { data } = await axios.put(`${API_URL}/publicaciones/${guardada.idPublicacion}`,
        datosPublicacion(valores, guardada.idUbicacion), config)
      if (!data?.idPublicacion) throw new Error('No recibimos los cambios de la publicación.')
      guardada = { ...guardada, ...data }
      parcial = true
    }

    for (const periodo of valores.periodos.filter((item) => !item.idDisponibilidad)) {
      recurso = 'períodos'
      const { data } = await axios.post(`${API_URL}/disponibilidades`, {
        idPublicacion: guardada.idPublicacion, fechaInicio: periodo.desde, fechaFin: periodo.hasta,
      }, config)
      if (!data?.idDisponibilidad) throw new Error('No recibimos el período creado.')
      guardada.periodos = [...guardada.periodos, { ...periodoDesdeApi(data), clave: periodo.clave }]
      parcial = true
    }

    const quitados = (publicacion?.periodos ?? []).filter((periodo) =>
      !valores.periodos.some((actual) => actual.idDisponibilidad === periodo.idDisponibilidad))
    for (const periodo of quitados) {
      recurso = 'períodos'
      await axios.delete(`${API_URL}/disponibilidades/${periodo.idDisponibilidad}`, config)
      guardada.periodos = guardada.periodos.filter((actual) => actual.idDisponibilidad !== periodo.idDisponibilidad)
      parcial = true
    }

    return guardada
  } catch (error) {
    error.guardada = guardada
    error.parcial = parcial
    error.recurso = recurso
    throw error
  }
}
