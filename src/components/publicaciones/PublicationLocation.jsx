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
      <div className="relative">
        <PublicationIcon nombre="pinInput" className="absolute top-1/2 left-3 -translate-y-1/2" />
        <input id="direccion" name="direccion" required autoComplete="street-address" className={inputStyles + ' pl-9'}
          placeholder="Escribí la calle y la altura" value={valores.direccion} onChange={onChange} />
      </div>
    </FormField>
    <div className="grid grid-cols-3 gap-4 mt-4 phone:grid-cols-1">
      {CAMPOS.map(([nombre, etiqueta]) => <FormField key={nombre} id={nombre} label={etiqueta}>
        <input id={nombre} name={nombre} required className={inputStyles} value={valores[nombre]} onChange={onChange} />
      </FormField>)}
      <FormField id="horaRetiroDevolucion" label="Hora de retiro y devolución *" hint="La misma para los dos.">
        <input id="horaRetiroDevolucion" name="horaRetiroDevolucion" type="time" required className={inputStyles}
          value={valores.horaRetiroDevolucion} onChange={onChange} />
      </FormField>
    </div>
    <div className="flex items-center justify-center relative h-45 bg-[#e4e2df] rounded-[4px] mt-4">
      <span className="grid place-items-center size-10 border-2 border-white rounded-full bg-ink phone:-translate-y-[30px]"><PublicationIcon nombre="navigation" /></span>
      <div className="absolute bottom-4 left-4 max-w-90 w-[calc(100%_-_32px)] bg-white p-3 border border-border rounded-[4px] text-[11px] leading-[1.5]"><strong>Todavía no hay una ubicación marcada</strong><p className="mt-1 text-muted">Así lo ven los clientes: solo la zona. La dirección exacta la ve quien tenga la reserva confirmada.</p></div>
    </div>
  </PublicationSection>
}
