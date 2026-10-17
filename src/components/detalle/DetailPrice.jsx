import { formatARS, precioFinal } from '../../utils/formatters'

// Precio por día, con el precio original tachado y la etiqueta si hay descuento
export default function DetailPrice({ publicacion }) {
  const descuento = Number(publicacion.descuentoPorcentaje) || 0

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="font-serif text-[1.5rem] font-bold tabular-nums text-ink">{formatARS(precioFinal(publicacion))}</span>
      <span className="text-[0.75rem] text-muted">/ día</span>
      {descuento > 0 && (
        <>
          <span className="text-[0.75rem] tabular-nums line-through text-muted">{formatARS(publicacion.precioDia)}</span>
          <span className="ml-auto px-2 py-[0.1875rem] rounded-[0.1875rem] bg-[#fdd79c] text-[0.625rem] text-ink">-{descuento}% del propietario</span>
        </>
      )}
    </div>
  )
}
