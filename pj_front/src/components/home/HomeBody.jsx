"use client";
import { useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Home.module.css";

export default function HomeBody() {
    const { token } = useAuth();
    const onlineCount = useSelector((state) => state.online.count);


    return (
        <>

            <div className={styles.content}>
                    <div className={styles.titles}>
                        🟢 Usuarios en línea: {150+onlineCount}
                    </div>
                <div>Aquí van los juegos</div>
                <div>(Pablo trabaja)</div>
            </div>
        </>

    );
}
