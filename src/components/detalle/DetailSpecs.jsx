import { CalendarIcon, CarIcon } from '../icons/Icons'

// Barra con los datos del vehículo: tipo, año, capacidad y color
export default function DetailSpecs({ publicacion }) {
  const datos = [
    { etiqueta: 'Tipo', valor: publicacion.tipoVehiculo, icono: <CarIcon size={14} /> },
    { etiqueta: 'Año', valor: publicacion.anio, icono: <CalendarIcon size={14} /> },
    { etiqueta: 'Capacidad', valor: publicacion.cantidadAsientos && `${publicacion.cantidadAsientos} asientos` },
    { etiqueta: 'Color', valor: publicacion.color },
  ].filter((dato) => dato.valor)

  return (
    <dl className="grid grid-cols-4 gap-4 m-0 p-5 bg-card border border-border rounded-lg phone:grid-cols-2">
      {datos.map((dato) => (
        <div key={dato.etiqueta} className="flex items-start gap-2">
          <span className="mt-0.5 text-muted">{dato.icono}</span>
          <div>
            <dt className="text-[0.5625rem] uppercase text-muted">{dato.etiqueta}</dt>
            <dd className="m-0 mt-0.5 text-[0.75rem] text-ink">{dato.valor}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
