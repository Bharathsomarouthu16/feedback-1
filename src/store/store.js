import { configureStore } from '@reduxjs/toolkit';
import { api } from './apiSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
