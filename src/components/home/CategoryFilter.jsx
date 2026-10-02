import { CarIcon } from '../icons/Icons'

const OPTION_BASE =
  'inline-flex items-center gap-2 px-4 py-2.5 border-0 rounded-[4px] text-[11px] font-bold tracking-[0.06em] uppercase whitespace-nowrap transition-[background-color,color]'
const OPTION_IDLE = `${OPTION_BASE} bg-surface text-soft hover:bg-[#ebe4dc] hover:text-ink`
const OPTION_ACTIVE = `${OPTION_BASE} bg-ink text-white`

// Botones de categoría armados con los tipos de vehículo que devuelve el backend.
export default function CategoryFilter({ tipos, tipoId, onChange }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Tipo de vehículo"
    >
      <button
        type="button"
        className={tipoId === 'all' ? OPTION_ACTIVE : OPTION_IDLE}
        onClick={() => onChange('all')}
      >
        <CarIcon size={14} />
        Todos los vehículos
      </button>

      {tipos.map((tipo) => (
        <button
          key={tipo.idTipoVehiculo}
          type="button"
          className={tipoId === String(tipo.idTipoVehiculo) ? OPTION_ACTIVE : OPTION_IDLE}
          onClick={() => onChange(String(tipo.idTipoVehiculo))}
        >
          {tipo.nombre}
        </button>
      ))}
    </div>
  )
}
