import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState} from '@/interfaces/authSlice'



const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user; 
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user)); 
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null; 
      localStorage.removeItem("token");
      localStorage.removeItem("user"); 
    },
    checkAuth: (state) => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        state.isAuthenticated = true;
        state.token = token;
        state.user = JSON.parse(user); 
      }
    },
  },
});

export const { login, logout, checkAuth } = authSlice.actions;
export default authSlice.reducer;
