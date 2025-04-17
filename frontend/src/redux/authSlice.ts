import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      
      // تخزين البيانات في الـ cookies بدلاً من localStorage
      Cookies.set("token", action.payload.token, { expires: 7 });  // تواريخ انتهاء الصلاحية يمكن تعديلها حسب الحاجة
      Cookies.set("user", JSON.stringify(action.payload.user), { expires: 7 });
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null; 

      // إزالة البيانات من الـ cookies عند تسجيل الخروج
      Cookies.remove("token");
      Cookies.remove("user");
    },
    checkAuth: (state) => {
      const token = Cookies.get("token");  // قراءة الـ token من الـ cookies
      const user = Cookies.get("user");    // قراءة الـ user من الـ cookies

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
