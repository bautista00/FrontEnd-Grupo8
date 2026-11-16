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

// Pago de una reserva. Un 404 significa que la reserva no tiene pago y un 204 se toma como error.
async function pagoDeReserva(idReserva, config) {
  try {
    const respuesta = await axios.get(`${API_URL}/pagos/reserva/${idReserva}`, config);
    if (respuesta.status === 204) throw new Error("No se pudo consultar el pago.");
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
      if (respuesta.status === 204) throw new Error("No se pudo consultar la publicación.");
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

// Estado del pago de una reserva, al volver de Mercado Pago
export const fetchPagoReserva = createAsyncThunk("reservas/fetchPagoReserva", async (idReserva, { getState }) => {
  try {
    const respuesta = await axios.get(`${API_URL}/pagos/reserva/${idReserva}`, conToken(getState().users.token));
    if (respuesta.status === 204) throw new Error("No se recibieron los datos del pago.");
    return respuesta.data;
  } catch (error) {
    throw new Error(mensajeDeError(error, "No se pudo consultar el pago."), { cause: error });
  }
});

const initialState = {
  reservas: [],
  publicaciones: [],
  pagos: [],
  loading: false,
  error: null,
  pago: null,
  loadingPago: false,
  errorPago: null,
};

const reservasSlice = createSlice({
  name: "reservas",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMisReservas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMisReservas.fulfilled, (state, action) => {
        state.loading = false;
        state.reservas = action.payload.reservas;
        state.publicaciones = action.payload.publicaciones;
        state.pagos = action.payload.pagos;
      })
      .addCase(fetchMisReservas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPagoReserva.pending, (state) => {
        state.loadingPago = true;
        state.errorPago = null;
        state.pago = null;
      })
      .addCase(fetchPagoReserva.fulfilled, (state, action) => {
        state.loadingPago = false;
        state.pago = action.payload;
      })
      .addCase(fetchPagoReserva.rejected, (state, action) => {
        state.loadingPago = false;
        state.errorPago = action.error.message;
      })
      .addCase(logout, () => initialState);
  },
});

export default reservasSlice.reducer;
