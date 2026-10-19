import { useMemo, useState } from 'react'
import { MIS_VEHICULOS } from '../data/vehiculos'
import { nombreTipo } from '../utils/vehiculos'
import { VehiculosContext } from './VehiculosContext'

// Guarda la flota en memoria. Cuando exista el backend, estas funciones
// pasan a llamar a la API y el resto de las vistas no cambia.
export default function VehiculosProvider({ children }) {
  const [vehiculos, setVehiculos] = useState(MIS_VEHICULOS)

  const valor = useMemo(() => ({
    vehiculos,

    obtenerVehiculo: (id) => vehiculos.find((vehiculo) => String(vehiculo.idVehiculo) === String(id)) ?? null,

    // Devuelve el id del vehículo creado.
    crearVehiculo: (datos) => {
      const idVehiculo = Math.max(0, ...vehiculos.map((vehiculo) => vehiculo.idVehiculo)) + 1
      const nuevo = { ...datos, idVehiculo, tipoVehiculo: nombreTipo(datos.idTipoVehiculo), fotos: [], publicacionActual: null }
      setVehiculos([...vehiculos, nuevo])
      return idVehiculo
    },

    actualizarVehiculo: (id, datos) => {
      setVehiculos(vehiculos.map((vehiculo) => String(vehiculo.idVehiculo) === String(id)
        ? { ...vehiculo, ...datos, tipoVehiculo: nombreTipo(datos.idTipoVehiculo) }
        : vehiculo))
    },

    guardarFotos: (id, fotos) => {
      setVehiculos(vehiculos.map((vehiculo) => String(vehiculo.idVehiculo) === String(id) ? { ...vehiculo, fotos } : vehiculo))
    },
  }), [vehiculos])

  return <VehiculosContext.Provider value={valor}>{children}</VehiculosContext.Provider>
}
