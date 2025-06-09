import { ENDPOINTS } from "./Endpoints";

export async function getFriends() {
  const token = localStorage.getItem("token");
  if (!token) {
    return [];
  }

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
  if (!token) {
    return [];
  }
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
  if (!token) {
    return [];
  }
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

export async function sendFriendRequest(receiverId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Usuario no autenticado");

  const res = await fetch(ENDPOINTS.SEND_FRIEND_REQUEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ addresseeId: receiverId }),
  });

  if (!res.ok) throw new Error("Error al enviar solicitud de amistad");

  return { message: "Solicitud enviada correctamente" };
}

export async function acceptFriendRequest(requestId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Usuario no autenticado");

  const res = await fetch(ENDPOINTS.ACCEPT_FRIEND_REQUEST(requestId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al aceptar solicitud de amistad");

  // Cambia a res.text() porque la respuesta es texto plano
  return await res.text();
}


export async function rejectFriendRequest(requestId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Usuario no autenticado");

  const res = await fetch(ENDPOINTS.REJECT_FRIEND_REQUEST(requestId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al rechazar solicitud de amistad");
  return await res.json();
}