import { Game } from "./WormsGame.js";

export const wormsConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Game],
    physics: {
        default: "matter",
        matter: {
            gravity: { y: 0 },
            debug: true, // Activa para ver colisiones y cuerpos
        },
    },
};
