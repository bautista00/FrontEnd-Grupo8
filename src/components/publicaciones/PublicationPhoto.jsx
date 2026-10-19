import { useEffect, useState } from 'react'
import PublicationIcon from './PublicationIcon'

const URL = 'http://localhost:8080'

// Portadas ya pedidas, por idVehiculo. Si dos componentes muestran el mismo auto
// (por ejemplo, en Editar publicación) o se vuelve a la misma página, se reusa el pedido.
const portadas = new Map()

function obtenerPortada(idVehiculo) {
  if (!portadas.has(idVehiculo)) {
    const pedido = fetch(`${URL}/imagen-vehiculo/por-vehiculo/${idVehiculo}`)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudieron cargar las fotos')
        return respuesta.json()
      })
      .then((imagenes) => {
        // La portada es la imagen con menor "orden"
        const primera = [...imagenes].sort((a, b) => a.orden - b.orden).find((imagen) => imagen.file)
        return primera ? `data:image/jpeg;base64,${primera.file}` : null
      })
      .catch((error) => {
        // Si falla, lo olvidamos para poder reintentar la próxima vez
        portadas.delete(idVehiculo)
        throw error
      })
    portadas.set(idVehiculo, pedido)
  }
  return portadas.get(idVehiculo)
}

// Muestra la primera foto del vehículo; si no tiene, muestra un ícono de auto
export default function PublicationPhoto({ idVehiculo, alt = '', large = false }) {
  const [portada, setPortada] = useState(null)

  useEffect(() => {
    if (!idVehiculo) return

    let vigente = true
    obtenerPortada(idVehiculo)
      .then((imagen) => { if (vigente) setPortada(imagen) })
      .catch((error) => console.error('Error al cargar la foto', error))
    // Si cambia el vehículo antes de que llegue la respuesta, ignoramos la anterior
    return () => { vigente = false }
  }, [idVehiculo])

  if (!portada) return <PublicationIcon nombre={large ? 'carLarge' : 'car'} />
  return <img src={portada} alt={alt} className="w-full h-full object-cover" />
}
