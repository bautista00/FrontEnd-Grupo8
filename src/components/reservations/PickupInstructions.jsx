import { Link } from 'react-router-dom'
import { MapPinIcon } from '../icons/Icons'
import { formatearFecha } from '../../utils/formatters'

export default function PickupInstructions({ reserva, publicacion }) {
  const estaConfirmada = reserva.estado === 'CONFIRMADA'
  const direccion = estaConfirmada ? publicacion.direccion : null
  const horaRetiro = publicacion.horaRetiroDevolucion?.slice(0, 5)

  return (
    <section className="min-w-0 p-7 bg-card border border-border rounded-lg phone:p-5" aria-labelledby="pickup-instructions-title">
      <h2 id="pickup-instructions-title" className="text-[24px] leading-[1.4] text-ink">Dónde retirás el auto</h2>

      {/* Ubicación de ejemplo; el mapa real se conectará después. */}
      <div className="relative min-h-[230px] mt-5 overflow-hidden bg-surface bg-[radial-gradient(var(--color-disabled)_1px,transparent_1px)] bg-size-[16px_16px] border border-border rounded-[4px]">
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-36 h-36 bg-gold/10 border border-gold/30 rounded-full" aria-hidden="true" />
        <div className="absolute top-14 left-1/2 -translate-x-1/2 grid place-items-center size-10 bg-ink rounded-full text-white" aria-hidden="true">
          <MapPinIcon size={20} />
        </div>
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-card border border-border rounded-[4px]">
          <p className="text-[12px] leading-[1.6] text-ink">{direccion || `${publicacion.localidad}, ${publicacion.zona}`}</p>
          <p className="mt-1 text-[10px] leading-[1.7] text-muted">
            {direccion
              ? `${publicacion.localidad}, ${publicacion.zona}${horaRetiro ? ` · ${horaRetiro} hs` : ''}`
              : estaConfirmada
                ? 'Consultá el punto exacto de retiro en el detalle de tu reserva.'
                : 'La dirección exacta se muestra cuando la reserva está confirmada.'}
          </p>
        </div>
      </div>

      {estaConfirmada ? (
        <div className="mt-6">
          <h3 className="text-[20px] leading-[1.4] text-ink">Próximos pasos</h3>
          <ol className="grid gap-4 mt-4 mb-0 p-0 list-none text-[11px] leading-[1.7]">
            <li className="flex items-start gap-3">
              <span className="grid place-items-center shrink-0 size-5 mt-0.5 bg-ink rounded-full text-[10px] text-white" aria-hidden="true">1</span>
              <div>
                <strong className="text-ink">Retirá el auto</strong>
                <p className="text-muted">{formatearFecha(reserva.fechaInicio)}{horaRetiro && `, ${horaRetiro} hs`}{direccion && `, en ${direccion}`}.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid place-items-center shrink-0 size-5 mt-0.5 bg-ink rounded-full text-[10px] text-white" aria-hidden="true">2</span>
              <div>
                <strong className="text-ink">Llevá tu licencia de conducir</strong>
                <p className="text-muted">Y tu DNI para mostrarlos al recibir las llaves.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid place-items-center shrink-0 size-5 mt-0.5 bg-ink rounded-full text-[10px] text-white" aria-hidden="true">3</span>
              <div>
                <strong className="text-ink">Devolvelo en el mismo lugar</strong>
                <p className="text-muted">{formatearFecha(reserva.fechaFin)}{horaRetiro && `, ${horaRetiro} hs`}.</p>
              </div>
            </li>
          </ol>
        </div>
      ) : (
        <p className="mt-5 text-[11px] leading-[1.8] text-muted">Podés seguir el estado de tu reserva desde Mis reservas.</p>
      )}

      {/* Estos enlaces navegan a las vistas que ya existen. */}
      <div className="mt-6 pt-5 border-t border-border">
        <Link to="/mis-reservas" className="flex items-center justify-center w-full px-4 py-3 bg-ink rounded-[4px] text-[11px] text-white">Ver en Mis reservas</Link>
        <Link to="/" className="block mt-4 text-center text-[11px] text-soft hover:underline">Volver a explorar vehículos</Link>
      </div>
    </section>
  )
}
