import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { cambiarContrasena } from '../Redux/userSlice'
import CampoContrasena from '../ui/CampoContrasena'
import { btnBase, btnDark, btnSize } from '../ui/estilosBoton'

export default function CambiarContrasena() {
  const dispatch = useDispatch()
  const [guardando, actualizarGuardando] = useState(false)
  const [error, actualizarError] = useState(null)

  async function enviar(event) {
    event.preventDefault()
    const formulario = event.currentTarget
    const datos = new FormData(formulario)
    if (datos.get('nueva') !== datos.get('repetir')) return actualizarError('Las contraseñas nuevas no coinciden.')

    actualizarGuardando(true)
    actualizarError(null)
    try {
      await dispatch(cambiarContrasena({ actual: datos.get('actual'), nueva: datos.get('nueva') })).unwrap()
      formulario.reset()
      toast.success('Contraseña actualizada')
    } catch (e) {
      actualizarError(e.message)
    } finally {
      actualizarGuardando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="grid max-w-sm gap-4">
      <CampoContrasena id="actual" label="Contraseña actual" required autoComplete="current-password" />
      <CampoContrasena id="nueva" label="Contraseña nueva" required minLength={8} autoComplete="new-password" hint="Al menos 8 caracteres, con una letra y un número." />
      <CampoContrasena id="repetir" label="Repetir contraseña nueva" required autoComplete="new-password" />
      {error && <p role="alert" className="text-xs text-error">{error}</p>}
      <div>
        <button type="submit" disabled={guardando} className={`${btnBase} ${btnDark} ${btnSize} disabled:opacity-60`}>{guardando ? 'Guardando…' : 'Cambiar contraseña'}</button>
      </div>
    </form>
  )
}
