import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { limpiarErrorAuth, loginUser } from '../components/Redux/userSlice'
import { pageStyles } from '../components/publicaciones/estilosPublicacion'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import TarjetaAuth from '../components/auth/TarjetaAuth'
import CambioAuth from '../components/auth/CambioAuth'
import CampoTexto from '../components/ui/CampoTexto'
import CampoContrasena from '../components/ui/CampoContrasena'
import { btnBase, btnDark } from '../components/ui/estilosBoton'

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // Si llegó desde otra pantalla (por ejemplo, al agregar al carrito), vuelve ahí al entrar
  const volverA = useLocation().state?.volverA ?? '/'
  const [valores, setValores] = useState({ email: '', password: '' })
  const { loadingAuth: enviando, errorAuth: error } = useSelector((state) => state.users)
  const vigente = useRef(false)

  // Evita navegar desde una pantalla que ya se desmontó y no muestra el error del registro
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

  async function iniciarSesion(event) {
    event.preventDefault()
    if (enviando) return

    try {
      await dispatch(loginUser({ email: valores.email.trim(), password: valores.password })).unwrap()
      if (!vigente.current) return
      setValores((actuales) => ({ ...actuales, password: '' }))
      navigate(volverA, { replace: true })
    } catch {
      // El error del backend queda en Redux y se muestra en el formulario
    }
  }

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
