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

// ───────── NUEVO: paso 1, los dos thunks ─────────
export const createVehiculo = createAsyncThunk(
  "vehiculos/createVehiculo",
  async (nuevoVehiculo, { getState }) => {
    try {
      const { data } = await axios.post(`${API_URL}/vehiculo`, nuevoVehiculo, conToken(getState().users.token));
      return data; // POST: el back devuelve solo el vehículo recién creado (con su idVehiculo)
    } catch (error) {
      throw new Error(mensajeDe(error, "No se pudo registrar el vehículo. Intentá nuevamente."), { cause: error });
    }
  },
);

export const updateVehiculo = createAsyncThunk(
  "vehiculos/updateVehiculo",
  async (vehiculoEditado, { getState }) => {
    const { id, ...datos } = vehiculoEditado; // el id va solo en la URL, no en el body
    try {
      const { data } = await axios.put(`${API_URL}/vehiculo/${id}`, datos, conToken(getState().users.token));
      return data; // PUT: el back devuelve el vehículo modificado
    } catch (error) {
      throw new Error(mensajeDe(error, "No se pudo guardar el vehículo. Intentá nuevamente."), { cause: error });
    }
  },
);

export const deleteVehiculo = createAsyncThunk(
  "vehiculos/deleteVehiculo",
  async (idVehiculo, { getState }) => {
    try {
      await axios.delete(`${API_URL}/vehiculo/${idVehiculo}`, conToken(getState().users.token));
      return idVehiculo; // DELETE devuelve 204 sin cuerpo: se devuelve el id para sacarlo del estado
    } catch (error) {
      throw new Error(mensajeDe(error, "No se pudo eliminar el vehículo. Intentá nuevamente."), { cause: error });
    }
  },
);

export const fetchVehiculo = createAsyncThunk("vehiculos/fetchVehiculo", async (id, { getState }) => {
  try {
    const { data } = await axios.get(`${API_URL}/vehiculo/${id}`, conToken(getState().users.token));
    return data; // GET por id: el back devuelve un solo vehículo
  } catch (error) {
    throw new Error(mensajeDe(error, "No pudimos cargar el vehículo."), { cause: error });
  }
});

export const fetchFlotaVehiculos = createAsyncThunk("vehiculos/fetchFlotaVehiculos", async (_, { getState }) => {
  try {
    const { data } = await axios.get(`${API_URL}/vehiculo/mios?size=100`, conToken(getState().users.token));
    return data.content; // la respuesta es una página: la lista está en content
  } catch (error) {
    throw new Error(mensajeDe(error, "No pudimos cargar tus vehículos."), { cause: error });
  }
});

export const fetchPublicacionVigente = createAsyncThunk(
  "vehiculos/fetchPublicacionVigente",
  async (idVehiculo, { getState }) => {
    try {
      const { data } = await axios.get(`${API_URL}/publicaciones/mias?size=100`, conToken(getState().users.token));
      // GET: el back devuelve una página, la lista está en content. Si no hay ninguna vigente, se devuelve null
      return data.content.find(
        (publicacion) => publicacion.estado !== "DESACTIVADA" && publicacion.idVehiculo === Number(idVehiculo),
      ) ?? null;
    } catch (error) {
      throw new Error(mensajeDe(error, "No se pudo verificar la publicación del vehículo."), { cause: error });
    }
  },
);

export const guardarFotosVehiculo = createAsyncThunk(
  "vehiculos/guardarFotosVehiculo",
  async ({ idVehiculo, originales, actuales }, { getState }) => {
    const config = conToken(getState().users.token);
    const idsActuales = new Set(actuales.map((foto) => foto.idFoto));
    try {
      for (const foto of originales) {
        if (!idsActuales.has(foto.idFoto)) {
          await axios.delete(`${API_URL}/imagen-vehiculo/${foto.idFoto}`, config);
        }
      }
      for (const foto of actuales) {
        if (foto.archivo) {
          const form = new FormData();
          form.append("file", foto.archivo);
          form.append("idVehiculo", idVehiculo);
          form.append("orden", foto.orden);
          await axios.post(`${API_URL}/imagen-vehiculo`, form, config);
        } else {
          const original = originales.find((otra) => otra.idFoto === foto.idFoto);
          if (original && original.orden !== foto.orden) {
            // El back lee "orden" como parámetro, por eso va en la URL
            await axios.put(`${API_URL}/imagen-vehiculo/${foto.idFoto}?orden=${foto.orden}`, null, config);
          }
        }
      }
      // El payload es lo que quedó guardado en el back, no lo que había en pantalla
      return { idVehiculo, fotos: await fotosDeVehiculo(idVehiculo) };
    } catch (error) {
      throw new Error(mensajeDe(error, "No se pudieron guardar las fotos. Intentá nuevamente."), { cause: error });
    }
  },
);
// ───────── fin de lo nuevo ─────────

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
  loadingGuardar: false, // NUEVO: paso 2
  errorGuardar: null,    // NUEVO: paso 2
  loadingEliminar: false,
  errorEliminar: null,
  vehiculoActual: null,       // vehículo que se está editando o al que se le cargan fotos
  loadingVehiculo: false,
  errorVehiculo: null,
  requestIdVehiculo: null,
  flota: [],                  // mis vehículos, para detectar patentes repetidas
  loadingFlota: false,
  errorFlota: null,
  // NUEVO: fotos del vehículo (pantalla FotosVehiculo)
  loadingGuardarFotos: false,
  errorGuardarFotos: null,
  publicacionVigente: null,       // publicación ACTIVA o PAUSADA del vehículo, o null si no tiene
  loadingPublicacionVigente: false,
  errorPublicacionVigente: null,
  requestIdPublicacionVigente: null, // para ignorar respuestas viejas si se cambia de vehículo
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
    // NUEVO: paso 3
    limpiarErrorGuardar: (state) => {
      state.errorGuardar = null;
    },
    limpiarErrorEliminar: (state) => {
    state.errorEliminar = null;
    },
    // NUEVO
    limpiarErrorGuardarFotos: (state) => {
      state.errorGuardarFotos = null;
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
      // ───────── NUEVO: paso 4, los addCase ─────────
      .addCase(createVehiculo.pending, (state) => {
        state.loadingGuardar = true;
        state.errorGuardar = null;
      })
      .addCase(createVehiculo.fulfilled, (state) => {
        state.loadingGuardar = false;
        // No se agrega a vehiculos.content: la lista es paginada y la tarjeta necesita fotos y
        // publicacionActual, que el POST no devuelve. MisVehiculos vuelve a pedir la página al montarse.
      })
      .addCase(createVehiculo.rejected, (state, action) => {
        state.loadingGuardar = false;
        state.errorGuardar = action.error.message;
      })
      .addCase(updateVehiculo.pending, (state) => {
        state.loadingGuardar = true;
        state.errorGuardar = null;
      })
      .addCase(updateVehiculo.fulfilled, (state, action) => {
        state.loadingGuardar = false;
        const editado = action.payload;
        const lista = state.vehiculos?.content;
        const index = lista ? lista.findIndex((v) => v.idVehiculo === editado.idVehiculo) : -1;
        if (index !== -1) {
          // Se mezcla para no perder las fotos y la publicación que ya tenía la tarjeta
          lista[index] = { ...lista[index], ...editado };
        }
        if (state.vehiculoElegido?.idVehiculo === editado.idVehiculo) {
          state.vehiculoElegido = editado;
        }
        if (state.vehiculoActual?.idVehiculo === editado.idVehiculo) {
          state.vehiculoActual = editado;
        }
      })
      .addCase(updateVehiculo.rejected, (state, action) => {
        state.loadingGuardar = false;
        state.errorGuardar = action.error.message;
      })
      .addCase(deleteVehiculo.pending, (state) => {
      state.loadingEliminar = true;
      state.errorEliminar = null;
      })
      .addCase(deleteVehiculo.fulfilled, (state, action) => {
        state.loadingEliminar = false;
        const id = action.payload;
        // Para sacar un elemento se usa filter: devuelve todos menos el eliminado
        if (state.vehiculos) {
          const antes = state.vehiculos.content.length;
          state.vehiculos.content = state.vehiculos.content.filter((v) => v.idVehiculo !== id);
          if (state.vehiculos.content.length < antes) state.vehiculos.totalElements -= 1;
          if (state.vehiculoActual?.idVehiculo === id) state.vehiculoActual = null;
        }
        if (state.paraPublicar) {
          state.paraPublicar.content = state.paraPublicar.content.filter((v) => v.idVehiculo !== id);
        }
        if (state.vehiculoElegido?.idVehiculo === id) state.vehiculoElegido = null;
        delete state.fotosPorVehiculo[id];
      })
      .addCase(deleteVehiculo.rejected, (state, action) => {
        state.loadingEliminar = false;
        state.errorEliminar = action.error.message;
      })
      .addCase(fetchVehiculo.pending, (state, action) => {
        state.loadingVehiculo = true;
        state.errorVehiculo = null;
        state.vehiculoActual = null; // evita mostrar por un instante los datos del vehículo anterior
        state.requestIdVehiculo = action.meta.requestId;
      })
      .addCase(fetchVehiculo.fulfilled, (state, action) => {
        if (state.requestIdVehiculo !== action.meta.requestId) return;
        state.loadingVehiculo = false;
        state.vehiculoActual = action.payload;
      })
      .addCase(fetchVehiculo.rejected, (state, action) => {
        if (state.requestIdVehiculo !== action.meta.requestId) return;
        state.loadingVehiculo = false;
        state.errorVehiculo = action.error.message;
      })
      .addCase(fetchFlotaVehiculos.pending, (state) => {
        state.loadingFlota = true;
        state.errorFlota = null;
      })
      .addCase(fetchFlotaVehiculos.fulfilled, (state, action) => {
        state.loadingFlota = false;
        state.flota = action.payload;
      })
      .addCase(fetchFlotaVehiculos.rejected, (state, action) => {
        // Si falla no se bloquea el formulario: solo se pierde la detección de patentes repetidas
        state.loadingFlota = false;
        state.errorFlota = action.error.message;
      })
      .addCase(fetchPublicacionVigente.pending, (state, action) => {
        state.loadingPublicacionVigente = true;
        state.errorPublicacionVigente = null;
        state.publicacionVigente = null; // evita mostrar la publicación del vehículo anterior
        state.requestIdPublicacionVigente = action.meta.requestId;
      })
      .addCase(fetchPublicacionVigente.fulfilled, (state, action) => {
        if (state.requestIdPublicacionVigente !== action.meta.requestId) return;
        state.loadingPublicacionVigente = false;
        state.publicacionVigente = action.payload; // la publicación o null
      })
      .addCase(fetchPublicacionVigente.rejected, (state, action) => {
        if (state.requestIdPublicacionVigente !== action.meta.requestId) return;
        state.loadingPublicacionVigente = false;
        state.errorPublicacionVigente = action.error.message;
      })
      .addCase(guardarFotosVehiculo.pending, (state) => {
        state.loadingGuardarFotos = true;
        state.errorGuardarFotos = null;
      })
      .addCase(guardarFotosVehiculo.fulfilled, (state, action) => {
        state.loadingGuardarFotos = false;
        const { idVehiculo, fotos } = action.payload;
        // Las fotos guardadas reemplazan a las del caché: así la portada se actualiza sin otro GET
        state.fotosPorVehiculo[idVehiculo] = { fotos, loading: false, error: null, requestId: null };
        state.versionFotos += 1; // una carga de Mis vehículos que venía en camino no pisa las fotos nuevas
        // La tarjeta de Mis vehículos usa vehiculo.fotos: se actualiza también
        const tarjeta = state.vehiculos?.content.find((v) => String(v.idVehiculo) === String(idVehiculo));
        if (tarjeta) tarjeta.fotos = fotos;
      })
      .addCase(guardarFotosVehiculo.rejected, (state, action) => {
        state.loadingGuardarFotos = false;
        state.errorGuardarFotos = action.error.message;
      })
      // ───────── fin de lo nuevo ─────────
      .addCase(logout, () => initialState);
  }
  });

export default vehiculosSlice.reducer;
export const { elegirVehiculoPublicacion, olvidarFotosVehiculo, limpiarErrorGuardar, limpiarErrorEliminar, limpiarErrorGuardarFotos } = vehiculosSlice.actions;