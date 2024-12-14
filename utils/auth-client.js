'use client';

import { store } from '../store/store';
import { setUser, setSession, clearAuth } from '../store/authSlice';

export const updateAuthState = (user, session) => {
  if (typeof window !== 'undefined') {
    store.dispatch(setUser(user));
    store.dispatch(setSession(session));
  }
};

export const clearAuthState = () => {
  if (typeof window !== 'undefined') {
    store.dispatch(clearAuth());
  }
};
