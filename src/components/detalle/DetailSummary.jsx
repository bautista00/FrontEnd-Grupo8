import { formatARS, precioFinal } from '../../utils/formatters'

// Cuenta de la reserva: días por precio, descuento del propietario y total
export default function DetailSummary({ publicacion, dias }) {
  const descuento = Number(publicacion.descuentoPorcentaje) || 0
  const subtotal = Number(publicacion.precioDia) * dias
  const ahorro = subtotal * descuento / 100
  const total = precioFinal(publicacion) * dias

  return (
    <dl className="grid gap-2 m-0 pt-4 border-t border-border text-[0.6875rem]">
      <div className="flex justify-between gap-3">
        <dt>{dias} {dias === 1 ? 'día' : 'días'} x {formatARS(publicacion.precioDia)}</dt>
        <dd className="m-0 tabular-nums">{formatARS(subtotal)}</dd>
      </div>
      {descuento > 0 && (
        <div className="flex justify-between gap-3 text-gold">
          <dt>Descuento del propietario ({descuento}%)</dt>
          <dd className="m-0 tabular-nums">-{formatARS(ahorro)}</dd>
        </div>
      )}
      <div className="flex items-baseline justify-between gap-3 pt-3 border-t border-border">
        <dt className="text-[0.75rem] font-semibold">Total final</dt>
        <dd className="m-0 text-right">
          <span className="font-serif text-[1.25rem] font-bold tabular-nums text-ink">{formatARS(total)}</span>
          <span className="block text-[0.5625rem] text-muted">ARS</span>
        </dd>
      </div>
    </dl>
  )
}
