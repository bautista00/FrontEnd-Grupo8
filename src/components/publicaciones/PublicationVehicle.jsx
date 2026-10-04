import { Link } from 'react-router-dom'
import PublicationIcon from './PublicationIcon'
import PublicationSection from './PublicationSection'

export default function PublicationVehicle({ editando, vehiculo, vehiculos, seleccionado, onChange, rutaRegistro }) {
  const accion = !editando && (rutaRegistro
    ? <Link to={rutaRegistro} className="publication-text-button"><PublicationIcon nombre="plusSmall" />Registrar otro vehículo</Link>
    : <button type="button" disabled className="publication-text-button"><PublicationIcon nombre="plusSmall" />Registrar otro vehículo</button>)

  return <PublicationSection titulo="Vehículo" numero={!editando && '1'} accion={accion}>
    {editando ? <div className="publication-vehicle-summary">
      <div className="publication-vehicle-photo"><PublicationIcon nombre="car" /></div>
      <div className="publication-vehicle-info">
        <h3>{vehiculo ? vehiculo.marca + ' ' + vehiculo.modelo + ' ' + vehiculo.anio : 'Vehículo de la publicación'}</h3>
        <p>{vehiculo ? vehiculo.tipoVehiculo + ' · ' + vehiculo.color + ' · Patente ' + vehiculo.patente : 'Datos y fotos del vehículo registrado.'}</p>
        <p>No se puede cambiar en una publicación.</p>
      </div>
      <div className="publication-vehicle-actions">
        <button type="button" disabled className="publication-small-button"><PublicationIcon nombre="pencil" />Editar datos</button>
        <button type="button" disabled className="publication-small-button"><PublicationIcon nombre="image" />Fotos</button>
      </div>
    </div> : <>
      <div className="publication-vehicle-grid">
        {vehiculos.map((item) => <label key={item.idVehiculo} className="publication-vehicle-option">
          <input type="radio" name="idVehiculo" value={item.idVehiculo} checked={seleccionado === String(item.idVehiculo)}
            onChange={(event) => onChange(event.target.value)} />
          <div className="publication-vehicle-photo"><PublicationIcon nombre="car" /></div>
          <div><h3>{item.marca} {item.modelo} {item.anio}</h3><p>{item.patente}</p><p>{item.tipoVehiculo}</p></div>
        </label>)}
      </div>
      {vehiculos.length === 0 && <div className="publication-vehicle-placeholder">
        <PublicationIcon nombre="car" /><p>Tus vehículos registrados aparecerán acá para que elijas uno.</p>
      </div>}
      <p className="publication-help">Un vehículo puede tener una sola publicación activa o pausada a la vez.</p>
    </>}
  </PublicationSection>
}
