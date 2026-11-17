import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles } from '../components/publicaciones/estilosPublicacion'
import IconoPublicacion from '../components/publicaciones/IconoPublicacion'
import FilaPublicacion from '../components/publicaciones/FilaPublicacion'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import PaginacionPublicaciones from '../components/publicaciones/PaginacionPublicaciones'
import { btnBase, btnDark, btnSize } from '../components/ui/estilosBoton'
import { ESTADOS_PUBLICACION } from '../utils/publicaciones'
import { cambiarEstadoPublicacion, fetchMisPublicaciones, limpiarEditor, limpiarErrorGuardado } from '../components/Redux/publicacionesSlice'

// Botones para filtrar por estado: "Todas" + uno por cada estado
const FILTROS = [
  { valor: 'TODAS', etiqueta: 'Todas' },
  ...Object.entries(ESTADOS_PUBLICACION).map(([valor, datos]) => ({ valor, etiqueta: datos.etiqueta })),
]

export default function MisPublicaciones() {
  const dispatch = useDispatch()
  // Página de resultados que devuelve el backend ({ content, totalPages, totalElements })
  const { misPublicaciones: datos, loading, error, guardando: procesando, errorGuardado, incierto } = useSelector((state) => state.publicaciones)
  const vigente = useRef(false)

  useEffect(() => {
    vigente.current = true
    dispatch(limpiarEditor())
    return () => { vigente.current = false }
  }, [dispatch])

  // Filtros de la consulta
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState('TODAS')
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [recargar, setRecargar] = useState(0)

  const token = useSelector((state) => state.users.token)

  // Cada vez que cambia un filtro, la página o "recargar", volvemos a consultar
  useEffect(() => {
    if (!token) return
    dispatch(fetchMisPublicaciones({ pagina, estado, busqueda }))
  }, [dispatch, token, pagina, estado, busqueda, recargar])

  function cambiarFiltro(valor) {
    if (procesando || incierto) return
    if (valor === estado && pagina === 0) return
    setEstado(valor)
    setPagina(0)
  }

  function buscar(event) {
    event.preventDefault()
    if (procesando || incierto) return
    setBusqueda(texto.trim())
    setPagina(0)
    setRecargar((actual) => actual + 1)
  }

  // Pausar y reactivar son PUT a su propia ruta; desactivar es un DELETE
  async function cambiarEstado(publicacion, accion) {
    if (procesando || incierto) return
    if (accion === 'desactivar' && !window.confirm('¿Desactivar esta publicación? No vas a poder reactivarla.')) return
    try {
      const guardada = await dispatch(cambiarEstadoPublicacion({ publicacion, accion })).unwrap()
      if (!vigente.current) return
      if (estado !== 'TODAS' && estado !== guardada.estado) {
        setPagina(Math.min(pagina, Math.max(0, Math.ceil((datos.totalElements - 1) / 10) - 1)))
        setRecargar((actual) => actual + 1)
      }
    } catch {
      // El error se muestra desde el slice.
    }
  }

  function consultarDeNuevo() {
    dispatch(limpiarErrorGuardado())
    setRecargar((actual) => actual + 1)
  }

  function cambiarPagina(nuevaPagina) {
    if (procesando || incierto) return
    setPagina(nuevaPagina)
  }

  // Lo que se muestra debajo de los filtros
  let resultados
  if (error) {
    resultados = <MensajePublicacion error onRetry={consultarDeNuevo}>{error}</MensajePublicacion>
  } else if (loading || !datos) {
    resultados = <MensajePublicacion>Cargando tus publicaciones…</MensajePublicacion>
  } else if (datos.content.length === 0) {
    resultados = (
      <div className="flex min-h-[18.75rem] flex-col items-center justify-center gap-3.5 p-8 text-center bg-white border border-border rounded-lg">
        <IconoPublicacion nombre="carLarge" />
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
            <FilaPublicacion
              key={publicacion.idPublicacion}
              publicacion={publicacion}
              onCambiarEstado={cambiarEstado}
              deshabilitado={procesando || incierto}
            />
          ))}
        </div>
        <PaginacionPublicaciones
          pagina={pagina}
          totalPages={datos.totalPages}
          totalElements={datos.totalElements}
          onChange={cambiarPagina}
          disabled={procesando || incierto}
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
          <IconoPublicacion nombre="plus" /> Publicar nuevo auto
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 my-6 phone:flex-col phone:items-stretch">
        <div role="group" aria-label="Filtrar publicaciones por estado" className="flex flex-wrap gap-1 phone:gap-0">
          {FILTROS.map((filtro) => (
            <button
              key={filtro.valor}
              type="button"
              disabled={procesando || incierto}
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
            <IconoPublicacion nombre="search" className="absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Buscar por marca, modelo o patente"
              placeholder="Marca, modelo o patente…"
              className="w-full bg-white border border-border rounded-[0.25rem] py-2 pr-3 pl-9 text-[0.75rem]"
              value={texto}
              disabled={procesando || incierto}
              onChange={(event) => setTexto(event.target.value)}
            />
          </div>
          <button type="submit" disabled={procesando || incierto} className="border border-border rounded-[0.25rem] px-3 text-[0.75rem]">Buscar</button>
        </form>
      </div>

      {errorGuardado && <MensajePublicacion error>{errorGuardado.message}{incierto ? ' Comprobá el estado antes de volver a guardar.' : ''}</MensajePublicacion>}
      {incierto && (errorGuardado?.tipo === 'guardar' && errorGuardado.idPublicacion
        ? <Link to={`/publicaciones/${errorGuardado.idPublicacion}/editar`} className="text-xs underline">Revisar publicación pendiente</Link>
        : <button type="button" onClick={consultarDeNuevo} className="text-xs underline">Comprobar estado</button>)}
      {procesando && <MensajePublicacion>Guardando estado…</MensajePublicacion>}
      {resultados}
    </main>
  )
}
