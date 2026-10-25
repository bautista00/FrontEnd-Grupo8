/**
 * Aviso visual de éxito o error. Las vistas actuales no lo utilizan.
 */

export default function ReservationToast({ mensaje, tipo = 'exito' }) {
  const esExito = tipo === 'exito'

  return (
    <div
      role={esExito ? 'status' : 'alert'}
      aria-atomic="true"
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 w-full max-w-[30rem] p-5 rounded-lg shadow-md text-white phone:bottom-4 phone:left-4 phone:right-4 phone:w-auto phone:p-4 ${esExito ? 'bg-emerald-800' : 'bg-red-700'}`}
    >
      <svg className="shrink-0 mt-0.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {esExito ? (
          <path d="m5 12 4 4L19 6" />
        ) : (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </>
        )}
      </svg>

      <p className="flex-1 min-w-0 text-[0.75rem] leading-[1.7]">
        {mensaje}
      </p>

      <button type="button" aria-label="Cerrar aviso" className="grid place-items-center shrink-0 w-6 h-6 p-0 bg-transparent border-0 text-[1.375rem] leading-none text-white/80 disabled:cursor-not-allowed" disabled>
        <span aria-hidden="true">×</span>
      </button>
    </div>
  )
}
