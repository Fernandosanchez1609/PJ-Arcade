// src/components/WsConnector.js
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { connectWebSocket, disconnectWebSocket } from "@/lib/WsClient";
import { setOnlineCount } from "@/store/slices/onlineSlice";

export default function WsConnector() {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1) Callback de mensajes
    const handleMessage = (msg) => {
      if (msg.Type === "onlineCount") {
        dispatch(setOnlineCount(msg.Data));
      }
    };

    // 2) Conectar (solo crea 1 socket si no hay ninguno abierto o en proceso)
    connectWebSocket(handleMessage);

    // 3) Asegurar cierre en recarga o cierre de pestaña
    const handleBeforeUnload = () => {
      disconnectWebSocket();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 4) Cleanup de React (al desmontar, e.g. cambio de ruta o Fast Refresh)
    return () => {
      disconnectWebSocket();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dispatch]);

  return null;
}
