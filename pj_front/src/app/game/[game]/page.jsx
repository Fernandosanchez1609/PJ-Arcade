"use client"
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { sendMessage } from "@/lib/WsClient";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import styles from "./GamePage.module.css";
import RivalsCard from "@/components/game/RivalsCard";
import ChatBox from "@/components/game/ChatBox";
import GameScreen from "@/components/game/GameScreen";

export default function GamePage({ params }) {
    const { user } = useAuth();
    const { game } = params;

    const rivalSocketId = useSelector((state) => state.match.rivalSocketId);
    const rivalName = useSelector((state) => state.match.rivalName);
    const playerRole = useSelector((state) => state.match.playerRole);

    const [isSearching, setIsSearching] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const handleFindMatch = () => {
        setIsSearching(true);
        sendMessage("Matchmaking", { game });
    };

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile(); // Al montar
        window.addEventListener("resize", checkIfMobile); // Al redimensionar

        return () => window.removeEventListener("resize", checkIfMobile);
    }, []);

    useEffect(() => {
        if (rivalSocketId) {
            setIsSearching(false);
            sendMessage("RivalInfo", {
                socketId: rivalSocketId,
                userId: user.id,
                name: user.name,
            });
        }
    }, [rivalSocketId]);

    if (isMobile) {
        return (
            <div className={styles.container}>
                <h1>{game}</h1>
                <p className={styles.mobileWarning}>
                    ️⚠️ Atención: <br />
                    Este juego no es compatible con dispositivos móviles. <br />
                    lamentamos las molestias.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1>{game}</h1>

            {!rivalSocketId && (
                <Button
                    onClick={handleFindMatch}
                    disabled={isSearching}
                    className="mb-6"
                >
                    {isSearching ? "Buscando partida…" : "Buscar partida"}
                </Button>
            )}

            {rivalSocketId && (
                <div className={styles.rivalsContainer}>
                    {playerRole === "Player1" ? (
                        <>
                            <RivalsCard name={user.name} />
                            <img src="/vs.png" alt="VS" className={styles.vs} />
                            <RivalsCard name={rivalName} />
                        </>
                    ) : (
                        <>
                            <RivalsCard name={rivalName} />
                            <img src="/vs.png" alt="VS" className={styles.vs} />
                            <RivalsCard name={user.name} />
                        </>
                    )}
                </div>
            )}

            <div className={styles.gameContainer}>
                {rivalSocketId && (
                    <div className={styles.gameWrapper}>
                        <div className={styles.gameScreen}>
                            <GameScreen gameName={game} />
                        </div>
                        <div className={styles.chatBox}>
                            <ChatBox />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
