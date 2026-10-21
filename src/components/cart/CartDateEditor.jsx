import { useState } from 'react'
import DetailCalendar from '../detalle/DetailCalendar'
import DetailPeriod from '../detalle/DetailPeriod'

export default function CartDateEditor({
  carrito,
  periodos,
  alGuardar,
  alCancelar,
  guardando = false,
  mensaje = '',
}) {
  // Empezamos mostrando las fechas actuales del carrito.
  const [inicio, actualizarInicio] = useState(carrito.fechaInicio)
  const [fin, actualizarFin] = useState(carrito.fechaFin)

  // Guardamos temporalmente las fechas que el usuario elige.
  const elegirDia = (fecha) => {
    if (guardando) return

    // Si ya había un rango completo, empezamos una nueva selección.
    if (!inicio || fin || fecha <= inicio) {
      actualizarInicio(fecha)
      actualizarFin('')
      return
    }

    // Las dos fechas deben pertenecer al mismo período publicado.
    const mismoPeriodo = periodos.some(
      (periodo) => inicio >= periodo.desde && fecha <= periodo.hasta
    )

    if (mismoPeriodo) {
      actualizarFin(fecha)
    } else {
      actualizarInicio(fecha)
      actualizarFin('')
    }
  }

  // Comprobamos que haya un rango completo dentro de un período.
  const rangoValido = Boolean(
    inicio &&
    fin &&
    fin > inicio &&
    periodos.some(
      (periodo) => inicio >= periodo.desde && fin <= periodo.hasta
    )
  )

  return (
    <div className="grid gap-4 mt-5 p-4 bg-paper border border-border rounded-lg">
      <h3 className="text-[1.125rem] text-ink">
        Cambiar fechas
      </h3>

      {/* Reutilizamos el bloque que muestra retiro y devolución. */}
      <DetailPeriod inicio={inicio} fin={fin} />

      {/* Reutilizamos el calendario del detalle de publicación. */}
      <DetailCalendar
        periodos={periodos}
        inicio={inicio}
        fin={fin}
        onElegirDia={elegirDia}
      />

      {mensaje && (
        <p role="alert" className="text-[0.75rem] text-red-700">
          {mensaje}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => alGuardar(inicio, fin)}
          disabled={!rangoValido || guardando || !alGuardar}
          className="px-4 py-3 bg-ink text-white rounded-[0.25rem] text-[0.75rem] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {guardando ? 'Guardando...' : 'Guardar fechas'}
        </button>

        <button
          type="button"
          onClick={alCancelar}
          disabled={guardando}
          className="px-4 py-3 bg-card border border-border rounded-[0.25rem] text-[0.75rem] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
