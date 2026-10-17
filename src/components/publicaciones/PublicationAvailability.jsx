import { useState } from 'react'
import { helpStyles, textButtonStyles } from './publicationStyles'
import PublicationIcon from './PublicationIcon'
import MonthCalendar from '../ui/MonthCalendar'
import { fechaISO } from '../../utils/formatters'

function fechaTexto(fecha) {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(fecha + 'T12:00:00'))
}

export default function PublicationAvailability({ periodos, onChange, onSelectionChange }) {
  const [inicio, setInicio] = useState('')
  const hoy = new Date()
  const fechaHoy = fechaISO(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

  function elegirDia(fecha) {
    if (fecha < fechaHoy || fecha === inicio) return
    if (!inicio) {
      setInicio(fecha)
      onSelectionChange?.(fecha)
      return
    }
    const desde = fecha < inicio ? fecha : inicio
    const hasta = fecha < inicio ? inicio : fecha
    onChange([...periodos, { desde, hasta, clave: crypto.randomUUID() }])
    setInicio('')
    onSelectionChange?.('')
  }

  function descartarSeleccion() {
    setInicio('')
    onSelectionChange?.('')
  }

  // Cómo se ve cada día del calendario
  function estiloDia(fecha) {
    const elegido = inicio === fecha || periodos.some((periodo) => fecha >= periodo.desde && fecha <= periodo.hasta)
    return {
      disabled: fecha < fechaHoy || fecha === inicio,
      pressed: elegido,
      className: elegido ? 'bg-[#fdd79c] border-gold text-ink' : 'bg-white border-border',
    }
  }

  return <div className="grid grid-cols-2 gap-4 mt-4 phone:grid-cols-1">
    <div>
      <MonthCalendar className="phone:max-w-80" estiloDia={estiloDia} onElegirDia={elegirDia} />
      <p className={helpStyles} aria-live="polite">{inicio ? 'Ahora tocá un día distinto para cerrar el período.' : 'Tocá el primer y el último día de un período para sumarlo.'}</p>
      {inicio && <button type="button" onClick={descartarSeleccion} className={textButtonStyles}>Cancelar selección</button>}
    </div>
    <div>
      <div className="flex flex-wrap gap-2.5 text-muted text-[0.6875rem]"><span className="text-gold">● Disponible para reservar</span><span>○ No publicado</span></div>
      {periodos.length === 0 && <p className={helpStyles}>Sin períodos seleccionados.</p>}
      {periodos.map((periodo, indice) => <div key={periodo.idDisponibilidad ?? periodo.clave ?? indice} className="flex items-center gap-1.5 mt-2.5 p-2 border border-border rounded-[0.25rem] text-[0.6875rem]">
        <PublicationIcon nombre="calendar" />
        <span className="flex-1">Del {fechaTexto(periodo.desde)} al {fechaTexto(periodo.hasta)}</span>
        <button type="button" className="grid place-items-center border-0 bg-transparent p-1" aria-label={'Quitar período del ' + fechaTexto(periodo.desde) + ' al ' + fechaTexto(periodo.hasta)}
          onClick={() => onChange(periodos.filter((_, posicion) => posicion !== indice))}><PublicationIcon nombre="close" /></button>
      </div>)}
      <p className={helpStyles}>Si quitás días que alguien ya reservó, esa reserva se mantiene igual.</p>
    </div>
  </div>
}
