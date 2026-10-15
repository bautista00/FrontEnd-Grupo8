import { helpStyles, textButtonStyles } from './publicationStyles'
import { useState } from 'react'
import PublicationIcon from './PublicationIcon'

function fechaDia(anio, mes, dia) {
  return anio + '-' + String(mes + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0')
}

function fechaTexto(fecha) {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(fecha + 'T12:00:00'))
}

export default function PublicationAvailability({ periodos, onChange, onSelectionChange }) {
  const [mes, setMes] = useState(() => {
    const hoy = new Date()
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  })
  const [inicio, setInicio] = useState('')
  const hoy = new Date()
  const fechaHoy = fechaDia(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const anio = mes.getFullYear()
  const numeroMes = mes.getMonth()
  const primerDia = (mes.getDay() + 6) % 7
  const cantidadDias = new Date(anio, numeroMes + 1, 0).getDate()
  const celdas = Array.from({ length: Math.ceil((primerDia + cantidadDias) / 7) * 7 }, (_, indice) => {
    const dia = indice - primerDia + 1
    return dia >= 1 && dia <= cantidadDias ? dia : null
  })

  function elegirDia(dia) {
    const fecha = fechaDia(anio, numeroMes, dia)
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

  return <div className="grid grid-cols-2 gap-4 mt-4 phone:grid-cols-1">
    <div>
      <div className="bg-paper border border-border rounded-[0.375rem] p-3 phone:max-w-80">
        <div className="flex items-center justify-between gap-2 text-[0.75rem] capitalize">
          <button type="button" className="grid place-items-center border-0 bg-transparent p-1" aria-label="Mes anterior" onClick={() => setMes(new Date(anio, numeroMes - 1, 1))}><PublicationIcon nombre="left" /></button>
          <span>{mes.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>
          <button type="button" className="grid place-items-center border-0 bg-transparent p-1" aria-label="Mes siguiente" onClick={() => setMes(new Date(anio, numeroMes + 1, 1))}><PublicationIcon nombre="right" /></button>
        </div>
        <div className="grid grid-cols-7 gap-[0.1875rem] mt-3">
          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((dia) => <span key={dia} className="text-center py-1 text-muted text-[0.625rem]">{dia}</span>)}
          {celdas.map((dia, indice) => {
            if (!dia) return <span key={'vacio-' + indice} className="text-center py-1 text-muted text-[0.625rem]" />
            const fecha = fechaDia(anio, numeroMes, dia)
            const elegido = inicio === fecha || periodos.some((periodo) => fecha >= periodo.desde && fecha <= periodo.hasta)
            return <button type="button" key={fecha} aria-label={fecha} aria-pressed={elegido}
              disabled={fecha < fechaHoy || fecha === inicio}
              className={'h-8 border rounded-[0.25rem] text-[0.6875rem] p-0 ' + (elegido ? 'bg-[#fdd79c] border-gold text-ink' : 'bg-white border-border')} onClick={() => elegirDia(dia)}>{dia}</button>
          })}
        </div>
      </div>
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
