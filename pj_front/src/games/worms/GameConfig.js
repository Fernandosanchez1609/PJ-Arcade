import { Game } from "./WormsGame.js";

export const wormsConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Game, GameOver, Victory],
    physics: {
        default: "arcade",
        matter: {
            gravity: { y: 500 },

        },
        arcade: {
            useFixedStep: true,
            fps: 60,
        },
    },
    fps: {
        target: 60,
        forceSetTimeOut: true,
    }
};
