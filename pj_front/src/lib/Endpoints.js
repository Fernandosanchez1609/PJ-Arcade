export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
  LOGIN:  `${API_BASE}/api/User/login`,
  REGISTER: `${API_BASE}/api/User/register`,
  GAMES: `${API_BASE}/api/Game`,
  USERS: `${API_BASE}/api/User/AllUsers`,
  TOGGLE_ROLE: (userId) => `${API_BASE}/api/User/toggle-role/${userId}`,
};