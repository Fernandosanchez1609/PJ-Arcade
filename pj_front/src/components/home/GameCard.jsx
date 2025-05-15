"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAllGames } from "@/lib/GameService";
import { API_BASE } from "@/lib/Endpoints";
import AuthModal from "./AuthModal"; 
import styles from "./Home.module.css";

export default function GameCart() {
  const { token } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchGames() {
      try {
        const data = await getAllGames();
        setGames(data);
      } catch {
        setError("Error al cargar los juegos");
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  const handleGameClick = (gameName) => {
    if (token) {
      router.push(`/game/${gameName}`);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {loading && <p>Cargando juegos...</p>}
      {error && <p>{error}</p>}

      <div className={styles.gamesGrid}>
        {games.map((game) => (
          <div
            key={game.gameId}
            className={styles.gameCard}
            onClick={() => handleGameClick(game.name)}
            style={{ cursor: "pointer" }}
          >
            <img
              src={API_BASE + game.imgURL}
              alt={game.name}
              className={styles.gameImage}
            />
            <h3>{game.name}</h3>
          </div>
        ))}
      </div>

      {/* Modal de login/registro */}
      {!token && isModalOpen && (
        <AuthModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
