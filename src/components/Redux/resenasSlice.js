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

// Crea o edita una reseña y vuelve a pedir las listas que la muestran
export const crearResena = createAsyncThunk("resenas/crearResena", async ({ idReserva, estrellas, comentario }, { getState, dispatch }) => {
  try {
    const { data } = await axios.post(`${API_URL}/resenas`, { idReserva, estrellas, comentario }, conToken(getState().users.token));
    dispatch(actualizarListas(idReserva));
    return data;
  } catch (error) {
    // Si el plazo venció (409), vuelve a pedir las pendientes para que "Calificar" desaparezca
    if (error.response?.status === 409) dispatch(fetchPendientes());
    throw errorDe(error, "No se pudo enviar la calificación.");
  }
});

export const editarResena = createAsyncThunk("resenas/editarResena", async ({ idResena, idReserva, estrellas, comentario }, { getState, dispatch }) => {
  try {
    const { data } = await axios.put(`${API_URL}/resenas/${idResena}`, { estrellas, comentario }, conToken(getState().users.token));
    dispatch(actualizarListas(idReserva));
    return data;
  } catch (error) {
    // Si el plazo venció (409), vuelve a pedir las pendientes para que "Calificar" desaparezca
    if (error.response?.status === 409) dispatch(fetchPendientes());
    throw errorDe(error, "No se pudo guardar la calificación.");
  }
});

const actualizarListas = (idReserva) => (dispatch) => {
  dispatch(fetchPendientes());
  dispatch(fetchMisResenas());
  dispatch(fetchResenasReserva(idReserva));
};

const lista = (data) => (Array.isArray(data) ? data : data?.content ?? []);

// Perfil público: el perfil, sus publicaciones y sus reseñas de los dos roles, en paralelo (sin token)
export const fetchPerfilPublico = createAsyncThunk("resenas/fetchPerfilPublico", async (idUsuario) => {
  try {
    const resenas = (rol) => axios.get(`${API_URL}/resenas/usuario/${idUsuario}`, { params: { rol } });
    const [perfil, publicaciones, comoPropietario, comoConductor] = await Promise.all([
      axios.get(`${API_URL}/usuarios/${idUsuario}/perfil`),
      axios.get(`${API_URL}/publicaciones/usuario/${idUsuario}`),
      resenas("PROPIETARIO"),
      resenas("CONDUCTOR"),
    ]);
    return {
      idUsuario: String(idUsuario),
      perfil: perfil.data,
      publicaciones: lista(publicaciones.data),
      PROPIETARIO: lista(comoPropietario.data),
      CONDUCTOR: lista(comoConductor.data),
    };
  } catch (error) {
    throw errorDe(error, "No pudimos cargar este perfil.");
  }
});

const vacio = { datos: null, loading: false, error: null, requestId: null };

const initialState = {
  pendientes: vacio,
  mias: vacio,
  reserva: vacio,
  perfil: vacio,
};

const resenasSlice = createSlice({
  name: "resenas",
  initialState,
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
      })
      .addCase(thunk.rejected, (state, action) => {
        if (state[clave].requestId !== action.meta.requestId) return;
        state[clave].loading = false;
        state[clave].error = action.error.message;
      });

    cargar(fetchPendientes, "pendientes");
    cargar(fetchMisResenas, "mias");
    cargar(fetchResenasReserva, "reserva");
    cargar(fetchPerfilPublico, "perfil");
    builder.addCase(logout, () => initialState);
  },
});

export default resenasSlice.reducer;
