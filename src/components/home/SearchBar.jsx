import { CalendarIcon, ChevronDownIcon, MapPinIcon, SearchIcon } from '../icons/Icons'
import { btnBase, btnDark } from '../ui/buttonStyles'

const FIELD = 'flex-1 block px-4 py-3 cursor-pointer'
// Del segundo campo en adelante hay un separador (arriba en mobile, a la izquierda en desktop).
const FIELD_SEPARATED = `${FIELD} border-t border-border lg:border-t-0 lg:border-l`
const LABEL = 'block mb-1 text-[10px] font-bold tracking-[0.1em] uppercase text-muted'
const CONTROL = 'relative flex items-center gap-2.5'
const ICON = 'shrink-0 text-gold'
const INPUT =
  'w-full p-0 bg-transparent border-0 text-[13px] font-medium text-ink cursor-pointer focus:outline-none'

export default function SearchBar({
  zonas,
  zona,
  onZonaChange,
  fechaRetiro,
  fechaDevolucion,
  onFechaRetiroChange,
  onFechaDevolucionChange,
  onSearch,
}) {
  return (
    <form
      className="flex flex-col items-stretch mb-10 p-2 bg-card border border-border rounded-xl shadow-sm lg:flex-row lg:items-center lg:rounded-2xl lg:p-2.5"
      onSubmit={(e) => {
        e.preventDefault()
        onSearch()
      }}
    >
      <label className={FIELD}>
        <span className={LABEL}>Ubicación de retiro</span>
        <span className={CONTROL}>
          <MapPinIcon size={16} className={ICON} />
          <select
            className={`${INPUT} appearance-none pr-6`}
            value={zona}
            onChange={(e) => onZonaChange(e.target.value)}
          >
            <option value="all">Todas las zonas</option>
            {zonas.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <ChevronDownIcon size={14} className="absolute right-0 pointer-events-none text-muted" />
        </span>
      </label>

      <label className={FIELD_SEPARATED}>
        <span className={LABEL}>Fecha de retiro</span>
        <span className={CONTROL}>
          <CalendarIcon size={16} className={ICON} />
          <input
            className={INPUT}
            type="date"
            value={fechaRetiro}
            max={fechaDevolucion || undefined}
            onChange={(e) => onFechaRetiroChange(e.target.value)}
          />
        </span>
      </label>

      <label className={FIELD_SEPARATED}>
        <span className={LABEL}>Fecha de devolución</span>
        <span className={CONTROL}>
          <CalendarIcon size={16} className={ICON} />
          <input
            className={INPUT}
            type="date"
            value={fechaDevolucion}
            min={fechaRetiro || undefined}
            onChange={(e) => onFechaDevolucionChange(e.target.value)}
          />
        </span>
      </label>

      <button
        type="submit"
        className={`${btnBase} ${btnDark} m-2 px-7 py-4 rounded-lg lg:m-0 lg:ml-2`}
      >
        <SearchIcon size={16} />
        Explorar flota
      </button>
    </form>
  )
}
