export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
  LOGIN:  `${API_BASE}/api/User/login`,
  REGISTER: `${API_BASE}/api/User/register`,
  GAMES: `${API_BASE}/api/Game`,
  USERS: `${API_BASE}/api/User/AllUsers`,
  TOGGLE_ROLE: (userId) => `${API_BASE}/api/User/toggle-role/${userId}`,
  DELETE_USER: (userId) => `${API_BASE}/api/User/Delete/${userId}`,
  TOGGLE_BAN: (userId) => `${API_BASE}/api/User/ban/${userId}`,
  SEND_FRIEND_REQUEST: `${API_BASE}/api/Friendship/send`,
  ACCEPT_FRIEND_REQUEST: (requestId) => `${API_BASE}/api/Friendship/accept/${requestId}`,
  REJECT_FRIEND_REQUEST: (requestId) => `${API_BASE}/api/Friendship/reject/${requestId}`,
  GET_PENDING_RECEIVED_REQUESTS: `${API_BASE}/api/Friendship/pending`,
  GET_PENDING_SENT_REQUESTS: `${API_BASE}/api/Friendship/pending/sent`,
  GET_FRIENDS: `${API_BASE}/api/Friendship/friends`,
};