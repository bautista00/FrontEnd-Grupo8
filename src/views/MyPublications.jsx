import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/publicationStyles'
import PublicationIcon from '../components/publicaciones/PublicationIcon'
import PublicationRow from '../components/publicaciones/PublicationRow'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import PublicationPagination from '../components/publicaciones/PublicationPagination'
import { btnBase, btnDark, btnSize } from '../components/ui/buttonStyles'
import { ESTADOS_PUBLICACION } from '../utils/publicaciones'
import { API_URL } from '../utils/api'

// Botones para filtrar por estado: "Todas" + uno por cada estado
const FILTROS = [
  { valor: 'TODAS', etiqueta: 'Todas' },
  ...Object.entries(ESTADOS_PUBLICACION).map(([valor, datos]) => ({ valor, etiqueta: datos.etiqueta })),
]

export default function MyPublications() {
  // Página de resultados que devuelve el backend ({ content, totalPages, totalElements })
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  // Filtros de la consulta
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState('TODAS')
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Se incrementa para volver a pedir la lista (por ejemplo, después de pausar una publicación)
  const [recargar, setRecargar] = useState(0)
  const [procesando, setProcesando] = useState(false)

  const token = localStorage.getItem('jwtToken')

  // Cada vez que cambia un filtro, la página o "recargar", volvemos a consultar
  useEffect(() => {
    if (!token) return

    const parametros = new URLSearchParams({ page: pagina, size: 10 })
    if (estado !== 'TODAS') parametros.set('estado', estado)
    if (busqueda) parametros.set('busqueda', busqueda)

    fetch(`${API_URL}/publicaciones/mias?${parametros}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudieron cargar tus publicaciones')
        return respuesta.json()
      })
      .then((resultado) => {
        setDatos(resultado)
        setError('')
      })
      .catch((error) => {
        console.error('Error al cargar', error)
        setError('No se pudieron cargar tus publicaciones. Intentá nuevamente.')
      })
  }, [token, pagina, estado, busqueda, recargar])

  function cambiarFiltro(valor) {
    setEstado(valor)
    setPagina(0)
  }

  function buscar(event) {
    event.preventDefault()
    setBusqueda(texto.trim())
    setPagina(0)
  }

  // Pausar y reactivar son PUT a su propia ruta; desactivar es un DELETE
  function cambiarEstado(publicacion, accion) {
    if (accion === 'desactivar' && !window.confirm('¿Desactivar esta publicación? No vas a poder reactivarla.')) return

    const ruta = accion === 'desactivar' ? '' : `/${accion}`
    const metodo = accion === 'desactivar' ? 'DELETE' : 'PUT'

    setProcesando(true)
    setAviso('')
    fetch(`${API_URL}/publicaciones/${publicacion.idPublicacion}${ruta}`, {
      method: metodo,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudo cambiar el estado')
        // Volvemos a pedir la lista para ver el estado nuevo
        setRecargar(recargar + 1)
      })
      .catch((error) => {
        console.error('Error al cambiar el estado', error)
        setAviso('No se pudo cambiar el estado de la publicación. Intentá nuevamente.')
      })
      .finally(() => setProcesando(false))
  }

  // Lo que se muestra debajo de los filtros
  let resultados
  if (error) {
    resultados = <PublicationMessage error onRetry={() => setRecargar(recargar + 1)}>{error}</PublicationMessage>
  } else if (!datos) {
    resultados = <PublicationMessage>Cargando tus publicaciones…</PublicationMessage>
  } else if (datos.content.length === 0) {
    resultados = (
      <div className="flex min-h-[18.75rem] flex-col items-center justify-center gap-3.5 p-8 text-center bg-white border border-border rounded-lg">
        <PublicationIcon nombre="carLarge" />
        <h2 className="text-[1.375rem]">
          {busqueda || estado !== 'TODAS' ? 'No hay publicaciones con esos filtros' : 'Todavía no tenés publicaciones'}
        </h2>
        <p className="text-muted text-[0.75rem] leading-[1.7]">Podés crear una publicación o cambiar los filtros.</p>
      </div>
    )
  } else {
    resultados = (
      <>
        <p className="mb-4 text-[0.75rem] text-muted">{datos.totalElements} publicaciones encontradas</p>
        <div className="grid gap-6">
          {datos.content.map((publicacion) => (
            <PublicationRow
              key={publicacion.idPublicacion}
              publicacion={publicacion}
              onCambiarEstado={cambiarEstado}
              deshabilitado={procesando}
            />
          ))}
        </div>
        <PublicationPagination
          pagina={pagina}
          totalPages={datos.totalPages}
          totalElements={datos.totalElements}
          onChange={setPagina}
        />
      </>
    )
  }

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
          {FILTROS.map((filtro) => (
            <button
              key={filtro.valor}
              type="button"
              aria-pressed={estado === filtro.valor}
              onClick={() => cambiarFiltro(filtro.valor)}
              className={'border-0 rounded-[0.375rem] px-3.5 py-1.5 text-[0.75rem] phone:px-[0.5625rem] '
                + (estado === filtro.valor ? 'bg-ink text-white' : 'bg-transparent text-soft')}
            >
              {filtro.etiqueta}
            </button>
          ))}
        </div>
        <form onSubmit={buscar} className="flex gap-2 w-80 max-w-full phone:w-full" role="search">
          <div className="relative flex-1 min-w-0">
            <PublicationIcon nombre="search" className="absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Buscar por marca, modelo o patente"
              placeholder="Marca, modelo o patente…"
              className="w-full bg-white border border-border rounded-[0.25rem] py-2 pr-3 pl-9 text-[0.75rem]"
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
            />
          </div>
          <button type="submit" className="border border-border rounded-[0.25rem] px-3 text-[0.75rem]">Buscar</button>
        </form>
      </div>

      {aviso && <PublicationMessage error>{aviso}</PublicationMessage>}
      {resultados}
    </main>
  )
}
