"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Home.module.css";

export default function Content() {
    const { token } = useAuth();
    const onlineCount = useSelector((state) => state.online.count);


    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <>
            {hasMounted && token && (
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
