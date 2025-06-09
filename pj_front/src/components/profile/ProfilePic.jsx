import { Divide } from "lucide-react";
import styles from "./Profile.module.css";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePic({ user }) {
    return (
        <h1 className={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || "Usuario"}
        </h1>
    );
}
