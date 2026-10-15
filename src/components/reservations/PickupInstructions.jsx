import { Link } from 'react-router-dom'
import { MapPinIcon } from '../icons/Icons'
import { formatearFecha } from '../../utils/formatters'
import MapaPublicacion from '../publicaciones/MapaPublicacion'

export default function PickupInstructions({ reserva, publicacion }) {
  const estaConfirmada = reserva.estado === 'CONFIRMADA'
  const direccion = estaConfirmada ? publicacion.direccion : null
  const horaRetiro = publicacion.horaRetiroDevolucion?.slice(0, 5)

  return (
    <section className="min-w-0 p-7 bg-card border border-border rounded-lg phone:p-5" aria-labelledby="pickup-instructions-title">
      <h2 id="pickup-instructions-title" className="text-[1.5rem] leading-[1.4] text-ink">Dónde retirás el auto</h2>

      {/* Con la reserva confirmada se ve el punto exacto; si no, solo la zona aproximada. */}
      <div className="mt-5">
        <MapaPublicacion latitud={publicacion.latitud} longitud={publicacion.longitud} exacta={estaConfirmada} className="h-[14.375rem]" />
        <div className="flex items-start gap-2 mt-3 p-3 bg-card border border-border rounded-[0.25rem]">
          <MapPinIcon size={16} className="shrink-0 mt-0.5 text-gold" />
          <div>
            <p className="text-[0.75rem] leading-[1.6] text-ink">{direccion || `${publicacion.localidad}, ${publicacion.zona}`}</p>
            <p className="mt-1 text-[0.625rem] leading-[1.7] text-muted">
              {direccion
                ? `${publicacion.localidad}, ${publicacion.zona}${horaRetiro ? ` · ${horaRetiro} hs` : ''}`
                : estaConfirmada
                  ? 'Consultá el punto exacto de retiro en el detalle de tu reserva.'
                  : 'La dirección exacta se muestra cuando la reserva está confirmada.'}
            </p>
          </div>
        </div>
      </div>

      {estaConfirmada ? (
        <div className="mt-6">
          <h3 className="text-[1.25rem] leading-[1.4] text-ink">Próximos pasos</h3>
          <ol className="grid gap-4 mt-4 mb-0 p-0 list-none text-[0.6875rem] leading-[1.7]">
            <li className="flex items-start gap-3">
              <span className="grid place-items-center shrink-0 size-5 mt-0.5 bg-ink rounded-full text-[0.625rem] text-white" aria-hidden="true">1</span>
              <div>
                <strong className="text-ink">Retirá el auto</strong>
                <p className="text-muted">{formatearFecha(reserva.fechaInicio)}{horaRetiro && `, ${horaRetiro} hs`}{direccion && `, en ${direccion}`}.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid place-items-center shrink-0 size-5 mt-0.5 bg-ink rounded-full text-[0.625rem] text-white" aria-hidden="true">2</span>
              <div>
                <strong className="text-ink">Llevá tu licencia de conducir</strong>
                <p className="text-muted">Y tu DNI para mostrarlos al recibir las llaves.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid place-items-center shrink-0 size-5 mt-0.5 bg-ink rounded-full text-[0.625rem] text-white" aria-hidden="true">3</span>
              <div>
                <strong className="text-ink">Devolvelo en el mismo lugar</strong>
                <p className="text-muted">{formatearFecha(reserva.fechaFin)}{horaRetiro && `, ${horaRetiro} hs`}.</p>
              </div>
            </li>
          </ol>
        </div>
      ) : (
        <p className="mt-5 text-[0.6875rem] leading-[1.8] text-muted">Podés seguir el estado de tu reserva desde Mis reservas.</p>
      )}

      {/* Estos enlaces navegan a las vistas que ya existen. */}
      <div className="mt-6 pt-5 border-t border-border">
        <Link to="/mis-reservas" className="flex items-center justify-center w-full px-4 py-3 bg-ink rounded-[0.25rem] text-[0.6875rem] text-white">Ver en Mis reservas</Link>
        <Link to="/" className="block mt-4 text-center text-[0.6875rem] text-soft hover:underline">Volver a explorar vehículos</Link>
      </div>
    </section>
  )
}
