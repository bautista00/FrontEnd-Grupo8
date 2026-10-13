import { helpStyles, textButtonStyles, smallButtonStyles } from './publicationStyles'
import { Link } from 'react-router-dom'
import PublicationIcon from './PublicationIcon'
import PublicationSection from './PublicationSection'
import PublicationVehicleOptions from './PublicationVehicleOptions'
import PublicationPhoto from './PublicationPhoto'

export default function PublicationVehicle({ editando, vehiculo, seleccionado, onChange, rutaRegistro, estadoRegistro, sesion }) {
  const accion = !editando && (rutaRegistro
    ? <Link to={rutaRegistro} state={estadoRegistro} className={textButtonStyles}><PublicationIcon nombre="plusSmall" />Registrar otro vehículo</Link>
    : <button type="button" disabled className={textButtonStyles}><PublicationIcon nombre="plusSmall" />Registrar otro vehículo</button>)

  return <PublicationSection titulo="Vehículo" numero={!editando && '1'} accion={accion}>
    {editando ? <div className="flex items-center gap-4 max-[1100px]:flex-wrap">
      <div className="grid place-items-center w-40 h-25 shrink-0 bg-surface rounded-[4px] overflow-hidden max-[1100px]:w-25 max-[1100px]:h-18"><PublicationPhoto idVehiculo={vehiculo?.idVehiculo} apiUrl={sesion.apiUrl} token={sesion.token} /></div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] leading-5">{vehiculo ? vehiculo.marca + ' ' + vehiculo.modelo + ' ' + vehiculo.anio : 'Vehículo de la publicación'}</h3>
        <p className="text-muted text-[11px] leading-[1.6]">{vehiculo ? [vehiculo.tipoVehiculo, vehiculo.color, 'Patente ' + vehiculo.patente].filter(Boolean).join(' · ') : 'Datos y fotos del vehículo registrado.'}</p>
        <p className="text-muted text-[11px] leading-[1.6]">No se puede cambiar en una publicación.</p>
      </div>
      <div className="grid gap-2 max-[1100px]:flex max-[1100px]:flex-wrap">
        <button type="button" disabled className={smallButtonStyles}><PublicationIcon nombre="pencil" />Editar datos</button>
        <button type="button" disabled className={smallButtonStyles}><PublicationIcon nombre="image" />Fotos</button>
      </div>
    </div> : <>
      <PublicationVehicleOptions sesion={sesion} seleccionado={seleccionado} onChange={onChange} />
      {vehiculo && <p className={helpStyles}>Seleccionado: {vehiculo.marca} {vehiculo.modelo} · {vehiculo.patente}</p>}
      <p className={helpStyles}>Un vehículo puede tener una sola publicación activa o pausada a la vez.</p>
    </>}
  </PublicationSection>
}
