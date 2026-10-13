import { tieneCoordenadas } from './ubicacion'

export function valoresIniciales(publicacion) {
  return {
    idVehiculo: publicacion?.idVehiculo ? String(publicacion.idVehiculo) : '',
    precioDia: publicacion?.precioDia == null ? '' : String(publicacion.precioDia),
    descuentoPorcentaje: String(publicacion?.descuentoPorcentaje ?? 0),
    direccion: publicacion?.direccion ?? '', zona: publicacion?.zona ?? '',
    localidad: publicacion?.localidad ?? '', ciudad: publicacion?.ciudad ?? '',
    provincia: publicacion?.provincia ?? '', codigoPostal: publicacion?.codigoPostal ?? '',
    latitud: publicacion?.latitud ?? null, longitud: publicacion?.longitud ?? null,
    placeId: publicacion?.placeId ?? '',
    horaRetiroDevolucion: (publicacion?.horaRetiroDevolucion ?? '').replace(/^(\d{2}:\d{2}):00$/, '$1'),
    descripcion: publicacion?.descripcion ?? '',
    periodos: (publicacion?.periodos ?? []).map((periodo) => ({ ...periodo })),
  }
}

export function datosPublicacion(valores, idUbicacion) {
  return {
    idVehiculo: Number(valores.idVehiculo), idUbicacion,
    precioDia: Number(valores.precioDia), descuentoPorcentaje: Number(valores.descuentoPorcentaje || 0),
    descripcion: valores.descripcion.trim(),
    horaRetiroDevolucion: valores.horaRetiroDevolucion.length === 5 ? valores.horaRetiroDevolucion + ':00' : valores.horaRetiroDevolucion,
  }
}

export function datosUbicacion(valores) {
  const datos = Object.fromEntries(['direccion', 'zona', 'localidad', 'ciudad', 'provincia', 'codigoPostal'].map((campo) => [campo, valores[campo].trim()]))
  return { ...datos, latitud: Number(valores.latitud), longitud: Number(valores.longitud), placeId: valores.placeId || null }
}

export function periodoDesdeApi(periodo) {
  return { idDisponibilidad: periodo.idDisponibilidad, desde: periodo.fechaInicio, hasta: periodo.fechaFin }
}

export function mismosPeriodos(a, b) {
  return JSON.stringify(a.map(({ idDisponibilidad, desde, hasta }) => ({ idDisponibilidad, desde, hasta })))
    === JSON.stringify(b.map(({ idDisponibilidad, desde, hasta }) => ({ idDisponibilidad, desde, hasta })))
}

export function incorporarIds(borrador, confirmados, anteriores, verificar = false) {
  const usados = new Set(borrador.periodos.filter((periodo) => periodo.idDisponibilidad).map((periodo) => periodo.idDisponibilidad))
  return { ...borrador, periodos: borrador.periodos.map((periodo) => {
    if (periodo.idDisponibilidad) return periodo
    const candidatos = confirmados.periodos.filter((item) => !usados.has(item.idDisponibilidad)
      && !(anteriores.periodos ?? []).some((original) => original.idDisponibilidad === item.idDisponibilidad)
      && (item.clave ? item.clave === periodo.clave : item.desde === periodo.desde && item.hasta === periodo.hasta))
    if (verificar && candidatos.length > 1) throw new Error('Hay varios períodos iguales y no podemos identificar cuál se guardó. Revisalos desde Mis publicaciones.')
    if (candidatos.length !== 1) return periodo
    usados.add(candidatos[0].idDisponibilidad)
    return { ...periodo, idDisponibilidad: candidatos[0].idDisponibilidad }
  }) }
}

export function hayCambiosFormulario(valores, base) {
  return JSON.stringify(datosPublicacion(valores, base.idUbicacion)) !== JSON.stringify(datosPublicacion(valoresIniciales(base), base.idUbicacion))
    || !mismosPeriodos(valores.periodos, base.periodos ?? [])
}

export function validarFormulario(valores, base) {
  if (!valores.idVehiculo) return 'Elegí un vehículo.'
  if (!Number.isFinite(Number(valores.precioDia)) || Number(valores.precioDia) < 1) return 'Ingresá un precio por día mayor o igual a 1.'
  const descuento = Number(valores.descuentoPorcentaje || 0)
  if (!Number.isFinite(descuento) || descuento < 0 || descuento > 50) return 'El descuento debe estar entre 0 y 50 %.'
  if (!valores.descripcion.trim() || valores.descripcion.length > 600) return 'Completá la descripción, con un máximo de 600 caracteres.'
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(valores.horaRetiroDevolucion)) return 'Completá la hora de retiro y devolución.'
  if (!base.idPublicacion) {
    if (['direccion', 'zona', 'localidad', 'ciudad', 'provincia', 'codigoPostal'].some((campo) => !valores[campo].trim())) return 'Completá los datos del punto de retiro.'
    if (!tieneCoordenadas(valores)) return 'Seleccioná una ubicación con coordenadas válidas antes de publicar.'
    if (!valores.periodos.length) return 'Agregá al menos un período disponible.'
  }
  const hoy = new Date()
  const fechaHoy = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0')
  for (const periodo of valores.periodos) {
    const anterior = (base.periodos ?? []).find((item) => item.idDisponibilidad && item.idDisponibilidad === periodo.idDisponibilidad)
    if (anterior?.desde === periodo.desde && anterior?.hasta === periodo.hasta) continue
    if (!/^\d{4}-\d{2}-\d{2}$/.test(periodo.desde) || !/^\d{4}-\d{2}-\d{2}$/.test(periodo.hasta) || periodo.hasta <= periodo.desde) return 'Cada período necesita una fecha de fin posterior al inicio.'
    if (periodo.desde < fechaHoy) return 'Los períodos nuevos o modificados no pueden empezar en el pasado.'
  }
  return ''
}
