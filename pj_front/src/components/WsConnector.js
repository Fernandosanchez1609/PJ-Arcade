"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { connectWebSocket, disconnectWebSocket } from "@/lib/WsClient";
import { setOnlineCount } from "@/store/slices/onlineSlice";

export default function WsConnector() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleMessage = (msg) => {
      if (msg.Type === "onlineCount") {
        dispatch(setOnlineCount(msg.Data));
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
