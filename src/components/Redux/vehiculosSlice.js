import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken, mensajeDe } from "../../utils/api";
import { VEHICULOS_POR_PAGINA } from "../../utils/vehiculos";
import { logout } from "./userSlice";

// Fotos de un vehículo con la forma que usan las tarjetas; la primera es la portada
async function fotosDeVehiculo(idVehiculo) {
  const { data } = await axios.get(`${API_URL}/imagen-vehiculo/por-vehiculo/${idVehiculo}`);
  return data.map((imagen) => ({
    idFoto: imagen.id,
    orden: imagen.orden,
    url: `data:image/jpeg;base64,${imagen.file}`,
  }));
}

// Página de mis vehículos con sus fotos y su publicación vigente (ACTIVA o PAUSADA).
// El backend no manda las fotos ni la publicación dentro del vehículo: se piden aparte y se unen por idVehiculo.
export const fetchMisVehiculos = createAsyncThunk("vehiculos/fetchMisVehiculos", async (pagina, { getState }) => {
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

    return { ...vehiculos, content };
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

const initialState = {
  vehiculos: null,
  loading: false,
  error: null,
  // Pedido de la última página solicitada: si se cambia de página, se ignora la respuesta anterior
  requestId: null,
  tiposVehiculo: [],
  loadingTipos: false,
  errorTipos: null,
};

const vehiculosSlice = createSlice({
  name: "vehiculos",
  initialState,
  reducers: {},
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
      .addCase(logout, () => initialState);
  },
});

export default vehiculosSlice.reducer;
