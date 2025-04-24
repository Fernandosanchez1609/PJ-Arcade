"use client";
import { useSelector } from "react-redux";
import styles from "./Home.module.css";
import { useAuth } from "@/hooks/useAuth";

export default function Content() {
    const { token } = useAuth();
    const onlineCount = useSelector((state) => state.online.count);

    return (
        <>
            {token && (
                <div className={styles.titles}>
                    🟢 Usuarios en línea: {onlineCount}
                </div>
            )}
            <div className={styles.content}>

                <div>Aquí van los juegos</div>
                <div>(Pablo trabaja)</div>
            </div>
        </>

    );
}
