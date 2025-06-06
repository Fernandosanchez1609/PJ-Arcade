"use client";
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFriendship } from '@/hooks/useFriendship';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./FriendSidebar.module.css";
import { sendMessage } from '@/lib/WsClient';

export default function FriendSidebar() {
  const onlineStatus = useSelector((state) => state.friendship.onlineStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');
  const { token, user } = useAuth();
  const {
    friends,
    pendingReceived,
    pendingSent,
    fetchAll,
    acceptRequest,
    rejectRequest,
  } = useFriendship();

  useEffect(() => {
    fetchAll();
  }, [token, user]);

  const handleAceptRequest = async (requestId, newFriendId) => {
    await acceptRequest(requestId);
    sendMessage("RequestAcepted", newFriendId );
  }

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleButton}
        aria-label={isOpen ? "Cerrar barra lateral" : "Abrir barra lateral"}
      >
        {!isOpen ? (
          <ChevronLeft className={styles.iconSize} />
        ) : (
          <ChevronRight className={styles.iconSize} />
        )}
      </button>

      <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabsPadding}>
        <TabsList className={styles.tabsListGrid}>
          <TabsTrigger value="friends" className={styles.tabsTrigger}>Amigos</TabsTrigger>
          <TabsTrigger value="received" className={styles.tabsTrigger}>Recibidas</TabsTrigger>
          <TabsTrigger value="sent" className={styles.tabsTrigger}>Enviadas</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <ul className={styles.listMarginTop}>
            {friends.map((friend) => {
              const isOnline = onlineStatus[friend.userId];
              return (
                <li key={friend.userId} className={styles.listItem}>
                  {friend.name}{" "}
                  <span>
                    {isOnline ? "🟢" : "⚪"}
                  </span>
                </li>
              );
            })}
          </ul>
        </TabsContent>

        <TabsContent value="received">
          <ul className={styles.listMarginTop}>
            {pendingReceived.map((req) => (
              <li key={req.id} className={styles.listItem} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{req.requester.name}</span>
                <span>
                  <button
                    onClick={() => handleAceptRequest(req.id, req.requester.id)}
                    aria-label="Aceptar solicitud"
                    style={{ marginRight: 8, cursor: "pointer", background: "none", border: "none", fontSize: "1.2rem" }}
                  >
                    ✔️
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    aria-label="Rechazar solicitud"
                    style={{ cursor: "pointer", background: "none", border: "none", fontSize: "1.2rem" }}
                  >
                    ❌
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </TabsContent>


        <TabsContent value="sent">
          <ul className={styles.listMarginTop}>
            {pendingSent.map((req) => (
              <li key={req.id} className={styles.listItem}>
                {req.addressee.name}
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
