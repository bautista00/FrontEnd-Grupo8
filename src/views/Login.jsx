import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { pageStyles } from '../components/publicaciones/publicationStyles'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import AuthCard from '../components/auth/AuthCard'
import AuthSwitch from '../components/auth/AuthSwitch'
import InputField from '../components/ui/InputField'
import PasswordField from '../components/ui/PasswordField'
import { btnBase, btnDark } from '../components/ui/buttonStyles'
import { enviar } from '../utils/api'

export default function Login({ reiniciarCarrito }) {
  const navigate = useNavigate()
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

    setDatosParaEnviar({ datos: { email: valores.email.trim(), password: valores.password }, tokenInicial: localStorage.getItem('jwtToken'), volverA, reiniciarCarrito })
  }

  useEffect(() => {
    if (!datosParaEnviar) return
    let vigente = true
    const { datos, tokenInicial, volverA, reiniciarCarrito } = datosParaEnviar
    enviar('/auth/login', 'POST', null, datos, 'El correo o la contraseña no son correctos.')
      .then((respuesta) => {
        if (!vigente || tokenInicial !== localStorage.getItem('jwtToken')) return
        setDatosParaEnviar(null)
        setValores((actuales) => ({ ...actuales, password: '' }))
        localStorage.setItem('jwtToken', respuesta.token)
        reiniciarCarrito()
        navigate(volverA)
      })
      .catch((error) => {
        if (!vigente || tokenInicial !== localStorage.getItem('jwtToken')) return
        setError(error.message)
        setDatosParaEnviar(null)
      })
    return () => { vigente = false }
  }, [datosParaEnviar, navigate])

  return (
    <main className={pageStyles + ' pb-16'}>
      <AuthCard titulo="Iniciar sesión" subtitulo="Ingresá con tu email y tu contraseña.">
        <form onSubmit={iniciarSesion} className="grid gap-4">
          <InputField disabled={enviando} id="email" type="email" label="Correo electrónico" autoComplete="email" required value={valores.email} onChange={cambiarCampo} />
          <PasswordField disabled={enviando} id="password" label="Contraseña" autoComplete="current-password" required value={valores.password} onChange={cambiarCampo} />

          {error && <PublicationMessage error>{error}</PublicationMessage>}

          <button type="submit" disabled={enviando} className={btnBase + ' ' + btnDark + ' w-full mt-2 px-4 py-3 rounded-[0.25rem]'}>
            {enviando ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
        <AuthSwitch pregunta="¿No tenés cuenta?" texto="Registrate" to="/registro" state={{ volverA }} />
      </AuthCard>
    </main>
  )
}
