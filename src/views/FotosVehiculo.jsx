import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import ZonaSubirFotos from '../components/vehiculos/ZonaSubirFotos'
import MiniaturaFoto from '../components/vehiculos/MiniaturaFoto'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import { olvidarPortada } from '../components/publicaciones/FotoPublicacion'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/estilosBoton'
import { pageStyles, titleStyles, eyebrowStyles, introStyles, actionsStyles } from '../components/publicaciones/estilosPublicacion'
import { fetchUser } from '../components/Redux/userSlice'
import { fetchVehiculo } from '../components/Redux/vehiculosSlice'
import {
  agregarFotos, fotosDeVehiculo, moverFoto, publicacionActualDe,
  quitarFoto, sincronizarFotos, validarArchivoFoto,
} from '../utils/vehiculos'

let contadorNuevas = 0

function Fotos({ vehiculo, fotosIniciales, sinPublicacion, desdePublicacion, aviso, onRecargar }) {
  const navigate = useNavigate()
  const token = useSelector((state) => state.users.token)
  // Se trabaja sobre una copia: los cambios recién se guardan con "Guardar fotos".
  const [fotos, setFotos] = useState(fotosIniciales)
  const [problemas, setProblemas] = useState([])
  const [datosParaGuardar, setDatosParaGuardar] = useState(null)
  const guardando = datosParaGuardar !== null
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

  function guardar(destino, state) {
    if (guardando) return
    setDatosParaGuardar({
      token, idVehiculo: vehiculo.idVehiculo, originales: fotosIniciales.map((foto) => ({ ...foto })),
      actuales: fotos.map((foto) => ({ ...foto })), destino, state, onRecargar,
    })
  }

  useEffect(() => {
    if (!datosParaGuardar) return
    let vigente = true
    const { token: tokenEnvio, idVehiculo, originales, actuales, destino, state, onRecargar } = datosParaGuardar
    sincronizarFotos(tokenEnvio, idVehiculo, originales, actuales)
      .then(() => {
        if (!vigente) return
        olvidarPortada(idVehiculo)
        setDatosParaGuardar(null)
        navigate(destino, { state })
      })
      .catch((error) => {
        if (!vigente) return
        // pudo quedar una parte guardada
        onRecargar(error.message + ' Mostramos las fotos tal como quedaron guardadas; revisalas e intentá de nuevo.')
      })
    return () => { vigente = false }
  }, [datosParaGuardar, navigate])

  return (
    <main className={pageStyles + ' pb-20 phone:pb-12'}>
      <div className="max-w-4xl mx-auto">
        <Link aria-disabled={guardando} onClick={(event) => { if (guardando) event.preventDefault() }} to={volver.to} state={volver.state} className={eyebrowStyles + ' inline-block mb-3'}>← {volver.texto}</Link>
        <h1 className={titleStyles}>Fotos del {vehiculo.marca} {vehiculo.modelo}</h1>
        <p className={introStyles}>La primera foto es la portada en el catálogo. Usá las flechas para cambiar el orden.</p>

        {aviso && <MensajePublicacion error>{aviso}</MensajePublicacion>}

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
  const idUsuario = usuario?.idUsuario
  const [datos, setDatos] = useState(null)
  const [errorCarga, setErrorCarga] = useState('')
  const [aviso, setAviso] = useState('')
  const [version, setVersion] = useState(0)

  // El usuario logueado se usa para comprobar que el vehículo sea suyo
  useEffect(() => {
    if (!usuario?.idUsuario) dispatch(fetchUser())
  }, [usuario, dispatch])

  useEffect(() => {
    if (!token || !idUsuario) return
    let vigente = true
    Promise.all([
      dispatch(fetchVehiculo(id)).unwrap(),
      fotosDeVehiculo(id),
      publicacionActualDe(token, id),
    ])
      .then(([vehiculo, fotos, publicacion]) => {
        if (!vigente) return
        // El backend rechaza cambios de otro usuario; acá además se evita mostrarle la pantalla
        if (vehiculo.idUsuario !== idUsuario) {
          setErrorCarga('Este vehículo no es tuyo')
          return
        }
        setDatos({ vehiculo, fotos, sinPublicacion: !publicacion, clave: version })
        setErrorCarga('')
      })
      .catch((e) => {
        console.error('Error al cargar fotos', e)
        // Muestra el mensaje del backend; si no hubo respuesta (TypeError de fetch), uno propio
        if (vigente) setErrorCarga(e instanceof TypeError ? 'No pudimos cargar el vehículo' : e.message)
      })
    return () => { vigente = false }
  }, [id, token, version, idUsuario])

  // Si no se pudo traer el usuario, se muestra el error del slice
  const errorPrevio = !usuario?.idUsuario ? errorUsuario : null
  if (errorCarga || errorPrevio) {
    return (
      <main className={pageStyles + ' pb-20'}>
        <h1 className={titleStyles}>{errorCarga || errorPrevio}</h1>
        <Link to="/mis-vehiculos" className="inline-block mt-5 text-gold">Volver a mis vehículos</Link>
      </main>
    )
  }

  if (!datos) {
    return <main className={pageStyles + ' pb-20'}><MensajePublicacion>Cargando fotos…</MensajePublicacion></main>
  }

  return (
    <Fotos
      // La key nueva arma la pantalla de cero con lo que devolvió el backend
      key={`${datos.vehiculo.idVehiculo}-${datos.clave}`}
      vehiculo={datos.vehiculo}
      fotosIniciales={datos.fotos}
      sinPublicacion={datos.sinPublicacion}
      desdePublicacion={desdePublicacion}
      aviso={aviso}
      onRecargar={(mensaje) => { setDatos(null); setAviso(mensaje); setVersion((actual) => actual + 1) }}
    />
  )
}