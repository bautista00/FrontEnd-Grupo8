import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken, mensajeDe } from "../../utils/api";
import { logout } from "./userSlice";

const SIN_CONEXION = "No pudimos conectar con el servidor. Intentá nuevamente.";

// Mensaje para mostrar cuando falla un pedido: si axios no recibió respuesta, es un problema de conexión
function mensajeDeError(error, porDefecto, sinRespuesta = SIN_CONEXION) {
  if (error.response) return mensajeDe(error, porDefecto);
  if (axios.isAxiosError(error)) return sinRespuesta;
  return error.message || porDefecto;
}

// Pago opcional del listado: un 404 significa que la reserva no tiene pago.
async function pagoDeReserva(idReserva, config) {
  try {
    const respuesta = await axios.get(`${API_URL}/pagos/reserva/${idReserva}`, config);
    return respuesta.data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

// Publicaciones de las reservas, sin consultar dos veces la que aparece en varias
async function publicacionesDe(reservas, config) {
  const ids = [...new Set(reservas.map((reserva) => reserva.idPublicacion))];
  return Promise.all(ids.map(async (idPublicacion) => (await axios.get(`${API_URL}/publicaciones/${idPublicacion}`, config)).data));
}

// Mis reservas con las publicaciones y los pagos que necesitan sus tarjetas
export const fetchMisReservas = createAsyncThunk("reservas/fetchMisReservas", async (_, { getState }) => {
  try {
    const config = conToken(getState().users.token);
    const { data } = await axios.get(`${API_URL}/reservas/mias`, config);
    const reservas = data.content;

    const pedidosPublicaciones = publicacionesDe(reservas, config);
    // Los pagos se consultan en paralelo con las publicaciones
    const pedidosPagos = reservas.map((reserva) => pagoDeReserva(reserva.idReserva, config));

    const [publicaciones, pagos] = await Promise.all([pedidosPublicaciones, Promise.all(pedidosPagos)]);
    return { reservas, publicaciones, pagos: pagos.filter((pago) => pago !== null) };
  } catch (error) {
    throw new Error(mensajeDeError(error, "No pudimos cargar tus reservas."), { cause: error });
  }
});

// Reservas de los autos del usuario (vista del propietario), con sus publicaciones
export const fetchReservasDeMisVehiculos = createAsyncThunk("reservas/fetchReservasDeMisVehiculos", async (_, { getState }) => {
  try {
    const config = conToken(getState().users.token);
    const { data } = await axios.get(`${API_URL}/reservas/de-mis-vehiculos`, config);
    return { reservas: data.content, publicaciones: await publicacionesDe(data.content, config) };
  } catch (error) {
    throw new Error(mensajeDeError(error, "No pudimos cargar las reservas de tus autos."), { cause: error });
  }
});

export const finalizarReserva = createAsyncThunk("reservas/finalizarReserva", async ({ idReserva }, { getState, requestId, rejectWithValue }) => {
  const token = getState().users.token;
  const cambioSesion = () => getState().users.token !== token || getState().reservas.requestIdFinalizar !== requestId;
  try {
    const { data } = await axios.put(`${API_URL}/reservas/${idReserva}/finalizar`, null, conToken(token));
    if (cambioSesion()) return rejectWithValue({ solicitudVencida: true });
    return data;
  } catch (error) {
    if (cambioSesion()) return rejectWithValue({ solicitudVencida: true });
    throw new Error(mensajeDeError(error, "No se pudo confirmar la devolución."), { cause: error });
  }
}, { condition: (_, { getState }) => Boolean(getState().users.token) && !getState().reservas.finalizando });

// Recupera una reserva autorizada cuando no está en la sesión actual.
export const fetchReserva = createAsyncThunk(
  "reservas/fetchReserva",
  async (idReserva, { getState }) => {
    try {
      const config = conToken(getState().users.token);
      const { data: reserva } = await axios.get(`${API_URL}/reservas/${idReserva}`, config);
      const idUsuario = getState().users.user?.idUsuario;
      const esPropietario = String(reserva.propietario?.idUsuario) === String(idUsuario);
      const esConductor = String(reserva.conductor?.idUsuario) === String(idUsuario);
      const pago = esPropietario && !esConductor ? null : await pagoDeReserva(idReserva, config);
      return { reserva, pago };
    } catch (error) {
      throw new Error(mensajeDeError(error, "No pudimos cargar tu reserva."), { cause: error });
    }
  },
  {
    condition: (idReserva, { getState }) => Boolean(idReserva) && Boolean(getState().users.token)
      && !(getState().reservas.loadingDetalle
        && String(getState().reservas.idReservaDetalle) === String(idReserva)),
  },
);

// Verifica juntos el pago y la reserva al volver de Mercado Pago.
export const fetchPagoReserva = createAsyncThunk(
  "reservas/fetchPagoReserva",
  async (idReserva, { getState, requestId, rejectWithValue }) => {
    const token = getState().users.token;
    try {
      const config = conToken(token);
      const [{ data: pago }, { data: reserva }] = await Promise.all([
        axios.get(`${API_URL}/pagos/reserva/${idReserva}`, config),
        axios.get(`${API_URL}/reservas/${idReserva}`, config),
      ]);
      if (getState().users.token !== token || getState().reservas.requestIdPago !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      if (String(pago?.idReserva) !== String(idReserva) || String(reserva?.idReserva) !== String(idReserva)) {
        throw new Error("No se pudo identificar el pago y su reserva.");
      }
      return { pago, reserva };
    } catch (error) {
      if (getState().users.token !== token || getState().reservas.requestIdPago !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      throw new Error(mensajeDeError(error, "No se pudo consultar el pago."), { cause: error });
    }
  },
  {
    condition: (idReserva, { getState }) => Boolean(idReserva) && Boolean(getState().users.token)
      && !(getState().reservas.loadingPago && String(getState().reservas.idReservaPago) === String(idReserva)),
  },
);

// Obtiene los datos de retiro autorizados después de crear la reserva.
export const fetchPublicacionResultado = createAsyncThunk(
  "reservas/fetchPublicacionResultado",
  async ({ idPublicacion }, { getState, requestId, rejectWithValue }) => {
    const token = getState().users.token;
    try {
      const respuesta = await axios.get(`${API_URL}/publicaciones/${idPublicacion}`, conToken(token));
      if (getState().users.token !== token || getState().reservas.requestIdResultado !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      return respuesta.data;
    } catch (error) {
      if (getState().users.token !== token || getState().reservas.requestIdResultado !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      throw new Error(mensajeDeError(error, "No se pudo consultar la publicación."), { cause: error });
    }
  },
  {
    condition: ({ idReserva, idPublicacion }, { getState }) => {
      const { users, reservas } = getState();
      return Boolean(users.token) && Boolean(idReserva) && Boolean(idPublicacion)
        && !(reservas.loadingResultado
          && String(reservas.idReservaResultado) === String(idReserva)
          && String(reservas.idPublicacionResultado) === String(idPublicacion));
    },
  },
);

// Confirma el carrito con el método elegido y conserva los identificadores reales del backend.
export const confirmarCarrito = createAsyncThunk(
  "reservas/confirmarCarrito",
  async ({ idCarrito, metodoPago }, { getState, requestId, rejectWithValue }) => {
    const token = getState().users.token;
    const carrito = getState().carrito.carrito;
    try {
      const { data } = await axios.post(
        `${API_URL}/carritos/${idCarrito}/confirmar`,
        { metodoPago },
        conToken(token),
      );
      if (getState().users.token !== token || getState().reservas.requestIdConfirmar !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      return {
        ...data,
        reserva: {
          idReserva: data.idReserva,
          idPublicacion: carrito.idPublicacion,
          estado: data.estadoReserva,
          fechaInicio: carrito.fechaInicio,
          fechaFin: carrito.fechaFin,
          cantidadDias: carrito.cantidadDias,
          precioDiaAplicado: carrito.precioDiaAplicado,
          precioTotal: data.monto,
        },
        pago: {
          idPago: data.idPago,
          idReserva: data.idReserva,
          estado: data.estadoPago,
          metodo: metodoPago,
          monto: data.monto,
        },
      };
    } catch (error) {
      if (getState().users.token !== token || getState().reservas.requestIdConfirmar !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      throw new Error(mensajeDeError(error, "No se pudo crear la reserva.", "No recibimos confirmación. Revisá Mis reservas antes de volver a confirmar o pagar."), { cause: error });
    }
  },
  {
    condition: ({ idCarrito }, { getState }) => {
      const { users, carrito, reservas } = getState();
      return Boolean(users.token) && Boolean(carrito.carrito)
        && String(carrito.carrito.idCarrito) === String(idCarrito)
        && carrito.carritoConsultado && !carrito.resultadoIncierto && !carrito.loading
        && !carrito.agregando && !carrito.guardandoFechas && !carrito.quitando
        && !reservas.confirmando && !reservas.loadingCheckout
        && !(String(reservas.idCarritoConfirmacion) === String(idCarrito) && reservas.confirmacion);
    },
  },
);

// Solicita el checkout de un pago existente; no crea otra reserva ni otro pago.
export const crearCheckout = createAsyncThunk(
  "reservas/crearCheckout",
  async ({ idPago }, { getState, requestId, rejectWithValue }) => {
    const token = getState().users.token;
    try {
      const { data } = await axios.post(`${API_URL}/pagos/${idPago}/checkout`, null, conToken(token));
      if (getState().users.token !== token || getState().reservas.requestIdCheckout !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      return data;
    } catch (error) {
      if (getState().users.token !== token || getState().reservas.requestIdCheckout !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      throw new Error(mensajeDeError(error, "No se pudo iniciar el pago."), { cause: error });
    }
  },
  {
    condition: ({ idPago }, { getState }) => Boolean(idPago)
      && Boolean(getState().users.token) && !getState().reservas.loadingCheckout
      && !getState().reservas.cancelando,
  },
);

// Cancela la reserva existente y devuelve su nuevo estado, sin volver a consultar el listado.
export const cancelarReserva = createAsyncThunk(
  "reservas/cancelarReserva",
  async ({ idReserva }, { getState, requestId, rejectWithValue }) => {
    const token = getState().users.token;
    try {
      const respuesta = await axios.put(`${API_URL}/reservas/${idReserva}/cancelar`, null, conToken(token));
      if (getState().users.token !== token || getState().reservas.requestIdCancelar !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      return respuesta.data;
    } catch (error) {
      if (getState().users.token !== token || getState().reservas.requestIdCancelar !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      throw new Error(mensajeDeError(error, "No se pudo cancelar la reserva.", "No recibimos confirmación de la cancelación. Consultá Mis reservas para comprobar su estado."), { cause: error });
    }
  },
  {
    condition: ({ idReserva }, { getState }) => {
      const { users, reservas } = getState();
      const reserva = reservas.reservas.find((item) => String(item.idReserva) === String(idReserva));
      return Boolean(idReserva) && Boolean(users.token) && !reservas.cancelando
        && !reservas.loadingCheckout
        && (!reserva || ["PENDIENTE", "CONFIRMADA"].includes(reserva.estado));
    },
  },
);

const initialState = {
  reservaDetalle: null,
  pagoDetalle: null,
  idReservaDetalle: null,
  loadingDetalle: false,
  errorDetalle: null,
  requestIdDetalle: null,
  cambiosDuranteCarga: [],
  cargadas: false,
  reservas: [],
  publicaciones: [],
  pagos: [],
  loading: false,
  error: null,
  requestIdReservas: null,
  reservasDeMisAutos: [],
  publicacionesDeMisAutos: [],
  cargadasDeMisAutos: false,
  loadingDeMisAutos: false,
  errorDeMisAutos: null,
  requestIdDeMisAutos: null,
  cambiosAutosDuranteCarga: [],
  finalizando: false,
  errorFinalizar: null,
  idReservaFinalizar: null,
  requestIdFinalizar: null,
  reservaFinalizada: null,
  publicacionResultado: null,
  loadingResultado: false,
  errorResultado: null,
  idReservaResultado: null,
  idPublicacionResultado: null,
  requestIdResultado: null,
  pago: null,
  reservaPago: null,
  loadingPago: false,
  errorPago: null,
  idReservaPago: null,
  requestIdPago: null,
  confirmacion: null,
  idCarritoConfirmacion: null,
  confirmando: false,
  errorConfirmar: null,
  requestIdConfirmar: null,
  checkout: null,
  idPagoCheckout: null,
  loadingCheckout: false,
  errorCheckout: null,
  requestIdCheckout: null,
  cancelando: false,
  reservaCancelada: null,
  errorCancelar: null,
  idReservaCancelar: null,
  requestIdCancelar: null,
};

const reservasSlice = createSlice({
  name: "reservas",
  initialState,
  reducers: {
    limpiarErrorFinalizar: (state) => { state.errorFinalizar = null; },
    limpiarErrorCancelar: (state) => {
      state.errorCancelar = null;
      state.idReservaCancelar = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMisReservas.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.requestIdReservas = action.meta.requestId;
        state.cambiosDuranteCarga = [];
      })
      .addCase(fetchMisReservas.fulfilled, (state, action) => {
        if (state.requestIdReservas !== action.meta.requestId) return;
        state.loading = false;
        state.cargadas = true;
        state.reservas = action.payload.reservas.map((reserva) =>
          state.cambiosDuranteCarga.find((cambio) => cambio.idReserva === reserva.idReserva) ?? reserva);
        state.cambiosDuranteCarga = [];
        state.publicaciones = action.payload.publicaciones;
        state.pagos = action.payload.pagos;
      })
      .addCase(fetchMisReservas.rejected, (state, action) => {
        if (state.requestIdReservas !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchReserva.pending, (state, action) => {
        state.loadingDetalle = true;
        state.errorDetalle = null;
        state.reservaDetalle = null;
        state.pagoDetalle = null;
        state.idReservaDetalle = action.meta.arg;
        state.requestIdDetalle = action.meta.requestId;
      })
      .addCase(fetchReserva.fulfilled, (state, action) => {
        if (state.requestIdDetalle !== action.meta.requestId) return;
        state.loadingDetalle = false;
        state.requestIdDetalle = null;
        const reserva = action.payload.reserva;
        const cambio = [state.reservaCancelada, state.reservaFinalizada]
          .find((item) => item?.idReserva === reserva.idReserva);
        state.reservaDetalle = cambio ?? reserva;
        state.pagoDetalle = action.payload.pago;
      })
      .addCase(fetchReserva.rejected, (state, action) => {
        if (state.requestIdDetalle !== action.meta.requestId) return;
        state.loadingDetalle = false;
        state.requestIdDetalle = null;
        state.errorDetalle = action.error.message;
      })
      .addCase(fetchReservasDeMisVehiculos.pending, (state, action) => {
        state.loadingDeMisAutos = true;
        state.errorDeMisAutos = null;
        state.requestIdDeMisAutos = action.meta.requestId;
        state.cambiosAutosDuranteCarga = [];
      })
      .addCase(fetchReservasDeMisVehiculos.fulfilled, (state, action) => {
        if (state.requestIdDeMisAutos !== action.meta.requestId) return;
        state.loadingDeMisAutos = false;
        state.requestIdDeMisAutos = null;
        state.cargadasDeMisAutos = true;
        state.reservasDeMisAutos = action.payload.reservas.map((reserva) =>
          state.cambiosAutosDuranteCarga.find((item) => item.idReserva === reserva.idReserva) ?? reserva);
        state.cambiosAutosDuranteCarga = [];
        state.publicacionesDeMisAutos = action.payload.publicaciones;
      })
      .addCase(fetchReservasDeMisVehiculos.rejected, (state, action) => {
        if (state.requestIdDeMisAutos !== action.meta.requestId) return;
        state.loadingDeMisAutos = false;
        state.requestIdDeMisAutos = null;
        state.errorDeMisAutos = action.error.message;
        state.cambiosAutosDuranteCarga = [];
      })
      .addCase(finalizarReserva.pending, (state, action) => {
        state.finalizando = true;
        state.errorFinalizar = null;
        state.idReservaFinalizar = action.meta.arg.idReserva;
        state.requestIdFinalizar = action.meta.requestId;
      })
      .addCase(finalizarReserva.fulfilled, (state, action) => {
        if (state.requestIdFinalizar !== action.meta.requestId) return;
        state.finalizando = false;
        state.requestIdFinalizar = null;
        const reserva = action.payload;
        state.reservaFinalizada = reserva;
        for (const lista of [state.reservas, state.reservasDeMisAutos]) {
          const indice = lista.findIndex((item) => item.idReserva === reserva.idReserva);
          if (indice !== -1) lista[indice] = reserva;
        }
        if (state.loading) state.cambiosDuranteCarga.push(reserva);
        if (state.loadingDeMisAutos) state.cambiosAutosDuranteCarga.push(reserva);
        if (state.reservaDetalle?.idReserva === reserva.idReserva) state.reservaDetalle = reserva;
        if (state.reservaPago?.idReserva === reserva.idReserva) state.reservaPago = reserva;
      })
      .addCase(finalizarReserva.rejected, (state, action) => {
        if (state.requestIdFinalizar !== action.meta.requestId) return;
        state.finalizando = false;
        state.requestIdFinalizar = null;
        if (!action.payload?.solicitudVencida) state.errorFinalizar = action.error.message;
      })
      .addCase(fetchPagoReserva.pending, (state, action) => {
        state.loadingPago = true;
        state.errorPago = null;
        state.pago = null;
        state.reservaPago = null;
        state.idReservaPago = action.meta.arg;
        state.requestIdPago = action.meta.requestId;
      })
      .addCase(fetchPagoReserva.fulfilled, (state, action) => {
        if (state.requestIdPago !== action.meta.requestId) return;
        state.loadingPago = false;
        state.requestIdPago = null;
        state.pago = action.payload.pago;
        state.reservaPago = action.payload.reserva;
      })
      .addCase(fetchPagoReserva.rejected, (state, action) => {
        if (state.requestIdPago !== action.meta.requestId) return;
        state.loadingPago = false;
        state.requestIdPago = null;
        if (!action.payload?.solicitudVencida) state.errorPago = action.error.message;
      })
      .addCase(fetchPublicacionResultado.pending, (state, action) => {
        state.loadingResultado = true;
        state.errorResultado = null;
        state.publicacionResultado = null;
        state.idReservaResultado = action.meta.arg.idReserva;
        state.idPublicacionResultado = action.meta.arg.idPublicacion;
        state.requestIdResultado = action.meta.requestId;
      })
      .addCase(fetchPublicacionResultado.fulfilled, (state, action) => {
        if (state.requestIdResultado !== action.meta.requestId) return;
        state.loadingResultado = false;
        state.requestIdResultado = null;
        state.publicacionResultado = action.payload;
      })
      .addCase(fetchPublicacionResultado.rejected, (state, action) => {
        if (state.requestIdResultado !== action.meta.requestId) return;
        state.loadingResultado = false;
        state.requestIdResultado = null;
        if (!action.payload?.solicitudVencida) state.errorResultado = action.error.message;
      })
      .addCase(confirmarCarrito.pending, (state, action) => {
        state.confirmando = true;
        state.errorConfirmar = null;
        state.confirmacion = null;
        state.idCarritoConfirmacion = action.meta.arg.idCarrito;
        state.requestIdConfirmar = action.meta.requestId;
      })
      .addCase(confirmarCarrito.fulfilled, (state, action) => {
        if (state.requestIdConfirmar !== action.meta.requestId) return;
        state.confirmando = false;
        state.requestIdConfirmar = null;
        state.confirmacion = action.payload;
        state.reservaDetalle = action.payload.reserva;
        state.pagoDetalle = action.payload.pago;
        state.idReservaDetalle = action.payload.idReserva;
        state.errorDetalle = null;
        state.requestIdDetalle = null;
        state.loadingDetalle = false;
      })
      .addCase(confirmarCarrito.rejected, (state, action) => {
        if (state.requestIdConfirmar !== action.meta.requestId) return;
        state.confirmando = false;
        state.requestIdConfirmar = null;
        if (!action.payload?.solicitudVencida) state.errorConfirmar = action.error.message;
      })
      .addCase(crearCheckout.pending, (state, action) => {
        state.loadingCheckout = true;
        state.errorCheckout = null;
        state.checkout = null;
        state.idPagoCheckout = action.meta.arg.idPago;
        state.requestIdCheckout = action.meta.requestId;
      })
      .addCase(crearCheckout.fulfilled, (state, action) => {
        if (state.requestIdCheckout !== action.meta.requestId) return;
        state.loadingCheckout = false;
        state.requestIdCheckout = null;
        state.checkout = action.payload;
      })
      .addCase(crearCheckout.rejected, (state, action) => {
        if (state.requestIdCheckout !== action.meta.requestId) return;
        state.loadingCheckout = false;
        state.requestIdCheckout = null;
        if (!action.payload?.solicitudVencida) state.errorCheckout = action.error.message;
      })
      .addCase(cancelarReserva.pending, (state, action) => {
        state.cancelando = true;
        state.errorCancelar = null;
        state.idReservaCancelar = action.meta.arg.idReserva;
        state.requestIdCancelar = action.meta.requestId;
      })
      .addCase(cancelarReserva.fulfilled, (state, action) => {
        if (state.requestIdCancelar !== action.meta.requestId) return;
        state.cancelando = false;
        state.requestIdCancelar = null;
        state.reservaCancelada = action.payload;
        const indice = state.reservas.findIndex((reserva) => String(reserva.idReserva) === String(action.payload.idReserva));
        if (indice !== -1) state.reservas[indice] = action.payload;
        if (state.loading) state.cambiosDuranteCarga.push(action.payload);
        if (String(state.reservaDetalle?.idReserva) === String(action.payload.idReserva)) {
          state.reservaDetalle = action.payload;
        }
        if (String(state.reservaPago?.idReserva) === String(action.payload.idReserva)) {
          state.reservaPago = action.payload;
        }
      })
      .addCase(cancelarReserva.rejected, (state, action) => {
        if (state.requestIdCancelar !== action.meta.requestId) return;
        state.cancelando = false;
        state.requestIdCancelar = null;
        if (!action.payload?.solicitudVencida) state.errorCancelar = action.error.message;
      })
      .addCase(logout, () => initialState);
  },
});

export const { limpiarErrorCancelar, limpiarErrorFinalizar } = reservasSlice.actions;
export default reservasSlice.reducer;
