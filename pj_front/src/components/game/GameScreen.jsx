"use client";

import React, { useEffect, useRef } from "react";

// Asume que cada GameConfig.js exporta por defecto un config Phaser.GameConfig
const loaders = {
    worms: () => import("@/games/worms/GameConfig.js"),
};

export default function GameScreen({ gameName }) {
    const containerRef = useRef(null);
    const gameRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const Phaser = (await import("phaser")).default;

                const loader = loaders[gameName.toLowerCase()];
                if (!loader) {
                    console.error(`Juego "${gameName}" no encontrado.`);
                    return;
                }

                const module = await loader();
                const config = module?.default || module?.wormsConfig;

                if (!config || typeof config !== "object") {
                    console.error("Config Phaser no válido:", config);
                    return;
                }

                const parent = containerRef.current;
                if (!parent || !isMounted) return;

                parent.innerHTML = ""; // limpia canvas anterior

                gameRef.current = new Phaser.Game({
                    ...config,
                    parent,
                });
            } catch (err) {
                console.error("Error cargando el juego:", err);
            }
        })();

        return () => {
            isMounted = false;
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [gameName]);

    return (
        <div
            ref={containerRef}
            style={{ width: "100%", height: "100%", overflow: "hidden" }}
        />
    );
}
