"use client";
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFriendship } from '@/hooks/useFriendship';
import { useAuth } from '@/hooks/useAuth';
import { useFetchProfile } from '@/hooks/useFetchProfiles';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./FriendSidebar.module.css";
import { sendMessage } from '@/lib/WsClient';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProfileList from './ProfileList';
import { toast } from "react-toastify";

export default function FriendSidebar() {
  const onlineStatus = useSelector((state) => state.friendship.onlineStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const { fetchProfiles } = useFetchProfile();
  const { token, user } = useAuth();
  const {
    friends,
    pendingReceived,
    pendingSent,
    fetchAll,
    acceptRequest,
    rejectRequest,
    sendRequest
  } = useFriendship();

  console.log(friends)
  useEffect(() => {
    fetchAll();
  }, [token, user]);

  const handleAceptRequest = async (requestId, newFriendId) => {
    await acceptRequest(requestId);
    sendMessage("RequestAcepted", newFriendId);
  }
  useEffect(() => {
    if (showSearchModal) {
      setLoadingProfiles(true);
      fetchProfiles().then((data) => {
        setProfiles(data);
        setLoadingProfiles(false);
      });
    }
  }, [showSearchModal]);

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
              <li
                key={req.id}
                className={`${styles.listItem} ${styles.listItemActionsContainer}`}
              >
                <span>{req.requester.name}</span>
                <span>
                  <button
                    onClick={() => handleAceptRequest(req.id, req.requester.id)}
                    aria-label="Aceptar solicitud"
                    className={`${styles.listItemButton} ${styles.listItemButtonAccept}`}
                  >
                    ✔️
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    aria-label="Rechazar solicitud"
                    className={`${styles.listItemButton} ${styles.listItemButtonReject}`}
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
      <div className={styles.searchButtonContainer}>
        <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
          <DialogTrigger asChild>
            <button className={styles.searchButton}>
              Agregar amigos
            </button>
          </DialogTrigger>
          <DialogContent className="min-w-[70%] text-white">
            <DialogHeader>
              <DialogTitle>Agregar amigos</DialogTitle>
            </DialogHeader>
            {loadingProfiles ? (
              <p>Cargando perfiles...</p>
            ) : (
              <ProfileList
                profiles={profiles}
                friendIds={friends.map((f) => f.userId)}
                onSendRequest={async (id) => {
                  try {
                    await sendRequest(id);
                    await fetchAll();
                    toast.success("Solicitud de amistad enviada correctamente.");
                  } catch (error) {
                    toast.error("Error al enviar solicitud de amistad:", error);
                    console.log("Error al enviar solicitud de amistad:", error);
                  }
                }}
              />

            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
