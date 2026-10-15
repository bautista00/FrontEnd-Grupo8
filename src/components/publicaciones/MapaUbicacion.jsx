import { useEffect } from 'react'
import { AdvancedMarker, Map as GoogleMap, useMap } from '@vis.gl/react-google-maps'
import { tieneCoordenadas } from './ubicacion'

const BUENOS_AIRES = { lat: -34.6037, lng: -58.3816 }

// mueve el mapa cuando se elige otra dirección
function Centrar({ lat, lng }) {
  const mapa = useMap()
  useEffect(() => {
    if (!mapa || lat == null) return
    mapa.panTo({ lat, lng })
    mapa.setZoom(16)
  }, [mapa, lat, lng])
  return null
}

export default function MapaUbicacion({ valores }) {
  const posicion = tieneCoordenadas(valores) ? { lat: Number(valores.latitud), lng: Number(valores.longitud) } : null
  return <div>
    <div className="h-60 rounded-[0.25rem] overflow-hidden bg-[#e4e2df]">
      {/* DEMO_MAP_ID es el id de prueba de Google; AdvancedMarker necesita un mapId */}
      <GoogleMap mapId="DEMO_MAP_ID" defaultCenter={posicion ?? BUENOS_AIRES} defaultZoom={posicion ? 16 : 11}
        gestureHandling="cooperative" disableDefaultUI zoomControl>
        {posicion && <AdvancedMarker position={posicion} />}
        <Centrar lat={posicion?.lat} lng={posicion?.lng} />
      </GoogleMap>
    </div>
    <p className="mt-2 text-[0.6875rem] leading-[1.5]"><strong>{posicion ? 'Ubicación seleccionada' : 'Todavía no hay una ubicación marcada'}</strong>
      <span className="text-muted"> · Así lo ven los clientes: solo la zona. La dirección exacta la ve quien tenga la reserva confirmada.</span></p>
  </div>
}
