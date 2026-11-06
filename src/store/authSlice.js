import { createSlice } from '@reduxjs/toolkit';
import { api } from './apiSlice';
import { logout } from './authActions';

const TOKEN_KEY = 'loop_token';

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
const writeToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — session just won't persist */
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: readToken(), user: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout, (state) => {
        state.token = null;
        state.user = null;
        writeToken(null);
      })
      .addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.token = payload.token;
        state.user = payload.user;
        writeToken(payload.token);
      })
      // On page reload we have a token but no user yet; /auth/me fills it in.
      .addMatcher(api.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
      });
  },
});

export default authSlice.reducer;
export const selectToken = (s) => s.auth.token;
export const selectUser = (s) => s.auth.user;
