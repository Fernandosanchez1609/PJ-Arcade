export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
  LOGIN:  `${API_BASE}/api/User/login`,
  REGISTER: `${API_BASE}/api/User/register`,
};