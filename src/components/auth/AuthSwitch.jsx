import { Link } from 'react-router-dom'

// Pie de la tarjeta: invita a ir a la otra pantalla de acceso (login o registro)
export default function AuthSwitch({ pregunta, texto, to }) {
  return (
    <p className="mt-6 pt-5 border-t border-border text-center text-[0.75rem] text-muted">
      {pregunta} <Link to={to} className="font-semibold text-ink hover:underline">{texto}</Link>
    </p>
  )
}
