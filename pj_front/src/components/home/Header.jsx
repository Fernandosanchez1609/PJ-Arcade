import React from 'react';
import styles from './Home.module.css'; // Asegúrate de que la ruta sea correcta
import { useState } from 'react';
import AuthModal from './AuthModal';

const Header = () => {
    const [playerName, setPlayerName] = useState("Jugador");

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Función para abrir el modal
    const handleOpenModal = () => {
        setIsModalOpen(true);
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

            {isModalOpen && <AuthModal onClose={handleCloseModal} />}
        </header>
    );
};

export default Header;