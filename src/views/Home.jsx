import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FiltroCategoria from '../components/home/FiltroCategoria'
import Hero from '../components/home/Hero'
import BarraBusqueda from '../components/home/BarraBusqueda'
import SelectorOrden from '../components/home/SelectorOrden'
import GrillaVehiculos from '../components/home/GrillaVehiculos'
import { RotateCcwIcon } from '../components/iconos/Iconos'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import PaginacionPublicaciones from '../components/publicaciones/PaginacionPublicaciones'
import { PUBLICACIONES_POR_PAGINA } from '../utils/catalogo'
import { fetchTiposVehiculo } from '../components/Redux/vehiculosSlice'
import { buscarPublicaciones, fetchZonas } from '../components/Redux/publicacionesSlice'

export default function Home() {
  // Zonas y tipos de vehículo para los filtros, y la búsqueda del catálogo, desde el store de Redux
  const dispatch = useDispatch()
  const { zonas, loadingZonas, errorZonas, busqueda: catalogo, loadingBusqueda, errorBusqueda, consultaBusqueda } =
    useSelector((state) => state.publicaciones)
  const { tiposVehiculo: tipos, loadingTipos, errorTipos } = useSelector((state) => state.vehiculos)

  const [zona, setZona] = useState('all')
  const [tipoId, setTipoId] = useState('all')
  const [sortBy, setSortBy] = useState('recientes')
  const [fechaRetiro, setFechaRetiro] = useState('')
  const [fechaDevolucion, setFechaDevolucion] = useState('')
  const [pagina, setPagina] = useState(0)
  const [recargar, setRecargar] = useState(0)

  // Pide las zonas y los tipos de vehículo para los filtros
  useEffect(() => {
    dispatch(fetchZonas())
    dispatch(fetchTiposVehiculo())
  }, [dispatch])

  // El backend filtra, ordena y pagina sobre todas las publicaciones activas.
  // Las fechas solo se mandan cuando están elegidas las dos.
  const parametros = new URLSearchParams({ orden: sortBy, page: pagina, size: PUBLICACIONES_POR_PAGINA })
  if (zona !== 'all') parametros.set('zona', zona)
  if (tipoId !== 'all') parametros.set('idTipoVehiculo', tipoId)
  if (fechaRetiro && fechaDevolucion) {
    parametros.set('fechaInicio', fechaRetiro)
    parametros.set('fechaFin', fechaDevolucion)
  }
  const consulta = parametros.toString()

  //En este caso useEffect hace una petición a la API para obtener las publicaciones que 
  //coinciden con los filtros seleccionados por el usuario.
  // El slice ignora las respuestas de consultas anteriores que lleguen tarde.
  useEffect(() => {
    dispatch(buscarPublicaciones(consulta))
  }, [dispatch, consulta, recargar])

  // Mientras llega la consulta nueva se siguen mostrando los resultados anteriores
  const actualizando = catalogo !== null && (loadingBusqueda || consultaBusqueda !== consulta)
  const errorCatalogo = consultaBusqueda === consulta ? errorBusqueda : null

  // Cada filtro nuevo vuelve a la primera página
  const filtrar = (actualizar) => (valor) => {
    actualizar(valor)
    setPagina(0)
  }

  const hayFiltros = zona !== 'all' || tipoId !== 'all' || sortBy !== 'recientes' || fechaRetiro !== '' || fechaDevolucion !== ''

  const resetFiltros = () => {
    setZona('all')
    setTipoId('all')
    setSortBy('recientes')
    setFechaRetiro('')
    setFechaDevolucion('')
    setPagina(0)
  }

  const scrollToFleet = () => {
    document.getElementById('fleet-results')?.scrollIntoView({ behavior: 'smooth' })
  }

  const cambiarPagina = (nueva) => {
    setPagina(nueva)
    scrollToFleet()
  }

  return (
    <main className="flex-1 w-full max-w-page mx-auto px-(--gutter) pt-10 pb-14 lg:pt-14">
      <Hero />

      <BarraBusqueda
        zonas={zonas}
        zona={zona}
        onZonaChange={filtrar(setZona)}
        fechaRetiro={fechaRetiro}
        fechaDevolucion={fechaDevolucion}
        onFechaRetiroChange={filtrar(setFechaRetiro)}
        onFechaDevolucionChange={filtrar(setFechaDevolucion)}
        onSearch={scrollToFleet}
      />

      <section id="fleet-results">
        {(loadingZonas || loadingTipos) && <MensajePublicacion>Cargando filtros…</MensajePublicacion>}
        {errorZonas && <MensajePublicacion error>{errorZonas}</MensajePublicacion>}
        {errorTipos && <MensajePublicacion error>{errorTipos}</MensajePublicacion>}

        <div className="flex flex-col items-stretch gap-4 mb-5 min-[56.25rem]:flex-row min-[56.25rem]:items-center min-[56.25rem]:justify-between">
          <FiltroCategoria tipos={tipos} tipoId={tipoId} onChange={filtrar(setTipoId)} />
          <SelectorOrden value={sortBy} onChange={filtrar(setSortBy)} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 text-[0.75rem] text-muted">
          <span>
            Mostrando <strong className="text-ink">{catalogo?.totalElements ?? 0}</strong> unidades disponibles bajo estándares de
            certificación
          </span>

          {hayFiltros && (
            <button
              type="button"
              className="inline-flex items-center gap-1 p-0 bg-transparent border-0 text-[0.75rem] text-inherit transition-[color] hover:text-ink"
              onClick={resetFiltros}
            >
              <RotateCcwIcon size={12} />
              Restablecer filtros
            </button>
          )}
        </div>

        {errorCatalogo ? (
          <MensajePublicacion error onRetry={() => setRecargar(recargar + 1)}>{errorCatalogo}</MensajePublicacion>
        ) : !catalogo ? (
          <MensajePublicacion>Cargando vehículos…</MensajePublicacion>
        ) : catalogo.content.length === 0 && !actualizando ? (
          <p className="py-12 text-center text-[0.875rem] text-muted">No se encontraron vehículos para esta selección.</p>
        ) : (
          <div aria-busy={actualizando} className={actualizando ? 'opacity-60 transition-opacity' : undefined}>
            <GrillaVehiculos items={catalogo.content} />
            <PaginacionPublicaciones
              pagina={catalogo.number}
              totalPages={catalogo.totalPages}
              totalElements={catalogo.totalElements}
              onChange={cambiarPagina}
              disabled={actualizando}
            />
          </div>
        )}
      </section>
    </main>
  )
}
