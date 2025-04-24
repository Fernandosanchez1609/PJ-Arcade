"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { getAllGames } from "@/lib/GameService";
import styles from "./Home.module.css";

export default function HomeBody() {
    const { token } = useAuth();
    const onlineCount = useSelector((state) => state.online.count);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchGames() {
            try {
                const data = await getAllGames();
                setGames(data);
            } catch (err) {
                setError("Error al cargar los juegos");
            } finally {
                setLoading(false);
            }
        }

        fetchGames();
    }, []);

    return (
        <>
            <div className={styles.content}>
                <div className={styles.titles}>
                    🟢 Usuarios en línea: {150 + onlineCount}
                </div>
                {loading && <p>Cargando juegos...</p>}
                {error && <p>{error}</p>}

                <div className={styles.gamesGrid}>
                    {games.map((game) => (
                        <div key={game.gameId} className={styles.gameCard}>
                            <img
                                src={game.imgURL}
                                alt={game.name}
                                className={styles.gameImage}
                            />
                            <h3>{game.name}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
