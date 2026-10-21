import { Link } from 'react-router-dom'
import PublicationIcon from '../publicaciones/PublicationIcon'
import { actionsStyles, metaStyles } from '../publicaciones/publicationStyles'
import { btnBase, btnDark, btnOutline, btnSize } from '../ui/buttonStyles'
import { ESTADOS_PUBLICACION } from '../../utils/publicaciones'
import { portadaDe, puedePublicar, tieneFotos } from '../../utils/vehiculos'

export default function MyVehicleCard({ vehiculo }) {
  const portada = portadaDe(vehiculo)
  const conFotos = tieneFotos(vehiculo)
  const publicacion = vehiculo.publicacionActual
  const estado = publicacion ? ESTADOS_PUBLICACION[publicacion.estado] : null
  const nombre = `${vehiculo.marca} ${vehiculo.modelo}`

  return (
    <article className="flex flex-col bg-white border border-border rounded-lg overflow-hidden">
      <div className="relative grid place-items-center aspect-[16/10] bg-surface">
        {portada
          ? <img src={portada} alt={nombre} className="w-full h-full object-cover" />
          : <div className="grid justify-items-center gap-2 text-muted text-[12px]">
              <PublicationIcon nombre="car" />
              {conFotos ? 'Foto de portada' : 'Sin fotos todavía'}
            </div>}
        <span className="absolute top-3 left-3 bg-white rounded-[3px] px-1.5 py-0.5 text-[9px] uppercase">{vehiculo.tipoVehiculo}</span>
        {conFotos && <span className="absolute bottom-3 left-3 bg-ink text-white rounded-[3px] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.06em]">Portada</span>}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <span className="inline-block bg-paper border border-border rounded-[3px] px-2 py-px font-[family-name:monospace] text-[10px]">{vehiculo.patente}</span>
          <h2 className="mt-2 text-[22px] leading-tight">{nombre}</h2>
          <p className="mt-1 text-[12px] text-muted">Año {vehiculo.anio} · {vehiculo.color} · {vehiculo.cantidadAsientos} asientos</p>
        </div>

        <div className={metaStyles}>
          {estado
            ? <span className={estado.color}>
                <span className={'inline-block size-[5px] mr-[5px] rounded-full ' + estado.punto} />
                Publicación #{publicacion.idPublicacion} · {estado.nombre}
              </span>
            : <span>Sin publicación activa ni pausada</span>}
        </div>
        {!conFotos && !publicacion && <p className="text-[11px] leading-[1.6] text-error">Sumá al menos una foto antes de publicarlo.</p>}

        <div className="mt-auto grid gap-3">
          <div className={actionsStyles}>
            <Link to={`/vehiculos/${vehiculo.idVehiculo}/editar`} className={btnBase + ' ' + btnOutline + ' ' + btnSize + ' flex-1'}>Editar datos</Link>
            <Link to={`/vehiculos/${vehiculo.idVehiculo}/fotos`} className={btnBase + ' ' + btnOutline + ' ' + btnSize + ' flex-1'}>Fotos ({vehiculo.fotos.length})</Link>
          </div>
          {publicacion
            ? <Link to={`/publicaciones/${publicacion.idPublicacion}/editar`} className={btnBase + ' ' + btnDark + ' ' + btnSize + ' w-full'}>Gestionar publicación</Link>
            : puedePublicar(vehiculo)
              ? <Link to="/publicaciones/nueva" state={{ idVehiculo: vehiculo.idVehiculo }} className={btnBase + ' ' + btnDark + ' ' + btnSize + ' w-full'}>Crear publicación</Link>
              : <button className={btnBase + ' ' + btnDark + ' ' + btnSize + ' w-full'} disabled>Crear publicación</button>}
        </div>
      </div>
    </article>
  )
}
