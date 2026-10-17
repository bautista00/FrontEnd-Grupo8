import PublicationSection from '../publicaciones/PublicationSection'
import MapaPublicacion from '../publicaciones/MapaPublicacion'
import { MapPinIcon } from '../icons/Icons'

// Punto de retiro y devolución: zona en el mapa y horario (la dirección exacta es solo para la reserva confirmada)
export default function DetailLocation({ publicacion }) {
  return (
    <PublicationSection
      titulo="Punto de retiro y devolución"
      accion={<span className="px-2 py-[0.1875rem] border border-border rounded-[0.1875rem] text-[0.5625rem] uppercase text-muted">Zona aproximada</span>}
    >
      <p className="flex items-center gap-1.5 mb-3 text-[0.6875rem] text-soft">
        <MapPinIcon size={13} className="text-gold" />
        {[publicacion.localidad, publicacion.ciudad].filter(Boolean).join(', ')}
      </p>
      <MapaPublicacion latitud={publicacion.latitud} longitud={publicacion.longitud} className="h-60" />
      <p className="mt-3 text-[0.6875rem] leading-[1.6] text-muted">
        {publicacion.horaRetiroDevolucion && <strong className="text-ink">Retiro y devolución a las {publicacion.horaRetiroDevolucion.slice(0, 5)} hs. </strong>}
        La dirección exacta aparece en tu reserva cuando quede confirmada.
      </p>
    </PublicationSection>
  )
}
