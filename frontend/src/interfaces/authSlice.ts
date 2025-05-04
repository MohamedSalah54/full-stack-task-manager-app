 interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user:{
      email:String,
      name:String,
      role:String,
      id:String,
      profileImage:String
    } | null;
    error: string | null;
  }
  
  export const initialState: AuthState = {
    isAuthenticated: false,
    token: null,
    user:null,
    error: null,
  
  };
