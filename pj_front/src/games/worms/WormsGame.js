export class Game extends Phaser.Scene {
    constructor() {
        super({ key: "worms" });
    }

    preload() {
        this.load.image("background", "/images/sky-background.png");
        for (let i = 1; i <= 6; i++) {
            this.load.image(`cloud${i}`, `/images/cloud${i}.png`);
        }

        this.load.image("terrain", "/images/level2-800-600.png");
        this.load.image("explosion", "/images/explosion.png");
        this.load.spritesheet("wormWalk", "/images/sprites/wwalk.png", {
            frameWidth: 60,
            frameHeight: 60,
        });
    }

    create() {
        this.add.image(410, 250, "background");

        // Gusano animado con físicas
        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("wormWalk", {
                frames: [...Array(16).keys()], // frames 0 al 15
            }),
            frameRate: 15,
            repeat: -1,
        });

        this.worm1 = this.physics.add.sprite(450, 250, "wormWalk");
        this.worm1.setCollideWorldBounds(true);
        this.worm1.setBounce(0);
        this.worm1.setDrag(1000, 0);
        this.worm1.setMaxVelocity(200, 0);

        // Terreno
        this.terrain = this.add.renderTexture(400, 350, 800, 600).setDepth(1);
        this.terrain.draw("terrain", 0, 0);

        const srcImage = this.textures.get("terrain").getSourceImage();
        this.terrainBitmap = this.textures.createCanvas(
            "terrainBitmap",
            800,
            600
        );
        this.terrainBitmap.context.drawImage(srcImage, 0, 0);
        this.terrainBitmap.refresh();

        this.input.on("pointerdown", (pointer) => {
            const localX = pointer.x - this.terrain.x + this.terrain.width / 2;
            const localY = pointer.y - this.terrain.y + this.terrain.height / 2;

            this.terrain.erase("explosion", localX - 23, localY - 21.5);

            // Corrige el clearRect → usa el tamaño de la explosión
            this.terrainBitmap.context.clearRect(
                localX - 23,
                localY - 21.5,
                46,
                43
            );
            this.terrainBitmap.refresh();
        });

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

        this.cursors = this.input.keyboard.createCursorKeys();
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

    update() {
        const cursors = this.cursors;
        const worm = this.worm1;

        if (cursors.left.isDown) {
            worm.setVelocityX(-100);
            worm.play("walk", true);
            worm.setFlipX(false);
        } else if (cursors.right.isDown) {
            worm.setVelocityX(100);
            worm.play("walk", true);
            worm.setFlipX(true);
        } else {
            worm.setVelocityX(0);
            worm.anims.stop();
        }

        // Cursor dinámico según colisión con terreno
        const pointer = this.input.activePointer;
        const alpha = this.textures.getPixelAlpha(
            pointer.x,
            pointer.y,
            "terrainBitmap"
        );
        this.game.canvas.style.cursor = alpha > 0 ? "crosshair" : "default";
    }
}
