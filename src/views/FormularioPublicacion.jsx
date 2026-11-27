import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import ConfirmarAccion from '../components/ui/ConfirmarAccion'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles, descriptionStyles, actionsStyles, textButtonStyles, smallButtonStyles } from '../components/publicaciones/estilosPublicacion'
import CampoFormulario, { inputStyles } from '../components/ui/CampoFormulario'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/estilosBoton'
import IconoPublicacion from '../components/publicaciones/IconoPublicacion'
import SeccionPublicacion from '../components/publicaciones/SeccionPublicacion'
import VehiculoPublicacion from '../components/publicaciones/VehiculoPublicacion'
import UbicacionPublicacion from '../components/publicaciones/UbicacionPublicacion'
import PrecioPublicacion from '../components/publicaciones/PrecioPublicacion'
import DisponibilidadPublicacion from '../components/publicaciones/DisponibilidadPublicacion'
import VistaPreviaPublicacion from '../components/publicaciones/VistaPreviaPublicacion'
import BarraCambiosPendientes from '../components/publicaciones/BarraCambiosPendientes'
import MensajePublicacion from '../components/publicaciones/MensajePublicacion'
import { tieneCoordenadas } from '../components/publicaciones/ubicacion'
import { valoresIniciales, datosUbicacion, completarIds, cambiaronDatos, cambiaronPeriodos, validarFormulario } from '../components/publicaciones/datosFormularioPublicacion'
import {
  abrirEditor, bloquearGuardado, cambiarEstadoPublicacion, descartarBorradorAlta, fetchEdicionPublicacion, guardarBorradorAlta,
  guardarCambiosPublicacion, limpiarErrorGuardado,
} from '../components/Redux/publicacionesSlice'
import { elegirVehiculoPublicacion, fetchVehiculoParaPublicar } from '../components/Redux/vehiculosSlice'
import { fetchUser } from '../components/Redux/userSlice'

export default function FormularioPublicacion(props) {
  const { id } = useParams()
  const token = useSelector((state) => state.users.token)
  return <PublicationEditor key={`${token}:${props.modo === 'editar' ? id : 'nueva'}`} {...props} id={id} />
}

function PublicationEditor({ modo = 'crear', id }) {
  const navigate = useNavigate()
  const location = useLocation()
  const editando = modo === 'editar'
  const dispatch = useDispatch()
  const { token, user: usuario, error: errorUsuario } = useSelector((state) => state.users)
  const idUsuario = usuario?.idUsuario

  const {
    edicion, editorActual, loadingEdicion: cargandoEditor, errorEdicion: errorEditor,
    guardando, errorGuardado, incierto, borradorAlta,
  } = useSelector((state) => state.publicaciones)
  const { vehiculoElegido, loadingElegido, errorElegido } = useSelector((state) => state.vehiculos)
  const [regreso] = useState(location.state)
  const [claveEditor] = useState(location.key)
  const [usarGuardada] = useState(() => editando && regreso?.usarGuardada
    && String(edicion?.idPublicacion) === String(id))
  const esEditorActual = editorActual === claveEditor
  const publicacion = (esEditorActual || (usarGuardada && String(edicion?.idPublicacion) === String(id)))
    ? edicion : null
  const cargando = esEditorActual && cargandoEditor
  const errorCarga = esEditorActual ? errorEditor : null
  const [valores, setValores] = useState(() => {
    if (usarGuardada) return regreso.borrador ?? valoresIniciales(publicacion)
    const borrador = !editando && regreso?.retomarBorrador && borradorAlta?.idUsuario === idUsuario
      ? borradorAlta.valores : null
    const idVehiculo = regreso?.idVehiculo ?? borrador?.idVehiculo
    return { ...valoresIniciales(), ...borrador, idVehiculo: idVehiculo ? String(idVehiculo) : '' }
  })
  const [idVehiculoRecibido] = useState(editando ? '' : valores.idVehiculo)
  const [mensaje, setMensaje] = useState(regreso?.mensaje ?? '')
  const [esError, setEsError] = useState(regreso?.error ?? false)
  const [inicioPeriodo, setInicioPeriodo] = useState('')
  const [recargar, setRecargar] = useState(0)
  const [confirmarDesactivacion, setConfirmarDesactivacion] = useState(false)
  const [accionPendiente, setAccionPendiente] = useState(null)
  const destinoGuardado = useRef(null)
  const vigente = useRef(false)
  // Los avisos están arriba del formulario: ante un error se lleva la pantalla hasta ellos
  const avisos = useRef(null)
  const [avisoError, setAvisoError] = useState(0)
  const ubicacionFija = editando || Boolean(publicacion?.idPublicacion)
  const hayCambios = editando && Boolean(publicacion)
    && (cambiaronDatos(valores, publicacion) || cambiaronPeriodos(valores, publicacion))
  const borradorPendiente = Boolean(inicioPeriodo) || (editando ? hayCambios
    : JSON.stringify(valores) !== JSON.stringify(valoresIniciales()))
  const salida = useBlocker(({ currentLocation, nextLocation }) => {
    if (destinoGuardado.current === nextLocation.pathname) {
      destinoGuardado.current = null
      return false
    }
    return (borradorPendiente || guardando) && (currentLocation.pathname !== nextLocation.pathname
      || currentLocation.search !== nextLocation.search)
  })

  useEffect(() => {
    if (salida.state === 'blocked' && !borradorPendiente && !guardando) salida.proceed()
  }, [salida, borradorPendiente, guardando])

  useEffect(() => {
    if (!borradorPendiente && !guardando) return
    function antesDeCerrar(event) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', antesDeCerrar)
    return () => {
      window.removeEventListener('beforeunload', antesDeCerrar)
    }
  }, [borradorPendiente, guardando])

  useEffect(() => {
    vigente.current = true
    dispatch(abrirEditor({ clave: claveEditor, conservar: usarGuardada }))
    if (!editando) {
      dispatch(elegirVehiculoPublicacion(null))
      dispatch(descartarBorradorAlta())
    }
    return () => { vigente.current = false }
  }, [dispatch, editando, claveEditor, usarGuardada])

  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

  useEffect(() => {
    if (token && !usuario?.idUsuario) dispatch(fetchUser())
  }, [token, usuario, dispatch])

  useEffect(() => {
    if (idVehiculoRecibido && token && idUsuario) dispatch(fetchVehiculoParaPublicar(idVehiculoRecibido))
  }, [dispatch, idVehiculoRecibido, token, idUsuario])

  useEffect(() => {
    if (!editando || !token || !idUsuario || (usarGuardada && recargar === 0)) return
    let actual = true
    dispatch(fetchEdicionPublicacion(id)).unwrap().then((completa) => {
      if (!actual) return
      const pendiente = regreso?.idPublicacion === completa.idPublicacion && regreso.idUsuario === idUsuario
        ? regreso.borrador : null
      setValores(pendiente ? {
        ...pendiente, periodos: completarIds(pendiente.periodos, completa.periodos, regreso.periodosAnteriores, true),
      } : valoresIniciales(completa))
      setInicioPeriodo('')
    }).catch((error) => {
      if (actual && error instanceof Error) dispatch(bloquearGuardado(error.message))
    })
    return () => { actual = false }
  }, [dispatch, editando, id, token, idUsuario, regreso, recargar, usarGuardada])

  function mostrarMensaje(texto, error = false) {
    setMensaje(texto)
    setEsError(error)
    if (error) setAvisoError((actual) => actual + 1)
    dispatch(limpiarErrorGuardado())
  }

  useEffect(() => {
    if (avisoError || errorGuardado) avisos.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [avisoError, errorGuardado])

  function cambiarCampo(event) {
    if (guardando) return
    const { name, value } = event.target
    if (ubicacionFija && ['direccion', 'zona', 'localidad', 'ciudad', 'provincia', 'codigoPostal'].includes(name)) return
    setValores((actuales) => {
      const nuevos = { ...actuales, [name]: value }
      // Si se cambia a mano un dato de la dirección, las coordenadas del mapa ya no sirven
      const camposDireccion = ['direccion', 'localidad', 'ciudad', 'provincia', 'codigoPostal']
      if (camposDireccion.includes(name) && actuales[name] !== '' && value !== actuales[name]) {
        nuevos.latitud = null
        nuevos.longitud = null
        nuevos.placeId = ''
      }
      return nuevos
    })
  }

  // Cuando se elige una sugerencia de Google, completamos todos los campos de la ubicación
  function seleccionarUbicacion(ubicacion) {
    if (guardando || ubicacionFija) return
    setValores((actuales) => ({ ...actuales, ...ubicacion }))
  }

  function elegirVehiculo(vehiculo) {
    if (guardando || ubicacionFija) return
    dispatch(elegirVehiculoPublicacion(vehiculo))
    setValores({ ...valores, idVehiculo: String(vehiculo.idVehiculo) })
  }

  function navegarConDatosGuardados(destino, opciones) {
    destinoGuardado.current = destino
    navigate(destino, opciones)
  }

  // El borrador queda guardado para volver desde el alta del vehículo.
  function registrarOtroVehiculo() {
    if (guardando || incierto) return
    dispatch(guardarBorradorAlta({ idUsuario, valores }))
    navegarConDatosGuardados('/vehiculos/nuevo', { state: { desdePublicacion: true } })
  }

  async function guardar(event) {
    event.preventDefault()
    if (guardando || cargando || incierto || publicacion?.estado === 'DESACTIVADA') return
    if (inicioPeriodo) {
      mostrarMensaje('Terminá de elegir el período o cancelá la selección antes de guardar.', true)
      return
    }
    const problema = validarFormulario(valores, editando || Boolean(publicacion?.idPublicacion))
    if (problema) {
      mostrarMensaje(problema, true)
      return
    }
    mostrarMensaje('')
    if (!idUsuario || loadingElegido || (!publicacion?.idPublicacion && !vehiculoElegido)) {
      mostrarMensaje('Esperá a que termine de cargar el vehículo y los datos de tu cuenta.', true)
      return
    }
    const anteriores = publicacion
    const datos = {
      valores: structuredClone(valores),
      publicacion: structuredClone(publicacion ?? { ...vehiculoElegido, ...datosUbicacion(valores), periodos: [] }),
    }
    try {
      const guardada = await dispatch(guardarCambiosPublicacion(datos)).unwrap()
      if (!vigente.current) return
      setValores(valoresIniciales(guardada))
      setInicioPeriodo('')
      mostrarMensaje('')
      toast.success(editando ? 'Los cambios se guardaron.' : 'La publicación se creó.')
      if (!editando) navegarConDatosGuardados(`/publicaciones/${guardada.idPublicacion}/editar`, {
        replace: true, state: { usarGuardada: true },
      })
    } catch (error) {
      if (!vigente.current || error.sesionCambiada || error.name === 'ConditionError') return
      const guardada = error.guardada
      if (guardada) {
        const borrador = { ...valores, periodos: completarIds(valores.periodos, guardada.periodos, anteriores?.periodos) }
        setValores(borrador)
        if (!editando && guardada.idPublicacion && !error.incierto) {
          navegarConDatosGuardados(`/publicaciones/${guardada.idPublicacion}/editar`, { replace: true, state: {
            usarGuardada: true, borrador, idUsuario, idPublicacion: guardada.idPublicacion,
          } })
        }
      }
    }
  }

  async function cambiarEstado(accion, confirmado = false) {
    if (guardando || incierto || !publicacion?.idPublicacion || publicacion.estado === 'DESACTIVADA'
      || cambiaronDatos(valores, publicacion) || cambiaronPeriodos(valores, publicacion)) return
    if (accion === 'desactivar' && !confirmado) {
      dispatch(limpiarErrorGuardado())
      setConfirmarDesactivacion(true)
      return
    }
    mostrarMensaje('')
    setAccionPendiente(accion)
    try {
      await dispatch(cambiarEstadoPublicacion({ publicacion, accion })).unwrap()
      if (vigente.current) {
        setConfirmarDesactivacion(false)
        toast.success(accion === 'pausar' ? 'La publicación se pausó.' : accion === 'reactivar' ? 'La publicación se reactivó.' : 'La publicación se desactivó.')
      }
    } catch {
      // El error se muestra desde el slice.
    } finally {
      if (vigente.current) setAccionPendiente(null)
    }
  }

  // Vuelve el formulario a lo que está guardado
  function descartar() {
    if (guardando) return
    setValores(valoresIniciales(publicacion))
    setInicioPeriodo('')
    mostrarMensaje('')
  }

  function reintentarCarga() {
    if (!usuario?.idUsuario) dispatch(fetchUser())
    setRecargar((actual) => actual + 1)
  }

  async function comprobarGuardado() {
    if (guardando || cargando || !publicacion?.idPublicacion) return
    try {
      const guardada = await dispatch(fetchEdicionPublicacion(publicacion.idPublicacion)).unwrap()
      if (!vigente.current) return
      setValores({ ...valores, periodos: completarIds(valores.periodos, guardada.periodos, publicacion.periodos, true) })
      setInicioPeriodo('')
      mostrarMensaje('Ya comprobamos los datos guardados. Revisá lo que sigue pendiente.')
    } catch (error) {
      if (vigente.current && error instanceof Error) dispatch(bloquearGuardado(error.message))
    }
  }

  // Pantallas antes de mostrar el formulario
  const tituloPagina = editando ? 'Editar publicación' : 'Crear publicación'
  // Si no se pudo traer el usuario, se muestra el error del slice
  const errorPrevio = editando && !usuario?.idUsuario ? errorUsuario : null
  if ((cargando || (editando && !publicacion && !errorCarga)) && !errorPrevio) {
    return <main className={pageStyles}><MensajePublicacion>Cargando la publicación…</MensajePublicacion></main>
  }
  if (editando && !publicacion) {
    return (
      <main className={pageStyles}>
        <h1 className={titleStyles}>{tituloPagina}</h1>
        <MensajePublicacion error onRetry={reintentarCarga}>{errorCarga || errorPrevio}</MensajePublicacion>
        <Link to="/mis-publicaciones">← Mis publicaciones</Link>
      </main>
    )
  }

  const vehiculo = editando ? publicacion : vehiculoElegido
  const desactivada = publicacion?.estado === 'DESACTIVADA'
  const idPendiente = errorGuardado?.idPublicacion
  // Pausar/desactivar solo se puede si no hay cambios sin guardar
  const estadoBloqueado = guardando || hayCambios || desactivada || incierto

  // Pasos que se muestran arriba al crear
  const pasos = [
    ['Vehículo', valores.idVehiculo !== ''],
    ['Ubicación', ['direccion', 'zona', 'localidad', 'ciudad', 'provincia', 'codigoPostal', 'horaRetiroDevolucion']
      .every((campo) => valores[campo].trim() !== '') && tieneCoordenadas(valores)],
    ['Precio y días', Number(valores.precioDia) >= 1 && valores.periodos.length > 0],
    ['Descripción', valores.descripcion.trim() !== ''],
  ]

  const calendario = (
    <DisponibilidadPublicacion
      periodos={valores.periodos}
      inicio={inicioPeriodo}
      onChange={(periodos) => setValores({ ...valores, periodos })}
      onSelectionChange={setInicioPeriodo}
    />
  )

  return (
    <main className={pageStyles + (editando ? ' pb-[9.375rem] phone:pb-[10.625rem]' : ' pb-20 phone:pb-12')}>
      {editando
        ? <Link to="/mis-publicaciones" aria-disabled={guardando} onClick={(event) => { if (guardando) event.preventDefault() }}
            className={btnBase + ' ' + btnOutline + ' ' + btnSize + ' mb-4'}>
            <IconoPublicacion nombre="left" />Volver a mis publicaciones
          </Link>
        : <p className={eyebrowStyles}>Panel de propietario · Nueva publicación</p>}

      <div className={headingStyles + (editando ? ' pb-4 border-b border-border' : '')}>
        <div>
          <h1 className={titleStyles}>{tituloPagina}</h1>
          <p className={introStyles}>
            {editando
              ? 'Actualizá el precio, los días disponibles y las condiciones del alquiler.'
              : 'Elegí uno de tus vehículos y definí dónde se retira, el precio y los días en que se puede alquilar.'}
          </p>
        </div>
        {editando && (
          <div className={actionsStyles}>
            <label className="flex items-center gap-2 text-[0.75rem] text-soft">
              <span className="inline-block min-w-36">{accionPendiente === 'pausar' ? 'Pausando…' : accionPendiente === 'reactivar' ? 'Reanudando…' : 'Pausar publicación'}</span>
              <input
                type="checkbox"
                role="switch"
                checked={publicacion.estado === 'PAUSADA'}
                disabled={estadoBloqueado}
                onChange={() => cambiarEstado(publicacion.estado === 'ACTIVA' ? 'pausar' : 'reactivar')}
                className="appearance-none w-9 h-5 border-0 bg-border rounded-[0.75rem] relative after:content-[''] after:absolute after:left-0.5 after:top-0.5 after:size-4 after:bg-white after:rounded-full checked:bg-gold checked:after:translate-x-4"
              />
            </label>
            <Link to={`/publicaciones/${publicacion.idPublicacion}`} target="_blank" rel="noopener noreferrer"
              aria-label="Ver publicación guardada en otra pestaña" aria-disabled={guardando || incierto}
              onClick={(event) => { if (guardando || incierto) event.preventDefault() }} className={smallButtonStyles}>
              <IconoPublicacion nombre="eye" />Ver publicación
            </Link>
          </div>
        )}
      </div>

      {!editando && (
        <ol className="grid grid-cols-4 gap-4 m-0 mt-6 p-0 pb-4 border-b border-border list-none phone:grid-cols-2">
          {pasos.map(([etiqueta, completo], indice) => (
            <li key={etiqueta} className={'flex flex-col gap-[0.1875rem] pt-2 border-t-2 text-[0.75rem] ' + (completo ? 'border-ink text-ink' : 'border-border text-muted')}>
              <strong className="font-medium">{String(indice + 1).padStart(2, '0') + ' ' + etiqueta}</strong>
              <span className={'text-[0.6875rem]' + (completo ? ' text-gold' : '')}>{completo ? 'Completo' : 'Pendiente'}</span>
            </li>
          ))}
        </ol>
      )}

      <div ref={avisos}>
      {mensaje && <MensajePublicacion error={esError}>{mensaje}</MensajePublicacion>}
      {!editando && !usuario?.idUsuario && errorUsuario && (
        <MensajePublicacion error>{errorUsuario}</MensajePublicacion>
      )}
      {errorCarga && <MensajePublicacion error onRetry={reintentarCarga}>{errorCarga}</MensajePublicacion>}
      {errorElegido && <MensajePublicacion error>{errorElegido}</MensajePublicacion>}
      {errorGuardado && <MensajePublicacion error>
        {errorGuardado.parcial ? `Se guardó una parte de los cambios. Queda pendiente: ${errorGuardado.recurso}. ` : ''}
        {errorGuardado.message}
        {incierto ? ' No recibimos una confirmación. Comprobá lo guardado antes de intentar otra vez.' : ''}
      </MensajePublicacion>}
      <p role="status" className="sr-only">{guardando ? 'Guardando cambios…' : ''}</p>
      {incierto && (publicacion?.idPublicacion && idPendiente === publicacion.idPublicacion
        ? <button type="button" disabled={guardando} onClick={comprobarGuardado} className={smallButtonStyles}>Comprobar guardado</button>
        : <MensajePublicacion>
            Revisá <Link to={idPendiente ? `/publicaciones/${idPendiente}/editar` : '/mis-publicaciones'} className="underline">
              {idPendiente ? 'la publicación pendiente' : 'Mis publicaciones'}
            </Link> antes de volver a guardar.
          </MensajePublicacion>)}
      {desactivada && <MensajePublicacion>Esta publicación está desactivada. No se puede modificar ni reactivar.</MensajePublicacion>}
      </div>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 mt-8 items-start tablet:grid-cols-1">
        <form id="form-publicacion" onSubmit={guardar} className="min-w-0">
          {/* Mientras se guarda (o si está desactivada) se bloquea todo el formulario */}
          <fieldset disabled={guardando || desactivada} className="grid min-w-0 gap-6 border-0 p-0 m-0">
            <VehiculoPublicacion editando={ubicacionFija} vehiculo={vehiculo} seleccionado={valores.idVehiculo} onChange={elegirVehiculo}
              onRegistrarOtro={incierto ? null : registrarOtroVehiculo} />

            {editando ? (
              <>
                <SeccionPublicacion titulo="Precio">
                  <PrecioPublicacion valores={valores} onChange={cambiarCampo} />
                </SeccionPublicacion>
                <SeccionPublicacion titulo="Disponibilidad">
                  <p className={descriptionStyles}>Marcá los períodos en los que se puede reservar el auto. Fuera de ellos, nadie puede elegir esos días.</p>
                  {calendario}
                </SeccionPublicacion>
                <UbicacionPublicacion valores={valores} onChange={cambiarCampo} onUbicacionSeleccionada={seleccionarUbicacion} editando readOnly />
              </>
            ) : (
              <>
                <UbicacionPublicacion valores={valores} onChange={cambiarCampo} onUbicacionSeleccionada={seleccionarUbicacion} readOnly={ubicacionFija} />
                <SeccionPublicacion titulo="Precio y días disponibles" numero="3">
                  <PrecioPublicacion valores={valores} onChange={cambiarCampo} />
                  <p className={descriptionStyles}>Solo se puede reservar dentro de estos períodos. Después los ajustás desde la publicación.</p>
                  {calendario}
                </SeccionPublicacion>
              </>
            )}

            <SeccionPublicacion titulo="Descripción" numero={!editando && '4'}>
              <CampoFormulario id="descripcion" label={!editando && 'Contale al cliente cómo es el auto y qué esperás *'}>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  aria-label="Descripción del alquiler"
                  rows={5}
                  maxLength={600}
                  required
                  className={inputStyles + ' font-sans resize-y'}
                  placeholder="Estado del auto, cómo se entrega, si puede salir de la provincia…"
                  value={valores.descripcion}
                  onChange={cambiarCampo}
                />
              </CampoFormulario>
              <p className="text-right mt-1.5 text-muted text-[0.6875rem]">{valores.descripcion.length} de 600</p>
            </SeccionPublicacion>

            {editando ? (
              <SeccionPublicacion
                titulo={<><IconoPublicacion nombre="warning" />Zona crítica</>}
                className="border-[#fecaca] [&_h2]:font-sans [&_h2]:text-[0.875rem] [&_h2]:text-[#dc2626]"
              >
                <p className="text-muted text-[0.75rem] leading-[1.7] mb-4">
                  Pausar oculta el auto del catálogo y lo podés reanudar cuando quieras. Desactivar lo da de baja definitivamente:
                  las reservas existentes se mantienen, pero para volver a ofrecer el auto tenés que crear otra publicación.
                </p>
                <div className={actionsStyles}>
                  <button type="button" disabled={estadoBloqueado} className={smallButtonStyles + ' min-w-44'}
                    onClick={() => cambiarEstado(publicacion.estado === 'ACTIVA' ? 'pausar' : 'reactivar')}>
                    {accionPendiente === 'pausar' ? 'Pausando…' : accionPendiente === 'reactivar' ? 'Reanudando…' : publicacion.estado === 'PAUSADA' ? 'Reanudar publicación' : 'Pausar publicación'}
                  </button>
                  <button type="button" disabled={estadoBloqueado} className={textButtonStyles + ' text-error'}
                    onClick={() => cambiarEstado('desactivar')}>
                    Desactivar publicación
                  </button>
                </div>
              </SeccionPublicacion>
            ) : (
              <div className="flex justify-between gap-4 pt-2">
                <Link to="/mis-publicaciones" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Cancelar</Link>
                <button type="submit" disabled={incierto} className={btnBase + ' ' + btnDark + ' ' + btnSize}>
                  {guardando ? 'Publicando…' : 'Publicar'} <IconoPublicacion nombre="arrow" />
                </button>
              </div>
            )}
          </fieldset>
        </form>

        <VistaPreviaPublicacion vehiculo={vehiculo} valores={valores} editando={editando} />
      </div>

      <BarraCambiosPendientes visible={hayCambios} onDiscard={descartar} formId="form-publicacion" disabled={guardando} saveDisabled={guardando || desactivada || incierto} />
      {salida.state === 'blocked' && !confirmarDesactivacion && <ConfirmarAccion
        titulo={guardando ? 'Estamos guardando los cambios' : '¿Salir sin guardar?'}
        descripcion={guardando ? 'Esperá a que termine el guardado antes de salir.' : 'Los cambios que hiciste en esta publicación se van a descartar.'}
        confirmar="Salir sin guardar"
        cancelar="Seguir editando"
        procesando={guardando}
        alCerrar={() => salida.reset()}
        alConfirmar={() => salida.proceed()}
      />}
      {confirmarDesactivacion && <ConfirmarAccion
        titulo="¿Desactivar esta publicación?"
        descripcion="Dejará de aparecer en el catálogo. No vas a poder reactivarla."
        confirmar="Desactivar publicación"
        cancelar="Mantener publicación"
        procesando={guardando}
        confirmarDeshabilitado={incierto}
        textoProcesando="Desactivando…"
        mensaje={errorGuardado ? errorGuardado.message + (incierto ? ' Cerrá este aviso y comprobá el estado antes de intentar otra vez.' : '') : null}
        alCerrar={() => { if (!guardando) setConfirmarDesactivacion(false) }}
        alConfirmar={() => cambiarEstado('desactivar', true)}
      />}
    </main>
  )
}
