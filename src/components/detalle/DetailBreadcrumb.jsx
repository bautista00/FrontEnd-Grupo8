import { Link } from 'react-router-dom'

// Ruta de navegación: Inicio › Catálogo › nombre del vehículo
export default function DetailBreadcrumb({ titulo }) {
  return (
    <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-2 mb-5 text-[0.6875rem] text-muted">
      <Link to="/" className="hover:text-ink">Inicio</Link>
      <span aria-hidden="true">›</span>
      <Link to="/" className="hover:text-ink">Catálogo</Link>
      <span aria-hidden="true">›</span>
      <span className="text-ink">{titulo}</span>
    </nav>
  )
}
