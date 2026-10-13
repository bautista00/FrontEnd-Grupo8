import { useEffect, useState } from 'react'
import { API_PUBLICACIONES, consultarUsuario } from '../../services/publicacionesApi'
import PublicationMessage from './PublicationMessage'

function Identity({ apiUrl, token, children, onRetry, fallback }) {
  const [usuario, setUsuario] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let vigente = true
    consultarUsuario(apiUrl, token).then((datos) => {
      if (vigente) setUsuario(datos)
    }).catch((errorConsulta) => {
      if (vigente) setError(errorConsulta.message)
    })
    return () => { vigente = false }
  }, [apiUrl, token])
  if (error) return fallback(<PublicationMessage error onRetry={onRetry}>{error}</PublicationMessage>)
  if (!usuario) return fallback(<PublicationMessage>Comprobando tu sesión…</PublicationMessage>)
  return children({ apiUrl, token, usuario })
}

export default function PublicationSession({ token: tokenRecibido, apiUrl = API_PUBLICACIONES, children, fallback = (contenido) => contenido }) {
  const [tokenGuardado, setTokenGuardado] = useState(() => localStorage.getItem('jwtToken'))
  const [revision, setRevision] = useState(0)
  const token = tokenRecibido === undefined ? tokenGuardado : tokenRecibido
  useEffect(() => {
    function actualizarSesion() { setTokenGuardado(localStorage.getItem('jwtToken')) }
    window.addEventListener('storage', actualizarSesion)
    window.addEventListener('focus', actualizarSesion)
    window.addEventListener('volanta:sesion', actualizarSesion)
    return () => {
      window.removeEventListener('storage', actualizarSesion)
      window.removeEventListener('focus', actualizarSesion)
      window.removeEventListener('volanta:sesion', actualizarSesion)
    }
  }, [])
  if (!token) return fallback(<PublicationMessage>Iniciá sesión para administrar tus publicaciones.</PublicationMessage>)
  return <Identity key={apiUrl + token + revision} apiUrl={apiUrl} token={token} onRetry={() => setRevision(revision + 1)} fallback={fallback}>
    {children}
  </Identity>
}
