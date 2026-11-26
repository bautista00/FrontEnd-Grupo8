import { Link } from 'react-router-dom'
import Estrellas from './Estrellas'
import { nombreCorto } from '../../utils/resenas'

// Reseñas publicadas, de la más nueva a la más vieja (el backend ya las ordena)
export default function ListaResenas({ resenas }) {
  if (resenas.length === 0) return <p className="text-[0.75rem] text-muted">Todavía no hay reseñas.</p>

  return (
    <ul className="grid gap-3">
      {resenas.map((resena) => (
        <li key={resena.idResena} className="rounded-[0.25rem] border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link to={`/usuarios/${resena.autor.idUsuario}`} className="text-[0.875rem] font-medium text-ink hover:underline">{nombreCorto(resena.autor)}</Link>
            <time dateTime={resena.fecha} className="text-xs text-muted">
              {new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(resena.fecha))}
            </time>
          </div>
          <div className="mt-1"><Estrellas valor={resena.estrellas} size={14} /></div>
          {resena.comentario && <p className="mt-2 text-[0.8125rem] leading-relaxed text-soft break-words">{resena.comentario}</p>}
        </li>
      ))}
    </ul>
  )
}
