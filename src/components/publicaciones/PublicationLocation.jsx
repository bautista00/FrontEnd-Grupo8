import FormField, { inputStyles } from '../ui/FormField'
import PublicationIcon from './PublicationIcon'
import PublicationSection from './PublicationSection'
import SelectorUbicacion from './SelectorUbicacion'
import MapaUbicacion from './MapaUbicacion'

const CAMPOS = [
  ['zona', 'Barrio o zona *'], ['localidad', 'Localidad *'], ['ciudad', 'Ciudad *'],
  ['provincia', 'Provincia *'], ['codigoPostal', 'Código postal *'],
]

// Sección "Ubicación": dirección con sugerencias de Google, datos de la zona y mapa.
// Con readOnly (al editar) la dirección no se puede cambiar, solo la hora.
export default function PublicationLocation({ valores, onChange, onUbicacionSeleccionada, editando, readOnly = false }) {
  return (
    <PublicationSection titulo={editando ? 'Ubicación y punto de retiro' : 'Ubicación y retiro'} numero={!editando && '2'}>
      <FormField id="direccion" label="Dirección de retiro *">
        {readOnly ? (
          <div className="relative">
            <PublicationIcon nombre="pinInput" className="absolute top-1/2 left-3 -translate-y-1/2" />
            <input id="direccion" name="direccion" readOnly className={inputStyles + ' pl-9'} value={valores.direccion} />
          </div>
        ) : (
          <SelectorUbicacion valores={valores} onChange={onChange} onUbicacionSeleccionada={onUbicacionSeleccionada} />
        )}
      </FormField>

      <div className="grid grid-cols-3 gap-4 mt-4 phone:grid-cols-1">
        {CAMPOS.map(([nombre, etiqueta]) => (
          <FormField key={nombre} id={nombre} label={etiqueta}>
            <input id={nombre} name={nombre} required readOnly={readOnly} className={inputStyles} value={valores[nombre]} onChange={onChange} />
          </FormField>
        ))}
        <FormField id="horaRetiroDevolucion" label="Hora de retiro y devolución *" hint="La misma para los dos.">
          <input id="horaRetiroDevolucion" name="horaRetiroDevolucion" type="time" step={valores.horaRetiroDevolucion.length > 5 ? 1 : 60} required className={inputStyles}
            value={valores.horaRetiroDevolucion} onChange={onChange} />
        </FormField>
      </div>

      {readOnly && <p className="mt-3 text-[0.6875rem] text-muted">Por ahora, el punto de retiro se conserva como está. Podés cambiar la hora.</p>}

      <div className="mt-4">
        <MapaUbicacion valores={valores} />
      </div>
    </PublicationSection>
  )
}
