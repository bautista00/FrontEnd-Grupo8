import { obtener, enviar, subirArchivo } from './api.js'

// Patentes argentinas: formato nuevo (AB123CD) y formato anterior (ABC123).
const PATENTE_NUEVA_REGEX = /^[A-Z]{2}\d{3}[A-Z]{2}$/
const PATENTE_ANTIGUA_REGEX = /^[A-Z]{3}\d{3}$/

export const ANIO_MIN = 1990
export const ANIO_ACTUAL = new Date().getFullYear()
// Se admite el año siguiente porque los modelos nuevos salen antes de que termine el año.
export const ANIO_MAX = ANIO_ACTUAL + 1
export const ASIENTOS_MIN = 1
export const ASIENTOS_MAX = 9
export const ASIENTOS_POR_DEFECTO = 5
export const FOTO_TIPO_PERMITIDA = ['image/jpeg', 'image/png']
export const FOTO_MAX_MB = 10

export function normalizarPatente(valor) {
  return String(valor ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function patenteValida(valor) {
  const patente = normalizarPatente(valor)
  return PATENTE_NUEVA_REGEX.test(patente) || PATENTE_ANTIGUA_REGEX.test(patente)
}

// Los valores del formulario son siempre strings (vienen de inputs y selects).
// `tipos` son los del backend: en el alta se preselecciona el primero para que el select no quede vacío.
export function valoresInicialesVehiculo(vehiculo, tipos = []) {
  const idTipoVehiculo = vehiculo ? vehiculo.idTipoVehiculo : tipos[0]?.idTipoVehiculo
  return {
    patente: vehiculo?.patente ?? '',
    idTipoVehiculo: String(idTipoVehiculo ?? ''),
    marca: vehiculo?.marca ?? '',
    modelo: vehiculo?.modelo ?? '',
    anio: String(vehiculo?.anio ?? ANIO_ACTUAL),
    color: vehiculo?.color ?? '',
    cantidadAsientos: String(vehiculo?.cantidadAsientos ?? ASIENTOS_POR_DEFECTO),
  }
}

// `tipos`: los tipos de vehículo del backend.
// `otrosVehiculos`: el resto de la flota, para detectar patentes repetidas.
export function validarVehiculo(valores, tipos, otrosVehiculos = []) {
  const errores = {}

  if (!valores.patente.trim()) errores.patente = 'La patente es obligatoria'
  else if (!patenteValida(valores.patente)) errores.patente = 'La patente no es válida. Ejemplos: AB123CD o ABC123'
  else if (otrosVehiculos.some((otro) => normalizarPatente(otro.patente) === normalizarPatente(valores.patente))) {
    errores.patente = 'Ya registraste un vehículo con esa patente'
  }

  if (!tipos.some((tipo) => String(tipo.idTipoVehiculo) === valores.idTipoVehiculo)) {
    errores.idTipoVehiculo = 'Elegí un tipo de vehículo'
  }

  if (!valores.marca.trim()) errores.marca = 'La marca es obligatoria'
  if (!valores.modelo.trim()) errores.modelo = 'El modelo es obligatorio'
  if (!valores.color.trim()) errores.color = 'El color es obligatorio'

  const anio = Number(valores.anio)
  if (valores.anio === '' || !Number.isInteger(anio) || anio < ANIO_MIN || anio > ANIO_MAX) {
    errores.anio = `El año debe estar entre ${ANIO_MIN} y ${ANIO_MAX}`
  }

  const asientos = Number(valores.cantidadAsientos)
  if (valores.cantidadAsientos === '' || !Number.isInteger(asientos) || asientos < ASIENTOS_MIN || asientos > ASIENTOS_MAX) {
    errores.cantidadAsientos = `Los asientos deben estar entre ${ASIENTOS_MIN} y ${ASIENTOS_MAX}`
  }

  return errores
}

export function valoresAVehiculo(valores) {
  return {
    patente: normalizarPatente(valores.patente),
    idTipoVehiculo: Number(valores.idTipoVehiculo),
    marca: valores.marca.trim(),
    modelo: valores.modelo.trim(),
    anio: Number(valores.anio),
    color: valores.color.trim(),
    cantidadAsientos: Number(valores.cantidadAsientos),
  }
}

// Devuelve un mensaje de error, o null si el archivo es válido.
export function validarArchivoFoto(archivo) {
  if (!FOTO_TIPO_PERMITIDA.includes(archivo.type)) {
    return 'solo se permiten archivos JPG o PNG'
  }
  if (archivo.size > FOTO_MAX_MB * 1024 * 1024) {
    return `supera el máximo de ${FOTO_MAX_MB} MB`
  }
  return null
}

// Reasigna `orden` según la posición: la primera foto es la portada.
const reordenar = (fotos) => fotos.map((foto, indice) => ({ ...foto, orden: indice + 1 }))

export function moverFoto(fotos, indice, desplazamiento) {
  const destino = indice + desplazamiento
  if (destino < 0 || destino >= fotos.length) return fotos
  const copia = [...fotos]
  ;[copia[indice], copia[destino]] = [copia[destino], copia[indice]]
  return reordenar(copia)
}

export function quitarFoto(fotos, indice) {
  return reordenar(fotos.filter((_, posicion) => posicion !== indice))
}

export function agregarFotos(fotos, nuevas) {
  return reordenar([...fotos, ...nuevas])
}

export const portadaDe = (vehiculo) => {
  if (!vehiculo) return null
  return vehiculo.fotos[0]?.url || null
}

export const tieneFotos = (vehiculo) => vehiculo.fotos.length > 0
export const puedePublicar = (vehiculo) => tieneFotos(vehiculo)

// Fotos guardadas de un vehículo, con la forma que usan PhotoTile y las funciones de arriba.
// El backend ya las devuelve ordenadas por "orden"; la primera es la portada.
export async function fotosDeVehiculo(idVehiculo) {
  const imagenes = await obtener(`/imagen-vehiculo/por-vehiculo/${idVehiculo}`)
  return imagenes.map((imagen) => ({
    idFoto: imagen.id,
    orden: imagen.orden,
    url: `data:image/jpeg;base64,${imagen.file}`,
  }))
}

// Publicaciones ACTIVAS o PAUSADAS del usuario. Un vehículo tiene a lo sumo una.
// Se piden todas en un solo pedido y se descartan las desactivadas.
async function publicacionesVigentes(token) {
  const publicaciones = await obtener('/publicaciones/mias?size=100', token)
  return publicaciones.content.filter((publicacion) => publicacion.estado !== 'DESACTIVADA')
}

const publicacionDe = (publicaciones, idVehiculo) =>
  publicaciones.find((publicacion) => publicacion.idVehiculo === Number(idVehiculo)) ?? null

// Publicación ACTIVA o PAUSADA del vehículo (o null). Define si se ofrece "Guardar y crear publicación".
export async function publicacionActualDe(token, idVehiculo) {
  return publicacionDe(await publicacionesVigentes(token), idVehiculo)
}

export const VEHICULOS_POR_PAGINA = 9
// Arma lo que necesita MyVehicleCard. El backend no manda las fotos ni la publicación
// dentro del vehículo, así que se piden aparte y se unen por idVehiculo.
export async function cargarMisVehiculos(token, pagina) {
  const [vehiculos, publicaciones] = await Promise.all([
    obtener(`/vehiculo/mios?page=${pagina}&size=${VEHICULOS_POR_PAGINA}`, token),
    publicacionesVigentes(token),
  ])

  const content = await Promise.all(vehiculos.content.map(async (vehiculo) => ({
    ...vehiculo,
    fotos: await fotosDeVehiculo(vehiculo.idVehiculo),
    publicacionActual: publicacionDe(publicaciones, vehiculo.idVehiculo),
  })))

  return { ...vehiculos, content }
}

// Lleva al backend las diferencias entre las fotos guardadas (`originales`) y las de la pantalla (`actuales`):
// borra las quitadas, sube las nuevas y actualiza el orden de las que cambiaron de lugar.
export async function sincronizarFotos(token, idVehiculo, originales, actuales) {
  const idsActuales = new Set(actuales.map((foto) => foto.idFoto))

  for (const foto of originales) {
    if (!idsActuales.has(foto.idFoto)) {
      await enviar(`/imagen-vehiculo/${foto.idFoto}`, 'DELETE', token, null, 'No se pudo borrar una foto.')
    }
  }

  for (const foto of actuales) {
    if (foto.archivo) {
      const form = new FormData()
      form.append('file', foto.archivo)
      form.append('idVehiculo', idVehiculo)
      form.append('orden', foto.orden)
      await subirArchivo('/imagen-vehiculo', 'POST', token, form, 'No se pudo subir una foto.')
    } else {
      const original = originales.find((otra) => otra.idFoto === foto.idFoto)
      if (original && original.orden !== foto.orden) {
        // El backend lee "orden" como parámetro, por eso va en la URL
        await enviar(`/imagen-vehiculo/${foto.idFoto}?orden=${foto.orden}`, 'PUT', token, null, 'No se pudo cambiar el orden de las fotos.')
      }
    }
  }
}
