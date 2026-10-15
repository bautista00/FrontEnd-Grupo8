import { useEffect, useState } from 'react'
import PublicationIcon from './PublicationIcon'

const URL = 'http://localhost:8080'

// Muestra la primera foto del vehículo; si no tiene, muestra un ícono de auto
export default function PublicationPhoto({ idVehiculo, alt = '', large = false }) {
  const [portada, setPortada] = useState(null)

  useEffect(() => {
    if (!idVehiculo) return

    fetch(`${URL}/imagen-vehiculo/por-vehiculo/${idVehiculo}`)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudieron cargar las fotos')
        return respuesta.json()
      })
      .then((imagenes) => {
        // La portada es la imagen con menor "orden"
        const primera = [...imagenes].sort((a, b) => a.orden - b.orden).find((imagen) => imagen.file)
        setPortada(primera ? `data:image/jpeg;base64,${primera.file}` : null)
      })
      .catch((error) => console.error('Error al cargar la foto', error))
  }, [idVehiculo])

  if (!portada) return <PublicationIcon nombre={large ? 'carLarge' : 'car'} />
  return <img src={portada} alt={alt} className="w-full h-full object-cover" />
}
