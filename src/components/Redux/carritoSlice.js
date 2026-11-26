import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken, mensajeDe } from "../../utils/api";
import { logout } from "./userSlice";
import { confirmarCarrito } from "./reservasSlice";

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
}, {
  condition: (_, { getState }) => Boolean(getState().users.token) && !getState().carrito.loading,
});

// Agrega las fechas confirmadas y conserva la publicación que ya cargó el detalle.
export const agregarCarrito = createAsyncThunk(
  "carrito/agregarCarrito",
  async ({ idPublicacion, fechaInicio, fechaFin, publicacion }, { getState, requestId, rejectWithValue }) => {
    const token = getState().users.token;
    try {
      const { data } = await axios.post(
        `${API_URL}/carritos/publicaciones/${idPublicacion}`,
        { fechaInicio, fechaFin },
        conToken(token),
      );
      if (getState().users.token !== token || getState().carrito.requestIdAgregar !== requestId) {
        return rejectWithValue({ sesionCambiada: true });
      }
      return { ...data, publicacion };
    } catch (error) {
      if (getState().users.token !== token || getState().carrito.requestIdAgregar !== requestId) {
        return rejectWithValue({ sesionCambiada: true });
      }
      const mensaje = error.response
        ? mensajeDe(error, "No pudimos agregar el vehículo al carrito. Intentá nuevamente.")
        : "No recibimos confirmación. Revisá tu carrito antes de volver a agregar el vehículo.";
      throw new Error(mensaje, { cause: error });
    }
  },
  { condition: (_, { getState }) => Boolean(getState().users.token) && !getState().carrito.agregando && !getState().carrito.guardandoFechas && !getState().carrito.quitando && !getState().reservas?.confirmando },
);

// Guarda las fechas y los importes confirmados por el backend, conservando la publicación.
export const modificarFechasCarrito = createAsyncThunk(
  "carrito/modificarFechasCarrito",
  async ({ idCarrito, fechaInicio, fechaFin }, { getState, requestId, rejectWithValue }) => {
    const token = getState().users.token;
    const publicacion = getState().carrito.carrito.publicacion;
    try {
      const { data } = await axios.put(
        `${API_URL}/carritos/${idCarrito}/fechas`,
        { fechaInicio, fechaFin },
        conToken(token),
      );
      const actual = getState();
      if (actual.users.token !== token || actual.carrito.requestIdFechas !== requestId
        || String(actual.carrito.carrito?.idCarrito) !== String(idCarrito)) {
        return rejectWithValue({ solicitudVencida: true });
      }
      return { ...data, publicacion };
    } catch (error) {
      const actual = getState();
      if (actual.users.token !== token || actual.carrito.requestIdFechas !== requestId
        || String(actual.carrito.carrito?.idCarrito) !== String(idCarrito)) {
        return rejectWithValue({ solicitudVencida: true });
      }
      const mensaje = error.response
        ? mensajeDe(error, "No se pudieron modificar las fechas.")
        : "No recibimos confirmación del cambio. Volvé a consultar tu carrito antes de intentar otra vez.";
      throw new Error(mensaje, { cause: error });
    }
  },
  {
    condition: ({ idCarrito }, { getState }) => {
      const { users, carrito } = getState();
      return Boolean(users.token) && Boolean(carrito.carrito)
        && String(carrito.carrito.idCarrito) === String(idCarrito)
        && !carrito.guardandoFechas && !carrito.agregando && !carrito.quitando
        && !getState().reservas?.confirmando;
    },
  },
);

// El DELETE devuelve 204: se conserva el ID eliminado para actualizar Redux sin otro GET.
export const eliminarCarrito = createAsyncThunk(
  "carrito/eliminarCarrito",
  async ({ idCarrito }, { getState, requestId, rejectWithValue }) => {
    const token = getState().users.token;
    try {
      await axios.delete(`${API_URL}/carritos/${idCarrito}`, conToken(token));
      const actual = getState();
      if (actual.users.token !== token || actual.carrito.requestIdQuitar !== requestId
        || String(actual.carrito.carrito?.idCarrito) !== String(idCarrito)) {
        return rejectWithValue({ solicitudVencida: true });
      }
      return idCarrito;
    } catch (error) {
      const actual = getState();
      if (actual.users.token !== token || actual.carrito.requestIdQuitar !== requestId
        || String(actual.carrito.carrito?.idCarrito) !== String(idCarrito)) {
        return rejectWithValue({ solicitudVencida: true });
      }
      const mensaje = error.response
        ? mensajeDe(error, "No pudimos quitar el vehículo. Intentá nuevamente.")
        : "No recibimos confirmación. Volvé a consultar tu carrito para comprobar si se quitó el vehículo.";
      throw new Error(mensaje, { cause: error });
    }
  },
  {
    condition: ({ idCarrito }, { getState }) => {
      const { users, carrito } = getState();
      return Boolean(users.token) && Boolean(carrito.carrito)
        && String(carrito.carrito.idCarrito) === String(idCarrito)
        && !carrito.quitando && !carrito.guardandoFechas && !carrito.agregando
        && !getState().reservas?.confirmando;
    },
  },
);

const initialState = {
  carrito: null,
  carritoConfirmado: null,
  metodoPagoConfirmado: null,
  // Distingue un carrito todavía no consultado de uno que ya sabemos que está vacío
  carritoConsultado: false,
  mensajeVacio: "",
  loading: false,
  error: null,
  requestId: null,
  agregando: false,
  errorAgregar: null,
  idPublicacionAgregar: null,
  requestIdAgregar: null,
  guardandoFechas: false,
  errorFechas: null,
  idCarritoFechas: null,
  requestIdFechas: null,
  quitando: false,
  errorQuitar: null,
  idCarritoQuitar: null,
  requestIdQuitar: null,
};

const carritoSlice = createSlice({
  name: "carrito",
  initialState,
  reducers: {
    limpiarErrorQuitar: (state) => {
      state.errorQuitar = null;
      state.idCarritoQuitar = null;
    },
    // Después de quitar el vehículo o de convertir el carrito en reserva
    vaciarCarrito: (state) => {
      state.carrito = null;
      state.carritoConsultado = true;
      state.mensajeVacio = "";
      state.requestId = null;
      state.loading = false;
      state.error = null;
      state.guardandoFechas = false;
      state.errorFechas = null;
      state.idCarritoFechas = null;
      state.requestIdFechas = null;
      state.quitando = false;
      state.errorQuitar = null;
      state.idCarritoQuitar = null;
      state.requestIdQuitar = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarrito.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchCarrito.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.carrito = action.payload.carrito;
        state.mensajeVacio = action.payload.mensajeVacio;
        state.carritoConsultado = true;
      })
      .addCase(fetchCarrito.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        // carritoConsultado queda en false: se vuelve a intentar la próxima vez que se abra el carrito
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(agregarCarrito.pending, (state, action) => {
        state.agregando = true;
        state.errorAgregar = null;
        state.idPublicacionAgregar = action.meta.arg.idPublicacion;
        state.requestIdAgregar = action.meta.requestId;
      })
      .addCase(agregarCarrito.fulfilled, (state, action) => {
        if (state.requestIdAgregar !== action.meta.requestId) return;
        state.agregando = false;
        state.requestIdAgregar = null;
        state.carrito = action.payload;
        state.carritoConsultado = true;
        state.mensajeVacio = "";
        // Una consulta anterior no debe reemplazar el carrito recién agregado.
        state.requestId = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(agregarCarrito.rejected, (state, action) => {
        if (state.requestIdAgregar !== action.meta.requestId) return;
        state.agregando = false;
        state.requestIdAgregar = null;
        if (!action.payload?.sesionCambiada) state.errorAgregar = action.error.message;
      })
      .addCase(modificarFechasCarrito.pending, (state, action) => {
        state.guardandoFechas = true;
        state.errorFechas = null;
        state.idCarritoFechas = action.meta.arg.idCarrito;
        state.requestIdFechas = action.meta.requestId;
      })
      .addCase(modificarFechasCarrito.fulfilled, (state, action) => {
        if (state.requestIdFechas !== action.meta.requestId) return;
        state.guardandoFechas = false;
        state.requestIdFechas = null;
        state.carrito = action.payload;
        state.carritoConsultado = true;
        state.mensajeVacio = "";
        state.requestId = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(modificarFechasCarrito.rejected, (state, action) => {
        if (state.requestIdFechas !== action.meta.requestId) return;
        state.guardandoFechas = false;
        state.requestIdFechas = null;
        if (!action.payload?.solicitudVencida) state.errorFechas = action.error.message;
      })
      .addCase(eliminarCarrito.pending, (state, action) => {
        state.quitando = true;
        state.errorQuitar = null;
        state.idCarritoQuitar = action.meta.arg.idCarrito;
        state.requestIdQuitar = action.meta.requestId;
      })
      .addCase(eliminarCarrito.fulfilled, (state, action) => {
        if (state.requestIdQuitar !== action.meta.requestId) return;
        state.quitando = false;
        state.requestIdQuitar = null;
        if (String(state.carrito?.idCarrito) !== String(action.payload)) return;
        state.carrito = null;
        state.carritoConsultado = true;
        state.mensajeVacio = "";
        state.errorQuitar = null;
        state.idCarritoQuitar = null;
        // Una consulta anterior no debe volver a mostrar el carrito eliminado.
        state.requestId = null;
        state.loading = false;
        state.error = null;
        state.errorFechas = null;
        state.idCarritoFechas = null;
      })
      .addCase(eliminarCarrito.rejected, (state, action) => {
        if (state.requestIdQuitar !== action.meta.requestId) return;
        state.quitando = false;
        state.requestIdQuitar = null;
        if (!action.payload?.solicitudVencida) state.errorQuitar = action.error.message;
      })
      .addCase(confirmarCarrito.fulfilled, (state, action) => {
        if (String(state.carrito?.idCarrito) !== String(action.meta.arg.idCarrito)) return;
        return {
          ...initialState,
          carritoConsultado: true,
          // Ya no es un carrito activo: se conserva solo para revisar la reserva creada.
          carritoConfirmado: state.carrito,
          metodoPagoConfirmado: action.meta.arg.metodoPago,
        };
      })
      .addCase(logout, () => initialState);
  },
});

export const { vaciarCarrito, limpiarErrorQuitar } = carritoSlice.actions;
export default carritoSlice.reducer;
