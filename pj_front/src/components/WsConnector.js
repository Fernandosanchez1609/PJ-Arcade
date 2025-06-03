"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { connectWebSocket, disconnectWebSocket } from "@/lib/WsClient";
import { setOnlineCount } from "@/store/slices/onlineSlice";
import { setRivalUser, setRivalSocket, setPlayerRole } from "@/store/slices/matchSlice";
import { addChatMessage } from "@/store/slices/chatSlice";

export default function WsConnector() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleMessage = (msg) => {
      switch (msg.Type) {
        case "onlineCount":
          dispatch(setOnlineCount(msg.Data));
          break;
        case "RivalFound":
          dispatch(setRivalSocket(msg.Data.RivalId)); 
          dispatch(setPlayerRole(msg.Data.Role));     
          break;
        case "RivalInfo":
          dispatch(setRivalUser({
            userId: msg.Data.userId,
            name: msg.Data.name
          }));
          break;
        case "PrivateMessage":
          dispatch(addChatMessage({
            from: "rival",
            text: msg.Data.text,
            timestamp: Date.now(),
          }));
          break;
        case "Atack":
          const { x, y } = msg.Data;
          window.dispatchEvent(new CustomEvent("rivalAttack", { detail: { x, y } }));
          break;
        default:
          console.warn("[WS] Mensaje no manejado:", msg);
      }
    };
    connectWebSocket(handleMessage);
    const handleBeforeUnload = () => {
      disconnectWebSocket();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      disconnectWebSocket();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dispatch]);

  return null;
}
