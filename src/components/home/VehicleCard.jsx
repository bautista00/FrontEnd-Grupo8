import { formatARS, precioFinal } from '../../utils/formatters'
import { CarIcon } from '../icons/Icons'
import './VehicleCard.css'

export default function VehicleCard({ publicacion, onSelect }) {
  const descuento = Number(publicacion.descuentoPorcentaje) || 0
  const tieneDescuento = descuento > 0

  return (
    <article className="vehicle-card">
      <div className="vehicle-card__media">
        <div className="vehicle-card__placeholder">
          <CarIcon size={40} />
        </div>

        {tieneDescuento ? (
          <span className="vehicle-card__badge vehicle-card__badge--discount">-{descuento}%</span>
        ) : (
          publicacion.tipoVehiculo && (
            <span className="vehicle-card__badge">{publicacion.tipoVehiculo}</span>
          )
        )}
      </div>

      <div className="vehicle-card__body">
        <h3 className="vehicle-card__title">
          {publicacion.marca} {publicacion.modelo} {publicacion.anio}
        </h3>

        <p className="vehicle-card__meta">
          {publicacion.tipoVehiculo && <span>{publicacion.tipoVehiculo}</span>}
          <span>{publicacion.cantidadAsientos} asientos</span>
          <span>
            {publicacion.localidad}, {publicacion.ciudad}
          </span>
        </p>

        <div className="vehicle-card__footer">
          <div className="vehicle-card__price">
            <span className="vehicle-card__amount">{formatARS(precioFinal(publicacion))}</span>
            <span className="vehicle-card__unit">/ día</span>
            {tieneDescuento && (
              <span className="vehicle-card__original">{formatARS(publicacion.precioDia)}</span>
            )}
          </div>

          <button type="button" className="btn btn--outline" onClick={() => onSelect?.(publicacion)}>
            Ver detalle
          </button>
        </div>
      </div>
    </article>
  )
}
