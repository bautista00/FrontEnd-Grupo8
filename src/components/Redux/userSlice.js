import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL, conToken } from "../../utils/api";

// Datos del usuario logueado: el backend lo identifica por el token
export const fetchUser = createAsyncThunk("users/fetchUser", async (_, { getState }) => {
  try {
    const { data } = await axios.get(`${API_URL}/usuarios/me`, conToken(getState().users.token));
    return data;
  } catch (error) {
    throw new Error("No se pudieron cargar tus datos.", { cause: error });
  }
});

const initialState = {
  user: {},
  token: null,
  loading: false,
  error: null,
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setToken, logout } = userSlice.actions;
export default userSlice.reducer;
