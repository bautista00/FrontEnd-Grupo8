/**
 * Cálculos chicos sobre reservas y reseñas. Las reglas (quién califica, plazo y doble ciego)
 * las valida el backend: acá solo se arman textos y números para mostrar.
 */

import { fechaISO } from './formatos'

const DIAS_PLAZO = 7

// "Ana P."
export function nombreCorto(usuario) {
  if (!usuario) return ''
  return `${usuario.nombre ?? ''} ${usuario.apellido ? usuario.apellido[0] + '.' : ''}`.trim()
}

// Promedio de estrellas, o null si todavía no hay reseñas
export function promedio(resenas) {
  if (!resenas?.length) return null
  return resenas.reduce((suma, resena) => suma + resena.estrellas, 0) / resenas.length
}

// Cantidad de reseñas de 5 a 1 estrellas: [{ estrellas: 5, cantidad: 3 }, ...]
export function distribucion(resenas) {
  return [5, 4, 3, 2, 1].map((estrellas) => ({
    estrellas,
    cantidad: resenas.filter((resena) => resena.estrellas === estrellas).length,
  }))
}

// Reserva confirmada cuya fecha de devolución ya llegó y el propietario todavía no confirmó
export function devolucionPendiente(reserva) {
  const hoy = new Date()
  return reserva.estado === 'CONFIRMADA' && reserva.fechaFin <= fechaISO(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
}

// Último día para calificar: fechaFinalizacion + 7 días (solo para mostrar el texto)
export function plazoCalificacion(reserva) {
  if (!reserva?.fechaFinalizacion) return ''
  const limite = new Date(reserva.fechaFinalizacion)
  limite.setDate(limite.getDate() + DIAS_PLAZO)
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' }).format(limite)
}

// "marzo de 2026"; si no hay fecha (usuarios viejos) no se muestra nada
export function miembroDesde(fechaRegistro) {
  if (!fechaRegistro) return ''
  const fecha = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date(fechaRegistro + 'T12:00:00'))
  return 'Miembro desde ' + fecha
}

// Quién es la otra parte de la reserva y qué rol tiene (el que se va a calificar)
export function otraParteDe(reserva, idUsuario) {
  return reserva.propietario?.idUsuario === idUsuario
    ? { otraParte: reserva.conductor, rol: 'CONDUCTOR' }
    : { otraParte: reserva.propietario, rol: 'PROPIETARIO' }
}
