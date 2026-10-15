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
    horaRetiroDevolucion: (publicacion?.horaRetiroDevolucion ?? '').slice(0, 5),
    descripcion: publicacion?.descripcion ?? '',
    periodos: publicacion?.periodos ?? [],
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
    horaRetiroDevolucion: valores.horaRetiroDevolucion + ':00',
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

// true si los datos de la publicación (sin contar los períodos) son distintos a los guardados
export function cambiaronDatos(valores, publicacion) {
  const actuales = datosPublicacion(valores, publicacion.idUbicacion)
  const guardados = datosPublicacion(valoresIniciales(publicacion), publicacion.idUbicacion)
  return JSON.stringify(actuales) !== JSON.stringify(guardados)
}

// true si se agregó o se quitó algún período
export function cambiaronPeriodos(valores, publicacion) {
  const hayNuevos = valores.periodos.some((periodo) => !periodo.idDisponibilidad)
  return hayNuevos || valores.periodos.length !== publicacion.periodos.length
}

function fechaDeHoy() {
  const hoy = new Date()
  return hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0')
}

// Devuelve el primer problema que encuentre, o '' si está todo bien
export function validarFormulario(valores, editando) {
  const descuento = Number(valores.descuentoPorcentaje || 0)

  if (!valores.idVehiculo) return 'Elegí un vehículo.'
  if (!(Number(valores.precioDia) >= 1)) return 'Ingresá un precio por día mayor o igual a 1.'
  if (!(descuento >= 0 && descuento <= 50)) return 'El descuento debe estar entre 0 y 50 %.'
  if (!valores.descripcion.trim() || valores.descripcion.length > 600) return 'Completá la descripción, con un máximo de 600 caracteres.'
  if (!valores.horaRetiroDevolucion) return 'Completá la hora de retiro y devolución.'

  if (!editando) {
    const camposUbicacion = ['direccion', 'zona', 'localidad', 'ciudad', 'provincia', 'codigoPostal']
    if (camposUbicacion.some((campo) => !valores[campo].trim())) return 'Completá los datos del punto de retiro.'
    if (!tieneCoordenadas(valores)) return 'Seleccioná una ubicación con coordenadas válidas antes de publicar.'
    if (valores.periodos.length === 0) return 'Agregá al menos un período disponible.'
  }

  // Los períodos nuevos no pueden empezar antes de hoy
  const nuevos = valores.periodos.filter((periodo) => !periodo.idDisponibilidad)
  if (nuevos.some((periodo) => periodo.desde < fechaDeHoy())) return 'Los períodos nuevos no pueden empezar en el pasado.'

  return ''
}
