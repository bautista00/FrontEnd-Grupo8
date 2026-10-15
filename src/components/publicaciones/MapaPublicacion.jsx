import { AdvancedMarker, Circle, Map as GoogleMap } from '@vis.gl/react-google-maps'
import { tieneCoordenadas } from './ubicacion'

// Tamaño de la cuadrícula (~500 m) y radio del círculo que ve el cliente
const PASO = 0.005
const RADIO_METROS = 500

// Lleva el punto al centro de su cuadro de la cuadrícula.
// Así el círculo no queda centrado en la dirección real (eso la delataría),
// pero el auto siempre cae dentro del círculo.
function zonaAproximada(lat, lng) {
  return { lat: Math.round(lat / PASO) * PASO, lng: Math.round(lng / PASO) * PASO }
}

// exacta: marcador en el punto (reserva confirmada o dueño).
// Si no, solo un círculo con la zona aproximada.
export default function MapaPublicacion({ latitud, longitud, exacta = false, className = 'h-60' }) {
  if (!tieneCoordenadas({ latitud, longitud })) {
    return <div className={className + ' grid place-items-center bg-surface border border-border rounded-[0.25rem] text-[0.6875rem] text-muted'}>Ubicación no disponible</div>
  }
  const punto = { lat: Number(latitud), lng: Number(longitud) }
  const centro = exacta ? punto : zonaAproximada(punto.lat, punto.lng)
  return <div className={className + ' rounded-[0.25rem] overflow-hidden border border-border bg-surface'}>
    {/* DEMO_MAP_ID es el id de prueba de Google; AdvancedMarker necesita un mapId */}
    <GoogleMap mapId="DEMO_MAP_ID" defaultCenter={centro} defaultZoom={exacta ? 16 : 14}
      gestureHandling="cooperative" disableDefaultUI zoomControl>
      {exacta ? <AdvancedMarker position={punto} />
        : <Circle center={centro} radius={RADIO_METROS} clickable={false}
          strokeColor="#3b82f6" strokeOpacity={0.6} strokeWeight={1} fillColor="#60a5fa" fillOpacity={0.25} />}
    </GoogleMap>
  </div>
}
