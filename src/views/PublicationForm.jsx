import { pageStyles, headingStyles, titleStyles, eyebrowStyles, introStyles, descriptionStyles, actionsStyles, textButtonStyles, smallButtonStyles } from '../components/publicaciones/publicationStyles'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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

function valoresIniciales(publicacion) {
  return {
    idVehiculo: publicacion?.idVehiculo ? String(publicacion.idVehiculo) : '',
    precioDia: publicacion?.precioDia ?? '',
    descuentoPorcentaje: publicacion?.descuentoPorcentaje ?? '',
    direccion: publicacion?.direccion ?? '',
    zona: publicacion?.zona ?? '',
    localidad: publicacion?.localidad ?? '',
    ciudad: publicacion?.ciudad ?? '',
    provincia: publicacion?.provincia ?? '',
    codigoPostal: publicacion?.codigoPostal ?? '',
    horaRetiroDevolucion: publicacion?.horaRetiroDevolucion ?? '',
    descripcion: publicacion?.descripcion ?? '',
    periodos: publicacion?.periodos ?? [],
  }
}

export default function PublicationForm({ modo = 'crear', publicacion, vehiculos = [], rutaRegistroVehiculo }) {
  const editando = modo === 'editar'
  const [valores, setValores] = useState(() => valoresIniciales(publicacion))
  const [versionFormulario, setVersionFormulario] = useState(0)
  const iniciales = valoresIniciales(publicacion)
  const hayCambios = JSON.stringify(valores) !== JSON.stringify(iniciales)
  const vehiculo = editando ? publicacion : vehiculos.find((item) => String(item.idVehiculo) === valores.idVehiculo)
  const pasos = [
    ['Vehículo', Boolean(valores.idVehiculo)],
    ['Ubicación', ['direccion', 'zona', 'localidad', 'ciudad', 'provincia', 'codigoPostal', 'horaRetiroDevolucion']
      .every((campo) => valores[campo].trim() !== '')],
    ['Precio y días', valores.precioDia !== '' && Number(valores.precioDia) >= 1
      && Number(valores.descuentoPorcentaje || 0) >= 0 && Number(valores.descuentoPorcentaje || 0) <= 50
      && valores.periodos.length > 0],
    ['Descripción', Boolean(valores.descripcion.trim())],
  ]

  function cambiarCampo(event) {
    const { name, value } = event.target
    setValores({ ...valores, [name]: value })
  }

  function cambiarPeriodos(periodos) {
    setValores({ ...valores, periodos })
  }

  function descartar() {
    setValores(valoresIniciales(publicacion))
    setVersionFormulario(versionFormulario + 1)
  }

  return (
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
          <label className="flex items-center gap-2 text-[12px] text-soft">Pausar publicación <input type="checkbox" role="switch" disabled className="appearance-none w-9 h-5 border-0 bg-border rounded-[12px] relative after:content-[''] after:absolute after:left-0.5 after:top-0.5 after:size-4 after:bg-white after:rounded-full" /></label>
          <button type="button" disabled className={smallButtonStyles}><PublicationIcon nombre="eye" />Ver como usuario</button>
        </div>}
      </div>
      {!editando && <ol className="grid grid-cols-4 gap-4 m-0 mt-6 p-0 pb-4 border-b border-border list-none phone:grid-cols-2">
        {pasos.map(([etiqueta, completo], indice) => <li key={etiqueta} className={'flex flex-col gap-[3px] pt-2 border-t-2 text-[12px] ' + (completo ? 'border-ink text-ink' : 'border-border text-muted')}>
          <strong className="font-medium">{String(indice + 1).padStart(2, '0') + ' ' + etiqueta}</strong><span className={'text-[11px]' + (completo ? ' text-gold' : '')}>{completo ? 'Completo' : 'Pendiente'}</span>
        </li>)}
      </ol>}
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 mt-8 items-start tablet:grid-cols-1">
        <form onSubmit={(event) => event.preventDefault()} className="grid min-w-0 gap-6">
          <PublicationVehicle editando={editando} vehiculo={vehiculo} vehiculos={vehiculos}
            seleccionado={valores.idVehiculo} onChange={(idVehiculo) => setValores({ ...valores, idVehiculo })}
            rutaRegistro={rutaRegistroVehiculo} />
          {editando ? <>
            <PublicationSection titulo="Precio"><PublicationPrice valores={valores} onChange={cambiarCampo} /></PublicationSection>
            <PublicationSection titulo="Disponibilidad">
              <p className={descriptionStyles}>Marcá los períodos en los que se puede reservar el auto. Fuera de ellos, nadie puede elegir esos días.</p>
              <PublicationAvailability key={versionFormulario} periodos={valores.periodos} onChange={cambiarPeriodos} />
            </PublicationSection>
            <PublicationLocation valores={valores} onChange={cambiarCampo} editando />
          </> : <>
            <PublicationLocation valores={valores} onChange={cambiarCampo} />
            <PublicationSection titulo="Precio y días disponibles" numero="3">
              <PublicationPrice valores={valores} onChange={cambiarCampo} />
              <p className={descriptionStyles}>Solo se puede reservar dentro de estos períodos. Después los ajustás desde la publicación.</p>
              <PublicationAvailability key={versionFormulario} periodos={valores.periodos} onChange={cambiarPeriodos} />
            </PublicationSection>
          </>}
          <PublicationSection titulo="Descripción" numero={!editando && '4'}>
            <FormField id="descripcion" label={!editando && 'Contale al cliente cómo es el auto y qué esperás *'}>
              <textarea id="descripcion" name="descripcion" aria-label="Descripción del alquiler" rows={5} maxLength={600}
                className={inputStyles + ' font-sans resize-y'} placeholder="Estado del auto, cómo se entrega, si puede salir de la provincia…"
                value={valores.descripcion} onChange={cambiarCampo} />
            </FormField>
            <p className="text-right mt-1.5 text-muted text-[11px]">{valores.descripcion.length} de 600</p>
          </PublicationSection>
          {editando ? <PublicationSection titulo={<><PublicationIcon nombre="warning" />Zona crítica</>} className="border-[#fecaca] [&_h2]:font-sans [&_h2]:text-[14px] [&_h2]:text-[#dc2626]">
            <p className="text-muted text-[12px] leading-[1.7] mb-4">Pausar oculta el auto del catálogo y lo podés reactivar cuando quieras. Desactivar lo da de baja definitivamente: las reservas existentes se mantienen, pero la publicación no se puede reactivar.</p>
            <div className={actionsStyles}>
              <button type="button" disabled className={smallButtonStyles}>Pausar publicación</button>
              <button type="button" disabled className={textButtonStyles + ' text-error'}>Desactivar publicación</button>
            </div>
          </PublicationSection> : <div className="flex justify-between gap-4 pt-2">
            <Link to="/mis-publicaciones" className={btnBase + ' ' + btnOutline + ' ' + btnSize}>Cancelar</Link>
            <button type="submit" disabled className={btnBase + ' ' + btnDark + ' ' + btnSize}>Publicar <PublicationIcon nombre="arrow" /></button>
          </div>}
        </form>
        <PublicationPreview vehiculo={vehiculo} valores={valores} editando={editando} />
      </div>
      {editando && hayCambios && <PendingChangesBar onDiscard={descartar} />}
    </main>
  )
}
