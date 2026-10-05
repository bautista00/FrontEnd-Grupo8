import { metaStyles, actionsStyles, textButtonStyles } from './publicationStyles'
import { Link } from 'react-router-dom'
import PublicationIcon from './PublicationIcon'
import { btnBase, btnDark, btnOutline, btnSize } from '../ui/buttonStyles'
import { formatARS, precioFinal } from '../../utils/formatters'
import { ESTADOS_PUBLICACION, formatFechaPublicacion } from '../../utils/publicaciones'

export default function PublicationRow({ publicacion }) {
  const estado = ESTADOS_PUBLICACION[publicacion.estado]
  const desactivada = publicacion.estado === 'DESACTIVADA'
  const portada = publicacion.portada
  return (
    <article className={'flex items-center gap-5 p-6 bg-white border border-border rounded-lg max-[1100px]:flex-wrap phone:p-[18px]' + (desactivada ? ' opacity-70' : '')}>
      <div className="relative grid place-items-center w-48 h-30 shrink-0 bg-surface rounded-[4px] overflow-hidden phone:w-full phone:h-auto phone:aspect-[16/10]">
        {portada ? <img src={portada} alt={publicacion.marca + ' ' + publicacion.modelo} className="w-full h-full object-cover" />
          : <PublicationIcon nombre="car" />}
        <span className="absolute top-2 left-2 bg-white rounded-[3px] px-1.5 py-0.5 text-[9px] uppercase">{publicacion.tipoVehiculo}</span>
      </div>
      <div className="flex-1 min-w-0 phone:basis-full">
        <div className={metaStyles}>
          {estado && <span className={estado.color}><span className={'inline-block size-[5px] mr-[5px] rounded-full ' + estado.punto} />{estado.nombre} · {estado.detalle}</span>}
          <span className="bg-paper border border-border rounded-[3px] px-2 py-px font-[family-name:monospace] text-[10px]">Patente: {publicacion.patente}</span>
        </div>
        <h2 className="text-[24px] my-2 phone:text-[22px]">{publicacion.marca} {publicacion.modelo} {publicacion.anio}</h2>
        <p className={metaStyles}><PublicationIcon nombre="pin" />{publicacion.zona}, {publicacion.ciudad}</p>
        <p className={metaStyles}><PublicationIcon nombre="calendar" />
          {publicacion.disponibilidadResumen && <span>{publicacion.disponibilidadResumen} · </span>}
          Publicada el {formatFechaPublicacion(publicacion.fechaPublicacion)}
        </p>
      </div>
      <div className="grid gap-4 justify-items-end max-[1100px]:flex max-[1100px]:w-full max-[1100px]:flex-wrap max-[1100px]:items-center max-[1100px]:justify-between">
        <p className="font-serif font-bold text-[24px]">{formatARS(precioFinal(publicacion))}<span className="font-sans text-[12px] font-normal text-muted"> / día</span></p>
        <div className={actionsStyles}>
          {desactivada ? <Link to="/publicaciones/nueva" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Publicar de nuevo</Link> : <>
            <button type="button" disabled className={btnBase + ' ' + btnOutline + ' ' + btnSize}>{publicacion.estado === 'ACTIVA' ? 'Pausar' : 'Reactivar'}</button>
            <button type="button" disabled className={textButtonStyles + ' text-error'}>Desactivar</button>
            <Link to={'/publicaciones/' + publicacion.idPublicacion + '/editar'} className={btnBase + ' ' + btnDark + ' ' + btnSize}>Editar publicación</Link>
          </>}
        </div>
      </div>
    </article>
  )
}
