// src/components/profile/Tabs.jsx
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProfilePic from "./ProfilePic";
import styles from "./Tabs.module.css";

export default function ProfileTabs({ user }) {
    return (
        <Tabs defaultValue="profile" className={styles.container}>
            <TabsList className={styles.tabsList}>
                <TabsTrigger value="profile" className={styles.tabsTrigger}>Perfil</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
                <section className={styles.profileSection}>
                    <div className={styles.profileInfo}>
                        <ProfilePic user={user} />
                        <div className={styles.userDetails}>
                            <h1 className={styles.userName}>{user?.name || "Usuario"}</h1>
                            <button
                                aria-label="Editar perfil"
                                className={styles.editButton}
                            >
                                <img src="/edit.svg" alt="Editar perfil" className={styles.editIcon} />
                            </button>
                        </div>

                    </div>

                    <div className={styles.personlInfo}>
                        <h1 className={styles.email}>
                            Email: {user?.email || "Correo Electrónico"}
                        </h1>
                        <button className={styles.changePassword}>
                            Cambiar contraseña
                        </button>
                    </div>

                </section>
            </TabsContent>
        </Tabs>
    );
}
