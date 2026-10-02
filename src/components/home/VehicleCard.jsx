import { formatARS, precioFinal } from '../../utils/formatters'
import { CarIcon } from '../icons/Icons'
import { btnBase, btnOutline, btnSize } from '../ui/buttonStyles'

const BADGE_BASE =
  'absolute top-3 left-3 px-2 py-[3px] rounded-[3px] backdrop-blur-[4px] text-white font-semibold tracking-[0.08em] uppercase'
const BADGE_TIPO = `${BADGE_BASE} bg-[rgba(21,17,13,0.85)] text-[9px]`
const META_ITEM = "not-last:after:mx-1.5 not-last:after:content-['·']"
const BADGE_DESCUENTO = `${BADGE_BASE} bg-gold text-[10px]`

export default function VehicleCard({ publicacion, onSelect }) {
  const descuento = Number(publicacion.descuentoPorcentaje) || 0
  const tieneDescuento = descuento > 0

  return (
    <article className="flex flex-col overflow-hidden bg-card border border-border rounded-lg transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        <div className="grid place-items-center w-full h-full text-disabled">
          <CarIcon size={40} />
        </div>

        {tieneDescuento ? (
          <span className={BADGE_DESCUENTO}>-{descuento}%</span>
        ) : (
          publicacion.tipoVehiculo && (
            <span className={BADGE_TIPO}>{publicacion.tipoVehiculo}</span>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1 text-[18px] tracking-[-0.01em] text-ink">
          {publicacion.marca} {publicacion.modelo} {publicacion.anio}
        </h3>

        <p className="flex flex-wrap items-center mb-5 text-[12px] text-muted">
          {publicacion.tipoVehiculo && <span className={META_ITEM}>{publicacion.tipoVehiculo}</span>}
          <span className={META_ITEM}>{publicacion.cantidadAsientos} asientos</span>
          <span className={META_ITEM}>
            {publicacion.localidad}, {publicacion.ciudad}
          </span>
        </p>

        <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-surface">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
            <span className="font-serif text-[18px] font-semibold tabular-nums text-ink">{formatARS(precioFinal(publicacion))}</span>
            <span className="text-[12px] text-muted">/ día</span>
            {tieneDescuento && (
              <span className="basis-full text-[12px] tabular-nums line-through text-muted">{formatARS(publicacion.precioDia)}</span>
            )}
          </div>

          <button
            type="button"
            className={`${btnBase} ${btnOutline} ${btnSize}`}
            onClick={() => onSelect?.(publicacion)}
          >
            Ver detalle
          </button>
        </div>
      </div>
    </article>
  )
}
