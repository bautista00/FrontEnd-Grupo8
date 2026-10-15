// Botones "Anterior" / "Siguiente" para las listas paginadas del backend
export default function PublicationPagination({ pagina, totalPages, totalElements, onChange }) {
  if (totalPages < 2) return null

  return (
    <nav aria-label="Páginas de resultados" className="flex flex-wrap items-center justify-between gap-3 mt-5 text-[0.75rem] text-soft">
      <span>Página {pagina + 1} de {totalPages} · {totalElements} resultados</span>
      <div className="flex gap-3">
        <button type="button" disabled={pagina === 0} onClick={() => onChange(pagina - 1)}
          className="border border-border rounded-[0.25rem] px-3 py-2 disabled:opacity-40">Anterior</button>
        <button type="button" disabled={pagina + 1 >= totalPages} onClick={() => onChange(pagina + 1)}
          className="border border-border rounded-[0.25rem] px-3 py-2 disabled:opacity-40">Siguiente</button>
      </div>
    </nav>
  )
}
