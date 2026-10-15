import { metaStyles, actionsStyles, textButtonStyles } from './publicationStyles'
import { Link } from 'react-router-dom'
import PublicationIcon from './PublicationIcon'
import PublicationPhoto from './PublicationPhoto'
import { btnBase, btnDark, btnOutline, btnSize } from '../ui/buttonStyles'
import { formatARS, precioFinal } from '../../utils/formatters'
import { ESTADOS_PUBLICACION, formatFechaPublicacion } from '../../utils/publicaciones'

// Tarjeta de una publicación en "Mis publicaciones"
export default function PublicationRow({ publicacion, onCambiarEstado, deshabilitado }) {
  const estado = ESTADOS_PUBLICACION[publicacion.estado]
  const desactivada = publicacion.estado === 'DESACTIVADA'

  return (
    <article className={'flex items-center gap-5 p-6 bg-white border border-border rounded-lg max-[68.75rem]:flex-wrap phone:p-[1.125rem]' + (desactivada ? ' opacity-70' : '')}>
      <div className="relative grid place-items-center w-48 h-30 shrink-0 bg-surface rounded-[0.25rem] overflow-hidden phone:w-full phone:h-auto phone:aspect-[16/10]">
        <PublicationPhoto idVehiculo={publicacion.idVehiculo} alt={publicacion.marca + ' ' + publicacion.modelo} />
        {publicacion.tipoVehiculo && (
          <span className="absolute top-2 left-2 bg-white rounded-[0.1875rem] px-1.5 py-0.5 text-[0.5625rem] uppercase">{publicacion.tipoVehiculo}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 phone:basis-full">
        <div className={metaStyles}>
          {estado && (
            <span className={estado.color}>
              <span className={'inline-block size-[0.3125rem] mr-[0.3125rem] rounded-full ' + estado.punto} />
              {estado.nombre} · {estado.detalle}
            </span>
          )}
          <span className="bg-paper border border-border rounded-[0.1875rem] px-2 py-px font-[family-name:monospace] text-[0.625rem]">Patente: {publicacion.patente}</span>
        </div>
        <h2 className="text-[1.5rem] my-2 phone:text-[1.375rem]">{publicacion.marca} {publicacion.modelo} {publicacion.anio}</h2>
        <p className={metaStyles}><PublicationIcon nombre="pin" />{publicacion.zona}, {publicacion.ciudad}</p>
        <p className={metaStyles}>
          <PublicationIcon nombre="calendar" />
          {publicacion.disponibilidadResumen && <span>{publicacion.disponibilidadResumen} · </span>}
          Publicada el {formatFechaPublicacion(publicacion.fechaPublicacion)}
        </p>
      </div>

      <div className="grid gap-4 justify-items-end max-[68.75rem]:flex max-[68.75rem]:w-full max-[68.75rem]:flex-wrap max-[68.75rem]:items-center max-[68.75rem]:justify-between">
        <p className="font-serif font-bold text-[1.5rem]">
          {formatARS(precioFinal(publicacion))}
          <span className="font-sans text-[0.75rem] font-normal text-muted"> / día</span>
        </p>
        <div className={actionsStyles}>
          {desactivada ? (
            <Link to="/publicaciones/nueva" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Publicar de nuevo</Link>
          ) : (
            <>
              <button
                type="button"
                disabled={deshabilitado}
                onClick={() => onCambiarEstado(publicacion, publicacion.estado === 'ACTIVA' ? 'pausar' : 'reactivar')}
                className={btnBase + ' ' + btnOutline + ' ' + btnSize}
              >
                {publicacion.estado === 'ACTIVA' ? 'Pausar' : 'Reactivar'}
              </button>
              <button
                type="button"
                disabled={deshabilitado}
                onClick={() => onCambiarEstado(publicacion, 'desactivar')}
                className={textButtonStyles + ' text-error'}
              >
                Desactivar
              </button>
              <Link to={`/publicaciones/${publicacion.idPublicacion}/editar`} className={btnBase + ' ' + btnDark + ' ' + btnSize}>
                Editar publicación
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
