import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PhotoDropzone from '../components/vehiculos/PhotoDropzone'
import PhotoTile from '../components/vehiculos/PhotoTile'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import { olvidarPortada } from '../components/publicaciones/PublicationPhoto'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/buttonStyles'
import { pageStyles, titleStyles, eyebrowStyles, introStyles, actionsStyles } from '../components/publicaciones/publicationStyles'
import { obtener } from '../utils/api'
import {
  agregarFotos, fotosDeVehiculo, moverFoto, publicacionActualDe,
  quitarFoto, sincronizarFotos, validarArchivoFoto,
} from '../utils/vehiculos'

let contadorNuevas = 0

function Fotos({ vehiculo, fotosIniciales, sinPublicacion, aviso, onRecargar }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('jwtToken')
  // Se trabaja sobre una copia: los cambios recién se guardan con "Guardar fotos".
  const [fotos, setFotos] = useState(fotosIniciales)
  const [problemas, setProblemas] = useState([])
  const [guardando, setGuardando] = useState(false)

  function agregar(archivos) {
    const nuevas = []
    const rechazadas = []
    archivos.forEach((archivo) => {
      const motivo = validarArchivoFoto(archivo)
      if (motivo) rechazadas.push(`${archivo.name}: ${motivo}.`)
      // Se guarda el archivo para poder subirlo después; la url es solo para la vista previa
      else nuevas.push({ idFoto: `nueva-${++contadorNuevas}`, url: URL.createObjectURL(archivo), archivo, orden: 0 })
    })
    setProblemas(rechazadas)
    if (nuevas.length > 0) setFotos(agregarFotos(fotos, nuevas))
  }

  async function guardar(destino, state) {
    setGuardando(true)
    try {
      await sincronizarFotos(token, vehiculo.idVehiculo, fotosIniciales, fotos)
      olvidarPortada(vehiculo.idVehiculo)
      navigate(destino, { state })
    } catch (e) {
      console.error('Error al guardar fotos', e)
      setGuardando(false)
      // Pudo quedar algo a medias: se vuelve a pedir lo que realmente está guardado
      onRecargar(`${e.message} Mostramos las fotos tal como quedaron guardadas; revisalas e intentá de nuevo.`)
    }
  }

  return (
    <main className={pageStyles + ' pb-20 phone:pb-12'}>
      <div className="max-w-4xl mx-auto">
        <Link to="/mis-vehiculos" className={eyebrowStyles + ' inline-block mb-3'}>← Volver a mis vehículos</Link>
        <h1 className={titleStyles}>Fotos del {vehiculo.marca} {vehiculo.modelo}</h1>
        <p className={introStyles}>La primera foto es la portada en el catálogo. Usá las flechas para cambiar el orden.</p>

        {aviso && <PublicationMessage error>{aviso}</PublicationMessage>}

        <div className="mt-8">
          <PhotoDropzone onArchivos={agregar} />
        </div>

        {problemas.length > 0 && (
          <ul role="alert" className="grid gap-1 mt-4 p-0 list-none text-xs text-error">
            {problemas.map((problema) => <li key={problema}>{problema}</li>)}
          </ul>
        )}

        <h2 className="mt-8 text-[18px]">Fotos cargadas ({fotos.length})</h2>
        {fotos.length > 0
          ? <ul className="grid grid-cols-3 gap-4 mt-4 p-0 list-none phone:grid-cols-1 tablet:grid-cols-2">
              {fotos.map((foto, indice) => (
                <PhotoTile
                  key={foto.idFoto}
                  foto={foto}
                  indice={indice}
                  total={fotos.length}
                  onMover={(posicion, desplazamiento) => setFotos(moverFoto(fotos, posicion, desplazamiento))}
                  onQuitar={(posicion) => setFotos(quitarFoto(fotos, posicion))}
                />
              ))}
            </ul>
          : <p className="mt-4 p-6 text-center text-[12px] leading-[1.7] text-muted bg-white border border-border rounded-lg">
              Todavía no hay fotos. Sumá al menos una: los vehículos sin foto no se pueden publicar.
            </p>}

        <div className={actionsStyles + ' justify-end mt-8'}>
          <Link to="/mis-vehiculos" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Cancelar</Link>
          <button
            type="button"
            disabled={guardando}
            onClick={() => guardar('/mis-vehiculos')}
            className={btnBase + ' ' + (sinPublicacion ? btnOutline : btnDark) + ' ' + btnSize}
          >
            {guardando ? 'Guardando…' : 'Guardar fotos'}
          </button>
          {sinPublicacion && (
            <button
              type="button"
              disabled={guardando || fotos.length === 0}
              title={fotos.length === 0 ? 'Cargá al menos una foto para poder publicar' : undefined}
              onClick={() => guardar('/publicaciones/nueva', { idVehiculo: vehiculo.idVehiculo })}
              className={btnBase + ' ' + btnDark + ' ' + btnSize + ' disabled:opacity-50 disabled:cursor-not-allowed'}
            >
              Guardar y crear publicación
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

export default function VehiclePhotos() {
  const { id } = useParams()
  const token = localStorage.getItem('jwtToken')
  const [datos, setDatos] = useState(null)
  const [errorCarga, setErrorCarga] = useState(false)
  const [aviso, setAviso] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!token) return
    let vigente = true
    Promise.all([obtener(`/vehiculo/${id}`), fotosDeVehiculo(id), publicacionActualDe(token, id)])
      .then(([vehiculo, fotos, publicacion]) => {
        if (!vigente) return
        setDatos({ vehiculo, fotos, sinPublicacion: !publicacion, clave: version })
        setErrorCarga(false)
      })
      .catch((e) => {
        console.error('Error al cargar fotos', e)
        if (vigente) setErrorCarga(true)
      })
    return () => { vigente = false }
  }, [id, token, version])

  if (!token) {
    return <main className={pageStyles + ' pb-20'}><PublicationMessage>Iniciá sesión para administrar tus vehículos.</PublicationMessage></main>
  }

  if (errorCarga) {
    return (
      <main className={pageStyles + ' pb-20'}>
        <h1 className={titleStyles}>No pudimos cargar el vehículo</h1>
        <Link to="/mis-vehiculos" className="inline-block mt-5 text-gold">Volver a mis vehículos</Link>
      </main>
    )
  }

  if (!datos) {
    return <main className={pageStyles + ' pb-20'}><PublicationMessage>Cargando fotos…</PublicationMessage></main>
  }

  return (
    <Fotos
      // La key nueva arma la pantalla de cero con lo que devolvió el backend
      key={`${datos.vehiculo.idVehiculo}-${datos.clave}`}
      vehiculo={datos.vehiculo}
      fotosIniciales={datos.fotos}
      sinPublicacion={datos.sinPublicacion}
      aviso={aviso}
      onRecargar={(mensaje) => { setAviso(mensaje); setVersion(version + 1) }}
    />
  )
}