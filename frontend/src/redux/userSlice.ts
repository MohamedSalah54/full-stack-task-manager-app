import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CreateUserState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: CreateUserState = {
  user: null,
  loading: false,
  error: null,
};

export const createUserSlice = createSlice({
  name: 'createUser',
  initialState,
  reducers: {
    setLoading(state) {
      state.loading = true;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    setUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
      state.loading = false;
    },
    resetState(state) {
      state.loading = false;
      state.error = null;
      state.user = null;
    },
  },
});

export const { setLoading, setError, setUser, resetState } = createUserSlice.actions;

export default createUserSlice.reducer;
