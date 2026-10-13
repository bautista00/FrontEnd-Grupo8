import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles, descriptionStyles, actionsStyles, textButtonStyles, smallButtonStyles } from '../components/publicaciones/publicationStyles'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import FormField, { inputStyles } from '../components/ui/FormField'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/buttonStyles'
import PublicationIcon from '../components/publicaciones/PublicationIcon'
import PublicationSection from '../components/publicaciones/PublicationSection'
import PublicationVehicle from '../components/publicaciones/PublicationVehicle'
import PublicationLocation from '../components/publicaciones/PublicationLocation'
import { tieneCoordenadas } from '../components/publicaciones/ubicacion'
import PublicationPrice from '../components/publicaciones/PublicationPrice'
import PublicationAvailability from '../components/publicaciones/PublicationAvailability'
import PublicationPreview from '../components/publicaciones/PublicationPreview'
import PendingChangesBar from '../components/publicaciones/PendingChangesBar'
import PublicationFormLoader from '../components/publicaciones/PublicationFormLoader'
import PublicationStateActions from '../components/publicaciones/PublicationStateActions'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import { valoresIniciales, hayCambiosFormulario, validarFormulario, periodoDesdeApi, incorporarIds } from '../components/publicaciones/publicationFormData'
import guardarPublicacion from '../services/guardarPublicacion'
import { consultarPublicacion, consultarPeriodos } from '../services/publicacionesApi'

export default function PublicationForm(props) {
  const { id } = useParams()
  return <PublicationFormLoader {...props} id={id} Form={PublicationEditor} />
}

function PublicationEditor({ modo = 'crear', publicacion, sesion, rutaRegistroVehiculo, SelectorUbicacion, MapaUbicacion }) {
  const editando = modo === 'editar'
  const location = useLocation()
  const navigate = useNavigate()
  const regreso = !editando && location.state?.idUsuario === sesion.usuario.idUsuario ? location.state : null
  const [base, setBase] = useState(publicacion ?? {})
  const [valores, setValores] = useState(() => ({ ...valoresIniciales(publicacion), ...regreso?.borradorPublicacion,
    ...(regreso?.vehiculoRegistrado ? { idVehiculo: String(regreso.vehiculoRegistrado.idVehiculo) } : {}) }))
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(regreso?.vehiculoRegistrado ?? null)
  const [operacion, setOperacion] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState(false)
  const [incierto, setIncierto] = useState(false)
  const [versionFormulario, setVersionFormulario] = useState(0)
  const [inicioPeriodo, setInicioPeriodo] = useState('')
  const hayCambios = hayCambiosFormulario(valores, base)
  const vehiculo = editando ? base : vehiculoSeleccionado
  const guardando = Boolean(operacion) || cambiandoEstado
  const ubicacionFija = editando || Boolean(base.idPublicacion)
  const { apiUrl, token } = sesion

  useEffect(() => {
    if (!operacion) return
    let vigente = true
    const peticion = operacion.tipo === 'verificar'
      ? Promise.all([consultarPublicacion(apiUrl, token, operacion.base.idPublicacion), consultarPeriodos(apiUrl, token, operacion.base.idPublicacion)])
        .then(([datos, periodos]) => ({ ...operacion.base, ...datos, periodos: periodos.map(periodoDesdeApi) }))
      : guardarPublicacion(apiUrl, token, operacion)
    peticion.then((confirmados) => {
      if (!vigente) return
      const borradorVerificado = operacion.tipo === 'verificar' ? incorporarIds(operacion.valores, confirmados, operacion.base, true) : null
      setBase(confirmados)
      setError(false)
      setIncierto(false)
      setOperacion(null)
      if (operacion.tipo === 'verificar') {
        setValores(borradorVerificado)
        setMensaje('Ya comprobamos los datos guardados. Revisá los cambios que siguen pendientes.')
      } else {
        setValores(valoresIniciales(confirmados))
        setVersionFormulario((version) => version + 1)
        setInicioPeriodo('')
        setMensaje('Los cambios se guardaron.')
        if (!editando) navigate('/publicaciones/' + confirmados.idPublicacion + '/editar', { replace: true })
      }
    }).catch((errorPeticion) => {
      if (!vigente) return
      if (errorPeticion.confirmados) {
        setBase(errorPeticion.confirmados)
        setValores(incorporarIds(operacion.valores, errorPeticion.confirmados, operacion.base))
      }
      setError(true)
      setIncierto(errorPeticion.incierto ?? true)
      setMensaje((errorPeticion.parcial ? 'Se guardó una parte de los cambios. Queda pendiente: ' + errorPeticion.recurso + '. ' : '') + errorPeticion.message
        + (errorPeticion.incierto ? ' No recibimos una confirmación del servidor. Comprobá el resultado antes de volver a guardar.' : ''))
      setOperacion(null)
    })
    return () => { vigente = false }
  }, [operacion, apiUrl, token, editando, navigate])

  useEffect(() => {
    if (!guardando) return
    function antesDeSalir(event) { event.preventDefault(); event.returnValue = '' }
    function esperarGuardado(event) {
      if (event.target.closest('a[href]')) {
        event.preventDefault()
        event.stopPropagation()
        setMensaje('Esperá a que termine el guardado antes de salir.')
      }
    }
    window.addEventListener('beforeunload', antesDeSalir)
    document.addEventListener('click', esperarGuardado, true)
    return () => {
      window.removeEventListener('beforeunload', antesDeSalir)
      document.removeEventListener('click', esperarGuardado, true)
    }
  }, [guardando])

  function confirmarGuardado(event) {
    event.preventDefault()
    if (guardando || incierto || base.estado === 'DESACTIVADA') return
    if (inicioPeriodo) { setMensaje('Terminá de elegir el período o cancelá la selección antes de guardar.'); setError(true); return }
    const problema = validarFormulario(valores, base)
    if (problema) { setMensaje(problema); setError(true); return }
    setMensaje('')
    setError(false)
    setOperacion({ tipo: 'guardar', valores: structuredClone(valores), base: structuredClone(base) })
  }
  const pasos = [
    ['Vehículo', Boolean(valores.idVehiculo)],
    ['Ubicación', ['direccion', 'zona', 'localidad', 'ciudad', 'provincia', 'codigoPostal', 'horaRetiroDevolucion']
      .every((campo) => valores[campo].trim() !== '') && tieneCoordenadas(valores)],
    ['Precio y días', valores.precioDia !== '' && Number(valores.precioDia) >= 1
      && Number(valores.descuentoPorcentaje || 0) >= 0 && Number(valores.descuentoPorcentaje || 0) <= 50
      && valores.periodos.length > 0],
    ['Descripción', Boolean(valores.descripcion.trim())],
  ]

  function cambiarCampo(event) {
    const { name, value } = event.target
    if (guardando || (ubicacionFija && ['direccion', 'zona', 'localidad', 'ciudad', 'provincia', 'codigoPostal'].includes(name))) return
    setValores((actuales) => {
      const cambiaDireccion = name === 'direccion' && value !== actuales.direccion
      const cambiaZona = ['localidad', 'ciudad', 'provincia', 'codigoPostal'].includes(name)
        && actuales[name].trim() !== '' && value !== actuales[name]
      return {
        ...actuales,
        [name]: value,
        ...((cambiaDireccion || cambiaZona) ? { latitud: null, longitud: null, placeId: '' } : {}),
      }
    })
  }

  function seleccionarUbicacion(ubicacion) {
    if (guardando || ubicacionFija) return
    setValores((actuales) => ({
      ...actuales,
      direccion: ubicacion.direccion ?? '',
      zona: ubicacion.zona ?? '',
      localidad: ubicacion.localidad ?? '',
      ciudad: ubicacion.ciudad ?? '',
      provincia: ubicacion.provincia ?? '',
      codigoPostal: ubicacion.codigoPostal ?? '',
      latitud: ubicacion.latitud ?? null,
      longitud: ubicacion.longitud ?? null,
      placeId: ubicacion.placeId ?? '',
    }))
  }

  function cambiarPeriodos(periodos) {
    if (!guardando) setValores((actuales) => ({ ...actuales, periodos }))
  }

  function descartar() {
    if (guardando) return
    setValores(valoresIniciales(base))
    setVersionFormulario(versionFormulario + 1)
    setInicioPeriodo('')
    setMensaje('')
    setError(false)
  }

  return <PublicationStateActions publicacion={base} apiUrl={apiUrl} token={token} disabled={guardando || hayCambios || incierto}
    onConfirmed={(confirmada) => setBase((actuales) => ({ ...actuales, ...confirmada }))} onPending={setCambiandoEstado}>
    {(acciones) => (
    <main className={pageStyles + (editando && hayCambios ? ' pb-[150px] phone:pb-[170px]' : ' pb-20 phone:pb-12')}>
      {editando ? <Link to="/mis-publicaciones" className={eyebrowStyles + ' inline-block mb-3'}>← Mis publicaciones</Link>
        : <p className={eyebrowStyles}>Panel de propietario · Nueva publicación</p>}
      <div className={headingStyles + (editando ? ' pb-4 border-b border-border' : '')}>
        <div>
          <h1 className={titleStyles}>{editando ? 'Editar publicación' : 'Crear publicación'}</h1>
          <p className={introStyles}>{editando
            ? 'Actualizá el precio, los días disponibles y las condiciones del alquiler.'
            : 'Elegí uno de tus vehículos y definí dónde se retira, el precio y los días en que se puede alquilar.'}</p>
        </div>
        {editando && <div className={actionsStyles}>
          <label className="flex items-center gap-2 text-[12px] text-soft">Pausar publicación <input type="checkbox" role="switch" checked={acciones.estado === 'PAUSADA'} disabled={acciones.disabled || base.estado === 'DESACTIVADA'} onChange={() => acciones.confirmar(base.estado === 'ACTIVA' ? 'pausar' : 'reactivar')} className="appearance-none w-9 h-5 border-0 bg-border rounded-[12px] relative after:content-[''] after:absolute after:left-0.5 after:top-0.5 after:size-4 after:bg-white after:rounded-full checked:bg-gold checked:after:translate-x-4" /></label>
          <button type="button" disabled className={smallButtonStyles}><PublicationIcon nombre="eye" />Ver como usuario</button>
        </div>}
      </div>
      {!editando && <ol className="grid grid-cols-4 gap-4 m-0 mt-6 p-0 pb-4 border-b border-border list-none phone:grid-cols-2">
        {pasos.map(([etiqueta, completo], indice) => <li key={etiqueta} className={'flex flex-col gap-[3px] pt-2 border-t-2 text-[12px] ' + (completo ? 'border-ink text-ink' : 'border-border text-muted')}>
          <strong className="font-medium">{String(indice + 1).padStart(2, '0') + ' ' + etiqueta}</strong><span className={'text-[11px]' + (completo ? ' text-gold' : '')}>{completo ? 'Completo' : 'Pendiente'}</span>
        </li>)}
      </ol>}
      {mensaje && <PublicationMessage error={error}>{mensaje}</PublicationMessage>}
      {guardando && <PublicationMessage>Guardando cambios…</PublicationMessage>}
      {base.estado === 'DESACTIVADA' && <PublicationMessage>Esta publicación está desactivada. No se puede modificar ni reactivar.</PublicationMessage>}
      {incierto && !guardando && (base.idPublicacion
        ? <button type="button" className={smallButtonStyles} onClick={() => setOperacion({ tipo: 'verificar', valores: structuredClone(valores), base: structuredClone(base) })}>Comprobar guardado</button>
        : <PublicationMessage>Revisá <Link to="/mis-publicaciones" className="underline">Mis publicaciones</Link> antes de intentar otra alta.</PublicationMessage>)}
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 mt-8 items-start tablet:grid-cols-1">
        <form id="form-publicacion" onSubmit={confirmarGuardado} className="min-w-0">
          <fieldset disabled={guardando || base.estado === 'DESACTIVADA'} className="grid min-w-0 gap-6 border-0 p-0 m-0">
          <PublicationVehicle editando={ubicacionFija} vehiculo={vehiculo} sesion={sesion}
            seleccionado={valores.idVehiculo} onChange={(item) => { setVehiculoSeleccionado(item); setValores({ ...valores, idVehiculo: String(item.idVehiculo) }) }}
            rutaRegistro={rutaRegistroVehiculo} estadoRegistro={{ regreso: '/publicaciones/nueva', idUsuario: sesion.usuario.idUsuario, borradorPublicacion: valores }} />
          {editando ? <>
            <PublicationSection titulo="Precio"><PublicationPrice valores={valores} onChange={cambiarCampo} /></PublicationSection>
            <PublicationSection titulo="Disponibilidad">
              <p className={descriptionStyles}>Marcá los períodos en los que se puede reservar el auto. Fuera de ellos, nadie puede elegir esos días.</p>
              <PublicationAvailability key={versionFormulario} periodos={valores.periodos} onChange={cambiarPeriodos} onSelectionChange={setInicioPeriodo} />
            </PublicationSection>
            <PublicationLocation valores={valores} onChange={cambiarCampo} onUbicacionSeleccionada={seleccionarUbicacion}
              SelectorUbicacion={SelectorUbicacion} MapaUbicacion={MapaUbicacion} editando readOnly />
          </> : <>
            <PublicationLocation valores={valores} onChange={cambiarCampo} onUbicacionSeleccionada={seleccionarUbicacion}
              SelectorUbicacion={SelectorUbicacion} MapaUbicacion={MapaUbicacion} readOnly={ubicacionFija} />
            <PublicationSection titulo="Precio y días disponibles" numero="3">
              <PublicationPrice valores={valores} onChange={cambiarCampo} />
              <p className={descriptionStyles}>Solo se puede reservar dentro de estos períodos. Después los ajustás desde la publicación.</p>
              <PublicationAvailability key={versionFormulario} periodos={valores.periodos} onChange={cambiarPeriodos} onSelectionChange={setInicioPeriodo} />
            </PublicationSection>
          </>}
          <PublicationSection titulo="Descripción" numero={!editando && '4'}>
            <FormField id="descripcion" label={!editando && 'Contale al cliente cómo es el auto y qué esperás *'}>
              <textarea id="descripcion" name="descripcion" aria-label="Descripción del alquiler" rows={5} maxLength={600} required
                className={inputStyles + ' font-sans resize-y'} placeholder="Estado del auto, cómo se entrega, si puede salir de la provincia…"
                value={valores.descripcion} onChange={cambiarCampo} />
            </FormField>
            <p className="text-right mt-1.5 text-muted text-[11px]">{valores.descripcion.length} de 600</p>
          </PublicationSection>
          {editando ? <PublicationSection titulo={<><PublicationIcon nombre="warning" />Zona crítica</>} className="border-[#fecaca] [&_h2]:font-sans [&_h2]:text-[14px] [&_h2]:text-[#dc2626]">
            <p className="text-muted text-[12px] leading-[1.7] mb-4">Pausar oculta el auto del catálogo y lo podés reactivar cuando quieras. Desactivar lo da de baja definitivamente: las reservas existentes se mantienen, pero la publicación no se puede reactivar.</p>
            <div className={actionsStyles}>
              <button type="button" disabled={acciones.disabled || base.estado === 'DESACTIVADA'} onClick={() => acciones.confirmar(base.estado === 'ACTIVA' ? 'pausar' : 'reactivar')} className={smallButtonStyles}>{base.estado === 'PAUSADA' ? 'Reactivar publicación' : 'Pausar publicación'}</button>
              <button type="button" disabled={acciones.disabled || base.estado === 'DESACTIVADA'} onClick={() => acciones.confirmar('desactivar')} className={textButtonStyles + ' text-error'}>Desactivar publicación</button>
            </div>
          </PublicationSection> : <div className="flex justify-between gap-4 pt-2">
            <Link to="/mis-publicaciones" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Cancelar</Link>
            <button type="submit" disabled={guardando || incierto} className={btnBase + ' ' + btnDark + ' ' + btnSize}>{base.idPublicacion ? 'Completar publicación' : 'Publicar'} <PublicationIcon nombre="arrow" /></button>
          </div>}
          </fieldset>
        </form>
        <PublicationPreview key={vehiculo?.idVehiculo ?? 'sin-vehiculo'} vehiculo={vehiculo} valores={valores} editando={editando} sesion={sesion} />
      </div>
      {editando && hayCambios && <PendingChangesBar onDiscard={descartar} formId="form-publicacion" disabled={guardando} saveDisabled={guardando || incierto || base.estado === 'DESACTIVADA'} />}
    </main>
  )}</PublicationStateActions>
}
