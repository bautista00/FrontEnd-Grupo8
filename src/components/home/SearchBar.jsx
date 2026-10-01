import { CalendarIcon, ChevronDownIcon, MapPinIcon, SearchIcon } from '../icons/Icons'
import './SearchBar.css'

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
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault()
        onSearch()
      }}
    >
      <label className="search-bar__field">
        <span className="search-bar__label">Ubicación de retiro</span>
        <span className="search-bar__control">
          <MapPinIcon size={16} className="search-bar__icon" />
          <select value={zona} onChange={(e) => onZonaChange(e.target.value)}>
            <option value="all">Todas las zonas</option>
            {zonas.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <ChevronDownIcon size={14} className="search-bar__chevron" />
        </span>
      </label>

      <label className="search-bar__field">
        <span className="search-bar__label">Fecha de retiro</span>
        <span className="search-bar__control">
          <CalendarIcon size={16} className="search-bar__icon" />
          <input
            type="date"
            value={fechaRetiro}
            max={fechaDevolucion || undefined}
            onChange={(e) => onFechaRetiroChange(e.target.value)}
          />
        </span>
      </label>

      <label className="search-bar__field">
        <span className="search-bar__label">Fecha de devolución</span>
        <span className="search-bar__control">
          <CalendarIcon size={16} className="search-bar__icon" />
          <input
            type="date"
            value={fechaDevolucion}
            min={fechaRetiro || undefined}
            onChange={(e) => onFechaDevolucionChange(e.target.value)}
          />
        </span>
      </label>

      <button type="submit" className="btn btn--dark search-bar__submit">
        <SearchIcon size={16} />
        Explorar flota
      </button>
    </form>
  )
}
