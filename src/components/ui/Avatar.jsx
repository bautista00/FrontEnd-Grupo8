// Foto redonda del usuario o, si no tiene, sus iniciales en el mismo círculo
export default function Avatar({ foto, nombre = '', apellido = '', size = 36, className = '' }) {
  const iniciales = ((nombre[0] ?? '') + (apellido[0] ?? '')).toUpperCase()
  const src = foto && (foto.startsWith('data:') ? foto : `data:image/jpeg;base64,${foto}`)
  const estilo = { width: size, height: size, fontSize: size * 0.38 }

  return src
    ? <img src={src} alt="" style={estilo} className={`shrink-0 rounded-full object-cover ${className}`} />
    : <span aria-hidden="true" style={estilo} className={`grid shrink-0 place-items-center rounded-full bg-surface font-semibold text-ink ${className}`}>{iniciales}</span>
}
