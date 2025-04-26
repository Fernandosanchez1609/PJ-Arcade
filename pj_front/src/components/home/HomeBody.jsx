"use client";

import { useSelector } from "react-redux";
import styles from "./Home.module.css";
import GameCart from "./GameCard";

export default function HomeBody() {

    const onlineCount = useSelector((state) => state.online.count);

    return (
        <>
            <div className={styles.content}>
                <div className={styles.titles}>
                    🟢 Usuarios en línea: {onlineCount}
                </div>
                <GameCart/>
            </div>
        </>
    );
}
