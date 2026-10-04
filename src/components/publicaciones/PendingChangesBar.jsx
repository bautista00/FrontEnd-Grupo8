export default function PendingChangesBar({ onDiscard }) {
  return <div className="publication-pending-bar" role="status">
    <p>Tenés cambios sin guardar.</p>
    <div>
      <button type="button" onClick={onDiscard} className="publication-discard">Descartar cambios</button>
      <button type="button" disabled className="publication-save">Guardar cambios</button>
    </div>
  </div>
}
