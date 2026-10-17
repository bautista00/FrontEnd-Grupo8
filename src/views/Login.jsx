import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pageStyles } from '../components/publicaciones/publicationStyles'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import AuthCard from '../components/auth/AuthCard'
import AuthSwitch from '../components/auth/AuthSwitch'
import InputField from '../components/ui/InputField'
import PasswordField from '../components/ui/PasswordField'
import { btnBase, btnDark } from '../components/ui/buttonStyles'
import { enviar } from '../utils/api'

export default function Login() {
  const navigate = useNavigate()
  const [valores, setValores] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  function cambiarCampo(event) {
    const { name, value } = event.target
    setValores({ ...valores, [name]: value })
  }

  function iniciarSesion(event) {
    event.preventDefault()
    setEnviando(true)
    setError('')

    // Si el backend explica el problema lo mostramos; si no, un mensaje general
    enviar('/auth/login', 'POST', null, { email: valores.email.trim(), password: valores.password }, 'El correo o la contraseña no son correctos.')
      .then((respuesta) => {
        // El resto de las vistas leen el token con esta clave
        localStorage.setItem('jwtToken', respuesta.token)
        navigate('/')
      })
      .catch((error) => {
        console.error('Error al iniciar sesión', error)
        setError(error.message)
        setEnviando(false)
      })
  }

  return (
    <main className={pageStyles + ' pb-16'}>
      <AuthCard titulo="Iniciar sesión" subtitulo="Ingresá con tu email y tu contraseña.">
        <form onSubmit={iniciarSesion} className="grid gap-4">
          <InputField id="email" type="email" label="Correo electrónico" autoComplete="email" required value={valores.email} onChange={cambiarCampo} />
          <PasswordField id="password" label="Contraseña" autoComplete="current-password" required value={valores.password} onChange={cambiarCampo} />

          {error && <PublicationMessage error>{error}</PublicationMessage>}

          <button type="submit" disabled={enviando} className={btnBase + ' ' + btnDark + ' w-full mt-2 px-4 py-3 rounded-[0.25rem]'}>
            {enviando ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
        <AuthSwitch pregunta="¿No tenés cuenta?" texto="Registrate" to="/registro" />
      </AuthCard>
    </main>
  )
}
