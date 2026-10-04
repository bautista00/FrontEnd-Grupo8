import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicationIcon from '../components/publicaciones/PublicationIcon'
import PublicationRow from '../components/publicaciones/PublicationRow'
import { btnBase, btnDark, btnSize } from '../components/ui/buttonStyles'
import { ESTADOS_PUBLICACION } from '../utils/publicaciones'
import './publicaciones.css'

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
    <main className="publications-page">
      <div className="publications-heading">
        <div>
          <p className="publication-eyebrow">Panel de propietario · Gestión de vehículos</p>
          <h1>Mis publicaciones</h1>
          <p className="publication-intro">Administrá tus autos en alquiler: precio, días disponibles y si aparecen en el catálogo.</p>
        </div>
        <Link to="/publicaciones/nueva" className={btnBase + ' ' + btnDark + ' ' + btnSize}>
          <PublicationIcon nombre="plus" /> Publicar nuevo auto
        </Link>
      </div>
      <div className="publications-filters">
        <div role="group" aria-label="Filtrar publicaciones por estado" className="publication-tabs">
          {filtros.map((filtro) => {
            const cantidad = datosDisponibles
              ? publicaciones.filter((item) => filtro.valor === 'TODAS' || item.estado === filtro.valor).length
              : null
            return <button key={filtro.valor} type="button" aria-pressed={estado === filtro.valor}
              onClick={() => setEstado(filtro.valor)} className={estado === filtro.valor ? 'selected' : ''}>
              {filtro.etiqueta}{cantidad !== null && ' (' + cantidad + ')'}
            </button>
          })}
        </div>
        <div className="publication-search">
          <PublicationIcon nombre="search" />
          <input type="search" aria-label="Buscar por modelo o patente" placeholder="Buscar por modelo o patente…"
            value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
        </div>
      </div>
      <div className="publication-list">
        {resultados.map((publicacion) => <PublicationRow key={publicacion.idPublicacion} publicacion={publicacion} />)}
      </div>
      {resultados.length === 0 && <div className="publication-empty">
        <PublicationIcon nombre="carLarge" />
        <h2>{datosDisponibles ? 'No hay publicaciones para mostrar' : 'Tus publicaciones aparecerán acá'}</h2>
        <p>{datosDisponibles ? 'Podés crear una publicación o cambiar los filtros.' : 'Desde este espacio vas a administrar tus autos en alquiler.'}</p>
      </div>}
    </main>
  )
}
