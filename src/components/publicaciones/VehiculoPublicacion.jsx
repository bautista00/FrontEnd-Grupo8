import { helpStyles, textButtonStyles, smallButtonStyles } from './estilosPublicacion'
import IconoPublicacion from './IconoPublicacion'
import SeccionPublicacion from './SeccionPublicacion'
import OpcionesVehiculoPublicacion from './OpcionesVehiculoPublicacion'
import FotoPublicacion from './FotoPublicacion'

// Sección "Vehículo": al crear se elige de la lista; al editar solo se muestra
export default function VehiculoPublicacion({ editando, vehiculo, seleccionado, onChange, onRegistrarOtro }) {
  const registrarOtro = !editando && (
    <button type="button" disabled={!onRegistrarOtro} onClick={onRegistrarOtro} className={textButtonStyles}><IconoPublicacion nombre="plusSmall" />Registrar otro vehículo</button>
  )

  return (
    <SeccionPublicacion titulo="Vehículo" numero={!editando && '1'} accion={registrarOtro}>
      {editando ? (
        <div className="flex items-center gap-4 max-[68.75rem]:flex-wrap">
          <div className="grid place-items-center w-40 h-25 shrink-0 bg-surface rounded-sm overflow-hidden max-[68.75rem]:w-25 max-[68.75rem]:h-18">
            <FotoPublicacion idVehiculo={vehiculo.idVehiculo} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[0.875rem] leading-5">{vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}</h3>
            <p className="text-muted text-[0.6875rem] leading-[1.6]">
              {[vehiculo.tipoVehiculo, vehiculo.color, 'Patente ' + vehiculo.patente].filter(Boolean).join(' · ')}
            </p>
            <p className="text-muted text-[0.6875rem] leading-[1.6]">No se puede cambiar en una publicación.</p>
          </div>
          <div className="grid gap-2 max-[68.75rem]:flex max-[68.75rem]:flex-wrap">
            <button type="button" disabled className={smallButtonStyles}><IconoPublicacion nombre="pencil" />Editar datos</button>
            <button type="button" disabled className={smallButtonStyles}><IconoPublicacion nombre="image" />Fotos</button>
          </div>
        </div>
      ) : (
        <>
          <OpcionesVehiculoPublicacion seleccionado={seleccionado} onChange={onChange} />
          {vehiculo && <p className={helpStyles}>Seleccionado: {vehiculo.marca} {vehiculo.modelo} · {vehiculo.patente}</p>}
          <p className={helpStyles}>Un vehículo puede tener una sola publicación activa o pausada a la vez.</p>
        </>
      )}
    </SeccionPublicacion>
  )
}
