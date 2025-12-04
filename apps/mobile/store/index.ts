import { configureStore } from '@reduxjs/toolkit';
// Use feature-specific slices (newer organization under `store/slices`)
import authReducer from './slices/auth/auth.slice';
import userReducer from './slices/user/user.slice';
import appReducer from './slices/app/app.slice';
import apiReducer from './slices/api/api.slice';
import { middleware } from "./middleware"

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    user: userReducer,
    api: apiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;