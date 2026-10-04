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
    <article className={'publication-row' + (desactivada ? ' publication-inactive' : '')}>
      <div className="publication-row-photo">
        {portada ? <img src={portada} alt={publicacion.marca + ' ' + publicacion.modelo} className="publication-photo" />
          : <PublicationIcon nombre="car" />}
        <span className="publication-type">{publicacion.tipoVehiculo}</span>
      </div>
      <div className="publication-row-info">
        <div className="publication-meta">
          {estado && <span className={estado.color}><span className={'publication-status-dot ' + estado.punto} />{estado.nombre} · {estado.detalle}</span>}
          <span className="publication-plate">Patente: {publicacion.patente}</span>
        </div>
        <h2>{publicacion.marca} {publicacion.modelo} {publicacion.anio}</h2>
        <p className="publication-meta"><PublicationIcon nombre="pin" />{publicacion.zona}, {publicacion.ciudad}</p>
        <p className="publication-meta"><PublicationIcon nombre="calendar" />
          {publicacion.disponibilidadResumen && <span>{publicacion.disponibilidadResumen} · </span>}
          Publicada el {formatFechaPublicacion(publicacion.fechaPublicacion)}
        </p>
      </div>
      <div className="publication-row-actions">
        <p className="publication-row-price">{formatARS(precioFinal(publicacion))}<span> / día</span></p>
        <div className="publication-actions">
          {desactivada ? <Link to="/publicaciones/nueva" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Publicar de nuevo</Link> : <>
            <button type="button" disabled className={btnBase + ' ' + btnOutline + ' ' + btnSize}>{publicacion.estado === 'ACTIVA' ? 'Pausar' : 'Reactivar'}</button>
            <button type="button" disabled className="publication-text-button text-error">Desactivar</button>
            <Link to={'/publicaciones/' + publicacion.idPublicacion + '/editar'} className={btnBase + ' ' + btnDark + ' ' + btnSize}>Editar publicación</Link>
          </>}
        </div>
      </div>
    </article>
  )
}
