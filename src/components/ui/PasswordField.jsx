import { useState } from 'react'
import FormField, { inputStyles } from './FormField'
import PublicationIcon from '../publicaciones/PublicationIcon'

// Campo de contraseña con un botón (el ojo) para mostrarla u ocultarla
export default function PasswordField({ id, label, hint, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <FormField id={id} label={label} hint={hint}>
      <div className="relative">
        <input id={id} name={id} type={visible ? 'text' : 'password'} className={inputStyles + ' pr-10'} {...props} />
        <button
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
          className="absolute top-1/2 right-3 -translate-y-1/2 grid place-items-center p-0 border-0 bg-transparent"
        >
          <PublicationIcon nombre="eye" />
        </button>
      </div>
    </FormField>
  )
}
