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
            router.replace("/");
        }
    }, [token, user]);

    return (
        <div className={styles.container}>
            <section>
                <p></p>
                <button>Cambiar contraseña</button>
            </section>
            <section>
                <ProfilePic />
                <p>{user.name || "Usuario"}</p>
                <button>
                    <img src="" alt="Editar perfil" />
                </button>
            </section>
        </div>

    );
}
