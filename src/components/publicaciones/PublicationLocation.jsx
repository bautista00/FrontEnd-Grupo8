import FormField, { inputStyles } from '../ui/FormField'
import PublicationIcon from './PublicationIcon'
import PublicationSection from './PublicationSection'

const CAMPOS = [
  ['zona', 'Barrio o zona *'], ['localidad', 'Localidad *'], ['ciudad', 'Ciudad *'],
  ['provincia', 'Provincia *'], ['codigoPostal', 'Código postal *'],
]

export default function PublicationLocation({ valores, onChange, editando }) {
  return <PublicationSection titulo={editando ? 'Ubicación y punto de retiro' : 'Ubicación y retiro'} numero={!editando && '2'}>
    <FormField id="direccion" label="Dirección de retiro *">
      <div className="publication-address">
        <PublicationIcon nombre="pinInput" />
        <input id="direccion" name="direccion" required autoComplete="street-address" className={inputStyles}
          placeholder="Escribí la calle y la altura" value={valores.direccion} onChange={onChange} />
      </div>
    </FormField>
    <div className="publication-location-grid">
      {CAMPOS.map(([nombre, etiqueta]) => <FormField key={nombre} id={nombre} label={etiqueta}>
        <input id={nombre} name={nombre} required className={inputStyles} value={valores[nombre]} onChange={onChange} />
      </FormField>)}
      <FormField id="horaRetiroDevolucion" label="Hora de retiro y devolución *" hint="La misma para los dos.">
        <input id="horaRetiroDevolucion" name="horaRetiroDevolucion" type="time" required className={inputStyles}
          value={valores.horaRetiroDevolucion} onChange={onChange} />
      </FormField>
    </div>
    <div className="publication-location-map">
      <span className="publication-map-marker"><PublicationIcon nombre="navigation" /></span>
      <div><strong>Todavía no hay una ubicación marcada</strong><p>Así lo ven los clientes: solo la zona. La dirección exacta la ve quien tenga la reserva confirmada.</p></div>
    </div>
  </PublicationSection>
}
