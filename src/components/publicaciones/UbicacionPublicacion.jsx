import CampoFormulario, { inputStyles } from '../ui/CampoFormulario'
import IconoPublicacion from './IconoPublicacion'
import SeccionPublicacion from './SeccionPublicacion'
import SelectorUbicacion from './SelectorUbicacion'
import MapaUbicacion from './MapaUbicacion'

const CAMPOS = [
  ['zona', 'Barrio o zona *'], ['localidad', 'Localidad *'], ['ciudad', 'Ciudad *'],
  ['provincia', 'Provincia *'], ['codigoPostal', 'Código postal *'],
]

// Sección "Ubicación": dirección con sugerencias de Google, datos de la zona y mapa.
// Con readOnly (al editar) la dirección no se puede cambiar, solo la hora.
export default function UbicacionPublicacion({ valores, onChange, onUbicacionSeleccionada, editando, readOnly = false }) {
  return (
    <SeccionPublicacion titulo={editando ? 'Ubicación y punto de retiro' : 'Ubicación y retiro'} numero={!editando && '2'}>
      <CampoFormulario id="direccion" label="Dirección de retiro *">
        {readOnly ? (
          <div className="relative">
            <IconoPublicacion nombre="pinInput" className="absolute top-1/2 left-3 -translate-y-1/2" />
            <input id="direccion" name="direccion" readOnly className={inputStyles + ' pl-9'} value={valores.direccion} />
          </div>
        ) : (
          <SelectorUbicacion valores={valores} onChange={onChange} onUbicacionSeleccionada={onUbicacionSeleccionada} />
        )}
      </CampoFormulario>

      <div className="grid grid-cols-3 gap-4 mt-4 phone:grid-cols-1">
        {CAMPOS.map(([nombre, etiqueta]) => (
          <CampoFormulario key={nombre} id={nombre} label={etiqueta}>
            <input id={nombre} name={nombre} required readOnly={readOnly} className={inputStyles} value={valores[nombre]} onChange={onChange} />
          </CampoFormulario>
        ))}
        <CampoFormulario id="horaRetiroDevolucion" label="Hora de retiro y devolución *" hint="La misma para los dos.">
          <input id="horaRetiroDevolucion" name="horaRetiroDevolucion" type="time" step={valores.horaRetiroDevolucion.length > 5 ? 1 : 60} required className={inputStyles}
            value={valores.horaRetiroDevolucion} onChange={onChange} />
        </CampoFormulario>
      </div>

      {readOnly && <p className="mt-3 text-[0.6875rem] text-muted">Por ahora, el punto de retiro se conserva como está. Podés cambiar la hora.</p>}

      <div className="mt-4">
        <MapaUbicacion valores={valores} />
      </div>
    </SeccionPublicacion>
  )
}
