import { tieneCoordenadas } from './ubicacion'

// Valores del formulario a partir de una publicación (o vacíos si es nueva)
export function valoresIniciales(publicacion) {
  return {
    idVehiculo: publicacion?.idVehiculo ? String(publicacion.idVehiculo) : '',
    precioDia: publicacion?.precioDia == null ? '' : String(publicacion.precioDia),
    descuentoPorcentaje: String(publicacion?.descuentoPorcentaje ?? 0),
    direccion: publicacion?.direccion ?? '',
    zona: publicacion?.zona ?? '',
    localidad: publicacion?.localidad ?? '',
    ciudad: publicacion?.ciudad ?? '',
    provincia: publicacion?.provincia ?? '',
    codigoPostal: publicacion?.codigoPostal ?? '',
    latitud: publicacion?.latitud ?? null,
    longitud: publicacion?.longitud ?? null,
    placeId: publicacion?.placeId ?? '',
    // El backend manda "10:00:00" y el input de hora usa "10:00"
    horaRetiroDevolucion: (publicacion?.horaRetiroDevolucion ?? '').replace(/^(\d{2}:\d{2}):00$/, '$1'),
    descripcion: publicacion?.descripcion ?? '',
    periodos: (publicacion?.periodos ?? []).map((periodo) => ({ ...periodo })),
  }
}

// Body para POST/PUT /publicaciones
export function datosPublicacion(valores, idUbicacion) {
  return {
    idVehiculo: Number(valores.idVehiculo),
    idUbicacion,
    precioDia: Number(valores.precioDia),
    descuentoPorcentaje: Number(valores.descuentoPorcentaje || 0),
    descripcion: valores.descripcion.trim(),
    horaRetiroDevolucion: valores.horaRetiroDevolucion.length === 5 ? valores.horaRetiroDevolucion + ':00' : valores.horaRetiroDevolucion,
  }
}

// Body para POST /ubicaciones
export function datosUbicacion(valores) {
  return {
    direccion: valores.direccion.trim(),
    zona: valores.zona.trim(),
    localidad: valores.localidad.trim(),
    ciudad: valores.ciudad.trim(),
    provincia: valores.provincia.trim(),
    codigoPostal: valores.codigoPostal.trim(),
    latitud: Number(valores.latitud),
    longitud: Number(valores.longitud),
    placeId: valores.placeId || null,
  }
}

// El backend usa fechaInicio/fechaFin y el calendario usa desde/hasta
export function periodoDesdeApi(periodo) {
  return { idDisponibilidad: periodo.idDisponibilidad, desde: periodo.fechaInicio, hasta: periodo.fechaFin }
}

export function completarIds(periodos, guardados, anteriores = [], verificar = false) {
  const usados = new Set(periodos.map((periodo) => periodo.idDisponibilidad).filter(Boolean))
  return periodos.map((periodo) => {
    if (periodo.idDisponibilidad) return periodo
    const candidatos = guardados.filter((guardado) => !usados.has(guardado.idDisponibilidad)
      && !anteriores.some((anterior) => anterior.idDisponibilidad === guardado.idDisponibilidad)
      && (guardado.clave ? guardado.clave === periodo.clave : guardado.desde === periodo.desde && guardado.hasta === periodo.hasta))
    if (verificar && candidatos.length > 1) throw new Error('Hay varios períodos iguales. Revisalos desde Mis publicaciones antes de seguir.')
    if (candidatos.length !== 1) return periodo
    usados.add(candidatos[0].idDisponibilidad)
    return { ...periodo, idDisponibilidad: candidatos[0].idDisponibilidad }
  })
}

// true si los datos de la publicación (sin contar los períodos) son distintos a los guardados
export function cambiaronDatos(valores, publicacion) {
  const actuales = datosPublicacion(valores, publicacion.idUbicacion)
  const guardados = datosPublicacion(valoresIniciales(publicacion), publicacion.idUbicacion)
  return JSON.stringify(actuales) !== JSON.stringify(guardados)
}

// true si se agregó o se quitó algún período
export function cambiaronPeriodos(valores, publicacion) {
  return JSON.stringify(valores.periodos.map(({ idDisponibilidad, desde, hasta }) => ({ idDisponibilidad, desde, hasta })))
    !== JSON.stringify(publicacion.periodos.map(({ idDisponibilidad, desde, hasta }) => ({ idDisponibilidad, desde, hasta })))
}

function fechaDeHoy() {
  const hoy = new Date()
  return hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0')
}

// Campos del punto de retiro con el mismo mensaje que ValidacionVolanta del backend,
// en el orden en que aparecen en la pantalla
const CAMPOS_UBICACION = [
  ['direccion', 'Ingresá la dirección.'],
  ['zona', 'Ingresá el barrio o la zona.'],
  ['localidad', 'Ingresá la localidad.'],
  ['ciudad', 'Ingresá la ciudad.'],
  ['provincia', 'Ingresá la provincia.'],
  ['codigoPostal', 'Ingresá el código postal.'],
]

// Devuelve el primer problema que encuentre, o '' si está todo bien.
// Donde el backend valida lo mismo, se usa su texto.
export function validarFormulario(valores, editando) {
  const descuento = Number(valores.descuentoPorcentaje || 0)

  if (!valores.idVehiculo) return 'Elegí un vehículo.'
  if (!Number.isFinite(Number(valores.precioDia)) || Number(valores.precioDia) < 1) return 'Ingresá un precio por día mayor o igual a 1.'
  if (!(descuento >= 0 && descuento <= 50)) return 'El descuento tiene que estar entre 0 y 50 %.'
  if (!valores.descripcion.trim()) return 'Ingresá una descripción.'
  if (valores.descripcion.length > 600) return 'La descripción puede tener hasta 600 caracteres.'
  if (!valores.horaRetiroDevolucion) return 'Elegí la hora de retiro y devolución.'

  if (!editando) {
    const campoVacio = CAMPOS_UBICACION.find(([campo]) => !valores[campo].trim())
    if (campoVacio) return campoVacio[1]
    if (!tieneCoordenadas(valores)) return 'Elegí la dirección de la lista de sugerencias.'
    if (valores.periodos.length === 0) return 'Agregá al menos un período disponible.'
  }

  // Los períodos nuevos no pueden empezar antes de hoy
  const nuevos = valores.periodos.filter((periodo) => !periodo.idDisponibilidad)
  if (nuevos.some((periodo) => periodo.desde < fechaDeHoy())) return 'Los períodos nuevos no pueden empezar en el pasado.'

  return ''
}
