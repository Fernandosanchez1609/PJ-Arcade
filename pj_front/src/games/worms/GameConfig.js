// src/games/worms/GameConfig.js
import { Game } from "./WormsGame.js";  // tu Scene
export const wormsConfig = {
  type: Phaser.AUTO,
  width:  1000,
  height: 1000,
  scene: [Game],
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 400 }, debug: false },
  },
};
// **¡OJO!** NO hagas `new Phaser.Game(...)` aquí; sólo exporta la config.
