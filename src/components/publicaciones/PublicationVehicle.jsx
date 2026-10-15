import { helpStyles, textButtonStyles, smallButtonStyles } from './publicationStyles'
import PublicationIcon from './PublicationIcon'
import PublicationSection from './PublicationSection'
import PublicationVehicleOptions from './PublicationVehicleOptions'
import PublicationPhoto from './PublicationPhoto'

// Sección "Vehículo": al crear se elige de la lista; al editar solo se muestra
export default function PublicationVehicle({ editando, vehiculo, seleccionado, onChange }) {
  const registrarOtro = !editando && (
    <button type="button" disabled className={textButtonStyles}><PublicationIcon nombre="plusSmall" />Registrar otro vehículo</button>
  )

  return (
    <PublicationSection titulo="Vehículo" numero={!editando && '1'} accion={registrarOtro}>
      {editando ? (
        <div className="flex items-center gap-4 max-[68.75rem]:flex-wrap">
          <div className="grid place-items-center w-40 h-25 shrink-0 bg-surface rounded-[0.25rem] overflow-hidden max-[68.75rem]:w-25 max-[68.75rem]:h-18">
            <PublicationPhoto idVehiculo={vehiculo.idVehiculo} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[0.875rem] leading-5">{vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}</h3>
            <p className="text-muted text-[0.6875rem] leading-[1.6]">
              {[vehiculo.tipoVehiculo, vehiculo.color, 'Patente ' + vehiculo.patente].filter(Boolean).join(' · ')}
            </p>
            <p className="text-muted text-[0.6875rem] leading-[1.6]">No se puede cambiar en una publicación.</p>
          </div>
          <div className="grid gap-2 max-[68.75rem]:flex max-[68.75rem]:flex-wrap">
            <button type="button" disabled className={smallButtonStyles}><PublicationIcon nombre="pencil" />Editar datos</button>
            <button type="button" disabled className={smallButtonStyles}><PublicationIcon nombre="image" />Fotos</button>
          </div>
        </div>
      ) : (
        <>
          <PublicationVehicleOptions seleccionado={seleccionado} onChange={onChange} />
          {vehiculo && <p className={helpStyles}>Seleccionado: {vehiculo.marca} {vehiculo.modelo} · {vehiculo.patente}</p>}
          <p className={helpStyles}>Un vehículo puede tener una sola publicación activa o pausada a la vez.</p>
        </>
      )}
    </PublicationSection>
  )
}
