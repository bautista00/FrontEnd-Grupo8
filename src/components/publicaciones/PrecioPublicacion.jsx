import CampoFormulario, { inputStyles } from '../ui/CampoFormulario'
import { formatARS } from '../../utils/formatos'

export default function PrecioPublicacion({ valores, onChange }) {
  const precio = valores.precioDia === '' ? null : Number(valores.precioDia) * (1 - Number(valores.descuentoPorcentaje || 0) / 100)
  return <>
    <div className="grid grid-cols-2 gap-4 phone:grid-cols-1">
      <CampoFormulario id="precioDia" label="Precio por día (ARS) *">
        <input id="precioDia" name="precioDia" type="number" min="1" step="1" required placeholder="Ingresá el precio"
          className={inputStyles} value={valores.precioDia} onChange={onChange} />
      </CampoFormulario>
      <CampoFormulario id="descuentoPorcentaje" label="Descuento del propietario (%)" hint="De 0 a 50 %. Se aplica a toda la reserva, sin importar la cantidad de días.">
        <input id="descuentoPorcentaje" name="descuentoPorcentaje" type="number" min="0" max="50" step="1"
          className={inputStyles} value={valores.descuentoPorcentaje} onChange={onChange} />
      </CampoFormulario>
    </div>
    <p className="mt-4 bg-paper border border-border rounded-[0.25rem] p-3 text-[0.75rem] text-soft">El cliente ve <strong>{precio === null ? '—' : formatARS(precio)}</strong> por día.</p>
  </>
}
