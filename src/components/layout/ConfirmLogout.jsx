export default function ConfirmLogout({ alCerrar, alConfirmar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-logout-title"
        className="relative w-full max-w-[26rem] max-h-[calc(100dvh-2rem)] overflow-y-auto p-8 bg-card border border-border rounded-lg shadow-md phone:p-6"
      >
        {/* La cruz cierra el modal igual que No. */}
        <button type="button" aria-label="Cerrar confirmación" className="absolute top-4 right-4 grid place-items-center w-8 h-8 p-0 bg-transparent border-0 text-[1.625rem] leading-none text-muted" onClick={alCerrar}>
          <span aria-hidden="true">×</span>
        </button>

        <h2 id="confirm-logout-title" className="pr-6 text-[1.625rem] leading-[1.3] text-ink phone:text-[1.4375rem]">
          ¿Desea cerrar sesión?
        </h2>

        <div className="flex flex-wrap justify-end gap-3 mt-8 phone:flex-col">
          <button type="button" className="px-5 py-3 bg-card border border-border rounded-[0.25rem] text-[0.75rem] text-soft" onClick={alCerrar}>
            No
          </button>
          {/* Ejecuta la función cerrarSesion que recibimos desde Navbar. */}
          <button type="button" className="px-5 py-3 bg-red-600 border border-red-600 rounded-[0.25rem] text-[0.75rem] text-white" onClick={alConfirmar}>
            Sí, cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
