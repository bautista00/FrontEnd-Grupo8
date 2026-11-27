import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken, mensajeDe } from "../../utils/api";

// La respuesta quedó vieja si se cerró o cambió la sesión, o si hay una petición más nueva
const sesionCambiada = (getState, token, campoRequestId, requestId) =>
  getState().users.token !== token || getState().users[campoRequestId] !== requestId;

// Datos del usuario logueado: el backend lo identifica por el token
export const fetchUser = createAsyncThunk("users/fetchUser", async (_, { getState, dispatch, requestId, rejectWithValue }) => {
  const token = getState().users.token;
  try {
    const { data } = await axios.get(`${API_URL}/usuarios/me`, conToken(token));
    if (sesionCambiada(getState, token, "requestIdUser", requestId)) return rejectWithValue({ sesionCambiada: true });
    return data;
  } catch (error) {
    if (sesionCambiada(getState, token, "requestIdUser", requestId)) return rejectWithValue({ sesionCambiada: true });
    if (error.response?.status === 401) {
      dispatch(logout());
      return rejectWithValue({ sesionCambiada: true });
    }
    const mensaje = error.response
      ? mensajeDe(error, "No se pudieron cargar tus datos.")
      : "No pudimos conectar con el servidor. Intentá nuevamente.";
    throw new Error(mensaje, { cause: error });
  }
});

// Cambios del perfil propio. Cada uno devuelve el usuario actualizado; el error llega con el mensaje del backend
const crearThunkPerfil = (tipo, pedido, mensajeError) => createAsyncThunk(tipo, async (datos, { getState, requestId, rejectWithValue }) => {
  const token = getState().users.token;
  try {
    const resultado = await pedido(datos, conToken(token));
    if (sesionCambiada(getState, token, "requestIdPerfil", requestId)) return rejectWithValue({ sesionCambiada: true });
    return resultado;
  } catch (error) {
    if (sesionCambiada(getState, token, "requestIdPerfil", requestId)) return rejectWithValue({ sesionCambiada: true });
    throw new Error(error.response ? mensajeDe(error, mensajeError) : "No pudimos conectar con el servidor. Intentá nuevamente.", { cause: error });
  }
}, { condition: (_, { getState }) => Boolean(getState().users.token) && !getState().users.guardandoPerfil });

export const actualizarTelefono = crearThunkPerfil("users/actualizarTelefono", async (telefono, config) => {
  const { data } = await axios.put(`${API_URL}/usuarios/me/telefono`, { telefono }, config);
  return data;
}, "No se pudo guardar el teléfono.");

export const actualizarEmail = crearThunkPerfil("users/actualizarEmail", async ({ email, password }, config) => {
  const { data } = await axios.put(`${API_URL}/usuarios/me/email`, { email, password }, config);
  return { token: data.token, email: email.trim() };
}, "No se pudo cambiar el correo.");

export const cambiarContrasena = crearThunkPerfil("users/cambiarContrasena", async ({ actual, nueva }, config) => {
  await axios.put(`${API_URL}/usuarios/me/password`, { actual, nueva }, config);
}, "No se pudo cambiar la contraseña.");

export const subirFoto = crearThunkPerfil("users/subirFoto", async (archivo, config) => {
  const formData = new FormData();
  formData.append("file", archivo);
  const { data } = await axios.post(`${API_URL}/usuarios/me/foto`, formData, config);
  return data;
}, "No se pudo subir la foto.");

export const quitarFoto = crearThunkPerfil("users/quitarFoto", async (_, config) => {
  const { data } = await axios.delete(`${API_URL}/usuarios/me/foto`, config);
  return data;
}, "No se pudo quitar la foto.");

// Login y registro: los dos devuelven el token de la nueva sesión
const crearThunkAuth = (tipo, ruta, mensajeError) => createAsyncThunk(
  tipo,
  async (datos, { getState, dispatch, requestId, rejectWithValue }) => {
    const token = getState().users.token;
    try {
      const { data } = await axios.post(`${API_URL}${ruta}`, datos);
      if (sesionCambiada(getState, token, "requestIdAuth", requestId)) return rejectWithValue({ sesionCambiada: true });
      // Limpia la sesión anterior (y los demás slices) antes de guardar el token nuevo
      dispatch(logout());
      return data.token;
    } catch (error) {
      if (sesionCambiada(getState, token, "requestIdAuth", requestId)) return rejectWithValue({ sesionCambiada: true });
      const mensaje = error.response
        ? mensajeDe(error, mensajeError)
        : "No pudimos conectar con el servidor. Intentá nuevamente.";
      throw new Error(mensaje, { cause: error });
    }
  },
  { condition: (_, { getState }) => !getState().users.loadingAuth },
);

export const loginUser = crearThunkAuth("users/loginUser", "/auth/login", "El correo o la contraseña no son correctos.");
export const registerUser = crearThunkAuth("users/registerUser", "/auth/register", "No pudimos crear la cuenta. Intentá nuevamente.");

const initialState = {
  user: {},
  token: null,
  loading: false,
  error: null,
  requestIdUser: null,
  loadingAuth: false,
  errorAuth: null,
  requestIdAuth: null,
  guardandoPerfil: false,
  errorPerfil: null,
  operacionPerfil: null,
  requestIdPerfil: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // Guarda el token que devuelve el login o el registro
    setToken: (state, action) => {
      state.token = action.payload;
    },
    // Cierra la sesión: vuelve al estado inicial y Redux Persist guarda el token en null
    logout: () => initialState,
    // Al entrar al login o al registro no se muestra el error del otro formulario
    limpiarErrorAuth: (state) => {
      state.errorAuth = null;
    },
    limpiarErrorPerfil: (state) => {
      state.errorPerfil = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.requestIdUser = action.meta.requestId;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        if (state.requestIdUser !== action.meta.requestId) return;
        state.loading = false;
        state.requestIdUser = null;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        if (state.requestIdUser !== action.meta.requestId) return;
        state.loading = false;
        state.requestIdUser = null;
        if (!action.payload?.sesionCambiada) state.error = action.error.message;
      });

    for (const thunk of [actualizarTelefono, actualizarEmail, cambiarContrasena, subirFoto, quitarFoto]) {
      builder
        .addCase(thunk.pending, (state, action) => {
          state.guardandoPerfil = true;
          state.errorPerfil = null;
          state.operacionPerfil = thunk.typePrefix;
          state.requestIdPerfil = action.meta.requestId;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          if (state.requestIdPerfil !== action.meta.requestId) return;
          state.guardandoPerfil = false;
          state.requestIdPerfil = null;
          // Un GET anterior al guardado ya no puede reemplazar estos datos.
          state.requestIdUser = null;
          state.loading = false;
          if (thunk === actualizarEmail) {
            state.token = action.payload.token;
            state.user.email = action.payload.email;
          } else if (thunk !== cambiarContrasena) {
            state.user = action.payload;
          }
        })
        .addCase(thunk.rejected, (state, action) => {
          if (state.requestIdPerfil !== action.meta.requestId) return;
          state.guardandoPerfil = false;
          state.requestIdPerfil = null;
          if (!action.payload?.sesionCambiada) state.errorPerfil = action.error.message;
        });
    }

    for (const thunk of [loginUser, registerUser]) {
      builder
        .addCase(thunk.pending, (state, action) => {
          state.loadingAuth = true;
          state.errorAuth = null;
          state.requestIdAuth = action.meta.requestId;
        })
        // El logout del thunk ya dejó el estado inicial: solo falta el token nuevo
        .addCase(thunk.fulfilled, (state, action) => {
          state.token = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          if (state.requestIdAuth !== action.meta.requestId) return;
          state.loadingAuth = false;
          state.requestIdAuth = null;
          if (!action.payload?.sesionCambiada) state.errorAuth = action.error.message;
        });
    }
  },
});

export const { setToken, logout, limpiarErrorAuth, limpiarErrorPerfil } = userSlice.actions;
export default userSlice.reducer;
