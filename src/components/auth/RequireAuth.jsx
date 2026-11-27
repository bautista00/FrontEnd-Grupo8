import { Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { tokenVigente } from '../../utils/api'

// Si entró como invitado, conserva el destino para después del login.
export default function RequireAuth({ children }) {
  const { pathname, search } = useLocation()
  const token = useSelector((state) => state.users.token)
  const [entroConSesion] = useState(() => Boolean(token))

  if (!tokenVigente(token)) {
    return <Navigate to="/login" replace state={entroConSesion ? null : { volverA: pathname + search }} />
  }
  return children
}
