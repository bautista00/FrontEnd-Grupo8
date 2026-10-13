export default function PublicationPagination({ pagina, totalPages, totalElements, onChange, disabled = false }) {
  if (totalPages < 2) return null
  return <nav aria-label="Páginas de resultados" className="flex flex-wrap items-center justify-between gap-3 mt-5 text-[12px] text-soft">
    <span>Página {pagina + 1} de {totalPages} · {totalElements} resultados</span>
    <div className="flex gap-3">
      <button type="button" disabled={disabled || pagina === 0} onClick={() => onChange(pagina - 1)} className="border border-border rounded-[4px] px-3 py-2 disabled:opacity-40">Anterior</button>
      <button type="button" disabled={disabled || pagina + 1 >= totalPages} onClick={() => onChange(pagina + 1)} className="border border-border rounded-[4px] px-3 py-2 disabled:opacity-40">Siguiente</button>
    </div>
  </nav>
}
