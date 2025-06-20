
let socket = null;

/**
 * Conecta al WebSocket y registra el callback de mensajes.
 * @param {(msg: any) => void} onMessage — función que se llamará con cada mensaje recibido.
 */
export function connectWebSocket(onMessage) {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
     socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }
  const url = process.env.NEXT_PUBLIC_WS_URL
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("[WS] Conectado a", url);
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      onMessage(msg);
      console.log("[WS] Mensaje recibido:", msg);
    } catch (err) {
      console.error("[WS] Error al parsear mensaje:", err);
    }
  };

  socket.onerror = (err) => {
    console.error("[WS] Error de conexión:", err);
  };

  socket.onclose = (ev) => {
    console.log("[WS] Conexión cerrada:", ev.code, ev.reason);
    socket = null;
  };
}

/**
 * Envía un mensaje al servidor WebSocket.
 * @param {string} type — tipo de mensaje.
 * @param {any} data — payload del mensaje.
 */
export function sendMessage(type, data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const payload = JSON.stringify({ Type: type, Data: data });
    socket.send(payload);
    console.log("[WS] Mensaje enviado:", payload);
  } else {
    console.warn("[WS] No hay conexión WebSocket activa. Imposible enviar mensaje");
  }
}

/**
 * Desconecta el WebSocket si está abierto.
 */
export function disconnectWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
