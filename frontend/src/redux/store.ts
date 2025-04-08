// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import taskReducer from './taskSlice';
import accountReducer from './accountReducer';
import createUserReducer from './userSlice';
import userReducer from './accountReducer';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    account: accountReducer,
    createUser: createUserReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
