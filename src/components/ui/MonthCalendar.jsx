import { useState } from 'react'
import PublicationIcon from '../publicaciones/PublicationIcon'
import { fechaISO } from '../../utils/formatters'

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

// Calendario mensual con navegación entre meses. Solo dibuja la grilla:
// qué días se pueden elegir y cómo se ven lo define quien lo usa.
// estiloDia(fecha) devuelve { className, disabled, pressed } para cada día ("AAAA-MM-DD").
export default function MonthCalendar({ mesInicial, estiloDia, onElegirDia, className = '' }) {
  const [mes, setMes] = useState(() => {
    const base = mesInicial ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const anio = mes.getFullYear()
  const numeroMes = mes.getMonth()
  // Lunes primero: el día de la semana del 1 va de 0 (lunes) a 6 (domingo)
  const primerDia = (mes.getDay() + 6) % 7
  const cantidadDias = new Date(anio, numeroMes + 1, 0).getDate()
  const celdas = Array.from({ length: Math.ceil((primerDia + cantidadDias) / 7) * 7 }, (_, indice) => {
    const dia = indice - primerDia + 1
    return dia >= 1 && dia <= cantidadDias ? dia : null
  })

  return (
    <div className={'bg-paper border border-border rounded-[0.375rem] p-3 ' + className}>
      <div className="flex items-center justify-between gap-2 text-[0.75rem] capitalize">
        <button type="button" className="grid place-items-center border-0 bg-transparent p-1" aria-label="Mes anterior" onClick={() => setMes(new Date(anio, numeroMes - 1, 1))}>
          <PublicationIcon nombre="left" />
        </button>
        <span>{mes.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>
        <button type="button" className="grid place-items-center border-0 bg-transparent p-1" aria-label="Mes siguiente" onClick={() => setMes(new Date(anio, numeroMes + 1, 1))}>
          <PublicationIcon nombre="right" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-[0.1875rem] mt-3">
        {DIAS_SEMANA.map((dia) => <span key={dia} className="text-center py-1 text-muted text-[0.625rem]">{dia}</span>)}
        {celdas.map((dia, indice) => {
          if (!dia) return <span key={'vacio-' + indice} />
          const fecha = fechaISO(anio, numeroMes, dia)
          const estilo = estiloDia(fecha)
          return (
            <button
              type="button"
              key={fecha}
              aria-label={fecha}
              aria-pressed={estilo.pressed}
              disabled={estilo.disabled}
              onClick={() => onElegirDia(fecha)}
              className={'h-8 border rounded-[0.25rem] p-0 text-[0.6875rem] ' + estilo.className}
            >
              {dia}
            </button>
          )
        })}
      </div>
    </div>
  )
}
