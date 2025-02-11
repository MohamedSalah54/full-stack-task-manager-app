 interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
  }
  
  export const initialState: AuthState = {
    isAuthenticated: false,
    token: null,
  };