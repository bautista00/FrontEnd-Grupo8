import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { actualizarEmail, actualizarTelefono, limpiarErrorPerfil } from '../Redux/userSlice'
import CampoFormulario, { inputStyles } from '../ui/CampoFormulario'
import CampoContrasena from '../ui/CampoContrasena'
import { btnBase, btnDark, btnOutline, btnSize } from '../ui/estilosBoton'
import { textButtonStyles } from '../publicaciones/estilosPublicacion'

export default function ContactoPerfil({ usuario }) {
  const dispatch = useDispatch()
  const { guardandoPerfil, errorPerfil, operacionPerfil } = useSelector((state) => state.users)
  const [campo, actualizarCampo] = useState(null)
  const [email, actualizarEmailLocal] = useState(usuario.email)
  const [telefono, actualizarTelefonoLocal] = useState(usuario.telefono ?? '')
  const [password, actualizarPassword] = useState('')
  const vigente = useRef(false)

  useEffect(() => {
    vigente.current = true
    return () => { vigente.current = false }
  }, [])

  function abrir(nombre) {
    actualizarEmailLocal(usuario.email)
    actualizarTelefonoLocal(usuario.telefono ?? '')
    actualizarPassword('')
    dispatch(limpiarErrorPerfil())
    actualizarCampo(nombre)
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (guardandoPerfil) return
    try {
      const accion = campo === 'email'
        ? actualizarEmail({ email: email.trim(), password })
        : actualizarTelefono(telefono.trim())
      await dispatch(accion).unwrap()
      if (!vigente.current) return
      toast.success(campo === 'email' ? 'Correo actualizado' : 'Teléfono actualizado')
      actualizarPassword('')
      actualizarCampo(null)
    } catch {
      // el error queda en el slice
    }
  }

  const operacion = campo === 'email' ? actualizarEmail.typePrefix : actualizarTelefono.typePrefix
  const error = operacionPerfil === operacion ? errorPerfil : null

  return (
    <div className="rounded-[0.25rem] border border-border bg-card divide-y divide-border">
      {[['email', 'Correo electrónico', usuario.email], ['telefono', 'Teléfono', usuario.telefono || 'No informado']].map(([nombre, etiqueta, valor]) => (
        <section key={nombre} className="px-5 py-4">
          <dl className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <dt className="text-[0.625rem] uppercase tracking-[0.08em] text-muted">{etiqueta}</dt>
            <dd className="m-0 flex items-baseline gap-4">
              <span className="text-[0.875rem] text-ink break-all">{valor}</span>
              {campo !== nombre && <button type="button" disabled={guardandoPerfil} onClick={() => abrir(nombre)} className={textButtonStyles + ' underline'}>Cambiar</button>}
            </dd>
          </dl>
          {campo === nombre && (
            <form onSubmit={guardar} className="mt-4 max-w-sm">
              <fieldset disabled={guardandoPerfil} className="m-0 grid gap-4 border-0 p-0">
                {nombre === 'email' ? (
                  <>
                    <CampoFormulario id="email" label="Correo nuevo">
                      <input id="email" type="email" required value={email} onChange={(evento) => actualizarEmailLocal(evento.target.value)} className={inputStyles} />
                    </CampoFormulario>
                    <CampoContrasena id="password" label="Tu contraseña" required value={password} onChange={(evento) => actualizarPassword(evento.target.value)} autoComplete="current-password" hint="La pedimos para confirmar que sos vos." />
                  </>
                ) : (
                  <CampoFormulario id="telefono" label="Teléfono nuevo" hint="Entre 8 y 15 dígitos.">
                    <input id="telefono" type="tel" inputMode="numeric" required pattern="[0-9]{8,15}" value={telefono} onChange={(evento) => actualizarTelefonoLocal(evento.target.value)} className={inputStyles} />
                  </CampoFormulario>
                )}
                {error && <p role="alert" className="text-xs text-error">{error}</p>}
                <div className="flex gap-3 [&_button:disabled]:opacity-60">
                  <button type="submit" className={`${btnBase} ${btnDark} ${btnSize}`}>{guardandoPerfil ? 'Guardando…' : 'Guardar'}</button>
                  <button type="button" onClick={() => { actualizarCampo(null); actualizarPassword('') }} className={`${btnBase} ${btnOutline} ${btnSize}`}>Cancelar</button>
                </div>
              </fieldset>
            </form>
          )}
        </section>
      ))}
    </div>
  )
}
