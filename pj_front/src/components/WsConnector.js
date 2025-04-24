
"use client";

import { useEffect } from "react";
import {  useDispatch } from "react-redux";
import { connectWebSocket, disconnectWebSocket } from "@/lib/WsClient";
import { setOnlineCount } from "@/store/slices/onlineSlice";

export default function WsConnector() {
  const dispatch = useDispatch();

  useEffect(() => {

    connectWebSocket((msg) => {
      if (msg.Type === "onlineCount") {
        dispatch(setOnlineCount(msg.Data));
      }
      // …otros tipos si los necesitas…
    });

    return () => {
      disconnectWebSocket();
    };
  }, [dispatch]);

  return null;
}
