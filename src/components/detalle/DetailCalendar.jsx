import MonthCalendar from '../ui/MonthCalendar'
import { fechaISO } from '../../utils/formatters'

function fechaHoy() {
  const hoy = new Date()
  return fechaISO(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
}

// Calendario de la publicación: solo se pueden elegir los días dentro de un período publicado.
// periodos: [{ desde, hasta }]. inicio/fin: fechas "AAAA-MM-DD" o ''.
export default function DetailCalendar({ periodos, inicio, fin, onElegirDia }) {
  const hoy = fechaHoy()

  // Arranca en el mes del primer día que se puede reservar
  const primerDiaReservable = periodos
    .filter((periodo) => periodo.hasta >= hoy)
    .map((periodo) => (periodo.desde > hoy ? periodo.desde : hoy))
    .sort()[0]
  const mesInicial = primerDiaReservable ? new Date(primerDiaReservable + 'T12:00:00') : new Date()

  // Cómo se ve cada día: bloqueado, extremo del rango, dentro del rango o libre
  function estiloDia(fecha) {
    const reservable = fecha >= hoy && periodos.some((periodo) => fecha >= periodo.desde && fecha <= periodo.hasta)
    const esExtremo = fecha === inicio || fecha === fin
    const enRango = Boolean(inicio && fin && fecha > inicio && fecha < fin)

    let className = 'bg-white border-border text-ink'
    if (!reservable) className = 'bg-surface border-border text-disabled'
    else if (esExtremo) className = 'bg-ink border-ink text-white'
    else if (enRango) className = 'bg-border border-border text-ink'

    return { disabled: !reservable, pressed: esExtremo || enRango, className }
  }

  return <MonthCalendar mesInicial={mesInicial} estiloDia={estiloDia} onElegirDia={onElegirDia} />
}
