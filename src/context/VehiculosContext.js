import { createContext, useContext } from 'react'

export const VehiculosContext = createContext(null)

export function useVehiculos() {
  const contexto = useContext(VehiculosContext)
  if (!contexto) throw new Error('useVehiculos debe usarse dentro de <VehiculosProvider>')
  return contexto
}
