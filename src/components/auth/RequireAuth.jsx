import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { tokenVigente } from '../../utils/api'

// Envuelve las pantallas de la cuenta: sin sesión (o con el token vencido) manda al login,
// que después de entrar vuelve a esta misma pantalla
export default function RequireAuth({ children }) {
  const { pathname, search } = useLocation()
  const token = useSelector((state) => state.users.token)

  if (!tokenVigente(token)) {
    return <Navigate to="/login" replace state={{ volverA: pathname + search }} />
  }
  return children
}
