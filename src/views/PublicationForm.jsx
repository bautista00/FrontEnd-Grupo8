import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles, descriptionStyles, actionsStyles, textButtonStyles, smallButtonStyles } from '../components/publicaciones/publicationStyles'
import FormField, { inputStyles } from '../components/ui/FormField'
import { btnBase, btnDark, btnOutline, btnSize } from '../components/ui/buttonStyles'
import PublicationIcon from '../components/publicaciones/PublicationIcon'
import PublicationSection from '../components/publicaciones/PublicationSection'
import PublicationVehicle from '../components/publicaciones/PublicationVehicle'
import PublicationLocation from '../components/publicaciones/PublicationLocation'
import PublicationPrice from '../components/publicaciones/PublicationPrice'
import PublicationAvailability from '../components/publicaciones/PublicationAvailability'
import PublicationPreview from '../components/publicaciones/PublicationPreview'
import PendingChangesBar from '../components/publicaciones/PendingChangesBar'
import PublicationMessage from '../components/publicaciones/PublicationMessage'
import { tieneCoordenadas } from '../components/publicaciones/ubicacion'
import { valoresIniciales, datosPublicacion, datosUbicacion, periodoDesdeApi, cambiaronDatos, cambiaronPeriodos, validarFormulario } from '../components/publicaciones/publicationFormData'

import { obtener, enviar } from '../utils/api'

export default function PublicationForm({ modo = 'crear' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const editando = modo === 'editar'
  const token = localStorage.getItem('jwtToken')

  // Publicación tal como está guardada en el backend (solo al editar)
  const [publicacion, setPublicacion] = useState(null)
  // Lo que el usuario va completando en el formulario
  const [valores, setValores] = useState(valoresIniciales())
  // Vehículo elegido en la lista (solo al crear)
  const [vehiculoElegido, setVehiculoElegido] = useState(null)

  const [cargando, setCargando] = useState(editando)
  const [errorCarga, setErrorCarga] = useState('')
  const [guardando, setGuardando] = useState(false)
  // Mensaje de arriba del formulario. Puede venir de la pantalla de crear (location.state)
  const [mensaje, setMensaje] = useState(location.state?.mensaje ?? '')
  const [esError, setEsError] = useState(location.state?.error ?? false)

  // Primer día elegido en el calendario mientras se arma un período
  const [inicioPeriodo, setInicioPeriodo] = useState('')
  // Se incrementa para "reiniciar" el calendario
  const [versionCalendario, setVersionCalendario] = useState(0)
  // Se incrementa para volver a pedir la publicación al backend
  const [recargar, setRecargar] = useState(0)

  // Al editar: pedimos la publicación con su vehículo, su ubicación y sus períodos
  useEffect(() => {
    if (!editando || !token) return

    // 1. El usuario logueado y la publicación
    Promise.all([obtener('/usuarios/me', token), obtener(`/publicaciones/${id}`, token)])
      .then(([usuario, datos]) =>
        // 2. Con los ids de la publicación pedimos el resto
        Promise.all([
          obtener(`/vehiculo/${datos.idVehiculo}`, token),
          obtener(`/ubicaciones/${datos.idUbicacion}`, token),
          obtener(`/disponibilidades/publicacion/${id}`, token),
        ]).then(([vehiculo, ubicacion, periodos]) => {
          if (vehiculo.idUsuario !== usuario.idUsuario) throw new Error('Esta publicación no pertenece a tu cuenta.')

          // 3. Juntamos todo en un solo objeto
          const completa = {
            ...vehiculo,
            ...ubicacion,
            ...datos,
            codigoPostal: ubicacion.codigoPostal,
            placeId: ubicacion.placeId,
            periodos: periodos.map(periodoDesdeApi),
          }
          setPublicacion(completa)
          setValores(valoresIniciales(completa))
          setVersionCalendario((version) => version + 1)
          setErrorCarga('')
        }),
      )
      .catch((error) => {
        console.error('Error al cargar', error)
        setErrorCarga(error.message)
      })
      .finally(() => setCargando(false))
  }, [editando, id, token, recargar])

  function mostrarMensaje(texto, error = false) {
    setMensaje(texto)
    setEsError(error)
  }

  function cambiarCampo(event) {
    const { name, value } = event.target
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
    setValores((actuales) => ({ ...actuales, ...ubicacion }))
  }

  function elegirVehiculo(vehiculo) {
    setVehiculoElegido(vehiculo)
    setValores({ ...valores, idVehiculo: String(vehiculo.idVehiculo) })
  }

  function guardar(event) {
    event.preventDefault()
    if (inicioPeriodo) {
      mostrarMensaje('Terminá de elegir el período o cancelá la selección antes de guardar.', true)
      return
    }
    const problema = validarFormulario(valores, editando)
    if (problema) {
      mostrarMensaje(problema, true)
      return
    }
    setGuardando(true)
    mostrarMensaje('')
    if (editando) guardarCambios()
    else crearPublicacion()
  }

  function crearPublicacion() {
    let idPublicacion = null

    // 1. Creamos la ubicación de retiro
    enviar('/ubicaciones', 'POST', token, datosUbicacion(valores))
      // 2. Creamos la publicación con el id de esa ubicación
      .then((ubicacion) => enviar('/publicaciones', 'POST', token, datosPublicacion(valores, ubicacion.idUbicacion)))
      // 3. Cargamos los períodos disponibles de la publicación nueva
      .then((nueva) => {
        idPublicacion = nueva.idPublicacion
        return Promise.all(valores.periodos.map((periodo) =>
          enviar('/disponibilidades', 'POST', token, { idPublicacion, fechaInicio: periodo.desde, fechaFin: periodo.hasta }),
        ))
      })
      .then(() => {
        navigate(`/publicaciones/${idPublicacion}/editar`, { replace: true, state: { mensaje: 'La publicación se creó.' } })
      })
      .catch((error) => {
        console.error('Error al crear la publicación', error)
        if (idPublicacion) {
          // La publicación ya se creó: vamos a editarla para revisar los períodos
          navigate(`/publicaciones/${idPublicacion}/editar`, {
            replace: true,
            state: { mensaje: 'La publicación se creó, pero no se pudieron guardar todos los períodos. Revisalos acá.', error: true },
          })
          return
        }
        setGuardando(false)
        mostrarMensaje(error.message, true)
      })
  }

  function guardarCambios() {
    const pedidos = []

    // Precio, descuento, hora y descripción
    if (cambiaronDatos(valores, publicacion)) {
      pedidos.push(enviar(`/publicaciones/${id}`, 'PUT', token, datosPublicacion(valores, publicacion.idUbicacion)))
    }
    // Períodos nuevos (todavía no tienen id)
    valores.periodos
      .filter((periodo) => !periodo.idDisponibilidad)
      .forEach((periodo) => {
        pedidos.push(enviar('/disponibilidades', 'POST', token, { idPublicacion: Number(id), fechaInicio: periodo.desde, fechaFin: periodo.hasta }))
      })
    // Períodos que se quitaron del calendario
    publicacion.periodos
      .filter((guardado) => !valores.periodos.some((periodo) => periodo.idDisponibilidad === guardado.idDisponibilidad))
      .forEach((periodo) => {
        pedidos.push(enviar(`/disponibilidades/${periodo.idDisponibilidad}`, 'DELETE', token))
      })

    // Esperamos a que terminen todos (salgan bien o mal) y volvemos a pedir los datos guardados
    Promise.allSettled(pedidos).then((resultados) => {
      const fallido = resultados.find((resultado) => resultado.status === 'rejected')
      if (fallido) mostrarMensaje(fallido.reason.message + ' Te mostramos lo que quedó guardado.', true)
      else mostrarMensaje('Los cambios se guardaron.')
      setGuardando(false)
      setRecargar(recargar + 1)
    })
  }

  // Pausar y reactivar son PUT a su propia ruta; desactivar es un DELETE
  function cambiarEstado(accion) {
    if (accion === 'desactivar' && !window.confirm('¿Desactivar esta publicación? No vas a poder reactivarla.')) return

    const textos = {
      pausar: 'La publicación quedó pausada.',
      reactivar: 'La publicación está activa de nuevo.',
      desactivar: 'La publicación se desactivó.',
    }
    const ruta = accion === 'desactivar' ? '' : `/${accion}`
    const metodo = accion === 'desactivar' ? 'DELETE' : 'PUT'

    setGuardando(true)
    enviar(`/publicaciones/${id}${ruta}`, metodo, token)
      .then(() => mostrarMensaje(textos[accion]))
      .catch((error) => mostrarMensaje(error.message, true))
      .finally(() => {
        setGuardando(false)
        setRecargar(recargar + 1)
      })
  }

  // Vuelve el formulario a lo que está guardado
  function descartar() {
    setValores(valoresIniciales(publicacion))
    setVersionCalendario(versionCalendario + 1)
    setInicioPeriodo('')
    mostrarMensaje('')
  }

  function reintentarCarga() {
    setErrorCarga('')
    setCargando(true)
    setRecargar(recargar + 1)
  }

  // Pantallas antes de mostrar el formulario
  const tituloPagina = editando ? 'Editar publicación' : 'Crear publicación'
  if (!token) {
    return (
      <main className={pageStyles}>
        <h1 className={titleStyles}>{tituloPagina}</h1>
        <PublicationMessage>Iniciá sesión para administrar tus publicaciones.</PublicationMessage>
      </main>
    )
  }
  if (cargando) {
    return <main className={pageStyles}><PublicationMessage>Cargando la publicación…</PublicationMessage></main>
  }
  if (editando && !publicacion) {
    return (
      <main className={pageStyles}>
        <h1 className={titleStyles}>{tituloPagina}</h1>
        <PublicationMessage error onRetry={reintentarCarga}>{errorCarga}</PublicationMessage>
        <Link to="/mis-publicaciones">← Mis publicaciones</Link>
      </main>
    )
  }

  const vehiculo = editando ? publicacion : vehiculoElegido
  const desactivada = publicacion?.estado === 'DESACTIVADA'
  const hayCambios = editando && (cambiaronDatos(valores, publicacion) || cambiaronPeriodos(valores, publicacion))
  // Pausar/desactivar solo se puede si no hay cambios sin guardar
  const estadoBloqueado = guardando || hayCambios || desactivada

  // Pasos que se muestran arriba al crear
  const pasos = [
    ['Vehículo', valores.idVehiculo !== ''],
    ['Ubicación', ['direccion', 'zona', 'localidad', 'ciudad', 'provincia', 'codigoPostal', 'horaRetiroDevolucion']
      .every((campo) => valores[campo].trim() !== '') && tieneCoordenadas(valores)],
    ['Precio y días', Number(valores.precioDia) >= 1 && valores.periodos.length > 0],
    ['Descripción', valores.descripcion.trim() !== ''],
  ]

  const calendario = (
    <PublicationAvailability
      key={versionCalendario}
      periodos={valores.periodos}
      onChange={(periodos) => setValores({ ...valores, periodos })}
      onSelectionChange={setInicioPeriodo}
    />
  )

  return (
    <main className={pageStyles + (hayCambios ? ' pb-[9.375rem] phone:pb-[10.625rem]' : ' pb-20 phone:pb-12')}>
      {editando
        ? <Link to="/mis-publicaciones" className={eyebrowStyles + ' inline-block mb-3'}>← Mis publicaciones</Link>
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
              Pausar publicación
              <input
                type="checkbox"
                role="switch"
                checked={publicacion.estado === 'PAUSADA'}
                disabled={estadoBloqueado}
                onChange={() => cambiarEstado(publicacion.estado === 'ACTIVA' ? 'pausar' : 'reactivar')}
                className="appearance-none w-9 h-5 border-0 bg-border rounded-[0.75rem] relative after:content-[''] after:absolute after:left-0.5 after:top-0.5 after:size-4 after:bg-white after:rounded-full checked:bg-gold checked:after:translate-x-4"
              />
            </label>
            <button type="button" disabled className={smallButtonStyles}><PublicationIcon nombre="eye" />Ver como usuario</button>
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

      {mensaje && <PublicationMessage error={esError}>{mensaje}</PublicationMessage>}
      {errorCarga && <PublicationMessage error onRetry={reintentarCarga}>{errorCarga}</PublicationMessage>}
      {guardando && <PublicationMessage>Guardando cambios…</PublicationMessage>}
      {desactivada && <PublicationMessage>Esta publicación está desactivada. No se puede modificar ni reactivar.</PublicationMessage>}

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 mt-8 items-start tablet:grid-cols-1">
        <form id="form-publicacion" onSubmit={guardar} className="min-w-0">
          {/* Mientras se guarda (o si está desactivada) se bloquea todo el formulario */}
          <fieldset disabled={guardando || desactivada} className="grid min-w-0 gap-6 border-0 p-0 m-0">
            <PublicationVehicle editando={editando} vehiculo={vehiculo} seleccionado={valores.idVehiculo} onChange={elegirVehiculo} />

            {editando ? (
              <>
                <PublicationSection titulo="Precio">
                  <PublicationPrice valores={valores} onChange={cambiarCampo} />
                </PublicationSection>
                <PublicationSection titulo="Disponibilidad">
                  <p className={descriptionStyles}>Marcá los períodos en los que se puede reservar el auto. Fuera de ellos, nadie puede elegir esos días.</p>
                  {calendario}
                </PublicationSection>
                <PublicationLocation valores={valores} onChange={cambiarCampo} onUbicacionSeleccionada={seleccionarUbicacion} editando readOnly />
              </>
            ) : (
              <>
                <PublicationLocation valores={valores} onChange={cambiarCampo} onUbicacionSeleccionada={seleccionarUbicacion} />
                <PublicationSection titulo="Precio y días disponibles" numero="3">
                  <PublicationPrice valores={valores} onChange={cambiarCampo} />
                  <p className={descriptionStyles}>Solo se puede reservar dentro de estos períodos. Después los ajustás desde la publicación.</p>
                  {calendario}
                </PublicationSection>
              </>
            )}

            <PublicationSection titulo="Descripción" numero={!editando && '4'}>
              <FormField id="descripcion" label={!editando && 'Contale al cliente cómo es el auto y qué esperás *'}>
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
              </FormField>
              <p className="text-right mt-1.5 text-muted text-[0.6875rem]">{valores.descripcion.length} de 600</p>
            </PublicationSection>

            {editando ? (
              <PublicationSection
                titulo={<><PublicationIcon nombre="warning" />Zona crítica</>}
                className="border-[#fecaca] [&_h2]:font-sans [&_h2]:text-[0.875rem] [&_h2]:text-[#dc2626]"
              >
                <p className="text-muted text-[0.75rem] leading-[1.7] mb-4">
                  Pausar oculta el auto del catálogo y lo podés reactivar cuando quieras. Desactivar lo da de baja definitivamente:
                  las reservas existentes se mantienen, pero la publicación no se puede reactivar.
                </p>
                <div className={actionsStyles}>
                  <button type="button" disabled={estadoBloqueado} className={smallButtonStyles}
                    onClick={() => cambiarEstado(publicacion.estado === 'ACTIVA' ? 'pausar' : 'reactivar')}>
                    {publicacion.estado === 'PAUSADA' ? 'Reactivar publicación' : 'Pausar publicación'}
                  </button>
                  <button type="button" disabled={estadoBloqueado} className={textButtonStyles + ' text-error'}
                    onClick={() => cambiarEstado('desactivar')}>
                    Desactivar publicación
                  </button>
                </div>
              </PublicationSection>
            ) : (
              <div className="flex justify-between gap-4 pt-2">
                <Link to="/mis-publicaciones" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Cancelar</Link>
                <button type="submit" className={btnBase + ' ' + btnDark + ' ' + btnSize}>
                  Publicar <PublicationIcon nombre="arrow" />
                </button>
              </div>
            )}
          </fieldset>
        </form>

        <PublicationPreview vehiculo={vehiculo} valores={valores} editando={editando} />
      </div>

      {hayCambios && (
        <PendingChangesBar onDiscard={descartar} formId="form-publicacion" disabled={guardando} saveDisabled={guardando || desactivada} />
      )}
    </main>
  )
}
