import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken, mensajeDe } from "../../utils/api";
import { logout } from "./userSlice";

// Detalle: la publicación junto con su vehículo y sus períodos disponibles
export const fetchPublicacion = createAsyncThunk("publicaciones/fetchPublicacion", async (id, { getState }) => {
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
    throw new Error(mensajeDe(error, "No pudimos cargar la publicación."), { cause: error });
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

const initialState = {
  publicacion: null,
  loadingPublicacion: false,
  errorPublicacion: null,
  requestIdPublicacion: null,
  misPublicaciones: null,
  loading: false,
  error: null,
  // Pedido de la última consulta: si cambia un filtro o la página, se ignora la respuesta anterior
  requestId: null,
};

const publicacionesSlice = createSlice({
  name: "publicaciones",
  initialState,
  reducers: {
    // Reemplaza una publicación de la lista después de pausarla, reactivarla o desactivarla.
    // Si con el nuevo estado ya no entra en el filtro elegido, se saca de la lista.
    actualizarPublicacionEnLista: (state, action) => {
      const { publicacion, filtro } = action.payload;
      const lista = state.misPublicaciones;
      if (!lista) return;
      const index = lista.content.findIndex((item) => item.idPublicacion === publicacion.idPublicacion);
      if (index !== -1) {
        lista.content[index] = publicacion;
      }
      if (filtro !== "TODAS" && publicacion.estado !== filtro) {
        lista.content = lista.content.filter((item) => item.estado === filtro);
        lista.totalElements = Math.max(0, lista.totalElements - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.errorPublicacion = action.error.message;
      })
      .addCase(fetchMisPublicaciones.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchMisPublicaciones.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.loading = false;
        state.misPublicaciones = action.payload;
      })
      .addCase(fetchMisPublicaciones.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(logout, () => initialState);
  },
});

export const { actualizarPublicacionEnLista } = publicacionesSlice.actions;
export default publicacionesSlice.reducer;
