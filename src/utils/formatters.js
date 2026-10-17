export function formatARS(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Fecha corta con hora local para evitar cambios de día.
export function formatearFecha(fecha) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(fecha + 'T12:00:00'))
}

// Precio por día con el descuento de la publicación ya aplicado.
export function precioFinal(publicacion) {
  const descuento = Number(publicacion.descuentoPorcentaje) || 0
  return Number(publicacion.precioDia) * (1 - descuento / 100)
}

// Arma "AAAA-MM-DD" a partir del año, el mes (0 a 11) y el día.
export function fechaISO(anio, mes, dia) {
  return anio + '-' + String(mes + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0')
}

// Cantidad de días entre retiro y devolución (del 12 al 16 son 4 días).
export function diasEntre(inicio, fin) {
  return Math.round((new Date(fin + 'T12:00:00') - new Date(inicio + 'T12:00:00')) / 86400000)
}
