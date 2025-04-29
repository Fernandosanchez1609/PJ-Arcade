"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { sendMessage } from "@/lib/WsClient";
import { useAuth }     from "@/hooks/useAuth";
import { ScrollArea }  from "@/components/ui/scroll-area";
import { Input }       from "@/components/ui/input";
import { Button }      from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { addChatMessage } from "@/store/slices/chatSlice";
import styles from "./ChatBox.module.css";

export default function ChatBox() {
  const { user }        = useAuth();
  const rivalSocketId   = useSelector(s => s.match.rivalSocketId);
  const rivalName       = useSelector(s => s.match.rivalName);
  const messages        = useSelector(s => s.chat.messages);
  const dispatch        = useDispatch();

  const [draft, setDraft] = useState("");
  const scrollRef        = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = () => {
    if (!draft.trim() || !rivalSocketId) return;

    sendMessage("PrivateMessage", {
      socketId: rivalSocketId,
      text:     draft
    });

    dispatch(addChatMessage({
      from: "me",
      text: draft,
      timestamp: Date.now(),
    }));
    setDraft("");
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        Chat con {rivalName}
      </header>

      <ScrollArea className={styles.messageList} ref={scrollRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.from === "me" 
                ? styles.messageMe 
                : styles.messageRival
            }
          >
            {msg.from === "rival" && (
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback>
                  {rivalName?.[0]?.toUpperCase() || "R"}
                </AvatarFallback>
              </Avatar>
            )}

            <div className={styles.bubble}>
              {msg.text}
            </div>

            {msg.from === "me" && (
              <Avatar className="h-8 w-8 ml-2">
                <AvatarFallback>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </ScrollArea>

      <div className={styles.inputRow}>
        <Input
          placeholder="Escribe un mensaje…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button 
          onClick={handleSend} 
          disabled={!draft.trim()} 
          className="ml-2"
        >
          Enviar
        </Button>
      </div>
    </div>
  );
}
