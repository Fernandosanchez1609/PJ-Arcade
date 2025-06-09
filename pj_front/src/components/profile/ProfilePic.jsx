import { Divide } from "lucide-react";
import styles from "./Profile.module.css";

export default function Profile({ user }) {
    return <img src="{user.profilePic}" alt="Imagen de perfil" />;
}
