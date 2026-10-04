// textos y colores de los estados
export const ESTADOS_PUBLICACION = {
  ACTIVA: { etiqueta: 'Activas', nombre: 'Activa', detalle: 'Visible en el catálogo', color: 'text-emerald-700', punto: 'bg-emerald-600' },
  PAUSADA: { etiqueta: 'Pausadas', nombre: 'Pausada', detalle: 'No se puede reservar', color: 'text-amber-700', punto: 'bg-amber-600' },
  DESACTIVADA: { etiqueta: 'Desactivadas', nombre: 'Desactivada', detalle: 'No se puede reactivar', color: 'text-muted', punto: 'bg-disabled' },
}

export function formatFechaPublicacion(fecha) {
  if (!fecha) return '—'
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(fecha + 'T12:00:00'))
}
