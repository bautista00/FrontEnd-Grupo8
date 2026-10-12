import { formatearFecha } from '../../utils/formatters'

export default function ConfirmCartRemoval({ carrito, alCerrar, alConfirmar, mensaje }) {
  // El nombre y las fechas llegan desde el carrito.
  const vehiculo = carrito.publicacion
  const fechaInicioTexto = formatearFecha(carrito.fechaInicio)
  const fechaFinTexto = formatearFecha(carrito.fechaFin)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-cart-removal-title"
        aria-describedby="confirm-cart-removal-description"
        className="relative w-full max-w-[560px] max-h-[calc(100dvh-32px)] overflow-y-auto p-8 bg-card border border-border rounded-lg shadow-md phone:p-6"
      >
        {/* La cruz cierra el modal igual que Mantener. */}
        <button type="button" aria-label="Cerrar confirmación" className="absolute top-4 right-4 grid place-items-center w-8 h-8 p-0 bg-transparent border-0 text-[26px] leading-none text-muted" onClick={alCerrar}>
          <span aria-hidden="true">×</span>
        </button>

        <h2 id="confirm-cart-removal-title" className="pr-6 text-[26px] leading-[1.3] text-ink phone:text-[23px]">
          ¿Quitar el {vehiculo.marca} {vehiculo.modelo} del carrito?
        </h2>
        <p id="confirm-cart-removal-description" className="mt-3 text-[13px] leading-[1.8] text-soft">
          Las fechas del {fechaInicioTexto} al {fechaFinTexto} se liberan y otra persona puede reservarlas.
        </p>

        {/* Si falla la eliminación, conservamos el carrito y mostramos el error. */}
        {mensaje && (
          <p role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 rounded-[4px] text-[12px] leading-[1.7] text-red-700">{mensaje}</p>
        )}

        <div className="flex flex-wrap justify-end gap-3 mt-8 phone:flex-col">
          <button type="button" className="px-5 py-3 bg-card border border-border rounded-[4px] text-[12px] text-soft disabled:cursor-not-allowed" onClick={alCerrar}>
            Mantener
          </button>
          {/* Ejecuta la función quitarCarrito que recibimos desde Cart. */}
          <button type="button" className="px-5 py-3 bg-red-600 border border-red-600 rounded-[4px] text-[12px] text-white" onClick={alConfirmar}>
            Quitar del carrito
          </button>
        </div>
      </div>
    </div>
  )
}
