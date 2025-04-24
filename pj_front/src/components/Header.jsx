"use client"
import React, { useEffect } from 'react';
import styles from './home/Home.module.css'
import { useState } from 'react';
import AuthModal from './home/AuthModal';
import { useAuth } from "@/hooks/useAuth";


const Header = () => {
    const { token, user } = useAuth();
    const [playerName, setPlayerName] = useState("Jugador");
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        if (token && user) {
         
          setPlayerName(user.name || user.email || "Jugador");
        } else {
          setPlayerName("Inicia Sesión ⇒");
        }
    }, [token, user]);
    

    // Función para abrir el modal
    const handleOpenModal = () => {
        if (!token) {
          setIsModalOpen(true);
        }
      };

    // Función para cerrar el modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <header className={styles.header}>
            <div className={styles.header_left}>
                <img src="/icon.svg" alt="Joystick" />
                <img src="/crown.svg" alt="Crown" />

            </div>
            <div className={styles.header_right}>
                <img src="/setings.svg" alt="Settings" />
                <span className={styles.titles}>{playerName} </span>
                <img src="/userIcon.svg" alt="Bot"  onClick={handleOpenModal}/>
            </div>

            {!token && isModalOpen && <AuthModal onClose={handleCloseModal} />}
        </header>
    );
};

export default Header;