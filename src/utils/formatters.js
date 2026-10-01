export function formatARS(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Precio por día con el descuento de la publicación ya aplicado.
export function precioFinal(publicacion) {
  const descuento = Number(publicacion.descuentoPorcentaje) || 0
  return Number(publicacion.precioDia) * (1 - descuento / 100)
}
