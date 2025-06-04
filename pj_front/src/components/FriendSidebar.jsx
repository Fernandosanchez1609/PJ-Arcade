"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFriends, getPendingReceivedRequests, getPendingSentRequests } from "@/lib/friendshipService";
import styles from "./FriendSidebar.module.css";

export default function FriendSidebar() {
  const [activeTab, setActiveTab] = useState("friends");
  const [isOpen, setIsOpen] = useState(true);

  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsData, receivedData, sentData] = await Promise.all([
          getFriends(),
          getPendingReceivedRequests(),
          getPendingSentRequests(),
        ]);
        setFriends(friendsData);
        setReceivedRequests(receivedData);
        setSentRequests(sentData);
      } catch (error) {
        console.error("Error loading friends data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div
      className={`${styles.sidebar} ${
        isOpen ? styles.sidebarOpen : styles.sidebarClosed
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
            {friends.map((friend) => (
              <li key={friend.userId} className={styles.listItem}>
                {friend.name}
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="received">
          <ul className={styles.listMarginTop}>
            {receivedRequests.map((req) => (
              <li key={req.id} className={styles.listItem}>
                {req.requester.name}
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="sent">
          <ul className={styles.listMarginTop}>
            {sentRequests.map((req) => (
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
