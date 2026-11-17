import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken, mensajeDe } from "../../utils/api";
import { VEHICULOS_POR_PAGINA } from "../../utils/vehiculos";
import { logout } from "./userSlice";

// Fotos de un vehículo con la forma que usan las tarjetas; la primera es la portada
async function fotosDeVehiculo(idVehiculo) {
  const { data } = await axios.get(`${API_URL}/imagen-vehiculo/por-vehiculo/${idVehiculo}`);
  return [...data].sort((a, b) => a.orden - b.orden).map((imagen) => ({
    idFoto: imagen.id,
    orden: imagen.orden,
    url: imagen.file ? `data:image/jpeg;base64,${imagen.file}` : null,
  }));
}

// Página de mis vehículos con sus fotos y su publicación vigente (ACTIVA o PAUSADA).
// El backend no manda las fotos ni la publicación dentro del vehículo: se piden aparte y se unen por idVehiculo.
export const fetchMisVehiculos = createAsyncThunk("vehiculos/fetchMisVehiculos", async (pagina, { getState, fulfillWithValue }) => {
  const versionFotos = getState().vehiculos.versionFotos;
  try {
    const config = conToken(getState().users.token);
    const [{ data: vehiculos }, { data: publicaciones }] = await Promise.all([
      axios.get(`${API_URL}/vehiculo/mios?page=${pagina}&size=${VEHICULOS_POR_PAGINA}`, config),
      axios.get(`${API_URL}/publicaciones/mias?size=100`, config),
    ]);
    const vigentes = publicaciones.content.filter((publicacion) => publicacion.estado !== "DESACTIVADA");

    const content = await Promise.all(vehiculos.content.map(async (vehiculo) => ({
      ...vehiculo,
      fotos: await fotosDeVehiculo(vehiculo.idVehiculo),
      publicacionActual: vigentes.find((publicacion) => publicacion.idVehiculo === vehiculo.idVehiculo) ?? null,
    })));

    return fulfillWithValue({ ...vehiculos, content }, { versionFotos });
  } catch (error) {
    throw new Error(mensajeDe(error, "No se pudieron cargar tus vehículos."), { cause: error });
  }
});

export const fetchTiposVehiculo = createAsyncThunk("vehiculos/fetchTiposVehiculo", async () => {
  try {
    const { data } = await axios.get(`${API_URL}/tipo-vehiculo`);
    return data;
  } catch (error) {
    throw new Error(mensajeDe(error, "No se pudieron cargar los tipos de vehículo."), { cause: error });
  }
});

export const fetchVehiculosParaPublicar = createAsyncThunk(
  "vehiculos/fetchVehiculosParaPublicar",
  async (pagina, { getState }) => {
    try {
      const { data } = await axios.get(`${API_URL}/vehiculo/mios?page=${pagina}&size=10`, conToken(getState().users.token));
      return data;
    } catch (error) {
      throw new Error(mensajeDe(error, "No se pudieron cargar tus vehículos. Intentá nuevamente."));
    }
  },
);

export const fetchVehiculoParaPublicar = createAsyncThunk(
  "vehiculos/fetchVehiculoParaPublicar",
  async (id, { getState, rejectWithValue }) => {
    const { token, user } = getState().users;
    try {
      const { data } = await axios.get(`${API_URL}/vehiculo/${id}`, conToken(token));
      if (getState().users.token !== token) return rejectWithValue("La sesión cambió.");
      if (data.idUsuario !== user.idUsuario) return rejectWithValue("El vehículo no pertenece a tu cuenta.");
      return data;
    } catch (error) {
      return rejectWithValue(mensajeDe(error, "No pudimos seleccionar el vehículo. Elegilo de la lista."));
    }
  },
);

export const fetchFotosVehiculo = createAsyncThunk(
  "vehiculos/fetchFotosVehiculo",
  async (id) => fotosDeVehiculo(id),
  {
    condition: (id, { getState }) => {
      const entrada = getState().vehiculos.fotosPorVehiculo[id];
      return !entrada?.loading && entrada?.fotos == null;
    },
  },
);

const initialState = {
  vehiculos: null,
  loading: false,
  error: null,
  // Pedido de la última página solicitada: si se cambia de página, se ignora la respuesta anterior
  requestId: null,
  tiposVehiculo: [],
  loadingTipos: false,
  errorTipos: null,
  paraPublicar: null,
  loadingParaPublicar: false,
  errorParaPublicar: null,
  requestIdParaPublicar: null,
  vehiculoElegido: null,
  loadingElegido: false,
  errorElegido: null,
  requestIdElegido: null,
  fotosPorVehiculo: {},
  versionFotos: 0,
};

const vehiculosSlice = createSlice({
  name: "vehiculos",
  initialState,
  reducers: {
    elegirVehiculoPublicacion: (state, action) => {
      state.vehiculoElegido = action.payload;
      state.loadingElegido = false;
      state.errorElegido = null;
      state.requestIdElegido = null;
    },
    olvidarFotosVehiculo: (state, action) => {
      delete state.fotosPorVehiculo[action.payload];
      state.versionFotos += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMisVehiculos.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchMisVehiculos.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.loading = false;
        state.vehiculos = action.payload;
        if (state.versionFotos !== action.meta.versionFotos) return;
        action.payload.content.forEach((vehiculo) => {
          state.fotosPorVehiculo[vehiculo.idVehiculo] = {
            fotos: vehiculo.fotos, loading: false, error: null, requestId: null,
          };
        });
      })
      .addCase(fetchMisVehiculos.rejected, (state, action) => {
        if (action.meta.requestId !== state.requestId) return;
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTiposVehiculo.pending, (state) => {
        state.loadingTipos = true;
        state.errorTipos = null;
      })
      .addCase(fetchTiposVehiculo.fulfilled, (state, action) => {
        state.loadingTipos = false;
        state.tiposVehiculo = action.payload;
      })
      .addCase(fetchTiposVehiculo.rejected, (state, action) => {
        state.loadingTipos = false;
        state.errorTipos = action.error.message;
      })
      .addCase(fetchVehiculosParaPublicar.pending, (state, action) => {
        state.loadingParaPublicar = true;
        state.errorParaPublicar = null;
        state.requestIdParaPublicar = action.meta.requestId;
      })
      .addCase(fetchVehiculosParaPublicar.fulfilled, (state, action) => {
        if (state.requestIdParaPublicar !== action.meta.requestId) return;
        state.loadingParaPublicar = false;
        state.paraPublicar = action.payload;
      })
      .addCase(fetchVehiculosParaPublicar.rejected, (state, action) => {
        if (state.requestIdParaPublicar !== action.meta.requestId) return;
        state.loadingParaPublicar = false;
        state.errorParaPublicar = action.error.message;
      })
      .addCase(fetchVehiculoParaPublicar.pending, (state, action) => {
        state.loadingElegido = true;
        state.errorElegido = null;
        state.requestIdElegido = action.meta.requestId;
        state.vehiculoElegido = null;
      })
      .addCase(fetchVehiculoParaPublicar.fulfilled, (state, action) => {
        if (state.requestIdElegido !== action.meta.requestId) return;
        state.loadingElegido = false;
        state.vehiculoElegido = action.payload;
      })
      .addCase(fetchVehiculoParaPublicar.rejected, (state, action) => {
        if (state.requestIdElegido !== action.meta.requestId) return;
        state.loadingElegido = false;
        state.errorElegido = action.payload || action.error.message;
      })
      .addCase(fetchFotosVehiculo.pending, (state, action) => {
        state.versionFotos += 1;
        state.fotosPorVehiculo[action.meta.arg] = {
          fotos: null, loading: true, error: null, requestId: action.meta.requestId,
        };
      })
      .addCase(fetchFotosVehiculo.fulfilled, (state, action) => {
        const entrada = state.fotosPorVehiculo[action.meta.arg];
        if (entrada?.requestId !== action.meta.requestId) return;
        entrada.loading = false;
        entrada.fotos = action.payload;
      })
      .addCase(fetchFotosVehiculo.rejected, (state, action) => {
        const entrada = state.fotosPorVehiculo[action.meta.arg];
        if (entrada?.requestId !== action.meta.requestId) return;
        entrada.loading = false;
        entrada.error = "No se pudieron cargar las fotos.";
      })
      .addCase(logout, () => initialState);
  },
});

export default vehiculosSlice.reducer;
export const { elegirVehiculoPublicacion, olvidarFotosVehiculo } = vehiculosSlice.actions;
