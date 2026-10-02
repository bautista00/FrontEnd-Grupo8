import VehicleCard from './VehicleCard'

export default function VehicleGrid({ items, onSelect }) {
  return (
    <div className="grid grid-cols-[1fr] gap-6 mb-10 md:grid-cols-[repeat(2,1fr)] lg:grid-cols-[repeat(3,1fr)] lg:gap-8">
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
