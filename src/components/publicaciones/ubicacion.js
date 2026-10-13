function coordenadaValida(valor, minimo, maximo) {
  if (typeof valor !== 'number' && typeof valor !== 'string') return false
  if (valor === null || valor === undefined || String(valor).trim() === '') return false
  const numero = Number(valor)
  return Number.isFinite(numero) && numero >= minimo && numero <= maximo
}

export function tieneCoordenadas(ubicacion) {
  return coordenadaValida(ubicacion.latitud, -90, 90)
    && coordenadaValida(ubicacion.longitud, -180, 180)
}
