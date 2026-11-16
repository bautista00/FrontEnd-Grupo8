import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken, mensajeDe } from "../../utils/api";
import { logout } from "./userSlice";

// Carrito del usuario con su publicación y los períodos disponibles.
// Si está vacío, el backend responde solo con un mensaje.
export const fetchCarrito = createAsyncThunk("carrito/fetchCarrito", async (_, { getState }) => {
  try {
    const config = conToken(getState().users.token);
    const { data: datosCarrito } = await axios.get(`${API_URL}/carritos/mio`, config);
    if (datosCarrito.mensaje && !datosCarrito.idCarrito) {
      return { carrito: null, mensajeVacio: datosCarrito.mensaje };
    }

    const [{ data: publicacion }, { data: datosPeriodos }] = await Promise.all([
      axios.get(`${API_URL}/publicaciones/${datosCarrito.idPublicacion}`, config),
      axios.get(`${API_URL}/disponibilidades/publicacion/${datosCarrito.idPublicacion}`, config),
    ]);
    // Adapta las fechas del backend al formato que recibe el calendario
    const periodos = datosPeriodos.map((periodo) => ({ desde: periodo.fechaInicio, hasta: periodo.fechaFin }));

    return { carrito: { ...datosCarrito, publicacion: { ...publicacion, periodos } }, mensajeVacio: "" };
  } catch (error) {
    const mensaje = error.response
      ? mensajeDe(error, "No se pudo consultar el carrito")
      : "No pudimos conectar con el servidor. Intentá nuevamente.";
    throw new Error(mensaje, { cause: error });
  }
});

const initialState = {
  carrito: null,
  // Distingue un carrito todavía no consultado de uno que ya sabemos que está vacío
  carritoConsultado: false,
  mensajeVacio: "",
  loading: false,
  error: null,
};

const carritoSlice = createSlice({
  name: "carrito",
  initialState,
  reducers: {
    // Guarda el carrito que devolvió el backend al agregar un vehículo o cambiar las fechas
    guardarCarrito: (state, action) => {
      state.carrito = action.payload;
      state.carritoConsultado = true;
    },
    // Después de quitar el vehículo o de convertir el carrito en reserva
    vaciarCarrito: (state) => {
      state.carrito = null;
      state.carritoConsultado = true;
      state.mensajeVacio = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarrito.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarrito.fulfilled, (state, action) => {
        state.loading = false;
        state.carrito = action.payload.carrito;
        state.mensajeVacio = action.payload.mensajeVacio;
        state.carritoConsultado = true;
      })
      .addCase(fetchCarrito.rejected, (state, action) => {
        // carritoConsultado queda en false: se vuelve a intentar la próxima vez que se abra el carrito
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(logout, () => initialState);
  },
});

export const { guardarCarrito, vaciarCarrito } = carritoSlice.actions;
export default carritoSlice.reducer;
