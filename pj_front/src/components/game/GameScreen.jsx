"use client";

import React, { useEffect, useRef } from "react";

const loaders = {
  worms: () => import("@/games/worms/GameConfig.js"),
  // …otros loaders…
};

export default function GameScreen({ gameName }) {
  const containerRef = useRef(null);
  const gameRef      = useRef(null);

  useEffect(() => {
    (async () => {
      // 1) Importa Phaser sólo en cliente
      const Phaser = (await import("phaser")).default;

      // 2) Carga dinámicamente la config de este juego
      const loader = loaders[gameName.toLowerCase()];
      if (!loader) {
        console.error(`Juego "${gameName}" no encontrado.`);
        return;
      }
      const { wormsConfig } = await loader();

      const parent = containerRef.current;
      if (!parent) return;

      // ← **Limpia TODO** lo que haya dentro (canvas previo, etc)
      parent.innerHTML = "";

      // 3) Inicializa Phaser apuntando a ese contenedor limpio
      const config = {
        ...wormsConfig,
        parent,
      };
      gameRef.current = new Phaser.Game(config);
    })();

    return () => {
      // 4) Destruye el juego si existe
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [gameName]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
