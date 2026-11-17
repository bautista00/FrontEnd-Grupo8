import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import IconoPublicacion from './IconoPublicacion'
import { fetchFotosVehiculo, olvidarFotosVehiculo } from '../Redux/vehiculosSlice'
import { store } from '../Redux/store'

// Muestra la primera foto del vehículo; si no tiene, muestra un ícono de auto
export default function FotoPublicacion({ idVehiculo, alt = '', large = false }) {
  const dispatch = useDispatch()
  const entrada = useSelector((state) => state.vehiculos.fotosPorVehiculo[idVehiculo])

  useEffect(() => {
    if (idVehiculo) dispatch(fetchFotosVehiculo(idVehiculo))
  }, [dispatch, idVehiculo, entrada?.requestId])

  const portada = entrada?.fotos?.find((foto) => foto.url)?.url
  if (!portada) return <span title={entrada?.error || undefined}><IconoPublicacion nombre={large ? 'carLarge' : 'car'} /></span>
  return <img src={portada} alt={alt} className="w-full h-full object-cover" />
}

// Borra la portada guardada para que se vuelva a pedir al back.
export function olvidarPortada(idVehiculo) {
  store.dispatch(olvidarFotosVehiculo(idVehiculo))
}
