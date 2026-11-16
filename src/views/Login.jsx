import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout, setToken } from '../components/Redux/userSlice'
import { pageStyles } from '../components/publicaciones/estilosPublicacion'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import TarjetaAuth from '../components/auth/TarjetaAuth'
import CambioAuth from '../components/auth/CambioAuth'
import CampoTexto from '../components/ui/CampoTexto'
import CampoContrasena from '../components/ui/CampoContrasena'
import { btnBase, btnDark } from '../components/ui/estilosBoton'
import { enviar } from '../utils/api'

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // Si llegó desde otra pantalla (por ejemplo, al agregar al carrito), vuelve ahí al entrar
  const volverA = useLocation().state?.volverA ?? '/'
  const [valores, setValores] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [datosParaEnviar, setDatosParaEnviar] = useState(null)
  const enviando = datosParaEnviar !== null

  function cambiarCampo(event) {
    if (enviando) return
    const { name, value } = event.target
    setValores({ ...valores, [name]: value })
  }

  function iniciarSesion(event) {
    event.preventDefault()
    if (enviando) return
    setError('')

    setDatosParaEnviar({ datos: { email: valores.email.trim(), password: valores.password }, volverA })
  }

  useEffect(() => {
    if (!datosParaEnviar) return
    let vigente = true
    const { datos, volverA } = datosParaEnviar
    enviar('/auth/login', 'POST', null, datos, 'El correo o la contraseña no son correctos.')
      .then((respuesta) => {
        if (!vigente) return
        setDatosParaEnviar(null)
        setValores((actuales) => ({ ...actuales, password: '' }))
        dispatch(logout())
        dispatch(setToken(respuesta.token))
        navigate(volverA)
      })
      .catch((error) => {
        if (!vigente) return
        setError(error.message)
        setDatosParaEnviar(null)
      })
    return () => { vigente = false }
  }, [datosParaEnviar, navigate, dispatch])

  return (
    <main className={pageStyles + ' pb-16'}>
      <TarjetaAuth titulo="Iniciar sesión" subtitulo="Ingresá con tu email y tu contraseña.">
        <form onSubmit={iniciarSesion} className="grid gap-4">
          <CampoTexto disabled={enviando} id="email" type="email" label="Correo electrónico" autoComplete="email" required value={valores.email} onChange={cambiarCampo} />
          <CampoContrasena disabled={enviando} id="password" label="Contraseña" autoComplete="current-password" required value={valores.password} onChange={cambiarCampo} />

          {error && <MensajePublicacion error>{error}</MensajePublicacion>}

          <button type="submit" disabled={enviando} className={btnBase + ' ' + btnDark + ' w-full mt-2 px-4 py-3 rounded-[0.25rem]'}>
            {enviando ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
        <CambioAuth pregunta="¿No tenés cuenta?" texto="Registrate" to="/registro" state={{ volverA }} />
      </TarjetaAuth>
    </main>
  )
}
