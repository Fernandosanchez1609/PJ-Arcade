
"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { connectWebSocket, disconnectWebSocket } from "@/lib/WsClient";
import { setOnlineCount } from "@/store/slices/onlineSlice";

export default function WsConnector() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) return;

    connectWebSocket((msg) => {
      if (msg.Type === "onlineCount") {
        dispatch(setOnlineCount(msg.Data));
      }
      // …otros tipos si los necesitas…
    });

    return () => {
      disconnectWebSocket();
    };
  }, [token, dispatch]);

  return null;
}
