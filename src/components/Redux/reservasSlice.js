import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken, mensajeDe } from "../../utils/api";
import { logout } from "./userSlice";

const SIN_CONEXION = "No pudimos conectar con el servidor. Intentá nuevamente.";

// Mensaje para mostrar cuando falla un pedido: si axios no recibió respuesta, es un problema de conexión
function mensajeDeError(error, porDefecto) {
  if (error.response) return mensajeDe(error, porDefecto);
  if (axios.isAxiosError(error)) return SIN_CONEXION;
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

// Mis reservas con las publicaciones y los pagos que necesitan sus tarjetas
export const fetchMisReservas = createAsyncThunk("reservas/fetchMisReservas", async (_, { getState }) => {
  try {
    const config = conToken(getState().users.token);
    const { data } = await axios.get(`${API_URL}/reservas/mias`, config);
    const reservas = data.content;

    // Evita consultar dos veces una publicación que aparece en varias reservas
    const idsPublicaciones = [...new Set(reservas.map((reserva) => reserva.idPublicacion))];
    const pedidosPublicaciones = idsPublicaciones.map(async (idPublicacion) => {
      const respuesta = await axios.get(`${API_URL}/publicaciones/${idPublicacion}`, config);
      return respuesta.data;
    });
    // Los pagos se consultan en paralelo con las publicaciones
    const pedidosPagos = reservas.map((reserva) => pagoDeReserva(reserva.idReserva, config));

    const [publicaciones, pagos] = await Promise.all([Promise.all(pedidosPublicaciones), Promise.all(pedidosPagos)]);
    return { reservas, publicaciones, pagos: pagos.filter((pago) => pago !== null) };
  } catch (error) {
    throw new Error(mensajeDeError(error, "No pudimos cargar tus reservas."), { cause: error });
  }
});

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
    try {
      const { data } = await axios.post(
        `${API_URL}/carritos/${idCarrito}/confirmar`,
        { metodoPago },
        conToken(token),
      );
      if (getState().users.token !== token || getState().reservas.requestIdConfirmar !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      return data;
    } catch (error) {
      if (getState().users.token !== token || getState().reservas.requestIdConfirmar !== requestId) {
        return rejectWithValue({ solicitudVencida: true });
      }
      throw new Error(mensajeDeError(error, "No se pudo crear la reserva."), { cause: error });
    }
  },
  {
    condition: ({ idCarrito }, { getState }) => {
      const { users, carrito, reservas } = getState();
      return Boolean(users.token) && Boolean(carrito.carrito)
        && String(carrito.carrito.idCarrito) === String(idCarrito)
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
      throw new Error(mensajeDeError(error, "No se pudo cancelar la reserva."), { cause: error });
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
  reservas: [],
  publicaciones: [],
  pagos: [],
  loading: false,
  error: null,
  requestIdReservas: null,
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
      })
      .addCase(fetchMisReservas.fulfilled, (state, action) => {
        if (state.requestIdReservas !== action.meta.requestId) return;
        state.loading = false;
        state.reservas = action.payload.reservas;
        state.publicaciones = action.payload.publicaciones;
        state.pagos = action.payload.pagos;
      })
      .addCase(fetchMisReservas.rejected, (state, action) => {
        if (state.requestIdReservas !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.error.message;
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
        // El detalle puede haberse recargado sin cargar el listado y sus publicaciones.
        // En ese caso conservamos la respuesta, sin insertar una tarjeta incompleta.
        // Una consulta anterior no debe reemplazar la reserva recién cancelada.
        state.requestIdReservas = null;
        state.loading = false;
        state.error = null;
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

export const { limpiarErrorCancelar } = reservasSlice.actions;
export default reservasSlice.reducer;
