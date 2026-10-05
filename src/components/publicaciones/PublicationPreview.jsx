import { eyebrowStyles, helpStyles, metaStyles } from './publicationStyles'
import PublicationIcon from './PublicationIcon'
import { formatARS } from '../../utils/formatters'

export default function PublicationPreview({ vehiculo, valores, editando }) {
  const precio = valores.precioDia === '' ? null : Number(valores.precioDia) * (1 - Number(valores.descuentoPorcentaje || 0) / 100)
  const zona = [valores.zona, valores.ciudad].filter(Boolean).join(', ')
  return <aside className="grid gap-6 tablet:grid-cols-2 tablet:items-start phone:grid-cols-1">
    <section className="bg-white border border-border rounded-lg p-4">
      <p className={eyebrowStyles}>Vista previa en el catálogo</p>
      <div className="border border-border rounded-[4px] overflow-hidden mt-3">
        <div className="relative flex flex-col items-center justify-center gap-2 aspect-[16/10] bg-surface">
          {vehiculo?.portada ? <img src={vehiculo.portada} alt="" className="w-full h-full object-cover" /> : <PublicationIcon nombre="carLarge" />}
          <span className="text-muted text-[11px]">Portada del vehículo</span>
        </div>
        <div className="p-4">
          <h2 className="text-[16px] leading-6 mb-2">{vehiculo ? vehiculo.marca + ' ' + vehiculo.modelo + ' ' + vehiculo.anio : 'Vehículo seleccionado'}</h2>
          <p className={metaStyles}><PublicationIcon nombre="pin" />{zona || 'Completá la ubicación'}</p>
          {vehiculo && <p className={helpStyles}>{vehiculo.tipoVehiculo} · {vehiculo.color}</p>}
          <p className={eyebrowStyles + ' mt-4'}>Precio por día</p>
          <p className="font-serif text-[20px] font-bold mt-1">{precio === null ? '—' : formatARS(precio)}<span className="font-sans text-[12px] font-normal text-muted"> / día</span></p>
        </div>
        {!editando && <button type="button" disabled className="flex items-center justify-center gap-1.5 w-full p-2.5 border-0 border-t border-border bg-paper text-[11px]"><PublicationIcon nombre="image" />Fotos del vehículo</button>}
      </div>
    </section>
    <section className="p-4 border border-border rounded-lg bg-paper">
      <h3 className="text-[16px] mb-2">{editando ? 'Cambios de precio' : 'Cómo funciona'}</h3>
      {editando ? <p className="text-[11px] leading-[1.6] text-muted">Se aplican solo a reservas nuevas. Las que ya están en un carrito o confirmadas mantienen el precio con el que se hicieron.</p>
        : <ul className="p-0 m-0 list-none grid gap-2.5">
          <li className="flex items-start gap-1.5 text-[11px] leading-[1.6] text-muted"><PublicationIcon nombre="check" className="mt-0.5" /><span>Los datos y las fotos son del vehículo: los editás desde Mis vehículos.</span></li>
          <li className="flex items-start gap-1.5 text-[11px] leading-[1.6] text-muted"><PublicationIcon nombre="check" className="mt-0.5" /><span>Solo se puede reservar dentro de los días que cargues.</span></li>
          <li className="flex items-start gap-1.5 text-[11px] leading-[1.6] text-muted"><PublicationIcon nombre="check" className="mt-0.5" /><span>Mientras alguien confirma, las fechas quedan retenidas 15 minutos.</span></li>
          <li className="flex items-start gap-1.5 text-[11px] leading-[1.6] text-muted"><PublicationIcon nombre="check" className="mt-0.5" /><span>Podés pausar la publicación para que deje de estar disponible para nuevas reservas.</span></li>
        </ul>}
    </section>
  </aside>
}
