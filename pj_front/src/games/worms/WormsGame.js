import { sendMessage } from "@/lib/WsClient";
import { store } from "@/store/store";
import { Clouds } from "@/games/worms/WormsClouds";
import { Collisions } from "@/games/worms/WormsCollisions.js";

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
        this.load.image("grenade", "/images/grenade-20-20.png");
        this.load.spritesheet("fuego", "/images/sprites/shothit.png", {
            frameWidth: 60,
            frameHeight: 60,
        });
    }

    create() {
        this.physics.world.gravity.y = 500;
        this.cameras.main.setBounds(0, 0, 800, 600);
        this.camera = this.cameras.main;

        // // Animacion explosion
        // fire = this.add.particles("fuego");

        // this.emitter = fire.createEmitter({
        //     frame: Phaser.Utils.Array.NumberArray(0, 9), // frames del 0 al 9
        //     advanceParticleFrame: true, // esto hace que los frames avancen
        //     frameRate: 20, // velocidad del cambio de frame
        //     speedX: { min: -120, max: 120 },
        //     speedY: { min: -200, max: -120 },
        //     rotation: { min: -15, max: 15 },
        //     lifespan: 2000,
        //     maxParticles: 10,
        //     quantity: 10,
        //     on: false,
        // });

        // // Grenade
        this.grenade = this.physics.add.sprite(100, 10, "grenade");
        this.grenade.setBounce(0.7).setCollideWorldBounds(false);
        // .disableBody(true, true)

        // // Para calcular la potencia del disparo
        this.chargeStartTime = null;

        this.add.image(410, 250, "background").setDepth(-2);

        // Gusano animado con físicas
        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("wormWalk", {
                frames: [...Array(16).keys()], // frames 0 al 15
            }),
            frameRate: 15,
            repeat: -1,
        });

        this.worms = [];

        for (let i = 0; i < 6; i++) {
            const worm = this.physics.add.sprite(50 + i * 80, 20, "wormWalk");
            worm.setCollideWorldBounds(false)
                .setBounce(0)
                .setDrag(1000, 0)
                .setMaxVelocity(150, 500)
                .body.setSize(20, 45, true);

            worm.wormId = i + 1; // número del 1 al 6
            worm.collideDown;
            worm.collideLeft;
            worm.collideTop;
            worm.collideRight;

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
        this.terrain = this.add.renderTexture(400, 350, 800, 600).setDepth(0);
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

        this.colisiones = new Collisions(this);

        this.colisiones.updateCollisionMapFromBitmap(
            this.collisionMap,
            this.terrainBitmap,
            this.terrainWidth,
            this.terrainHeight
        );

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
            this.colisiones.updateCollisionMapArea(
                this.collisionMap,
                this.terrainBitmap,
                this.terrainWidth,
                this.terrainHeight,
                localX - 23,
                localY - 21.5,
                46,
                43
            );

            // Listener eventos de WebSocket
            window.addEventListener("rivalAttack", (event) => {
                const { x, y } = event.detail;
                this.terrain.erase("explosion", x - 23, y - 21.5);
                // this.terrain.erase.arc(x, y, 16, 0, Math.PI * 2);
                this.terrainBitmap.context.clearRect(x - 23, y - 21.5, 46, 43);
                this.terrainBitmap.refresh();
                this.colisiones.updateCollisionMapArea(
                    this.collisionMap,
                    this.terrainBitmap,
                    this.terrainWidth,
                    this.terrainHeight,
                    localX - 23,
                    localY - 21.5,
                    46,
                    43
                );
            });

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

        this.fireButton = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        this.physics.add.overlap(this.grenade, this.worms, this.terrain);
    }

    update() {
        const cursors = this.cursors;
        const worm1 = this.worms[0]; // ← Controla solo el gusano 1 por ahora

        this.wormLabels.forEach((label, index) => {
            const worm = this.worms[index];
            label.setPosition(worm.x, worm.y - 40);
        });

        // Comprobar colisiones con el terreno usando el mapa lógico
        this.worms.forEach((worm) => {
            const collisions = this.colisiones.checkCollisionDirections(
                this.collisionMap,
                this.terrainWidth,
                this.terrainHeight,
                worm.body.center.x,
                worm.body.center.y
            );

            // iguala los valores de los objetos que comparten
            // sustituye el codigo de abajo
            Object.assign(worm, collisions);

            // Si colisión abajo, parar gravedad y velocidad Y
            if (worm.collideDown) {
                worm.setVelocityY(0);
                worm.body.allowGravity = false;
                worm.body.blocked.down = true; // opcional para estados Phaser
            } else {
                worm.body.allowGravity = true;
                worm.body.blocked.down = false;
            }

            if (worm.collideTop) {
                worm.setVelocityY(0);
                worm.body.allowGravity = true;
            }

            // Bloquear movimiento lateral solo si se mueve hacia colisión
            if (worm.collideLeft && worm.body.velocity.x < 0) {
                const climbStep = this.colisiones.canClimb(
                    this.collisionMap,
                    this.terrainWidth,
                    this.terrainHeight,
                    worm.x,
                    worm.y,
                    -1
                );
                if (climbStep > 0) {
                    worm.setY(worm.y - climbStep); // sube
                } else {
                    worm.setVelocityX(0);
                    worm.setX(worm.x + 0.5); // empuja hacia fuera
                }
            }

            if (worm.collideRight && worm.body.velocity.x > 0) {
                const climbStep = this.colisiones.canClimb(
                    this.collisionMap,
                    this.terrainWidth,
                    this.terrainHeight,
                    worm.x,
                    worm.y,
                    -1
                );
                if (climbStep > 0) {
                    worm.setY(worm.y - climbStep); // sube
                } else {
                    worm.setVelocityX(0);
                    worm.setX(worm.x - 0.5); // empuja hacia fuera
                }
            }

            if (worm.y >= this.physics.world.bounds.height) {
                worm.y = this.physics.world.bounds.height; // En el futuro matará al gusano
                worm.body.velocity.y = Math.min(0, worm.body.velocity.y);
            }
        });

        // Salto
        if (
            cursors.up.isDown &&
            worm1.collideDown // COMENTADA PARA DEBUGGEAR GUSANO VOLADOR
        ) {
            worm1.setVelocityY(-300); // ← valor negativo para saltar hacia arriba
        }

        // Movimiento horizontal controlado
        if (cursors.left.isDown) {
            worm1.setVelocityX(-100);
            worm1.play("walk", true);
            worm1.setFlipX(false);
        } else if (cursors.right.isDown) {
            worm1.setVelocityX(100);
            worm1.play("walk", true);
            worm1.setFlipX(true);
        } else {
            worm1.setVelocityX(0);
            worm1.anims.stop();
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
