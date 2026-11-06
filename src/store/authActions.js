import { createAction } from '@reduxjs/toolkit';

// Kept separate from authSlice so apiSlice can dispatch it without a circular import.
export const logout = createAction('auth/logout');
