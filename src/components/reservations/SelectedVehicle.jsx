import { CarIcon, MapPinIcon } from '../icons/Icons'

// La vista elige el vehículo y el título del bloque.
export default function SelectedVehicle({ vehiculo, titulo = 'Vehículo seleccionado' }) {
  return (
    // Tailwind aplica los estilos desde className.
    <section className="min-w-0 p-6 bg-card border border-border rounded-lg phone:p-[1.125rem]" aria-labelledby="selected-vehicle-title">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-[0.625rem] leading-[1.5] tracking-[0.05em] uppercase text-muted">{titulo}</p>
        <span className="px-2 py-[0.1875rem] bg-surface rounded-[0.1875rem] text-[0.625rem] text-gold">{vehiculo.tipoVehiculo}</span>
      </div>

      <div className="flex items-center gap-5 phone:flex-col phone:items-start phone:gap-4">
        <div className="grid place-items-center shrink-0 w-[8.25rem] h-[5.875rem] bg-surface rounded-[0.25rem] text-disabled phone:w-full phone:h-[8.75rem]">
          {/* Reutilizamos el ícono existente como imagen de ejemplo. */}
          <CarIcon size={32} />
        </div>
        <div className="min-w-0">
          {/* Las llaves dentro del JSX muestran propiedades del objeto vehiculo. */}
          <h2 id="selected-vehicle-title" className="text-[1.25rem] leading-[1.4] text-ink">
            {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
          </h2>
          <p className="flex items-center gap-1.5 mt-2 text-[0.6875rem] text-muted">
            <MapPinIcon size={14} className="shrink-0 text-gold" />
            {vehiculo.localidad}, {vehiculo.zona}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {/* El backend usa asientos; los ejemplos anteriores usan cantidadAsientos. */}
            <span className="px-2 py-[0.1875rem] bg-paper border border-border rounded-[0.1875rem] text-[0.625rem] text-soft">{vehiculo.asientos ?? vehiculo.cantidadAsientos} asientos</span>
            <span className="px-2 py-[0.1875rem] bg-paper border border-border rounded-[0.1875rem] text-[0.625rem] text-soft">{vehiculo.anio}</span>
            {vehiculo.color && (
              <span className="px-2 py-[0.1875rem] bg-paper border border-border rounded-[0.1875rem] text-[0.625rem] text-soft">{vehiculo.color}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
