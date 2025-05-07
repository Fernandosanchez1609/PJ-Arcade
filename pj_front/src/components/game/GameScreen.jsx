import React, { useEffect } from "react";
import { wormsConfig } from "@/games/worms/GameConfig.js"; // Ajusta la ruta según sea necesario
import * as Phaser from "phaser";

const GameScreen = ({ gameName }) => {
    useEffect(() => {
        let game;
        switch (gameName) {
            case "worms":
                game = new Phaser.Game(wormsConfig);
                break;
            // Agregar más casos para otros juegos
            default:
                console.error("Game not found!");
                break;
        }

        return () => {
            if (game) game.destroy(true);
        };
    }, [gameName]);

    return <div id="game-container" />;
};

export default GameScreen;
