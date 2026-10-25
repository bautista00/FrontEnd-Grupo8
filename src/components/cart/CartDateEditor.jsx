/**
 * Permite elegir otro rango de fechas usando el calendario compartido.
 * Mantiene la selección temporal y llama a las funciones recibidas para guardar o cancelar.
 */

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
  const [inicio, actualizarInicio] = useState(carrito.fechaInicio)
  const [fin, actualizarFin] = useState(carrito.fechaFin)

  // Cambia la selección temporal; todavía no guarda en el backend.
  const elegirDia = (fecha) => {
    if (guardando) return

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

      <DetailPeriod inicio={inicio} fin={fin} />

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
          className="px-4 py-3 bg-ink text-white rounded-sm text-[0.75rem] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {guardando ? 'Guardando...' : 'Guardar fechas'}
        </button>

        <button
          type="button"
          onClick={alCancelar}
          disabled={guardando}
          className="px-4 py-3 bg-card border border-border rounded-sm text-[0.75rem] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
