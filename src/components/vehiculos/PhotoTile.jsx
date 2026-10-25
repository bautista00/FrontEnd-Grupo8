import PublicationIcon from '../publicaciones/PublicationIcon'

const botonIcono = 'grid place-items-center size-8 bg-white border border-border rounded-[0.25rem] disabled:opacity-40 disabled:cursor-not-allowed'

export default function PhotoTile({ foto, indice, total, onMover, onQuitar }) {
  const numero = indice + 1
  return (
    <li className="bg-white border border-border rounded-lg overflow-hidden">
      <div className="relative grid place-items-center aspect-4/3 bg-surface">
        {foto.url
          ? <img src={foto.url} alt={`Foto ${numero}`} className="w-full h-full object-cover" />
          : <span className="text-[0.75rem] text-muted">Foto {numero}</span>}
        {indice === 0 && <span className="absolute top-2 left-2 bg-ink text-white rounded-[0.1875rem] px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.06em]">Portada</span>}
        <span className="absolute top-2 right-2 bg-white rounded-[0.1875rem] px-1.5 py-0.5 text-[0.625rem]">#{numero}</span>
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex gap-1.5">
          <button type="button" className={botonIcono} disabled={indice === 0} onClick={() => onMover(indice, -1)} aria-label={`Mover la foto ${numero} hacia adelante`}>
            <PublicationIcon nombre="left" />
          </button>
          <button type="button" className={botonIcono} disabled={indice === total - 1} onClick={() => onMover(indice, 1)} aria-label={`Mover la foto ${numero} hacia atrás`}>
            <PublicationIcon nombre="right" />
          </button>
        </div>
        <button type="button" className={botonIcono + ' text-error'} onClick={() => onQuitar(indice)} aria-label={`Quitar la foto ${numero}`}>
          <PublicationIcon nombre="close" />
        </button>
      </div>
    </li>
  )
}
