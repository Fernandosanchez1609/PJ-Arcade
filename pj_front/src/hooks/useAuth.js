// src/hooks/useAuth.js
'use client';

import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, clearCredentials } from '@/store/slices/authSlice';
import * as authService from '@/lib/authService';

export function useAuth() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user  = useSelector((state) => state.auth.user);

  // Llama al endpoint, recoge el token y lo guarda en Redux (+ localStorage via slice)
  const login = async ({ email, password }) => {
    const data = await authService.login({ email, password });
    // <-- Aquí lees accessToken en lugar de token
    const accessToken = data.accessToken;
    dispatch(setCredentials(accessToken));
    return data;
  };

  const register = async ({ name, email, password }) => {
    const data = await authService.register({ name, email, password });
    const accessToken = data.accessToken;
    dispatch(setCredentials(accessToken));
    return data;
  };


  // Borra token de store y de localStorage
  const logout = () => {
    dispatch(clearCredentials());
  };

  return { token, user, login, register, logout };
}
