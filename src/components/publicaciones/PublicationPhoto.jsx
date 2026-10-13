import { useEffect, useState } from 'react'
import { consultarImagenes } from '../../services/publicacionesApi'
import PublicationIcon from './PublicationIcon'

export default function PublicationPhoto({ apiUrl, token, idVehiculo, alt = '', large = false }) {
  const [portada, setPortada] = useState(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let vigente = true
    if (!idVehiculo) return
    consultarImagenes(apiUrl, token, idVehiculo).then((imagenes) => {
      const primera = [...imagenes].sort((a, b) => a.orden - b.orden).find((imagen) => imagen.file)
      if (vigente) setPortada(primera ? 'data:image/jpeg;base64,' + primera.file : null)
    }).catch(() => { if (vigente) setError(true) })
    return () => { vigente = false }
  }, [apiUrl, token, idVehiculo])
  return portada ? <img src={portada} alt={alt} className="w-full h-full object-cover" />
    : <><PublicationIcon nombre={large ? 'carLarge' : 'car'} />{error && <span className="text-[10px] text-muted">No se pudo cargar la foto</span>}</>
}
