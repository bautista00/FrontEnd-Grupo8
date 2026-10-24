/**
 * Permite elegir el filtro de Mis reservas llamando a la función que recibe de la vista.
 */

const FILTROS = [
  { id: "todas", texto: 'Todas' },
  { id: "proximas", texto: 'Próximas' },
  { id: "historial", texto: 'Historial' },
]

export default function ReservationFilters({ hayReservasConfirmadas,filtroSeleccionado,alCambiar }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 pb-3 border-b border-border" role="group" aria-label="Filtros de reservas">
      {FILTROS.map((filtro) => (
        <button
          key={filtro.id}
          type="button"
          className={`inline-flex items-center gap-2 px-3 py-2 border-0 rounded-[0.1875rem] text-[0.6875rem] disabled:cursor-not-allowed ${filtro.id === filtroSeleccionado ? 'bg-ink text-white' : 'bg-transparent text-soft'}`}
          aria-pressed={filtro.id === filtroSeleccionado}
          onClick={()=> alCambiar(filtro.id)}
        >
          {filtro.id === "proximas" && hayReservasConfirmadas && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
          )}
          {filtro.texto}
          {filtro.id === "proximas" && hayReservasConfirmadas && (
            <span className="sr-only">: hay reservas confirmadas</span>
          )}
        </button>
      ))}
    </div>
  )
}
