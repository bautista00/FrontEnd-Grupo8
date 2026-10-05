export default function PendingChangesBar({ onDiscard }) {
  return <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between gap-5 w-[660px] max-w-[calc(100%_-_32px)] px-5 py-3.5 rounded-lg bg-ink text-white shadow-[0_16px_40px_#15110d26] text-[12px] phone:flex-col phone:items-stretch phone:gap-2 phone:bottom-4 phone:p-3.5" role="status">
    <p>Tenés cambios sin guardar.</p>
    <div className="flex items-center gap-4 phone:justify-between">
      <button type="button" onClick={onDiscard} className="border-0 bg-transparent text-disabled text-[12px] py-2 px-0">Descartar cambios</button>
      <button type="button" disabled className="bg-white text-ink border-0 rounded-[4px] px-3.5 py-2.5 text-[12px] whitespace-nowrap">Guardar cambios</button>
    </div>
  </div>
}
