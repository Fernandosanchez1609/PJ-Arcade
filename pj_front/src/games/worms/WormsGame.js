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

        // === Crear 6 gusanos ===
        const initialPositions = [
            { x: 100, y: 100 },
            { x: 200, y: 100 },
            { x: 300, y: 100 },
            { x: 400, y: 100 },
            { x: 500, y: 100 },
            { x: 600, y: 100 },
        ];

        this.worms = [];

        for (let i = 0; i < 6; i++) {
            const pos = initialPositions[i];
            const worm = this.physics.add.sprite(pos.x, pos.y, "wormWalk");
            worm.setCollideWorldBounds(true)
                .setBounce(0)
                .setDrag(1000, 0)
                .setMaxVelocity(200, 0)
                .body.setSize(40, 40, true);
            this.worms.push(worm);
        }

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

        // this.physics.add.collider(this.worm1, this.terrain)
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
      
        // Controlar solo al primer gusano (o luego podrías alternar entre ellos)
        const worm = this.worms[0];

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
