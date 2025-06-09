import { sendMessage } from "@/lib/WsClient";
import { store } from "@/store/store";
import { Clouds } from "@/games/worms/WormsClouds";
import { Collisions } from "@/games/worms/WormsCollisions.js";

export class Game extends Phaser.Scene {
    constructor() {
        super({ key: "worms" });
        this.isMyTurn = false; // Variable para controlar el turno del jugador
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
        this.load.image("crosshair", "/images/crshairr.png");
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

        this.add.image(410, 250, "background").setDepth(-2);

        this.currentWormIndex = 0;
        const role = store.getState().match.playerRole;

        if (role === "Player1") {
            this.isMyTurn = true;
        } else {
            this.isMyTurn = false;
        }

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

        // Grenade
        this.grenade = this.physics.add.sprite(0, 0, "grenade");
        this.grenade
            .setBounce(0) // Desactivamos rebote para hacerlo manual
            .setCollideWorldBounds(false)
            .disableBody(true, true)
            .setVelocityX(400);
        this.grenade.collideDown;
        this.grenade.collideLeft;
        this.grenade.collideTop;
        this.grenade.collideRight;

        // Para calcular la potencia del disparo
        this.chargeStartTime = null;

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
                .setOrigin(0.5)
                .setDepth(-2);

            this.wormLabels.push(label);
        }

        this.crosshair = this.add
            .image(
                this.worms[0].body.center.x + 20,
                this.worms[0].body.center.y + 20,
                "crosshair"
            )
            .setAngle(0)
            .setOrigin(0);

        // Terreno
        this.terrain = this.add.renderTexture(400, 350, 800, 600).setDepth(0);
        this.terrain.draw("terrain", 0, 0);

        const srcImage = this.textures.get("terrain").getSourceImage();
        this.terrainBitmap = this.textures.createCanvas(
            "terrainBitmap",
            800,
            600
        );
        this.terrainBitmap.context.drawImage(srcImage, 0, 50);
        this.terrainBitmap.refresh();

        // Crear mapa lógico de colisión para el terreno
        this.terrainWidth = 800;
        this.terrainHeight = 600;
        this.collisionMap = new Uint8Array(
            this.terrainWidth * this.terrainHeight
        );

        this.collisions = new Collisions(this);

        this.collisions.updateCollisionMapFromBitmap(
            this.collisionMap,
            this.terrainBitmap,
            this.terrainWidth,
            this.terrainHeight
        );

        // Barra de carga del disparo
        this.chargeBarBg = this.add
            .rectangle(0, 0, 52, 8, 0x000000)
            .setOrigin(0.5)
            .setVisible(false);
        this.chargeBarFill = this.add
            .rectangle(0, 0, 0, 6, 0x00ff00)
            .setOrigin(0.5)
            .setVisible(false);

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
            this.collisions.updateCollisionMapArea(
                this.collisionMap,
                this.terrainBitmap,
                this.terrainWidth,
                this.terrainHeight,
                localX - 23,
                localY - 21.5,
                46,
                90
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

        // Listener eventos de WebSocket
        window.addEventListener("rivalAttack", (event) => {
            const { x, y } = event.detail;
            this.terrain.erase("explosion", x - 23, y - 21.5);
            // this.terrain.erase.arc(x, y, 16, 0, Math.PI * 2);
            this.terrainBitmap.context.clearRect(x - 23, y - 21.5, 46, 43);
            this.terrainBitmap.refresh();
            this.collisions.updateCollisionMapArea(
                this.collisionMap,
                this.terrainBitmap,
                this.terrainWidth,
                this.terrainHeight,
                x - 23,
                y - 21.5,
                46,
                43
            );
        });

        window.addEventListener("changeActiveWorm", (event) => {
            const { wormIndex } = event.detail;
            this.currentWormIndex = wormIndex;
            if (this.isMyTurn) {
                this.isMyTurn = false;
            } else {
                this.isMyTurn = true;
            }
            console.log("es mi turno?", this.isMyTurn);
        });

        window.addEventListener("wormMove", (event) => {
            const { x, y, velocityX, velocityY, flipX, anim } = event.detail;

            const worm = this.worms[this.currentWormIndex];
            if (!worm) return; // prevención extra

            worm.x = x;
            worm.y = y;
            worm.setVelocity(velocityX, velocityY);
            worm.setFlipX(flipX);

            if (anim && anim !== worm.anims.getName()) {
                worm.play(anim, true);
            }
        });

        // Crear instancia de Clouds y comenzar la creación de nubes
        this.clouds = new Clouds(this); // Pasa la escena al constructor de Clouds
        this.clouds.startClouds(); // Comienza la creación de las nubes

        this.cursors = this.input.keyboard.createCursorKeys();

        this.fireButton = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );

        this.jumpButton = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        this.nextWormKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.T
        );
    }

    update() {
        const cursors = this.cursors;
        const worm1 = this.worms[this.currentWormIndex];

        if (Phaser.Input.Keyboard.JustDown(this.nextWormKey)) {
            this.currentWormIndex =
                (this.currentWormIndex + 1) % this.worms.length;

            const rivalSocketId = store.getState().match.rivalSocketId;

            if (rivalSocketId) {
                sendMessage("ChangeActiveWorm", {
                    socketId: rivalSocketId,
                    wormIndex: this.currentWormIndex,
                });
            }
            if (this.isMyTurn) {
                this.isMyTurn = false;
            } else {
                this.isMyTurn = true;
            }

            console.log("es mi turno?", this.isMyTurn);
        }

        // Posición etiquetas
        this.wormLabels.forEach((label, index) => {
            const worm = this.worms[index];
            label.setPosition(worm.x, worm.y - 40);
        });

        // Barra de carga visual sobre worm1
        // if (this.chargeStartTime !== null) {
        //     const chargeDuration = this.time.now - this.chargeStartTime;
        //     const power = Phaser.Math.Clamp(chargeDuration * 2, 100, 600);
        //     const percent = (power - 100) / (600 - 100); // de 0 a 1

        //     const red = Phaser.Display.Color.Interpolate.ColorWithColor(
        //         new Phaser.Display.Color(0, 255, 0),
        //         new Phaser.Display.Color(255, 0, 0),
        //         1,
        //         percent
        //     );
        //     const colorHex = Phaser.Display.Color.GetColor(red.r, red.g, red.b);
        //     this.chargeBarFill.setFillStyle(colorHex);

        //     this.chargeBarBg
        //         .setVisible(true)
        //         .setPosition(worm1.x, worm1.y - 60);
        //     this.chargeBarFill
        //         .setVisible(true)
        //         .setPosition(worm1.x, worm1.y - 60)
        //         .setScale(percent, 1);
        // } else {
        //     this.chargeBarBg.setVisible(false);
        //     this.chargeBarFill.setVisible(false);
        // }

        // Explosión
        if (this.grenade.active) {
            this.grenadeVsLand();
        } else {
            //  Allow them to set the angle, between -90 (straight up) and 0 (facing to the right)
            if (this.cursors.up.isDown) {
                this.crosshair.angle--;
            } else if (this.cursors.down.isDown) {
                this.crosshair.angle++;
            }

            if (Phaser.Input.Keyboard.JustDown(this.fireButton)) {
                this.chargeStartTime = this.time.now;
            }

            if (
                Phaser.Input.Keyboard.JustUp(this.fireButton) &&
                this.chargeStartTime !== null
            ) {
                const chargeDuration = this.time.now - this.chargeStartTime;
                this.chargeStartTime = null;

                // Limita la potencia de disparo entre 100 y 600
                const firePower = Phaser.Math.Clamp(chargeDuration, 100, 600);

                this.launchGrenade(
                    this.crosshair.x,
                    this.crosshair.y - 20,
                    firePower
                );
            }
        }

        // Colisiones gusanos
        this.worms.forEach((worm) => {
            const flags = this.collisions.checkCollisionDirections(
                this.collisionMap,
                this.terrainWidth,
                this.terrainHeight,
                worm.body.center.x,
                worm.body.center.y
            );
            worm.collisionFlags = flags;

            // Gravedad vertical
            if (flags.collideDown) {
                worm.setVelocityY(0);
                worm.body.allowGravity = false;
            } else {
                worm.body.allowGravity = true;
            }

            if (flags.collideTop && worm.body.velocity.y < 0) {
                worm.setVelocityY(0);
            }

            // Movimiento horizontal (bloqueo y escalada)
            if (flags.collideLeft && worm.body.velocity.x < 0) {
                const climb = this.collisions.canClimb(
                    this.collisionMap,
                    this.terrainWidth,
                    this.terrainHeight,
                    worm.x,
                    worm.y,
                    -1
                );
                if (climb > 0) {
                    worm.y -= climb;
                } else {
                    worm.body.setVelocityX(0);
                }
                worm.body.updateFromGameObject?.();
            }

            if (flags.collideRight && worm.body.velocity.x > 0) {
                const climb = this.collisions.canClimb(
                    this.collisionMap,
                    this.terrainWidth,
                    this.terrainHeight,
                    worm.x,
                    worm.y,
                    1
                );
                if (climb > 0) {
                    worm.y -= climb;
                } else {
                    worm.body.setVelocityX(0);
                }
                worm.body.updateFromGameObject?.();
            }

            // Fuera de los límites
            if (worm.y >= this.physics.world.bounds.height) {
                worm.setY(this.physics.world.bounds.height);
                worm.body.velocity.y = Math.min(0, worm.body.velocity.y);
            }
        });

        //movimiento del gusano activo
        if (this.isMyTurn) {
            // Salto
            if (this.jumpButton.isDown && worm1.collisionFlags?.collideDown) {
                worm1.setVelocityY(-300);
            }

            // Movimiento horizontal
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
        }

        //movimiento websocket
        // Enviar posición del gusano activo al rival
        if (this.isMyTurn) {
            const worm = this.worms[this.currentWormIndex];

            // Detectar cambio relevante
            if (
                worm.body.velocity.x !== 0 ||
                worm.body.velocity.y !== 0 ||
                Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
                Phaser.Input.Keyboard.JustDown(this.cursors.right)
            ) {
                const rivalSocketId = store.getState().match.rivalSocketId;
                sendMessage("WormMove", {
                    socketId: rivalSocketId,
                    x: worm.x,
                    y: worm.y,
                    velocityX: worm.body.velocity.x,
                    velocityY: worm.body.velocity.y,
                    flipX: worm.flipX,
                    anim: worm.anims.getName() || null,
                });
            }
        }

        // Colisiones de la granada
        if (this.grenade.active) {
            const grenadeFlags = this.collisions.checkCollisionDirections(
                this.collisionMap,
                this.terrainWidth,
                this.terrainHeight,
                this.grenade.body.center.x,
                this.grenade.body.center.y
            );
            this.grenade.collisionFlags = grenadeFlags;
        }

        // Cursor visual
        const pointer = this.input.activePointer;
        const alpha = this.textures.getPixelAlpha(
            pointer.x,
            pointer.y,
            "terrainBitmap"
        );
        this.game.canvas.style.cursor = alpha > 0 ? "crosshair" : "default";

        // Actualizar posición del crosshair para que siga al gusano
        this.crosshair.setPosition(
            worm1.body.center.x +
                20 * Math.cos(Phaser.Math.DegToRad(this.crosshair.angle)),
            worm1.body.center.y +
                20 * Math.sin(Phaser.Math.DegToRad(this.crosshair.angle))
        );

        if (
            this.grenade.velocity < 2 ||
            this.grenade.x < 0 ||
            this.grenade.x > 800 ||
            this.grenade.y > 600
        ) {
            this.removeGrenade();
        }
    }

    grenadeVsLand() {
        const x = Math.floor(this.grenade.body.center.x);
        const y = Math.floor(this.grenade.body.center.y);

        const isInsideTerrain = this.collisions.isSolid(
            this.collisionMap,
            this.terrainWidth,
            this.terrainHeight,
            x,
            y
        );

        if (isInsideTerrain) {
            const normal = this.collisions.getSurfaceNormal(
                this.collisionMap,
                this.terrainWidth,
                this.terrainHeight,
                this.grenade.body.center.x,
                this.grenade.body.center.y
            );

            const vx = this.grenade.body.velocity.x;
            const vy = this.grenade.body.velocity.y;

            const reflected = this.collisions.reflectVector(
                vx,
                vy,
                normal.x,
                normal.y
            );

            const bounceFactor = 0.6;
            this.grenade.setVelocity(
                reflected.x * bounceFactor,
                reflected.y * bounceFactor
            );

            this.grenade.setDrag(50, 0);

            const speed = Math.hypot(reflected.x, reflected.y);
            if (
                speed < 2 ||
                this.grenade.x <= 0 ||
                this.grenade.x >= 800 ||
                this.grenade.y >= 600
            ) {
                this.removeGrenade();
            }
        }
    }

    removeGrenade(hasExploded) {
        if (typeof hasExploded === "undefined") {
            hasExploded = false;
        }
        this.grenade.disableBody(true, true);
        this.camera.stopFollow();
        let delay = 1000;
        if (hasExploded) delay = 2000;

        this.cameraTween = this.tweens.add({
            targets: this.camera,
            scrollX: 0,
            duration: 1000,
            ease: "Quintic.Out",
            delay: delay,
        });
    }

    launchGrenade(x, y, power) {
        if (this.grenade.active) return;

        this.grenade
            .enableBody(true, x, y, true, true)
            .setVelocity(0)
            .setDrag(0)
            .setBounce(0)
            .setCollideWorldBounds(false);

        const trayectory = this.physics.velocityFromAngle(
            // CON ESTO CALCULAMOS TRAYECTORIA DISPAROS
            this.crosshair.angle,
            power,
            this.grenade.body.velocity
        );

        // const vx = Math.cos(angle) * power * direction;
        // const vy = -Math.sin(angle) * power;

        // this.grenade.setVelocity(vx, vy);

        // this.camera.startFollow(this.grenade, true, 0.1, 0.1);
    }
}
