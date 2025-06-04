export class Clouds {
    constructor(scene) {
        this.scene = scene;
        this.cloudBackGroup = this.scene.add.group();
        this.cloudFrontGroup = this.scene.add.group();
    }

    preload() {
        this.scene.load.image("background", "/images/sky-background.png");
        for (let i = 1; i <= 6; i++) {
            this.scene.load.image(`cloud${i}`, `/images/cloud${i}.png`);
        }
    }

    startClouds() {
        this.scene.time.addEvent({
            delay: 8500,
            callback: () => this.spawnClouds("back"),
            loop: true,
        });

        this.scene.time.addEvent({
            delay: 10000,
            callback: () => this.spawnClouds("front"),
            loop: true,
        });
    }

    spawnClouds(layer) {
        const cloudIndex = Phaser.Math.Between(1, 6);
        const cloudKey = `cloud${cloudIndex}`;
        const y = Phaser.Math.Between(50, 250);
        const cloud = this.scene.add.image(1200, y, cloudKey);

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

        cloud.setScale(scale).setDepth(-1);
        group.add(cloud);

        // Usamos this.scene.tweens.add en lugar de this.tweens.add
        this.scene.tweens.add({
            targets: cloud,
            x: -150,
            duration: 18000 / speed,
            ease: "Linear",
            onComplete: () => cloud.destroy(),
        });
    }
}
