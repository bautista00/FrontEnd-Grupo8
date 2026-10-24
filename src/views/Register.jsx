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

const MINIMO_PASSWORD = 6

const VALORES_INICIALES = {
  nombre: '',
  apellido: '',
  email: '',
  fechaNacimiento: '',
  telefono: '',
  password: '',
  repetirPassword: '',
}

// Devuelve el primer problema que encuentre, o '' si está todo bien
function validar(valores) {
  if (valores.password.length < MINIMO_PASSWORD) return `La contraseña debe tener al menos ${MINIMO_PASSWORD} caracteres.`
  if (valores.password !== valores.repetirPassword) return 'Las contraseñas no coinciden.'
  return ''
}

export default function Register({ reiniciarCarrito }) {
  const navigate = useNavigate()
  // Si viene del login con una pantalla pendiente, vuelve ahí al crear la cuenta
  const volverA = useLocation().state?.volverA ?? '/'
  const [valores, setValores] = useState(VALORES_INICIALES)
  const [error, setError] = useState('')
  const [datosParaEnviar, setDatosParaEnviar] = useState(null)
  const enviando = datosParaEnviar !== null

  function cambiarCampo(event) {
    if (enviando) return
    const { name, value } = event.target
    setValores({ ...valores, [name]: value })
  }

  function crearCuenta(event) {
    event.preventDefault()
    if (enviando) return
    const problema = validar(valores)
    if (problema) {
      setError(problema)
      return
    }

    setError('')
    // El teléfono es opcional: si está vacío no lo mandamos
    const datos = {
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim(),
      email: valores.email.trim(),
      fechaNacimiento: valores.fechaNacimiento,
      telefono: valores.telefono.trim() || null,
      password: valores.password,
    }

    setDatosParaEnviar({ datos: datos, tokenInicial: localStorage.getItem('jwtToken'), volverA, reiniciarCarrito })
  }

  useEffect(() => {
    if (!datosParaEnviar) return
    let vigente = true
    const { datos, tokenInicial, volverA, reiniciarCarrito } = datosParaEnviar
    enviar('/auth/register', 'POST', null, datos, 'No pudimos crear la cuenta. Intentá nuevamente.')
      .then((respuesta) => {
        if (!vigente || tokenInicial !== localStorage.getItem('jwtToken')) return
        setDatosParaEnviar(null)
        setValores((actuales) => ({ ...actuales, password: '', repetirPassword: '' }))
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

  const hoy = new Date().toISOString().slice(0, 10)

  return (
    <main className={pageStyles + ' pb-16'}>
      <AuthCard titulo="Crear cuenta" subtitulo="Completá tus datos para alquilar o publicar vehículos.">
        <form onSubmit={crearCuenta} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4 phone:grid-cols-1">
            <InputField disabled={enviando} id="nombre" label="Nombre" autoComplete="given-name" required value={valores.nombre} onChange={cambiarCampo} />
            <InputField disabled={enviando} id="apellido" label="Apellido" autoComplete="family-name" required value={valores.apellido} onChange={cambiarCampo} />
          </div>
          <InputField disabled={enviando} id="email" type="email" label="Correo electrónico" placeholder="nombre@ejemplo.com" autoComplete="email" required value={valores.email} onChange={cambiarCampo} />
          <div className="grid grid-cols-2 gap-4 phone:grid-cols-1">
            <InputField disabled={enviando} id="fechaNacimiento" type="date" label="Fecha de nacimiento" max={hoy} autoComplete="bday" required value={valores.fechaNacimiento} onChange={cambiarCampo} />
            <InputField
              id="telefono"
              type="tel"
              label={<>Teléfono <span className="normal-case tracking-normal font-normal">(opcional)</span></>}
              placeholder="+54 11 2345 6789"
              autoComplete="tel"
              value={valores.telefono}
              onChange={cambiarCampo}
            />
          </div>
          <PasswordField disabled={enviando} id="password" label="Contraseña" hint={`Mínimo ${MINIMO_PASSWORD} caracteres.`} autoComplete="new-password" required value={valores.password} onChange={cambiarCampo} />
          <PasswordField disabled={enviando} id="repetirPassword" label="Repetir contraseña" autoComplete="new-password" required value={valores.repetirPassword} onChange={cambiarCampo} />

          {error && <PublicationMessage error>{error}</PublicationMessage>}

          <button type="submit" disabled={enviando} className={btnBase + ' ' + btnDark + ' w-full mt-2 px-4 py-3 rounded-[0.25rem]'}>
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
        <AuthSwitch pregunta="¿Ya tenés cuenta?" texto="Iniciá sesión" to="/login" state={{ volverA }} />
      </AuthCard>
    </main>
  )
}
