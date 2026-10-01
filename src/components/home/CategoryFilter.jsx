import { CarIcon } from '../icons/Icons'
import './CategoryFilter.css'

// Botones de categoría armados con los tipos de vehículo que devuelve el backend.
export default function CategoryFilter({ tipos, tipoId, onChange }) {
  return (
    <div className="category-filter" role="group" aria-label="Tipo de vehículo">
      <button
        type="button"
        className={`category-filter__option${tipoId === 'all' ? ' category-filter__option--active' : ''}`}
        onClick={() => onChange('all')}
      >
        <CarIcon size={14} />
        Todos los vehículos
      </button>

      {tipos.map((tipo) => (
        <button
          key={tipo.idTipoVehiculo}
          type="button"
          className={`category-filter__option${tipoId === String(tipo.idTipoVehiculo) ? ' category-filter__option--active' : ''}`}
          onClick={() => onChange(String(tipo.idTipoVehiculo))}
        >
          {tipo.nombre}
        </button>
      ))}
    </div>
  )
}
