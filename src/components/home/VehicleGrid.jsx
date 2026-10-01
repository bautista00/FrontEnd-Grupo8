import VehicleCard from './VehicleCard'
import './VehicleGrid.css'

export default function VehicleGrid({ items, onSelect }) {
  return (
    <div className="vehicle-grid">
      {items.map((publicacion) => (
        <VehicleCard
          key={publicacion.idPublicacion}
          publicacion={publicacion}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
