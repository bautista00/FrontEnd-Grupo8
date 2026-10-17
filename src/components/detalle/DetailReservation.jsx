import { useState } from 'react'
import { CartIcon } from '../icons/Icons'
import { btnBase, btnDark } from '../ui/buttonStyles'
import { diasEntre, formatearFecha } from '../../utils/formatters'
import DetailCalendar from './DetailCalendar'
import DetailPeriod from './DetailPeriod'
import DetailPrice from './DetailPrice'
import DetailSummary from './DetailSummary'

// Tarjeta de reserva: guarda el período que elige el usuario y arma las partes con él
export default function DetailReservation({ publicacion, periodos, agregando, mensaje, onAgregar }) {
  const [inicio, setInicio] = useState('')
  const [fin, setFin] = useState('')

  const desdePublicado = periodos.map((periodo) => periodo.desde).sort()[0]
  const hastaPublicado = periodos.map((periodo) => periodo.hasta).sort().at(-1)
  const dias = inicio && fin ? diasEntre(inicio, fin) : 0

  // Con un período ya cerrado, el siguiente click empieza uno nuevo.
  // Si el rango pasaría por días no publicados, también empezamos de nuevo.
  function elegirDia(fecha) {
    if (!inicio || fin || fecha <= inicio) {
      setInicio(fecha)
      setFin('')
      return
    }
    if (periodos.some((periodo) => inicio >= periodo.desde && fecha <= periodo.hasta)) {
      setFin(fecha)
    } else {
      setInicio(fecha)
      setFin('')
    }
  }

  return (
    <aside className="grid gap-4 p-6 bg-card border border-border rounded-lg shadow-sm phone:p-[1.125rem]" aria-label="Reservar">
      <DetailPrice publicacion={publicacion} />
      <DetailPeriod inicio={inicio} fin={fin} hora={(publicacion.horaRetiroDevolucion ?? '').slice(0, 5)} />
      <DetailCalendar periodos={periodos} inicio={inicio} fin={fin} onElegirDia={elegirDia} />
      {desdePublicado && (
        <p className="text-[0.6875rem] leading-[1.6] text-muted">
          Publicado para reservar del {formatearFecha(desdePublicado)} al {formatearFecha(hastaPublicado)}.
        </p>
      )}

      {dias > 0 && <DetailSummary publicacion={publicacion} dias={dias} />}

      {mensaje && (
        <p role="alert" className="p-3 bg-red-50 border border-red-200 rounded-[0.25rem] text-[0.75rem] leading-[1.7] text-red-700">{mensaje}</p>
      )}

      <button
        type="button"
        disabled={!dias || agregando}
        onClick={() => onAgregar(inicio, fin)}
        className={btnBase + ' ' + btnDark + ' w-full px-4 py-3 rounded-[0.25rem] disabled:cursor-not-allowed disabled:opacity-50'}
      >
        <CartIcon size={14} />
        {agregando ? 'Agregando…' : 'Agregar al carrito'}
      </button>
      <p className="text-[0.625rem] leading-[1.6] text-muted">
        Retenemos las fechas 15 minutos. Todavía no se cobra nada.
      </p>
    </aside>
  )
}
