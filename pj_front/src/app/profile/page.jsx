// src/app/profile/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { useFetchUsers } from "@/hooks/useFetchUsers";
import { useToggleUserRole } from "@/hooks/useToggleUserRole";
import { useDeleteUser } from "@/hooks/useDeleteUser";
import UserCardList from "@/components/admin/UserCardList";
import { useBanUser } from "@/hooks/useBanUser";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProfilePic from "@/components/profile/Profile";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
    const { token, user } = useAuth();
    const router = useRouter();
    const { fetchUsers } = useFetchUsers();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            router.replace("/");
        }
    }, [token, router]);

    if (!token) {
        return null;
    }

    return (
        <div className={styles.container}>
            <section>
                <p></p>
                <button>Cambiar contraseña</button>
            </section>
            <section>
                <ProfilePic />
                <p>{user?.name || "Usuario"}</p>
                <button>
                    <img src="" alt="Editar perfil" />
                </button>
            </section>
        </div>

    );
}
