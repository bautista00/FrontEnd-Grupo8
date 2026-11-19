import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { limpiarErrorAuth, registerUser } from '../components/Redux/userSlice'
import { pageStyles } from '../components/publicaciones/estilosPublicacion'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import TarjetaAuth from '../components/auth/TarjetaAuth'
import CambioAuth from '../components/auth/CambioAuth'
import CampoTexto from '../components/ui/CampoTexto'
import CampoContrasena from '../components/ui/CampoContrasena'
import { btnBase, btnDark } from '../components/ui/estilosBoton'

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

export default function Registro() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // Si viene del login con una pantalla pendiente, vuelve ahí al crear la cuenta
  const volverA = useLocation().state?.volverA ?? '/'
  const [valores, setValores] = useState(VALORES_INICIALES)
  // Las validaciones del formulario quedan locales; el error del backend viene de Redux
  const [errorValidacion, setErrorValidacion] = useState('')
  const { loadingAuth: enviando, errorAuth } = useSelector((state) => state.users)
  const error = errorValidacion || errorAuth
  const vigente = useRef(false)

  // Evita navegar desde una pantalla que ya se desmontó y no muestra el error del login
  useEffect(() => {
    vigente.current = true
    dispatch(limpiarErrorAuth())
    return () => { vigente.current = false }
  }, [dispatch])

  function cambiarCampo(event) {
    if (enviando) return
    const { name, value } = event.target
    setValores({ ...valores, [name]: value })
  }

  async function crearCuenta(event) {
    event.preventDefault()
    if (enviando) return
    const problema = validar(valores)
    if (problema) {
      setErrorValidacion(problema)
      return
    }

    setErrorValidacion('')
    // El teléfono es opcional: si está vacío no lo mandamos
    const datos = {
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim(),
      email: valores.email.trim(),
      fechaNacimiento: valores.fechaNacimiento,
      telefono: valores.telefono.trim() || null,
      password: valores.password,
    }

    try {
      await dispatch(registerUser(datos)).unwrap()
      if (!vigente.current) return
      setValores((actuales) => ({ ...actuales, password: '', repetirPassword: '' }))
      navigate(volverA)
    } catch {
      // El error del backend queda en Redux y se muestra en el formulario
    }
  }

  const hoy = new Date().toISOString().slice(0, 10)

  return (
    <main className={pageStyles + ' pb-16'}>
      <TarjetaAuth titulo="Crear cuenta" subtitulo="Completá tus datos para alquilar o publicar vehículos.">
        <form onSubmit={crearCuenta} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4 phone:grid-cols-1">
            <CampoTexto disabled={enviando} id="nombre" label="Nombre" autoComplete="given-name" required value={valores.nombre} onChange={cambiarCampo} />
            <CampoTexto disabled={enviando} id="apellido" label="Apellido" autoComplete="family-name" required value={valores.apellido} onChange={cambiarCampo} />
          </div>
          <CampoTexto disabled={enviando} id="email" type="email" label="Correo electrónico" placeholder="nombre@ejemplo.com" autoComplete="email" required value={valores.email} onChange={cambiarCampo} />
          <div className="grid grid-cols-2 gap-4 phone:grid-cols-1">
            <CampoTexto disabled={enviando} id="fechaNacimiento" type="date" label="Fecha de nacimiento" max={hoy} autoComplete="bday" required value={valores.fechaNacimiento} onChange={cambiarCampo} />
            <CampoTexto
              id="telefono"
              type="tel"
              label={<>Teléfono <span className="normal-case tracking-normal font-normal">(opcional)</span></>}
              placeholder="+54 11 2345 6789"
              autoComplete="tel"
              value={valores.telefono}
              onChange={cambiarCampo}
            />
          </div>
          <CampoContrasena disabled={enviando} id="password" label="Contraseña" hint={`Mínimo ${MINIMO_PASSWORD} caracteres.`} autoComplete="new-password" required value={valores.password} onChange={cambiarCampo} />
          <CampoContrasena disabled={enviando} id="repetirPassword" label="Repetir contraseña" autoComplete="new-password" required value={valores.repetirPassword} onChange={cambiarCampo} />

          {error && <MensajePublicacion error>{error}</MensajePublicacion>}

          <button type="submit" disabled={enviando} className={btnBase + ' ' + btnDark + ' w-full mt-2 px-4 py-3 rounded-[0.25rem]'}>
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
        <CambioAuth pregunta="¿Ya tenés cuenta?" texto="Iniciá sesión" to="/login" state={{ volverA }} />
      </TarjetaAuth>
    </main>
  )
}
