export default function PendingChangesBar({ onDiscard, formId, disabled, saveDisabled }) {
  return <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between gap-5 w-[41.25rem] max-w-[calc(100%_-_2rem)] px-5 py-3.5 rounded-lg bg-ink text-white shadow-[0_1rem_2.5rem_#15110d26] text-[0.75rem] phone:flex-col phone:items-stretch phone:gap-2 phone:bottom-4 phone:p-3.5" role="status">
    <p>Tenés cambios sin guardar.</p>
    <div className="flex items-center gap-4 phone:justify-between">
      <button type="button" disabled={disabled} onClick={onDiscard} className="border-0 bg-transparent text-disabled text-[0.75rem] py-2 px-0">Descartar cambios</button>
      <button type="submit" form={formId} disabled={saveDisabled} className="bg-white text-ink border-0 rounded-[0.25rem] px-3.5 py-2.5 text-[0.75rem] whitespace-nowrap disabled:opacity-50">Guardar cambios</button>
    </div>
  </div>
}
