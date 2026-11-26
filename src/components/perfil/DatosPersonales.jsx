// La fecha llega como "AAAA-MM-DD"; con el mediodía no se corre de día por la zona horaria
function formatearNacimiento(fecha) {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(fecha + 'T12:00:00'))
}

// Nombre, apellido y fecha de nacimiento: solo lectura
export default function DatosPersonales({ usuario }) {
  const campos = [
    { label: 'Nombre', valor: usuario.nombre },
    { label: 'Apellido', valor: usuario.apellido },
    { label: 'Fecha de nacimiento', valor: formatearNacimiento(usuario.fechaNacimiento) },
  ]

  return (
    <section>
      <dl className="rounded-[0.25rem] border border-border bg-card divide-y divide-border">
        {campos.map((campo) => (
          <div key={campo.label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-4">
            <dt className="text-[0.625rem] uppercase tracking-[0.08em] text-muted">{campo.label}</dt>
            <dd className="m-0 text-[0.875rem] text-ink break-all">{campo.valor}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted">Se validan con tu DNI y tu licencia.</p>
    </section>
  )
}
