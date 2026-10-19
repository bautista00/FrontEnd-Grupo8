import { useRef, useState } from 'react'
import PublicationIcon from '../publicaciones/PublicationIcon'
import { btnBase, btnOutline, btnSize } from '../ui/buttonStyles'
import { FOTO_MAX_MB } from '../../utils/vehiculos'

export default function PhotoDropzone({ onArchivos }) {
  const inputRef = useRef(null)
  const [arrastrando, setArrastrando] = useState(false)

  function recibir(lista) {
    const archivos = Array.from(lista ?? [])
    if (archivos.length > 0) onArchivos(archivos)
  }

  return (
    <div
      onDragOver={(event) => { event.preventDefault(); setArrastrando(true) }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={(event) => { event.preventDefault(); setArrastrando(false); recibir(event.dataTransfer.files) }}
      className={'grid justify-items-center gap-2 px-6 py-10 text-center bg-white border-2 border-dashed rounded-lg transition-[border-color,background-color] '
        + (arrastrando ? 'border-ink bg-surface' : 'border-border')}
    >
      <PublicationIcon nombre="image" />
      <p className="text-[14px] text-ink">Arrastrá fotos acá o elegilas desde tu equipo</p>
      <p className="text-[12px] text-muted">JPG o PNG, hasta {FOTO_MAX_MB} MB cada una. Exterior e interior.</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png"
        className="sr-only"
        aria-label="Seleccionar fotos del vehículo"
        onChange={(event) => { recibir(event.target.files); event.target.value = '' }}
      />
      <button type="button" onClick={() => inputRef.current?.click()} className={btnBase + ' ' + btnOutline + ' ' + btnSize + ' mt-2'}>
        Seleccionar archivos
      </button>
    </div>
  )
}
