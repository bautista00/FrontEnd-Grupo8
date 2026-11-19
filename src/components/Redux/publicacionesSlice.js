import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken, mensajeDe } from "../../utils/api";
import { logout } from "./userSlice";
import guardarDatosPublicacion from "../publicaciones/guardarPublicacion";
import { periodoDesdeApi } from "../publicaciones/datosFormularioPublicacion";

// Detalle: la publicación junto con su vehículo y sus períodos disponibles
export const fetchPublicacion = createAsyncThunk("publicaciones/fetchPublicacion", async (id, { getState, rejectWithValue }) => {
  try {
    const config = conToken(getState().users.token);
    const [[datos, vehiculo], periodos] = await Promise.all([
      axios.get(`${API_URL}/publicaciones/${id}`, config).then(({ data }) => Promise.all([
        data,
        axios.get(`${API_URL}/vehiculo/${data.idVehiculo}`, config).then((respuesta) => respuesta.data),
      ])),
      axios.get(`${API_URL}/disponibilidades/publicacion/${id}`, config).then(({ data }) => data),
    ]);
    return {
      ...vehiculo,
      ...datos,
      periodos: periodos.map((periodo) => ({ desde: periodo.fechaInicio, hasta: periodo.fechaFin })),
    };
  } catch (error) {
    // Reintentar solo sirve si no hubo respuesta o falló el servidor (no si ya no está disponible)
    return rejectWithValue({
      message: mensajeDe(error, "No pudimos cargar la publicación."),
      reintentable: !error.response || error.response.status >= 500,
    });
  }
});

// Zonas de las publicaciones activas, para el filtro de Home
export const fetchZonas = createAsyncThunk("publicaciones/fetchZonas", async () => {
  try {
    const { data } = await axios.get(`${API_URL}/publicaciones/zonas`);
    return data;
  } catch (error) {
    throw new Error(mensajeDe(error, "No se pudieron cargar las zonas."), { cause: error });
  }
});

// Catálogo de Home: el backend filtra, ordena y pagina; se guarda la página completa que devuelve
export const buscarPublicaciones = createAsyncThunk("publicaciones/buscarPublicaciones", async (consulta) => {
  try {
    const { data } = await axios.get(`${API_URL}/publicaciones/buscar?${consulta}`);
    return data;
  } catch (error) {
    throw new Error(mensajeDe(error, "No se pudo obtener la información del servidor."), { cause: error });
  }
});

// Mis publicaciones: el backend filtra por estado y búsqueda, y pagina de a 10
export const fetchMisPublicaciones = createAsyncThunk(
  "publicaciones/fetchMisPublicaciones",
  async ({ pagina, estado, busqueda }, { getState }) => {
    try {
      const parametros = new URLSearchParams({ page: pagina, size: 10 });
      if (estado !== "TODAS") parametros.set("estado", estado);
      if (busqueda) parametros.set("busqueda", busqueda);
      const { data } = await axios.get(`${API_URL}/publicaciones/mias?${parametros}`, conToken(getState().users.token));
      return data;
    } catch (error) {
      throw new Error(mensajeDe(error, "No se pudo obtener la información del servidor."), { cause: error });
    }
  },
);

// Datos guardados del editor; el borrador de inputs queda en el formulario.
export const fetchEdicionPublicacion = createAsyncThunk(
  "publicaciones/fetchEdicionPublicacion",
  async (id, { getState, rejectWithValue }) => {
    const { token, user } = getState().users;
    const config = conToken(token);
    try {
      const { data: publicacion } = await axios.get(`${API_URL}/publicaciones/${id}`, config);
      const [{ data: vehiculo }, { data: ubicacion }, { data: periodos }] = await Promise.all([
        axios.get(`${API_URL}/vehiculo/${publicacion.idVehiculo}`, config),
        axios.get(`${API_URL}/ubicaciones/${publicacion.idUbicacion}`, config),
        axios.get(`${API_URL}/disponibilidades/publicacion/${id}`, config),
      ]);
      if (getState().users.token !== token) return rejectWithValue({ sesionCambiada: true });
      if (vehiculo.idUsuario !== user.idUsuario) throw new Error("Esta publicación no pertenece a tu cuenta.");
      return {
        ...vehiculo, ...ubicacion, ...publicacion,
        codigoPostal: ubicacion.codigoPostal, placeId: ubicacion.placeId,
        periodos: periodos.map(periodoDesdeApi),
      };
    } catch (error) {
      return rejectWithValue({ message: mensajeDe(error,
        axios.isAxiosError(error) ? "No pudimos cargar la publicación." : error.message) });
    }
  },
);

export const guardarCambiosPublicacion = createAsyncThunk(
  "publicaciones/guardarCambiosPublicacion",
  async (datos, { getState, rejectWithValue }) => {
    const token = getState().users.token;
    try {
      const guardada = await guardarDatosPublicacion({ ...datos, token });
      if (getState().users.token !== token) return rejectWithValue({ sesionCambiada: true });
      return guardada;
    } catch (error) {
      if (getState().users.token !== token) return rejectWithValue({ sesionCambiada: true });
      return rejectWithValue({
        message: mensajeDe(error, axios.isAxiosError(error) ? "No se pudo guardar. Intentá nuevamente." : error.message),
        incierto: !error.response || error.response.status >= 500,
        guardada: error.guardada, parcial: Boolean(error.parcial), recurso: error.recurso,
      });
    }
  },
  { condition: (_, { getState }) => !getState().publicaciones.guardando && !getState().publicaciones.incierto },
);

export const cambiarEstadoPublicacion = createAsyncThunk(
  "publicaciones/cambiarEstadoPublicacion",
  async ({ publicacion, accion }, { getState, rejectWithValue }) => {
    const token = getState().users.token;
    const ruta = accion === "desactivar" ? "" : `/${accion}`;
    try {
      const { data } = await axios({
        url: `${API_URL}/publicaciones/${publicacion.idPublicacion}${ruta}`,
        method: accion === "desactivar" ? "DELETE" : "PUT",
        ...conToken(token),
      });
      if (getState().users.token !== token) return rejectWithValue({ sesionCambiada: true });
      return { ...publicacion, ...(data || { estado: "DESACTIVADA" }) };
    } catch (error) {
      if (getState().users.token !== token) return rejectWithValue({ sesionCambiada: true });
      return rejectWithValue({
        message: mensajeDe(error, "No se pudo cambiar el estado. Intentá nuevamente."),
        incierto: !error.response || error.response.status >= 500,
      });
    }
  },
  { condition: (_, { getState }) => !getState().publicaciones.guardando && !getState().publicaciones.incierto },
);

function actualizarGuardada(state, publicacion) {
  const lista = state.misPublicaciones;
  const index = lista?.content.findIndex((item) => item.idPublicacion === publicacion.idPublicacion) ?? -1;
  if (index !== -1) {
    const completa = { ...lista.content[index], ...publicacion };
    if (state.consulta?.estado && state.consulta.estado !== "TODAS" && state.consulta.estado !== completa.estado) {
      lista.content.splice(index, 1);
      lista.totalElements = Math.max(0, lista.totalElements - 1);
      lista.totalPages = Math.ceil(lista.totalElements / (lista.size || 10));
    } else {
      lista.content[index] = completa;
    }
  }
  if (state.publicacion?.idPublicacion === publicacion.idPublicacion) {
    state.publicacion = { ...state.publicacion, ...publicacion };
  }
}

function completarComprobacion(state, action) {
  if (state.requestIdComprobacion !== action.meta.requestId) return;
  state.incierto = false;
  state.errorGuardado = null;
  state.requestIdComprobacion = null;
}

const initialState = {
  zonas: [],
  loadingZonas: false,
  errorZonas: null,
  busqueda: null,
  loadingBusqueda: false,
  errorBusqueda: null,
  // Pedido de la última búsqueda: si cambia un filtro o la página, se ignora la respuesta anterior
  requestIdBusqueda: null,
  // Consulta a la que corresponde la búsqueda (o el error) guardada
  consultaBusqueda: null,
  publicacion: null,
  loadingPublicacion: false,
  errorPublicacion: null,
  errorPublicacionReintentable: false,
  requestIdPublicacion: null,
  misPublicaciones: null,
  loading: false,
  error: null,
  // Pedido de la última consulta: si cambia un filtro o la página, se ignora la respuesta anterior
  requestId: null,
  consulta: null,
  edicion: null,
  editorActual: null,
  editorGuardado: null,
  loadingEdicion: false,
  errorEdicion: null,
  requestIdEdicion: null,
  guardando: false,
  errorGuardado: null,
  incierto: false,
  requestIdGuardado: null,
  requestIdComprobacion: null,
  borradorAlta: null,
};

const publicacionesSlice = createSlice({
  name: "publicaciones",
  initialState,
  reducers: {
    abrirEditor: (state, action) => {
      if (state.editorActual === action.payload.clave) return;
      state.editorActual = action.payload.clave;
      if (!action.payload.conservar) state.edicion = null;
      state.loadingEdicion = false;
      state.errorEdicion = null;
      state.requestIdEdicion = null;
    },
    limpiarEditor: (state) => {
      state.editorActual = null;
      state.edicion = null;
      state.loadingEdicion = false;
      state.errorEdicion = null;
      state.requestIdEdicion = null;
    },
    limpiarErrorGuardado: (state) => { if (!state.incierto) state.errorGuardado = null; },
    bloquearGuardado: (state, action) => {
      state.incierto = true;
      state.requestIdComprobacion = null;
      state.errorGuardado = { message: action.payload, tipo: "guardar", idPublicacion: state.edicion?.idPublicacion };
    },
    guardarBorradorAlta: (state, action) => { state.borradorAlta = action.payload; },
    descartarBorradorAlta: (state) => { state.borradorAlta = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchZonas.pending, (state) => {
        state.loadingZonas = true;
        state.errorZonas = null;
      })
      .addCase(fetchZonas.fulfilled, (state, action) => {
        state.loadingZonas = false;
        state.zonas = action.payload;
      })
      .addCase(fetchZonas.rejected, (state, action) => {
        state.loadingZonas = false;
        state.errorZonas = action.error.message;
      })
      .addCase(buscarPublicaciones.pending, (state, action) => {
        state.loadingBusqueda = true;
        state.errorBusqueda = null;
        state.requestIdBusqueda = action.meta.requestId;
      })
      .addCase(buscarPublicaciones.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestIdBusqueda) return;
        state.loadingBusqueda = false;
        state.busqueda = action.payload;
        state.consultaBusqueda = action.meta.arg;
      })
      .addCase(buscarPublicaciones.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestIdBusqueda) return;
        state.loadingBusqueda = false;
        state.busqueda = null;
        state.errorBusqueda = action.error.message;
        state.consultaBusqueda = action.meta.arg;
      })
      .addCase(fetchPublicacion.pending, (state, action) => {
        state.loadingPublicacion = true;
        state.errorPublicacion = null;
        state.requestIdPublicacion = action.meta.requestId;
      })
      .addCase(fetchPublicacion.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestIdPublicacion) return;
        state.loadingPublicacion = false;
        state.publicacion = action.payload;
      })
      .addCase(fetchPublicacion.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestIdPublicacion) return;
        state.loadingPublicacion = false;
        state.errorPublicacion = action.payload?.message ?? action.error.message;
        state.errorPublicacionReintentable = action.payload?.reintentable ?? true;
      })
      .addCase(fetchMisPublicaciones.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
        state.consulta = action.meta.arg;
        if (state.incierto && (state.errorGuardado?.tipo === "estado" || !state.errorGuardado?.idPublicacion)) {
          state.requestIdComprobacion = action.meta.requestId;
        }
      })
      .addCase(fetchMisPublicaciones.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.loading = false;
        state.misPublicaciones = action.payload;
        completarComprobacion(state, action);
      })
      .addCase(fetchMisPublicaciones.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchEdicionPublicacion.pending, (state, action) => {
        state.loadingEdicion = true;
        state.errorEdicion = null;
        state.requestIdEdicion = action.meta.requestId;
        if (String(state.edicion?.idPublicacion) !== String(action.meta.arg)) state.edicion = null;
        if (state.incierto && state.errorGuardado?.idPublicacion != null
          && String(state.errorGuardado.idPublicacion) === String(action.meta.arg)) {
          state.requestIdComprobacion = action.meta.requestId;
        }
      })
      .addCase(fetchEdicionPublicacion.fulfilled, (state, action) => {
        if (state.requestIdEdicion !== action.meta.requestId) return;
        state.loadingEdicion = false;
        state.edicion = action.payload;
        completarComprobacion(state, action);
        actualizarGuardada(state, action.payload);
      })
      .addCase(fetchEdicionPublicacion.rejected, (state, action) => {
        if (state.requestIdEdicion !== action.meta.requestId) return;
        state.loadingEdicion = false;
        if (!action.payload?.sesionCambiada) state.errorEdicion = action.payload?.message || action.error.message;
      })
      .addCase(guardarCambiosPublicacion.pending, (state, action) => {
        state.guardando = true;
        state.errorGuardado = null;
        state.requestIdGuardado = action.meta.requestId;
        state.editorGuardado = state.editorActual;
        state.requestIdComprobacion = null;
      })
      .addCase(guardarCambiosPublicacion.fulfilled, (state, action) => {
        if (state.requestIdGuardado !== action.meta.requestId) return;
        state.guardando = false;
        if (state.editorActual === state.editorGuardado) state.edicion = action.payload;
        state.incierto = false;
        actualizarGuardada(state, action.payload);
      })
      .addCase(guardarCambiosPublicacion.rejected, (state, action) => {
        if (state.requestIdGuardado !== action.meta.requestId) return;
        state.guardando = false;
        if (action.payload?.sesionCambiada) return;
        state.errorGuardado = {
          ...(action.payload || { message: action.error.message }), tipo: "guardar",
          idPublicacion: action.payload?.guardada?.idPublicacion ?? action.meta.arg.publicacion?.idPublicacion,
        };
        state.incierto = Boolean(action.payload?.incierto);
        state.requestIdComprobacion = null;
        if (action.payload?.guardada && state.editorActual === state.editorGuardado) state.edicion = action.payload.guardada;
      })
      .addCase(cambiarEstadoPublicacion.pending, (state, action) => {
        state.guardando = true;
        state.errorGuardado = null;
        state.requestIdGuardado = action.meta.requestId;
        state.requestIdComprobacion = null;
      })
      .addCase(cambiarEstadoPublicacion.fulfilled, (state, action) => {
        if (state.requestIdGuardado !== action.meta.requestId) return;
        state.guardando = false;
        state.incierto = false;
        if (state.edicion?.idPublicacion === action.payload.idPublicacion) {
          state.edicion = { ...state.edicion, ...action.payload };
        }
        actualizarGuardada(state, action.payload);
      })
      .addCase(cambiarEstadoPublicacion.rejected, (state, action) => {
        if (state.requestIdGuardado !== action.meta.requestId) return;
        state.guardando = false;
        if (action.payload?.sesionCambiada) return;
        state.errorGuardado = {
          ...(action.payload || { message: action.error.message }), tipo: "estado",
          idPublicacion: action.meta.arg.publicacion.idPublicacion,
        };
        state.incierto = Boolean(action.payload?.incierto);
        state.requestIdComprobacion = null;
      })
      // Las zonas y la búsqueda de Home son públicas: se conservan al cerrar sesión, que vuelve a Home
      .addCase(logout, (state) => ({
        ...initialState,
        zonas: state.zonas, loadingZonas: state.loadingZonas, errorZonas: state.errorZonas,
        busqueda: state.busqueda, loadingBusqueda: state.loadingBusqueda, errorBusqueda: state.errorBusqueda,
        requestIdBusqueda: state.requestIdBusqueda, consultaBusqueda: state.consultaBusqueda,
      }));
  },
});

export const {
  abrirEditor, limpiarEditor, limpiarErrorGuardado, bloquearGuardado,
  guardarBorradorAlta, descartarBorradorAlta,
} = publicacionesSlice.actions;
export default publicacionesSlice.reducer;
