import PublicationIcon from './PublicationIcon'
import { formatARS } from '../../utils/formatters'

export default function PublicationPreview({ vehiculo, valores, editando }) {
  const precio = valores.precioDia === '' ? null : Number(valores.precioDia) * (1 - Number(valores.descuentoPorcentaje || 0) / 100)
  const zona = [valores.zona, valores.ciudad].filter(Boolean).join(', ')
  return <aside className="publication-preview-column">
    <section className="publication-preview">
      <p className="publication-eyebrow">Vista previa en el catálogo</p>
      <div className="publication-preview-card">
        <div className="publication-preview-photo">
          {vehiculo?.portada ? <img src={vehiculo.portada} alt="" className="publication-photo" /> : <PublicationIcon nombre="carLarge" />}
          <span>Portada del vehículo</span>
        </div>
        <div className="publication-preview-info">
          <h2>{vehiculo ? vehiculo.marca + ' ' + vehiculo.modelo + ' ' + vehiculo.anio : 'Vehículo seleccionado'}</h2>
          <p className="publication-meta"><PublicationIcon nombre="pin" />{zona || 'Completá la ubicación'}</p>
          {vehiculo && <p className="publication-help">{vehiculo.tipoVehiculo} · {vehiculo.color}</p>}
          <p className="publication-eyebrow">Precio por día</p>
          <p className="publication-preview-price">{precio === null ? '—' : formatARS(precio)}<span> / día</span></p>
        </div>
        {!editando && <button type="button" disabled className="publication-preview-photos"><PublicationIcon nombre="image" />Fotos del vehículo</button>}
      </div>
    </section>
    <section className="publication-preview-note">
      <h3>{editando ? 'Cambios de precio' : 'Cómo funciona'}</h3>
      {editando ? <p>Se aplican solo a reservas nuevas. Las que ya están en un carrito o confirmadas mantienen el precio con el que se hicieron.</p>
        : <ul>
          <li><PublicationIcon nombre="check" /><span>Los datos y las fotos son del vehículo: los editás desde Mis vehículos.</span></li>
          <li><PublicationIcon nombre="check" /><span>Solo se puede reservar dentro de los días que cargues.</span></li>
          <li><PublicationIcon nombre="check" /><span>Mientras alguien confirma, las fechas quedan retenidas 15 minutos.</span></li>
          <li><PublicationIcon nombre="check" /><span>Podés pausar la publicación para que deje de estar disponible para nuevas reservas.</span></li>
        </ul>}
    </section>
  </aside>
}
