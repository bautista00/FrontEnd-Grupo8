/**
 * Pide confirmación antes de eliminar un vehículo.
 * Los botones llaman a las funciones recibidas desde MisVehiculos.
 */

export default function ConfirmarEliminarVehiculo({ vehiculo, alCerrar, alConfirmar, mensaje, eliminando = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-vehicle-removal-title"
        aria-describedby="confirm-vehicle-removal-description"
        className="relative w-full max-w-[35rem] max-h-[calc(100dvh-2rem)] overflow-y-auto p-8 bg-card border border-border rounded-lg shadow-md phone:p-6"
      >
        <button type="button" aria-label="Cerrar confirmación" className="absolute top-4 right-4 grid place-items-center w-8 h-8 p-0 bg-transparent border-0 text-[1.625rem] leading-none text-muted disabled:cursor-not-allowed" onClick={alCerrar} disabled={eliminando}>
          <span aria-hidden="true">×</span>
        </button>

        <h2 id="confirm-vehicle-removal-title" className="pr-6 text-[1.625rem] leading-[1.3] text-ink phone:text-[1.4375rem]">
          ¿Eliminar el {vehiculo.marca} {vehiculo.modelo}?
        </h2>
        <p id="confirm-vehicle-removal-description" className="mt-3 text-[0.8125rem] leading-[1.8] text-soft">
          Se borran también sus fotos. Esta acción no se puede deshacer.
        </p>

        {mensaje && (
          <p role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 rounded-[0.25rem] text-[0.75rem] leading-[1.7] text-red-700">{mensaje}</p>
        )}

        <div className="flex flex-wrap justify-end gap-3 mt-8 phone:flex-col">
          <button type="button" className="px-5 py-3 bg-card border border-border rounded-[0.25rem] text-[0.75rem] text-soft disabled:cursor-not-allowed" onClick={alCerrar} disabled={eliminando}>
            Cancelar
          </button>
          <button type="button" className="px-5 py-3 bg-red-600 border border-red-600 rounded-[0.25rem] text-[0.75rem] text-white disabled:cursor-not-allowed disabled:opacity-65" onClick={alConfirmar} disabled={eliminando}>
            {eliminando ? 'Eliminando...' : 'Eliminar vehículo'}
          </button>
        </div>
      </div>
    </div>
  )
}