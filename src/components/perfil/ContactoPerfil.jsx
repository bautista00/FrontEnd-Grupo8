import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { actualizarEmail, actualizarTelefono } from '../Redux/userSlice'
import CampoFormulario, { inputStyles } from '../ui/CampoFormulario'
import CampoContrasena from '../ui/CampoContrasena'
import { btnBase, btnDark, btnOutline, btnSize } from '../ui/estilosBoton'
import { textButtonStyles } from '../publicaciones/estilosPublicacion'

// Una fila con su valor y su "Cambiar"; al tocarlo se abre el formulario del campo
function FilaEditable({ label, valor, children }) {
  const [editando, actualizarEditando] = useState(false)

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <dt className="text-[0.625rem] uppercase tracking-[0.08em] text-muted">{label}</dt>
        <dd className="m-0 flex items-baseline gap-4">
          <span className="text-[0.875rem] text-ink break-all">{valor}</span>
          {!editando && <button type="button" onClick={() => actualizarEditando(true)} className={textButtonStyles + ' underline'}>Cambiar</button>}
        </dd>
      </div>
      {editando && children(() => actualizarEditando(false))}
    </div>
  )
}

// Formulario con "Guardar" y "Cancelar"; el error del backend queda junto a los campos
function Formulario({ alGuardar, alCerrar, children }) {
  const [guardando, actualizarGuardando] = useState(false)
  const [error, actualizarError] = useState(null)

  async function enviar(event) {
    event.preventDefault()
    actualizarGuardando(true)
    actualizarError(null)
    try {
      await alGuardar(new FormData(event.currentTarget))
      alCerrar()
    } catch (e) {
      actualizarError(e.message)
      actualizarGuardando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="mt-4 grid max-w-sm gap-4">
      {children}
      {error && <p role="alert" className="text-xs text-error">{error}</p>}
      <div className="flex gap-3 [&_button:disabled]:opacity-60">
        <button type="submit" disabled={guardando} className={`${btnBase} ${btnDark} ${btnSize}`}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" disabled={guardando} onClick={alCerrar} className={`${btnBase} ${btnOutline} ${btnSize}`}>Cancelar</button>
      </div>
    </form>
  )
}

export default function ContactoPerfil({ usuario }) {
  const dispatch = useDispatch()

  return (
    <dl className="rounded-[0.25rem] border border-border bg-card divide-y divide-border">
      <FilaEditable label="Correo electrónico" valor={usuario.email}>
        {(cerrar) => (
          <Formulario alCerrar={cerrar} alGuardar={async (datos) => {
            await dispatch(actualizarEmail({ email: datos.get('email').trim(), password: datos.get('password') })).unwrap()
            toast.success('Correo actualizado')
          }}>
            <CampoFormulario id="email" label="Correo nuevo">
              <input id="email" name="email" type="email" required defaultValue={usuario.email} className={inputStyles} />
            </CampoFormulario>
            <CampoContrasena id="password" label="Tu contraseña" required autoComplete="current-password" hint="La pedimos para confirmar que sos vos." />
          </Formulario>
        )}
      </FilaEditable>

      <FilaEditable label="Teléfono" valor={usuario.telefono || 'No informado'}>
        {(cerrar) => (
          <Formulario alCerrar={cerrar} alGuardar={async (datos) => {
            await dispatch(actualizarTelefono(datos.get('telefono').trim())).unwrap()
            toast.success('Teléfono actualizado')
          }}>
            <CampoFormulario id="telefono" label="Teléfono nuevo" hint="Entre 8 y 15 dígitos.">
              <input id="telefono" name="telefono" type="tel" inputMode="numeric" required pattern="[0-9]{8,15}" defaultValue={usuario.telefono ?? ''} className={inputStyles} />
            </CampoFormulario>
          </Formulario>
        )}
      </FilaEditable>
    </dl>
  )
}
