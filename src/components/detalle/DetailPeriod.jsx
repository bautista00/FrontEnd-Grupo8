import { CalendarIcon } from '../icons/Icons'
import { formatearFecha } from '../../utils/formatters'

// Un extremo del período (retiro o devolución): etiqueta, fecha elegida y hora
function Extremo({ etiqueta, fecha, hora }) {
  return (
    <div>
      <p className="mb-1 text-[0.5625rem] uppercase text-muted">{etiqueta}</p>
      <p className="flex items-center gap-1.5 text-[0.6875rem]"><CalendarIcon size={12} />{fecha ? formatearFecha(fecha) : 'Elegí un día'}</p>
      {fecha && hora && <p className="mt-0.5 text-[0.625rem] text-muted">{hora} hs</p>}
    </div>
  )
}

// Período elegido: fecha y hora de retiro y de devolución
export default function DetailPeriod({ inicio, fin, hora }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-3 bg-paper border border-border rounded-[0.25rem]">
      <Extremo etiqueta="Retiro" fecha={inicio} hora={hora} />
      <Extremo etiqueta="Devolución" fecha={fin} hora={hora} />
    </div>
  )
}
