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
