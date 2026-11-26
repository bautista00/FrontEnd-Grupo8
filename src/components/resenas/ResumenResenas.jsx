import Estrellas from './Estrellas'
import { distribucion, promedio } from '../../utils/resenas'

// Promedio grande, sus estrellas y las barras del 5 al 1
export default function ResumenResenas({ resenas }) {
  const media = promedio(resenas)
  if (media === null) return null

  return (
    <div className="flex flex-wrap items-center gap-8 rounded-[0.25rem] border border-border bg-card p-5">
      <div className="text-center">
        <p className="font-serif text-[2.5rem] leading-none text-ink">{media.toFixed(1).replace('.', ',')}</p>
        <div className="mt-2"><Estrellas valor={media} /></div>
        <p className="mt-1 text-xs text-muted">{resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'}</p>
      </div>
      <ul className="grid min-w-48 flex-1 gap-1.5">
        {distribucion(resenas).map(({ estrellas, cantidad }) => (
          <li key={estrellas} className="flex items-center gap-2 text-xs text-muted">
            <span className="w-3 text-right">{estrellas}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
              <span className="block h-full bg-gold" style={{ width: `${(cantidad / resenas.length) * 100}%` }} />
            </span>
            <span className="w-5">{cantidad}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
