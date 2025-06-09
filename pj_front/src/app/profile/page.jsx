// src/app/profile/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProfilePic from "@/components/profile/ProfilePic";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
    const { token, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            // router.replace("/");
            router.push("/");
        }
    }, [token, user]);

    return (
        <div className={styles.container}>
            <section>
                <h1 className={styles.email}>
                    Email: {user?.email || "Correo Electrónico"}
                </h1>
                <button>Cambiar contraseña</button>
            </section>
            <section>
                <ProfilePic user={user} />
                <p>{user?.name || "Usuario"}</p>
                <button aria-label="Editar perfil">
                    <img src="/edit.svg" alt="Editar perfil" />
                </button>
            </section>
        </div>
    );
}
