import React from "react";
import styles from "./ProfileList.module.css";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileList({ profiles, onSendRequest, friendIds }) {
    const { user } = useAuth();
    const currentUserId = Number(user?.id);
    const normalizedFriendIds = friendIds.map(id => Number(id));

    console.log("Perfiles antes de filtrar:", profiles);
    console.log("ID del usuario actual:", currentUserId);
    console.log("IDs de amigos:", normalizedFriendIds);

    const filteredProfiles = profiles.filter(profile => {
        console.log("Profile en filtro:", profile);
        const profileId = Number(profile.userId);
        return profileId !== currentUserId && !normalizedFriendIds.includes(profileId);
    });

    console.log("Perfiles filtrados:", filteredProfiles);

    return (
        <div className={styles.gridContainer}>
            {filteredProfiles.map((profile) => (
                <div key={profile.userId} className={styles.profileCard}>
                    <div className={styles.profileHeader}>
                        <p className={styles.profileName}>{profile.name}</p>
                        <button
                            className={styles.sendButton}
                            onClick={() => onSendRequest(profile.userId)}
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
