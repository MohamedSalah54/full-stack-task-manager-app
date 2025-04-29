import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { User } from '../interfaces/user';

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

// ✅ ده المهم: خليه Thunk
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, thunkAPI) => {
  const token = Cookies.get("token");
  const user = Cookies.get("user");

  if (token && user) {
    return { token, user: JSON.parse(user) };
  } else {
    throw new Error("Not authenticated");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;

      Cookies.set("token", action.payload.token, { expires: 7 });
      Cookies.set("user", JSON.stringify(action.payload.user), { expires: 7 });
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;

      Cookies.remove("token");
      Cookies.remove("user");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
