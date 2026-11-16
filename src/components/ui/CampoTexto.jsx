import CampoFormulario, { inputStyles } from './CampoFormulario'

// Campo de texto con su etiqueta. El resto de las props van directo al input.
export default function CampoTexto({ id, label, hint, ...props }) {
  return (
    <CampoFormulario id={id} label={label} hint={hint}>
      <input id={id} name={id} className={inputStyles} {...props} />
    </CampoFormulario>
  )
}
