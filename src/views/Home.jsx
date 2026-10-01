import { useState } from 'react'
import CategoryFilter from '../components/home/CategoryFilter'
import Hero from '../components/home/Hero'
import SearchBar from '../components/home/SearchBar'
import SortSelect from '../components/home/SortSelect'
import VehicleGrid from '../components/home/VehicleGrid'
import { RotateCcwIcon } from '../components/icons/Icons'
import { TIPOS, VEHICULOS } from '../data/vehiculos'
import { precioFinal } from '../utils/formatters'
import './Home.css'

const sorters = {
  recommended: (a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion),
  'price-asc': (a, b) => precioFinal(a) - precioFinal(b),
  'price-desc': (a, b) => precioFinal(b) - precioFinal(a),
  'year-desc': (a, b) => b.anio - a.anio,
}

const zonas = [...new Set(VEHICULOS.map((v) => v.zona))].sort()

export default function Home() {
  const [zona, setZona] = useState('all')
  const [tipoId, setTipoId] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [fechaRetiro, setFechaRetiro] = useState('')
  const [fechaDevolucion, setFechaDevolucion] = useState('')

  const vehiculos = VEHICULOS.filter((v) => zona === 'all' || v.zona === zona)
    .filter((v) => tipoId === 'all' || v.idTipoVehiculo === Number(tipoId))
    .sort(sorters[sortBy])

  const hayFiltros = zona !== 'all' || tipoId !== 'all' || sortBy !== 'recommended'

  const resetFiltros = () => {
    setZona('all')
    setTipoId('all')
    setSortBy('recommended')
  }

  const scrollToFleet = () => {
    document.getElementById('fleet-results')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="home">
      <Hero />

      <SearchBar
        zonas={zonas}
        zona={zona}
        onZonaChange={setZona}
        fechaRetiro={fechaRetiro}
        fechaDevolucion={fechaDevolucion}
        onFechaRetiroChange={setFechaRetiro}
        onFechaDevolucionChange={setFechaDevolucion}
        onSearch={scrollToFleet}
      />

      <section id="fleet-results" className="fleet">
        <div className="fleet__toolbar">
          <CategoryFilter tipos={TIPOS} tipoId={tipoId} onChange={setTipoId} />
          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>

        <div className="fleet__summary">
          <span>
            Mostrando <strong>{vehiculos.length}</strong> unidades disponibles bajo estándares de
            certificación
          </span>

          {hayFiltros && (
            <button type="button" className="fleet__reset" onClick={resetFiltros}>
              <RotateCcwIcon size={12} />
              Restablecer filtros
            </button>
          )}
        </div>

        {vehiculos.length === 0 ? (
          <p className="fleet__status">No se encontraron vehículos para esta selección.</p>
        ) : (
          <VehicleGrid items={vehiculos} />
        )}
      </section>
    </main>
  )
}
