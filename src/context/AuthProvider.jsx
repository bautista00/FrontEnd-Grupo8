import { useMemo, useState } from 'react'
import { tokenVencido } from '../utils/api'
import { AuthContext } from './AuthContext'

const CLAVE = 'jwtToken' // misma clave que ya usan las otras vistas

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado && tokenVencido(guardado)) {
      localStorage.removeItem(CLAVE)
      return null
    }
    return guardado
  })

  const valor = useMemo(() => ({
    token,
    iniciarSesion: (nuevo) => { localStorage.setItem(CLAVE, nuevo); setToken(nuevo) },
    cerrarSesion: () => { localStorage.removeItem(CLAVE); setToken(null) },
  }), [token])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}