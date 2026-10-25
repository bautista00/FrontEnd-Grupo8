/**
 * Muestra el vehículo del carrito y permite abrir la edición de fechas o pedir su eliminación.
 * Envía las fechas elegidas a Cart mediante la función recibida por props.
 */

import { useState } from 'react'
import { CarIcon, MapPinIcon } from '../icons/Icons'
import { formatARS as formatearPrecio, formatearFecha } from '../../utils/formatters'
import CartDateEditor from './CartDateEditor'

export default function CartVehicle({
  carrito,
  alQuitar,
  periodos = carrito.publicacion.periodos ?? [],
  alGuardarFechas,
  guardandoFechas = false,
  quitando = false,
  mensajeFechas = '',
}) {
  const [mostrarEditor, actualizarMostrarEditor] = useState(false)

  // Pasa las fechas a Cart y le indica cómo cerrar el editor cuando se guarden correctamente.
  const guardarYCerrar = (fechaInicio, fechaFin) => {
    alGuardarFechas(
      fechaInicio,
      fechaFin,
      () => actualizarMostrarEditor(false)
    )
  }

  const vehiculo = carrito.publicacion

  return (
    <section className="flex min-w-0 gap-6 p-6 bg-card border border-border rounded-lg phone:flex-col phone:gap-4 phone:p-4.5" aria-labelledby="cart-vehicle-title">
      <div className="flex flex-col self-start shrink-0 items-center justify-center gap-2 w-[32%] h-55 bg-surface rounded-sm text-disabled phone:w-full phone:h-40">
        <CarIcon size={36} />
        <span className="text-[0.625rem] text-muted">Portada</span>
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[0.5625rem] tracking-[0.06em] uppercase text-gold">{vehiculo.tipoVehiculo}</span>
        <h2 id="cart-vehicle-title" className="mt-1.5 text-[1.375rem] leading-[1.3] text-ink">
          {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
        </h2>
        <p className="flex items-center gap-1.5 mt-2 text-[0.6875rem] text-muted">
          <MapPinIcon size={14} className="shrink-0 text-gold" />
          {vehiculo.localidad}, {vehiculo.zona}
        </p>

        {mostrarEditor ? (
          <CartDateEditor
            carrito={carrito}
            periodos={periodos}
            alGuardar={guardarYCerrar}
            alCancelar={() => actualizarMostrarEditor(false)}
            guardando={guardandoFechas}
            mensaje={mensajeFechas}
          />
        ) : (
          <dl className="grid grid-cols-3 gap-3 mt-5 mb-4 p-3 bg-paper border border-border rounded-sm phone:gap-2">
            <div>
              <dt className="mb-1.5 text-[0.5625rem] uppercase text-muted">Retiro</dt>
              <dd className="m-0 text-[0.6875rem] leading-normal">{formatearFecha(carrito.fechaInicio)}</dd>
            </div>
            <div>
              <dt className="mb-1.5 text-[0.5625rem] uppercase text-muted">Devolución</dt>
              <dd className="m-0 text-[0.6875rem] leading-normal">{formatearFecha(carrito.fechaFin)}</dd>
            </div>
            <div>
              <dt className="mb-1.5 text-[0.5625rem] uppercase text-muted">Duración</dt>
              <dd className="m-0 text-[0.6875rem] leading-normal">{carrito.cantidadDias} días</dd>
            </div>
          </dl>
        )}

        <p className="flex flex-wrap items-baseline gap-2 mt-4">
          <strong className="font-serif text-[1.25rem] text-ink">{formatearPrecio(carrito.precioDiaAplicado)}</strong>
          <span className="text-[0.6875rem] text-muted">/ día</span>
        </p>

        <div className="flex justify-between gap-4 mt-4 pt-3 border-t border-border">
          {!mostrarEditor && (
            <button type="button" className="p-0 bg-transparent border-0 text-[0.6875rem] text-muted underline disabled:cursor-not-allowed" onClick={() => actualizarMostrarEditor(true)} disabled={carrito.segundosRestantes === 0 || quitando}>
              Cambiar fechas
            </button>
          )}
          <button type="button" className="ml-auto p-0 bg-transparent border-0 text-[0.6875rem] text-muted underline disabled:cursor-not-allowed" onClick={alQuitar} disabled={guardandoFechas || quitando}>Quitar</button>
        </div>
      </div>
    </section>
  )
}
