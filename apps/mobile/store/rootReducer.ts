import { combineReducers } from '@reduxjs/toolkit';
import authSlice from '../store/slices/auth/auth.slice';
import userSlice from '../store/slices/user/user.slice';
import appSlice from '../store/slices/app/app.slice';
import apiSlice from '../store/slices/api/api.slice';

const rootReducer = combineReducers({
  // API
  api: apiSlice,

  // Feature slices
  auth: authSlice,
  user: userSlice,
  app: appSlice,

  // Add other feature slices here as they are created
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;