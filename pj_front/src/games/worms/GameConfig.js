import { Game } from "./WormsGame.js";

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 1000,
    scene: [Game],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 400 },
            debug: false,
        },
    },
};

var worms = new Phaser.Game(config);
