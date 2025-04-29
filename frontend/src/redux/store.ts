// store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import taskReducer from './taskSlice';
import accountReducer from './accountReducer';
import createUserReducer from './userSlice';
import userReducer from './accountReducer';
import profileReducer from './profileSlice'
import teamReducer from './teamSlice';
import notificationReducer from './notificationSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    account: accountReducer,
    createUser: createUserReducer,
    user: userReducer,
    profile: profileReducer,
    teams: teamReducer, 
    notifications: notificationReducer,


  },

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
