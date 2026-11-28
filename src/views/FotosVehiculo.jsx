import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import ZonaSubirFotos from '../components/vehiculos/ZonaSubirFotos'
import MiniaturaFoto from '../components/vehiculos/MiniaturaFoto'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/estilosBoton'
import { pageStyles, titleStyles, eyebrowStyles, introStyles, actionsStyles } from '../components/publicaciones/estilosPublicacion'
import { fetchUser } from '../components/Redux/userSlice'
// CAMBIO: los thunks y acciones del slice
import {
  fetchVehiculo, fetchFotosVehiculo, fetchPublicacionVigente,
  guardarFotosVehiculo, limpiarErrorGuardarFotos, olvidarFotosVehiculo,
} from '../components/Redux/vehiculosSlice'
// CAMBIO: de utils solo quedan las funciones puras (sin fetch)
import { agregarFotos, moverFoto, quitarFoto, validarArchivoFoto } from '../utils/vehiculos'

let contadorNuevas = 0

// CAMBIO: ya no recibe "aviso"; recibe onRecargar sin argumentos
function Fotos({ vehiculo, fotosIniciales, sinPublicacion, desdePublicacion, onRecargar }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // CAMBIO: guardando y el error vienen del store, no de useState
  const { loadingGuardarFotos: guardando, errorGuardarFotos } = useSelector((state) => state.vehiculos)
  // Se trabaja sobre una copia: los cambios recién se guardan con "Guardar fotos".
  const [fotos, setFotos] = useState(fotosIniciales)
  const [problemas, setProblemas] = useState([])
  // URLs de vista previa creadas en esta pantalla: se liberan al salir de ella
  const vistasPrevias = useRef([])
  // Si el alta empezó en Crear publicación, cancelar vuelve a ese formulario con su borrador
  const volver = desdePublicacion
    ? { to: '/publicaciones/nueva', state: { retomarBorrador: true }, texto: 'Volver a crear publicación' }
    : { to: '/mis-vehiculos', texto: 'Volver a mis vehículos' }

  useEffect(() => {
    const urls = vistasPrevias.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function agregar(archivos) {
    if (guardando) return
    const nuevas = []
    const rechazadas = []
    archivos.forEach((archivo) => {
      const motivo = validarArchivoFoto(archivo)
      if (motivo) rechazadas.push(`${archivo.name}: ${motivo}.`)
      else {
        // Se guarda el archivo para poder subirlo después; la url es solo para la vista previa
        const url = URL.createObjectURL(archivo)
        vistasPrevias.current.push(url)
        nuevas.push({ idFoto: `nueva-${++contadorNuevas}`, url, archivo, orden: 0 })
      }
    })
    setProblemas(rechazadas)
    if (nuevas.length > 0) setFotos(agregarFotos(fotos, nuevas))
  }

  function quitar(posicion) {
    if (guardando) return
    const foto = fotos[posicion]
    // Una foto nueva que se quita ya no necesita su vista previa
    if (foto.archivo) URL.revokeObjectURL(foto.url)
    setFotos(quitarFoto(fotos, posicion))
  }

  // CAMBIO: ahora despacha el thunk; unwrap() devuelve el payload o lanza el error
  async function guardar(destino, state) {
    if (guardando) return
    try {
      await dispatch(guardarFotosVehiculo({
        idVehiculo: vehiculo.idVehiculo,
        originales: fotosIniciales,
        actuales: fotos,
      })).unwrap()
      navigate(destino, { state })
    } catch {
      // El mensaje ya quedó en errorGuardarFotos. Pudo quedar una parte guardada: se piden las fotos de nuevo
      onRecargar()
    }
  }

  return (
    <main className={pageStyles + ' pb-20 phone:pb-12'}>
      <div className="max-w-4xl mx-auto">
        <Link aria-disabled={guardando} onClick={(event) => { if (guardando) event.preventDefault() }} to={volver.to} state={volver.state} className={eyebrowStyles + ' inline-block mb-3'}>← {volver.texto}</Link>
        <h1 className={titleStyles}>Fotos del {vehiculo.marca} {vehiculo.modelo}</h1>
        <p className={introStyles}>La primera foto es la portada en el catálogo. Usá las flechas para cambiar el orden.</p>

        {/* CAMBIO: el aviso sale del store */}
        {errorGuardarFotos && (
          <MensajePublicacion error>
            {errorGuardarFotos} Mostramos las fotos tal como quedaron guardadas; revisalas e intentá de nuevo.
          </MensajePublicacion>
        )}

        <fieldset disabled={guardando} className="contents">
        <div className="mt-8">
          <ZonaSubirFotos onArchivos={agregar} />
        </div>

        {problemas.length > 0 && (
          <ul role="alert" className="grid gap-1 mt-4 p-0 list-none text-xs text-error">
            {problemas.map((problema) => <li key={problema}>{problema}</li>)}
          </ul>
        )}

        <h2 className="mt-8 text-[1.125rem]">Fotos cargadas ({fotos.length})</h2>
        {fotos.length > 0
          ? <ul className="grid grid-cols-3 gap-4 mt-4 p-0 list-none phone:grid-cols-1 tablet:grid-cols-2">
              {fotos.map((foto, indice) => (
                <MiniaturaFoto
                  key={foto.idFoto}
                  foto={foto}
                  indice={indice}
                  total={fotos.length}
                  onMover={(posicion, desplazamiento) => { if (!guardando) setFotos(moverFoto(fotos, posicion, desplazamiento)) }}
                  onQuitar={quitar}
                />
              ))}
            </ul>
          : <p className="mt-4 p-6 text-center text-[0.75rem] leading-[1.7] text-muted bg-white border border-border rounded-lg">
              Todavía no hay fotos. Sumá al menos una: los vehículos sin foto no se pueden publicar.
            </p>}

        <div className={actionsStyles + ' justify-end mt-8'}>
          <Link aria-disabled={guardando} onClick={(event) => { if (guardando) event.preventDefault() }} to={volver.to} state={volver.state} className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Cancelar</Link>
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
              onClick={() => guardar('/publicaciones/nueva', { idVehiculo: vehiculo.idVehiculo, retomarBorrador: desdePublicacion })}
              className={btnBase + ' ' + btnDark + ' ' + btnSize + ' disabled:opacity-50 disabled:cursor-not-allowed'}
            >
              Guardar y crear publicación
            </button>
          )}
        </div>
        </fieldset>
      </div>
    </main>
  )
}

export default function FotosVehiculo() {
  const { id } = useParams()
  return <VehiclePhotosLoader key={id} id={id} />
}

function VehiclePhotosLoader({ id }) {
  const desdePublicacion = useLocation().state?.desdePublicacion === true
  const dispatch = useDispatch()
  const { token, user: usuario, error: errorUsuario } = useSelector((state) => state.users)
  // CAMBIO: todo lo que antes eran useState (datos, errorCarga, version) ahora se lee del store
  const {
    vehiculoActual, errorVehiculo, fotosPorVehiculo,
    publicacionVigente, loadingPublicacionVigente, errorPublicacionVigente,
  } = useSelector((state) => state.vehiculos)
  const idUsuario = usuario?.idUsuario

  const vehiculo = String(vehiculoActual?.idVehiculo) === String(id) ? vehiculoActual : null
  const entradaFotos = fotosPorVehiculo[id]
  // El back rechaza cambios de otro usuario; acá además se evita mostrarle la pantalla
  const noEsTuyo = Boolean(vehiculo && idUsuario && vehiculo.idUsuario !== idUsuario)

  // El usuario logueado se usa para comprobar que el vehículo sea suyo
  useEffect(() => {
    if (!usuario?.idUsuario) dispatch(fetchUser())
  }, [usuario, dispatch])

  // Un error de un guardado anterior no se muestra al entrar a la pantalla
  useEffect(() => {
    dispatch(limpiarErrorGuardarFotos())
  }, [dispatch, id])

  // CAMBIO: los tres pedidos son thunks; fetchFotosVehiculo no repite el GET si las fotos ya están en el store
  useEffect(() => {
    if (!token || !idUsuario) return
    dispatch(fetchVehiculo(id))
    dispatch(fetchFotosVehiculo(id))
    dispatch(fetchPublicacionVigente(id))
  }, [dispatch, token, idUsuario, id])

  // CAMBIO: tras un guardado fallido se descartan las fotos del store y se vuelven a pedir.
  // Mientras llegan se muestra "Cargando fotos…", y al volver Fotos se arma de cero con lo que quedó guardado
  function recargarFotos() {
    dispatch(olvidarFotosVehiculo(id))
    dispatch(fetchFotosVehiculo(id))
  }

  // Si no se pudo traer algo de lo necesario, se muestra el error del slice
  const errorPrevio = !usuario?.idUsuario ? errorUsuario : null
  const errorCarga = errorVehiculo || errorPublicacionVigente || entradaFotos?.error || (noEsTuyo && 'Este vehículo no es tuyo') || null
  if (errorCarga || errorPrevio) {
    return (
      <main className={pageStyles + ' pb-20'}>
        <h1 className={titleStyles}>{errorCarga || errorPrevio}</h1>
        <Link to="/mis-vehiculos" className="inline-block mt-5 text-gold">Volver a mis vehículos</Link>
      </main>
    )
  }

  if (!idUsuario || !vehiculo || !entradaFotos?.fotos || loadingPublicacionVigente) {
    return <main className={pageStyles + ' pb-20'}><MensajePublicacion>Cargando fotos…</MensajePublicacion></main>
  }

  return (
    <Fotos
      vehiculo={vehiculo}
      fotosIniciales={entradaFotos.fotos}
      sinPublicacion={!publicacionVigente}
      desdePublicacion={desdePublicacion}
      onRecargar={recargarFotos}
    />
  )
}