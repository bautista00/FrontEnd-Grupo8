import { Link } from 'react-router-dom'

// Tarjeta de las pantallas de acceso: link para volver, título, subtítulo y el formulario
export default function AuthCard({ titulo, subtitulo, children }) {
  return (
    <div className="w-full max-w-[26.25rem] mx-auto">
      <Link to="/" className="inline-block mb-4 text-[0.6875rem] text-muted hover:text-ink">← Volver al catálogo</Link>
      <section className="p-8 bg-card border border-border rounded-lg phone:p-5">
        <h1 className="text-center text-[2rem] leading-[1.2] text-ink phone:text-[1.75rem]">{titulo}</h1>
        <p className="mt-2 text-center text-[0.75rem] leading-[1.6] text-muted">{subtitulo}</p>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  )
}
