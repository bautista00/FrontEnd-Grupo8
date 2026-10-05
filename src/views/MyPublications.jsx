import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/publicationStyles'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicationIcon from '../components/publicaciones/PublicationIcon'
import PublicationRow from '../components/publicaciones/PublicationRow'
import { btnBase, btnDark, btnSize } from '../components/ui/buttonStyles'
import { ESTADOS_PUBLICACION } from '../utils/publicaciones'

export default function MyPublications({ publicaciones }) {
  const [estado, setEstado] = useState('TODAS')
  const [busqueda, setBusqueda] = useState('')
  const filtros = [{ valor: 'TODAS', etiqueta: 'Todas' },
    ...Object.entries(ESTADOS_PUBLICACION).map(([valor, datos]) => ({ valor, etiqueta: datos.etiqueta }))]
  const datosDisponibles = Array.isArray(publicaciones)
  const resultados = (publicaciones ?? []).filter((publicacion) => {
    const nombre = [publicacion.marca, publicacion.modelo, publicacion.patente].join(' ').toLowerCase()
    return (estado === 'TODAS' || publicacion.estado === estado) && nombre.includes(busqueda.trim().toLowerCase())
  })

  return (
    <main className={pageStyles + ' pb-20 phone:pb-12'}>
      <div className={headingStyles}>
        <div>
          <p className={eyebrowStyles}>Panel de propietario · Gestión de vehículos</p>
          <h1 className={titleStyles}>Mis publicaciones</h1>
          <p className={introStyles}>Administrá tus autos en alquiler: precio, días disponibles y si aparecen en el catálogo.</p>
        </div>
        <Link to="/publicaciones/nueva" className={btnBase + ' ' + btnDark + ' ' + btnSize}>
          <PublicationIcon nombre="plus" /> Publicar nuevo auto
        </Link>
      </div>
      <div className="flex items-center justify-between gap-4 my-6 phone:flex-col phone:items-stretch">
        <div role="group" aria-label="Filtrar publicaciones por estado" className="flex flex-wrap gap-1 phone:gap-0">
          {filtros.map((filtro) => {
            const cantidad = datosDisponibles
              ? publicaciones.filter((item) => filtro.valor === 'TODAS' || item.estado === filtro.valor).length
              : null
            return <button key={filtro.valor} type="button" aria-pressed={estado === filtro.valor}
              onClick={() => setEstado(filtro.valor)} className={'border-0 rounded-[6px] px-3.5 py-1.5 text-[12px] phone:px-[9px] ' + (estado === filtro.valor ? 'bg-ink text-white' : 'bg-transparent text-soft')}>
              {filtro.etiqueta}{cantidad !== null && ' (' + cantidad + ')'}
            </button>
          })}
        </div>
        <div className="relative w-72 max-w-full phone:w-full">
          <PublicationIcon nombre="search" className="absolute top-1/2 left-3 -translate-y-1/2" />
          <input className="w-full bg-white border border-border rounded-[4px] py-2 pr-3 pl-9 text-[12px]" type="search" aria-label="Buscar por modelo o patente" placeholder="Buscar por modelo o patente…"
            value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
        </div>
      </div>
      <div className="grid gap-6">
        {resultados.map((publicacion) => <PublicationRow key={publicacion.idPublicacion} publicacion={publicacion} />)}
      </div>
      {resultados.length === 0 && <div className="flex min-h-[300px] flex-col items-center justify-center gap-3.5 p-8 text-center bg-white border border-border rounded-lg">
        <PublicationIcon nombre="carLarge" />
        <h2 className="text-[22px]">{datosDisponibles ? 'No hay publicaciones para mostrar' : 'Tus publicaciones aparecerán acá'}</h2>
        <p className="text-muted text-[12px] leading-[1.7]">{datosDisponibles ? 'Podés crear una publicación o cambiar los filtros.' : 'Desde este espacio vas a administrar tus autos en alquiler.'}</p>
      </div>}
    </main>
  )
}
