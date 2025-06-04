import { sendMessage } from "@/lib/WsClient";
import { store } from "@/store/store";
import { Clouds } from "@/games/worms/WormsClouds";
import {
    updateCollisionMapFromBitmap,
    updateCollisionMapArea,
    isSolid,
    checkCollisionDirections,
} from "@/games/worms/WormsCollisions";

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
        this.physics.world.gravity.y = 500;

        // Listener eventos de WebSocket
        window.addEventListener("rivalAttack", (event) => {
            const { x, y } = event.detail;
            this.terrain.erase("explosion", x - 23, y - 21.5);
            this.terrainBitmap.context.clearRect(x - 23, y - 21.5, 46, 43);
            this.terrainBitmap.refresh();
            updateCollisionMapArea(
                // <- Esto es clave
                this.terrainBitmap,
                this.collisionMap,
                localX - 23,
                localY - 21.5,
                46,
                43,
                this.terrainWidth,
                this.terrainHeight
            );
        });

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

        // this.worm1 = this.physics.add.sprite(460, 200, "wormWalk");
        // this.worm1
        //     .setCollideWorldBounds(true)
        //     .setBounce(0)
        //     .setDrag(1000, 0)
        //     .setMaxVelocity(200, 500)
        //     .body.setSize(30, 40, true);

        this.worms = [];

        for (let i = 0; i < 6; i++) {
            const worm = this.physics.add.sprite(50 + i * 80, 20, "wormWalk");
            worm.setCollideWorldBounds(true)
                .setBounce(0)
                .setDrag(1000, 0)
                .setMaxVelocity(200, 500)
                .body.setSize(30, 40, true);

            worm.wormId = i + 1; // número del 1 al 6

            this.worms.push(worm);
        }

        // para mostrar el numero del gusano
        this.wormLabels = [];

        for (let worm of this.worms) {
            const label = this.add
                .text(worm.x, worm.y - 40, `#${worm.wormId}`, {
                    font: "16px Arial",
                    fill: "#ffffff",
                    stroke: "#000",
                    strokeThickness: 3,
                })
                .setOrigin(0.5);

            this.wormLabels.push(label);
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

        // Crear mapa lógico de colisión para el terreno
        this.terrainWidth = 800;
        this.terrainHeight = 600;
        this.collisionMap = new Uint8Array(
            this.terrainWidth * this.terrainHeight
        );

        // Define la forma irregular aproximada del gusano para colisión (offsets relativos)

        this.wormBaseOffsets = [
            { x: -10, y: -35 }, // abajo izquierda
            { x: 0, y: -35 }, // abajo centro
            { x: 10, y: -35 }, // abajo derecha
        ];

        this.wormTopOffsets = [
            { x: -10, y: -105 }, // arriba izquierda
            { x: 0, y: -105 }, // arriba centro
            { x: 10, y: -105 }, // arriba derecha
        ];

        this.wormSidesOffsets = [
            { x: -10, y: -45 }, // izquierda
            { x: 10, y: -45 }, // derecha
        ];

        this.wormShapeOffsets = [
            ...this.wormBaseOffsets,
            ...this.wormTopOffsets,
            ...this.wormSidesOffsets,
        ];

        this.input.on("pointerdown", (pointer) => {
            const localX =
                pointer.x - (this.terrain.x - this.terrain.width / 2);
            const localY =
                pointer.y - (this.terrain.y - this.terrain.height / 2);

            this.terrain.erase("explosion", localX - 23, localY - 21.5);

            // Corrige el clearRect → usa el tamaño de la explosión
            this.terrainBitmap.context.clearRect(
                localX - 23,
                localY - 21.5,
                46,
                43
            );
            this.terrainBitmap.refresh();

            // Actualizar mapa lógico en zona destruida
            updateCollisionMapFromBitmap(
                this.terrainBitmap,
                this.collisionMap,
                this.terrainWidth,
                this.terrainHeight
            );

            updateCollisionMapArea(
                // <- Esto es clave
                this.terrainBitmap,
                this.collisionMap,
                localX - 23,
                localY - 21.5,
                46,
                43,
                this.terrainWidth,
                this.terrainHeight
            );

            const rivalSocketId = store.getState().match.rivalSocketId;

            if (rivalSocketId) {
                sendMessage("Atack", {
                    socketId: rivalSocketId,
                    x: localX,
                    y: localY,
                });
            }
        });

        // Crear instancia de Clouds y comenzar la creación de nubes
        this.clouds = new Clouds(this); // Pasa la escena al constructor de Clouds
        this.clouds.startClouds(); // Comienza la creación de las nubes

        this.cursors = this.input.keyboard.createCursorKeys();

        // this.physics.add.collider(this.worm1, this.terrain)
    }

    update() {
        const cursors = this.cursors;
        const pointer = this.input.activePointer;

        this.worms.forEach((worm, index) => {
            // Controlar SOLO el gusano 0 manualmente con teclas
            if (index === 0) {
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

                if (cursors.up.isDown && worm.body.blocked.down) {
                    worm.setVelocityY(-300);
                }
            }

            // 👇 COLISIONES PERSONALIZADAS
            const collisions = checkCollisionDirections(
                worm.x,
                worm.y,
                this.wormShapeOffsets,
                this.collisionMap,
                this.terrainWidth,
                this.terrainHeight
            );

            if (collisions.collideDown) {
                worm.setVelocityY(0);
                worm.body.allowGravity = false;
                worm.body.blocked.down = true;
            } else {
                worm.body.allowGravity = true;
                worm.body.blocked.down = false;
            }

            if (collisions.collideTop) {
                worm.setVelocityY(0);
                worm.body.allowGravity = true;
            }

            if (collisions.collideLeft && worm.body.velocity.x < 0) {
                const climbStep = this.canClimb(worm.x, worm.y, -1);
                if (climbStep > 0) {
                    worm.y -= climbStep;
                } else {
                    worm.setVelocityX(0);
                }
            }

            if (collisions.collideRight && worm.body.velocity.x > 0) {
                const climbStep = this.canClimb(worm.x, worm.y, 1);
                if (climbStep > 0) {
                    worm.y -= climbStep;
                } else {
                    worm.setVelocityX(0);
                }
            }

            // Mover la etiqueta si existe
            if (this.wormLabels?.[index]) {
                this.wormLabels[index].setPosition(worm.x, worm.y - 40);
            }
        });

        // Cambiar el cursor según el terreno donde apunta
        const alpha = this.textures.getPixelAlpha(
            pointer.x,
            pointer.y,
            "terrainBitmap"
        );
        this.game.canvas.style.cursor = alpha > 0 ? "crosshair" : "default";
    }

    // --- Métodos auxiliares para el mapa lógico y colisión ---

    canClimb(px, py, direction) {
        // direction: -1 para izquierda, +1 para derecha
        const stepHeight = 15; // cuantos pixeles "sube" el gusano para escalar
        for (let i = 1; i <= stepHeight; i++) {
            // Verificamos si al subir i pixeles y movernos en dirección lateral podemos pasar
            const newX = px + direction * 10; // offset lateral igual que wormSidesOffsets
            const newY = py - i; // subimos

            const baseOffset = this.wormBaseOffsets[0];
            const baseX = Math.floor(newX + baseOffset.x);
            const baseY = Math.floor(newY + baseOffset.y + 1); // un pixel más abajo del pie

            // Comprobamos si hay colisión lateral en la nueva posición (simular checkCollisionDirections para el lateral)
            let blocked = false;
            for (const offset of this.wormSidesOffsets) {
                if (
                    (direction === -1 && offset.x < 0) ||
                    (direction === 1 && offset.x > 0)
                ) {
                    const checkX = Math.floor(newX + offset.x);
                    const checkY = Math.floor(newY + offset.y);
                    if (
                        isSolid(
                            checkX,
                            checkY,
                            this.collisionMap,
                            this.terrainWidth,
                            this.terrainHeight
                        )
                    ) {
                        blocked = true;
                        break;
                    }
                }
            }

            // También asegurarse que el suelo debajo está sólido para "apoyarse"

            if (
                !isSolid(
                    baseX,
                    baseY,
                    this.collisionMap,
                    this.terrainWidth,
                    this.terrainHeight
                )
            ) {
                blocked = true; // Si no hay suelo impide que flote
            }

            if (!blocked) {
                // Podemos subir i pixeles sin colisionar
                return i;
            }
        }
        return 0; // no puede subir
    }
}
