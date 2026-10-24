/**
 * Funciones compartidas para presentar importes y trabajar con fechas.
 */

// Presenta un importe en pesos argentinos.
export function formatARS(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Usa una hora local intermedia para conservar el día de la fecha recibida.
export function formatearFecha(fecha) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(fecha + 'T12:00:00'))
}

// Calcula el precio diario de presentación con el descuento de la publicación.
export function precioFinal(publicacion) {
  const descuento = Number(publicacion.descuentoPorcentaje) || 0
  return Number(publicacion.precioDia) * (1 - descuento / 100)
}

// Devuelve AAAA-MM-DD; el mes recibido va de 0 a 11.
export function fechaISO(anio, mes, dia) {
  return anio + '-' + String(mes + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0')
}

// Calcula los días entre retiro y devolución.
export function diasEntre(inicio, fin) {
  return Math.round((new Date(fin + 'T12:00:00') - new Date(inicio + 'T12:00:00')) / 86400000)
}
