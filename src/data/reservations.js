// Ejemplos con los campos de ReservaResponse del backend.
export const RESERVAS = [
  {
    idReserva: 1038,
    idPublicacion: 1,
    fechaInicio: '2026-11-05',
    fechaFin: '2026-11-08',
    fechaCreacion: '2026-09-28T10:00:00',
    estado: 'CONFIRMADA',
    precioDiaAplicado: 185000,
    cantidadDias: 3,
    precioTotal: 555000,
  },
  {
    idReserva: 1037,
    idPublicacion: 2,
    fechaInicio: '2026-09-12',
    fechaFin: '2026-09-15',
    fechaCreacion: '2026-09-01T10:00:00',
    estado: 'FINALIZADA',
    precioDiaAplicado: 204000,
    cantidadDias: 3,
    precioTotal: 612000,
  },
  {
    idReserva: 1036,
    idPublicacion: 4,
    fechaInicio: '2026-10-20',
    fechaFin: '2026-10-22',
    fechaCreacion: '2026-10-02T10:00:00',
    estado: 'CANCELADA',
    precioDiaAplicado: 144000,
    cantidadDias: 2,
    precioTotal: 288000,
  },
  {
    idReserva: 1035,
    idPublicacion: 5,
    fechaInicio: '2026-10-25',
    fechaFin: '2026-10-28',
    fechaCreacion: '2026-10-03T10:00:00',
    estado: 'RECHAZADA',
    precioDiaAplicado: 210000,
    cantidadDias: 3,
    precioTotal: 630000,
  },
]

// PagoResponse es otra respuesta: se relaciona por idReserva.
export const PAGOS = [
  {
    idPago: 1,
    idReserva: 1038,
    fecha: '2026-09-28',
    monto: 555000,
    estado: 'APROBADO',
    metodo: 'EFECTIVO',
    preferenceId: null,
    mercadoPagoPaymentId: null,
  },
]
