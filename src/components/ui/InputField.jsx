import FormField, { inputStyles } from './FormField'

// Campo de texto con su etiqueta. El resto de las props van directo al input.
export default function InputField({ id, label, hint, ...props }) {
  return (
    <FormField id={id} label={label} hint={hint}>
      <input id={id} name={id} className={inputStyles} {...props} />
    </FormField>
  )
}
