import { helpStyles, textButtonStyles, smallButtonStyles } from './publicationStyles'
import { Link } from 'react-router-dom'
import PublicationIcon from './PublicationIcon'
import PublicationSection from './PublicationSection'

export default function PublicationVehicle({ editando, vehiculo, vehiculos, seleccionado, onChange, rutaRegistro }) {
  const accion = !editando && (rutaRegistro
    ? <Link to={rutaRegistro} className={textButtonStyles}><PublicationIcon nombre="plusSmall" />Registrar otro vehículo</Link>
    : <button type="button" disabled className={textButtonStyles}><PublicationIcon nombre="plusSmall" />Registrar otro vehículo</button>)

  return <PublicationSection titulo="Vehículo" numero={!editando && '1'} accion={accion}>
    {editando ? <div className="flex items-center gap-4 max-[1100px]:flex-wrap">
      <div className="grid place-items-center w-40 h-25 shrink-0 bg-surface rounded-[4px] max-[1100px]:w-25 max-[1100px]:h-18"><PublicationIcon nombre="car" /></div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] leading-5">{vehiculo ? vehiculo.marca + ' ' + vehiculo.modelo + ' ' + vehiculo.anio : 'Vehículo de la publicación'}</h3>
        <p className="text-muted text-[11px] leading-[1.6]">{vehiculo ? vehiculo.tipoVehiculo + ' · ' + vehiculo.color + ' · Patente ' + vehiculo.patente : 'Datos y fotos del vehículo registrado.'}</p>
        <p className="text-muted text-[11px] leading-[1.6]">No se puede cambiar en una publicación.</p>
      </div>
      <div className="grid gap-2 max-[1100px]:flex max-[1100px]:flex-wrap">
        <button type="button" disabled className={smallButtonStyles}><PublicationIcon nombre="pencil" />Editar datos</button>
        <button type="button" disabled className={smallButtonStyles}><PublicationIcon nombre="image" />Fotos</button>
      </div>
    </div> : <>
      <div className="grid grid-cols-2 gap-3 phone:grid-cols-1">
        {vehiculos.map((item) => <label key={item.idVehiculo} className="flex items-center gap-3 p-3 border border-border rounded-[6px] cursor-pointer has-[input:checked]:border-ink has-[input:checked]:bg-paper">
          <input className="accent-ink" type="radio" name="idVehiculo" value={item.idVehiculo} checked={seleccionado === String(item.idVehiculo)}
            onChange={(event) => onChange(event.target.value)} />
          <div className="grid place-items-center w-18 h-14 shrink-0 bg-surface rounded-[4px]"><PublicationIcon nombre="car" /></div>
          <div><h3 className="text-[14px] leading-5">{item.marca} {item.modelo} {item.anio}</h3><p className="text-muted text-[11px] leading-[1.6]">{item.patente}</p><p className="text-muted text-[11px] leading-[1.6]">{item.tipoVehiculo}</p></div>
        </label>)}
      </div>
      {vehiculos.length === 0 && <div className="flex items-center justify-center gap-3 min-h-[130px] p-5 text-muted bg-paper rounded-[4px] text-[12px] leading-[1.7]">
        <PublicationIcon nombre="car" /><p>Tus vehículos registrados aparecerán acá para que elijas uno.</p>
      </div>}
      <p className={helpStyles}>Un vehículo puede tener una sola publicación activa o pausada a la vez.</p>
    </>}
  </PublicationSection>
}
