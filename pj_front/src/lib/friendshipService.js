import { ENDPOINTS } from "./Endpoints";

export async function getFriends() {
  const token = localStorage.getItem("token");
  const res = await fetch(ENDPOINTS.GET_FRIENDS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener amigos");
  return await res.json();
}


export async function getPendingReceivedRequests() {
  const token = localStorage.getItem("token");
  const res = await fetch(ENDPOINTS.GET_PENDING_RECEIVED_REQUESTS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener solicitudes recibidas");
  return await res.json();
}


export async function getPendingSentRequests() {
  const token = localStorage.getItem("token");
  const res = await fetch(ENDPOINTS.GET_PENDING_SENT_REQUESTS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener solicitudes enviadas");
  return await res.json();
}

