import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken, mensajeDe } from "../../utils/api";
import { logout } from "./userSlice";

const SIN_CONEXION = "No pudimos conectar con el servidor. Intentá nuevamente.";

// Un error de axios con mensaje listo para mostrar
function errorDe(error, porDefecto) {
  return new Error(error.response ? mensajeDe(error, porDefecto) : SIN_CONEXION, { cause: error });
}

// Reservas que el usuario todavía puede calificar
export const fetchPendientes = createAsyncThunk("resenas/fetchPendientes", async (_, { getState }) => {
  try {
    return (await axios.get(`${API_URL}/resenas/pendientes`, conToken(getState().users.token))).data;
  } catch (error) {
    throw errorDe(error, "No pudimos cargar tus reseñas pendientes.");
  }
});

// Las reseñas que escribió el usuario
export const fetchMisResenas = createAsyncThunk("resenas/fetchMisResenas", async (_, { getState }) => {
  try {
    return (await axios.get(`${API_URL}/resenas/mias`, conToken(getState().users.token))).data;
  } catch (error) {
    throw errorDe(error, "No pudimos cargar tus reseñas.");
  }
});

// Las reseñas de una reserva: { mia, deLaOtraParte, otraParteYaCalifico }
export const fetchResenasReserva = createAsyncThunk("resenas/fetchResenasReserva", async (idReserva, { getState }) => {
  try {
    const { data } = await axios.get(`${API_URL}/resenas/reserva/${idReserva}`, conToken(getState().users.token));
    return { ...data, idReserva };
  } catch (error) {
    throw errorDe(error, "No pudimos cargar las calificaciones.");
  }
});

// Guarda la reseña confirmada por el usuario.
const guardarResena = (tipo, editar) => createAsyncThunk(tipo, async (datos, { getState, requestId, rejectWithValue, dispatch }) => {
  const token = getState().users.token;
  const cambioSesion = () => getState().users.token !== token || getState().resenas.requestIdGuardar !== requestId;
  try {
    const { idReserva, idResena, estrellas, comentario } = datos;
    const { data } = editar
      ? await axios.put(`${API_URL}/resenas/${idResena}`, { estrellas, comentario }, conToken(token))
      : await axios.post(`${API_URL}/resenas`, { idReserva, estrellas, comentario }, conToken(token));
    if (cambioSesion()) return rejectWithValue({ sesionCambiada: true });
    return data;
  } catch (error) {
    if (cambioSesion()) return rejectWithValue({ sesionCambiada: true });
    if (error.response?.status === 409) dispatch(fetchPendientes());
    throw errorDe(error, "No se pudo guardar la calificación.");
  }
}, { condition: (_, { getState }) => Boolean(getState().users.token) && !getState().resenas.guardando });

export const crearResena = guardarResena("resenas/crearResena", false);
export const editarResena = guardarResena("resenas/editarResena", true);

const lista = (data) => (Array.isArray(data) ? data : data?.content ?? []);

// Perfil público: el perfil, sus publicaciones y sus reseñas de los dos roles, en paralelo (sin token)
export const fetchPerfilPublico = createAsyncThunk("resenas/fetchPerfilPublico", async (idUsuario) => {
  try {
    const resenas = (rol) => axios.get(`${API_URL}/resenas/usuario/${idUsuario}`, { params: { rol } });
    const [perfil, comoPropietario, comoConductor] = await Promise.all([
      axios.get(`${API_URL}/usuarios/${idUsuario}/perfil`),
      resenas("PROPIETARIO"),
      resenas("CONDUCTOR"),
    ]);
    return {
      idUsuario: String(idUsuario),
      perfil: perfil.data,
      PROPIETARIO: lista(comoPropietario.data),
      CONDUCTOR: lista(comoConductor.data),
    };
  } catch (error) {
    throw errorDe(error, "No pudimos cargar este perfil.");
  }
});

export const fetchPublicacionesPerfil = createAsyncThunk("resenas/fetchPublicacionesPerfil", async ({ idUsuario, pagina }) => {
  try {
    const { data } = await axios.get(`${API_URL}/publicaciones/usuario/${idUsuario}`, { params: { page: pagina, size: 10 } });
    return { idUsuario: String(idUsuario), pagina: data };
  } catch (error) {
    throw errorDe(error, "No pudimos cargar las publicaciones.");
  }
});

export const fetchPropietario = createAsyncThunk("resenas/fetchPropietario", async (idUsuario, { getState }) => {
  const perfil = getState().resenas.perfil.datos;
  if (perfil?.idUsuario === String(idUsuario)) return perfil.perfil;
  try {
    return (await axios.get(`${API_URL}/usuarios/${idUsuario}/perfil`)).data;
  } catch (error) {
    throw errorDe(error, "No pudimos cargar al propietario.");
  }
});

const vacio = { datos: null, loading: false, error: null, requestId: null };

function incorporarResena(state, resena) {
  if (state.mias.datos) {
    const indice = state.mias.datos.findIndex((item) => item.idResena === resena.idResena);
    if (indice === -1) state.mias.datos.unshift(resena);
    else state.mias.datos[indice] = { ...resena, publicada: resena.publicada || state.mias.datos[indice].publicada };
  }
  if (state.pendientes.datos) {
    state.pendientes.datos = state.pendientes.datos.filter((item) => item.idReserva !== resena.idReserva);
  }
  if (String(state.reserva.datos?.idReserva) === String(resena.idReserva)) {
    const publicada = resena.publicada || state.reserva.datos.mia?.publicada;
    state.reserva.datos.mia = { ...resena, publicada: Boolean(publicada) };
  }
}

const initialState = {
  pendientes: vacio,
  mias: vacio,
  reserva: vacio,
  perfil: vacio,
  publicacionesPerfil: vacio,
  propietario: vacio,
  guardando: false,
  errorGuardar: null,
  idReservaGuardar: null,
  requestIdGuardar: null,
  cambiosDuranteCarga: [],
};

const resenasSlice = createSlice({
  name: "resenas",
  initialState,
  reducers: {
    limpiarErrorResena: (state) => { state.errorGuardar = null; },
  },
  extraReducers: (builder) => {
    // Cada lista guarda sus datos, si está cargando y su error; una respuesta vieja no pisa a la más nueva
    const cargar = (thunk, clave) => builder
      .addCase(thunk.pending, (state, action) => {
        state[clave].loading = true;
        state[clave].error = null;
        state[clave].requestId = action.meta.requestId;
      })
      .addCase(thunk.fulfilled, (state, action) => {
        if (state[clave].requestId !== action.meta.requestId) return;
        state[clave] = { datos: action.payload, loading: false, error: null, requestId: null };
        if (["mias", "pendientes", "reserva"].includes(clave)) {
          for (const resena of state.cambiosDuranteCarga) incorporarResena(state, resena);
          if (![state.mias, state.pendientes, state.reserva].some((entrada) => entrada.loading)) state.cambiosDuranteCarga = [];
        }
      })
      .addCase(thunk.rejected, (state, action) => {
        if (state[clave].requestId !== action.meta.requestId) return;
        state[clave].loading = false;
        state[clave].requestId = null;
        state[clave].error = action.error.message;
        if (![state.mias, state.pendientes, state.reserva].some((entrada) => entrada.loading)) state.cambiosDuranteCarga = [];
      });

    cargar(fetchPendientes, "pendientes");
    cargar(fetchMisResenas, "mias");
    cargar(fetchResenasReserva, "reserva");
    cargar(fetchPerfilPublico, "perfil");
    cargar(fetchPublicacionesPerfil, "publicacionesPerfil");
    cargar(fetchPropietario, "propietario");
    for (const thunk of [crearResena, editarResena]) {
      builder
        .addCase(thunk.pending, (state, action) => {
          state.guardando = true;
          state.errorGuardar = null;
          state.idReservaGuardar = action.meta.arg.idReserva;
          state.requestIdGuardar = action.meta.requestId;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          if (state.requestIdGuardar !== action.meta.requestId) return;
          state.guardando = false;
          state.requestIdGuardar = null;
          incorporarResena(state, action.payload);
          if ([state.mias, state.pendientes, state.reserva].some((entrada) => entrada.loading)) {
            const indice = state.cambiosDuranteCarga.findIndex((item) => item.idResena === action.payload.idResena);
            if (indice === -1) state.cambiosDuranteCarga.push(action.payload);
            else state.cambiosDuranteCarga[indice] = action.payload;
          }
        })
        .addCase(thunk.rejected, (state, action) => {
          if (state.requestIdGuardar !== action.meta.requestId) return;
          state.guardando = false;
          state.requestIdGuardar = null;
          if (!action.payload?.sesionCambiada) state.errorGuardar = action.error.message;
        });
    }
    builder.addCase(logout, () => initialState);
  },
});

export default resenasSlice.reducer;
export const { limpiarErrorResena } = resenasSlice.actions;
