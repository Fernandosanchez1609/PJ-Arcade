import { generateTerrain } from "./MapGeneration.js";

export class Game extends Phaser.Scene {
    constructor() {
        super({ key: "worms" });
    }

    preload() {
        this.load.image("background", "/images/sky-background.png");

        for (let i = 1; i <= 6; i++) {
            this.load.image(`cloud${i}`, `/images/cloud${i}.png`);
        }

        // Cargar imágenes necesarias para el terreno
        this.load.image("terrainMask", "/images/masks/map1.png");
        this.load.image("dirt", "/images/textures/dirt-texture.png");
        this.load.image("grass", "/images/textures/grass-texture.png");
    }

    create() {
        this.add.image(410, 250, "background");

        // Generar terreno con hierba
        generateTerrain(this);

        // Nubes
        this.cloudBackGroup = this.add.group();
        this.cloudFrontGroup = this.add.group();

        this.time.addEvent({
            delay: 8500,
            callback: () => this.spawnCloud("back"),
            loop: true,
        });

        this.time.addEvent({
            delay: 10000,
            callback: () => this.spawnCloud("front"),
            loop: true,
        });
    }

    spawnCloud(layer) {
        const cloudIndex = Phaser.Math.Between(1, 6);
        const cloudKey = `cloud${cloudIndex}`;
        const y = Phaser.Math.Between(50, 250);

        const cloud = this.add.image(1200, y, cloudKey);

        let scale, speed, group;

        if (layer === "back") {
            scale = Phaser.Math.FloatBetween(0.2, 0.5);
            speed = Phaser.Math.FloatBetween(0.2, 0.3);
            group = this.cloudBackGroup;
        } else {
            scale = Phaser.Math.FloatBetween(0.5, 0.7);
            speed = Phaser.Math.FloatBetween(0.3, 0.5);
            group = this.cloudFrontGroup;
        }

        cloud.setScale(scale);
        group.add(cloud);

        this.tweens.add({
            targets: cloud,
            x: -150,
            duration: 18000 / speed,
            ease: "Linear",
            onComplete: () => cloud.destroy(),
        });
    }
}
