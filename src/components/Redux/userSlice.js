import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken, mensajeDe } from "../../utils/api";

// La respuesta quedó vieja si se cerró o cambió la sesión, o si hay una petición más nueva
const sesionCambiada = (getState, token, campoRequestId, requestId) =>
  getState().users.token !== token || getState().users[campoRequestId] !== requestId;

// Datos del usuario logueado: el backend lo identifica por el token
export const fetchUser = createAsyncThunk("users/fetchUser", async (_, { getState, requestId, rejectWithValue }) => {
  const token = getState().users.token;
  try {
    const { data } = await axios.get(`${API_URL}/usuarios/me`, conToken(token));
    if (sesionCambiada(getState, token, "requestIdUser", requestId)) return rejectWithValue({ sesionCambiada: true });
    return data;
  } catch (error) {
    if (sesionCambiada(getState, token, "requestIdUser", requestId)) return rejectWithValue({ sesionCambiada: true });
    const mensaje = error.response
      ? mensajeDe(error, "No se pudieron cargar tus datos.")
      : "No pudimos conectar con el servidor. Intentá nuevamente.";
    throw new Error(mensaje, { cause: error });
  }
});

// Cambios del perfil propio. Cada uno devuelve el usuario actualizado; el error llega con el mensaje del backend
const crearThunkPerfil = (tipo, pedido, mensajeError) => createAsyncThunk(tipo, async (datos, { getState, dispatch }) => {
  try {
    return await pedido(datos, conToken(getState().users.token), dispatch);
  } catch (error) {
    throw new Error(error.response ? mensajeDe(error, mensajeError) : "No pudimos conectar con el servidor. Intentá nuevamente.", { cause: error });
  }
});

export const actualizarTelefono = crearThunkPerfil("users/actualizarTelefono", async (telefono, config) => {
  const { data } = await axios.put(`${API_URL}/usuarios/me/telefono`, { telefono }, config);
  return data;
}, "No se pudo guardar el teléfono.");

// Si el backend devuelve un token nuevo (el correo forma parte del token), se guarda y se vuelve a pedir el usuario
export const actualizarEmail = crearThunkPerfil("users/actualizarEmail", async ({ email, password }, config, dispatch) => {
  const { data } = await axios.put(`${API_URL}/usuarios/me/email`, { email, password }, config);
  if (!data?.token) return (await axios.get(`${API_URL}/usuarios/me`, config)).data;
  dispatch(setToken(data.token));
  return (await axios.get(`${API_URL}/usuarios/me`, conToken(data.token))).data;
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

    // Teléfono, correo y foto devuelven el usuario con el cambio ya hecho
    for (const thunk of [actualizarTelefono, actualizarEmail, subirFoto, quitarFoto]) {
      builder.addCase(thunk.fulfilled, (state, action) => {
        state.user = action.payload;
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

export const { setToken, logout, limpiarErrorAuth } = userSlice.actions;
export default userSlice.reducer;
