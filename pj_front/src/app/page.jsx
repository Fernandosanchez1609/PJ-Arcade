"use client"
import { useState } from "react";
import { FaTwitter, FaInstagram, FaGithub, FaLinkedin, FaDiscord } from 'react-icons/fa'; // Usa react-icons para los íconos
import styles from "./Home.module.css";
export default function Home() {
  const [playerName, setPlayerName] = useState("Jugador");

  return (
    <div >
      {/* Barra superior */}
      <header className={styles.header}>
        <div className={styles.header_left}>
          <img src="/icon.svg" alt="Joystick" />
          <img src="/crown.svg" alt="Crown" />
          <img src="/setings.svg" alt="Settings" />
        </div>
        <div className={styles.header_right}>
          <span className={styles.titles}>{playerName} </span>
          <img src="/userIcon.svg" alt="Bot" />
        </div>
      </header>

      {/* Contenedor principal */}
      <main >
        <div >
          {/* Aquí iría el contenido del juego o la sección principal */}
          <div >
            {/* Contenido del juego */}
          </div>
        </div>
      </main>

      {/* Barra de redes sociales */}
      <footer >
        <div>
          <img src="/icon.svg" alt="Joystick" />
          <div>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
              <FaDiscord />
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
}
