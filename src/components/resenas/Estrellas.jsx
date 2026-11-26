import { useState } from 'react'

const ESTRELLA = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z'

function Estrella({ lleno, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={ESTRELLA} fill="currentColor" className={lleno ? 'text-gold' : 'text-border'} />
    </svg>
  )
}

// Una estrella de solo lectura: llena, media o vacía
function EstrellaPromedio({ parte, size }) {
  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <Estrella size={size} />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${parte * 100}%` }}>
        <Estrella lleno size={size} />
      </span>
    </span>
  )
}

// Sin onChange muestra el promedio (4,5 = cuatro estrellas y media); con onChange son botones para elegir la nota
export default function Estrellas({ valor = 0, onChange, size = 16 }) {
  const [sobre, setSobre] = useState(0)

  if (!onChange) {
    return (
      <span role="img" aria-label={`${String(valor.toFixed(1)).replace('.', ',')} de 5 estrellas`} className="inline-flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <EstrellaPromedio key={i} size={size} parte={Math.min(1, Math.max(0, Math.round((valor - i) * 2) / 2))} />
        ))}
      </span>
    )
  }

  return (
    <div role="group" aria-label="Calificación" className="inline-flex gap-1" onMouseLeave={() => setSobre(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
          aria-pressed={valor === n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setSobre(n)}
          className="border-0 bg-transparent p-0.5"
        >
          <Estrella lleno={n <= (sobre || valor)} size={size} />
        </button>
      ))}
    </div>
  )
}
