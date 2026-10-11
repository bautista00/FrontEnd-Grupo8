import { Link } from 'react-router-dom'
import { CalendarXIcon } from '../icons/Icons'

export default function EmptyReservations({ mensaje }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] px-6 py-12 bg-card border border-border rounded-lg text-center phone:px-4">
      <CalendarXIcon size={40} className="text-disabled" />
      {/* Cada lista pasa su propio mensaje por props. */}
      <h3 className="mt-5 text-[22px] leading-[1.4] text-ink phone:text-[20px]">
        {mensaje}
      </h3>
      <p className="max-w-md mt-2 text-[12px] leading-[1.6] text-muted">
        Cuando reserves un auto, lo vas a ver acá con su estado.
      </p>
      {/* Volvemos al catálogo de vehículos. */}
      <Link to="/" className="inline-flex items-center justify-center mt-5 px-5 py-3 bg-ink border-0 rounded-[4px] text-[12px] text-white">
        Explorar vehículos
      </Link>
    </div>
  )
}
