import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { cambiarContrasena, limpiarErrorPerfil } from '../Redux/userSlice'
import CampoContrasena from '../ui/CampoContrasena'
import { btnBase, btnDark, btnSize } from '../ui/estilosBoton'

export default function CambiarContrasena() {
  const dispatch = useDispatch()
  const { guardandoPerfil, errorPerfil, operacionPerfil } = useSelector((state) => state.users)
  const [actual, actualizarActual] = useState('')
  const [nueva, actualizarNueva] = useState('')
  const [repetir, actualizarRepetir] = useState('')
  const [validacion, actualizarValidacion] = useState(null)
  const vigente = useRef(false)

  useEffect(() => {
    vigente.current = true
    dispatch(limpiarErrorPerfil())
    return () => { vigente.current = false }
  }, [dispatch])

  async function enviar(evento) {
    evento.preventDefault()
    if (guardandoPerfil) return
    if (nueva !== repetir) return actualizarValidacion('Las contraseñas nuevas no coinciden.')
    actualizarValidacion(null)
    try {
      await dispatch(cambiarContrasena({ actual, nueva })).unwrap()
      if (!vigente.current) return
      actualizarActual('')
      actualizarNueva('')
      actualizarRepetir('')
      toast.success('Contraseña actualizada')
    } catch {
      // el error queda en el slice
    }
  }

  const error = validacion || (operacionPerfil === cambiarContrasena.typePrefix ? errorPerfil : null)
  return (
    <form onSubmit={enviar} className="max-w-sm">
      <fieldset disabled={guardandoPerfil} className="m-0 grid gap-4 border-0 p-0">
        <CampoContrasena id="actual" label="Contraseña actual" required value={actual} onChange={(evento) => actualizarActual(evento.target.value)} autoComplete="current-password" />
        <CampoContrasena id="nueva" label="Contraseña nueva" required minLength={8} value={nueva} onChange={(evento) => actualizarNueva(evento.target.value)} autoComplete="new-password" hint="Al menos 8 caracteres, con una letra y un número." />
        <CampoContrasena id="repetir" label="Repetir contraseña nueva" required value={repetir} onChange={(evento) => actualizarRepetir(evento.target.value)} autoComplete="new-password" />
        {error && <p role="alert" className="text-xs text-error">{error}</p>}
        <div><button type="submit" className={`${btnBase} ${btnDark} ${btnSize} disabled:opacity-60`}>{guardandoPerfil ? 'Guardando…' : 'Cambiar contraseña'}</button></div>
      </fieldset>
    </form>
  )
}
