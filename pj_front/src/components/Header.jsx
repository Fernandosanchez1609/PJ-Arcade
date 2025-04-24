"use client"
import React, { use, useEffect } from 'react';
import styles from './home/Home.module.css'
import { useState } from 'react';
import AuthModal from './home/AuthModal';
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation"; 

const Header = () => {
    const { token, user, logout } = useAuth();
    const [playerName, setPlayerName] = useState("Jugador");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter(); 
    
    
    useEffect(() => {
        console.log(user)
        if (token && user) {
         
          setPlayerName(user.name || user.email || "Jugador");
        } else {
          setPlayerName("Inicia Sesión ⇒");
        }
    }, [token, user]);

    const handleLogout = () => {
      logout();                 
    };
    

    const handleOpenModal = () => {
        if (token) {
          router.push("/profile");
        }else {
          setIsModalOpen(true);
        }
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <header className={styles.header}>
            <div className={styles.header_left}>
                <img src="/icon.svg" alt="Joystick" className={styles.icon} onClick={() =>router.push("/")}/>
                {token && <img src="/crown.svg" alt="Crown" className={styles.icon}/>}
            </div>
            <div className={styles.header_right}>
                {token && user?.role=="Admin" && <img src="/setings.svg" alt="Settings" className={styles.icon}/>}
                 <span className={styles.titles}>{playerName} </span>
                <img src="/userIcon.svg" alt="Bot" className={styles.icon} onClick={handleOpenModal}/>
                {token && <img src="/logout.svg" alt="logout" className={styles.icon} onClick={handleLogout}/>}
            </div>

            {!token && isModalOpen && <AuthModal onClose={handleCloseModal} />}
        </header>
    );
};

export default Header;