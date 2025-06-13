import { sendMessage } from "@/lib/WsClient";
import { store } from "@/store/store";
import { Clouds } from "@/games/worms/WormsClouds";
import { Collisions } from "@/games/worms/WormsCollisions.js";

export class Game extends Phaser.Scene {
    constructor() {
        super({ key: "worms" });
        this.isMyTurn = false; // Variable para controlar el turno del jugador
        this.hasExploded = true; // Variable para controlar si la granada ha explotado
        this.maxLife = 20;
        this.rivalSocketId = store.getState().match.rivalSocketId;
        this.fpsCounter = 0;
        this.playerLife = 300; // Vida del jugador
        this.rivalLife = 300; // Vida del rival
        this.gameOver = false;
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

        this.add.image(410, 250, "background").setDepth(-3);

        this.currentWormIndex = 0;
        const role = store.getState().match.playerRole;

        if (role === "Player1") {
            this.isMyTurn = true;
        } else {
            this.isMyTurn = false;
        }

        // Grenade
        this.grenade = this.physics.add.sprite(0, 0, "grenade");
        this.grenade
            .setBounce(0) // Desactivamos rebote para hacerlo manual
            .setCollideWorldBounds(false)
            .disableBody(true, true)
            .setDepth(0)
            .setOrigin(0.5);
        this.grenade.damage = 20;
        this.grenade.collideDown;
        this.grenade.collideLeft;
        this.grenade.collideTop;
        this.grenade.collideRight;

        if (role === "Player1") {
            this.isMyTurn = true;
        } else {
            this.isMyTurn = false;
        }

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
            worm.life = this.maxLife;
            worm.collideDown;
            worm.collideLeft;
            worm.collideTop;
            worm.collideRight;

            this.worms.push(worm);
        }

        // para mostrar el numero del gusano
        this.wormLabels = [];

        for (let worm of this.worms) {
            const nameLabel = this.add
                .text(worm.x, worm.y - 40, `${worm.wormId}`, {
                    font: "16px Arial",
                    fill: "#ffffff",
                    stroke: "#000",
                    strokeThickness: 3,
                })
                .setOrigin(0.5)
                .setDepth(-1);

            const lifeLabel = this.add
                .text(worm.x, worm.y - 25, `${worm.life}`, {
                    font: "16px Arial",
                    fill: "#ffffff",
                    stroke: "#000",
                    strokeThickness: 3,
                })
                .setOrigin(0.5)
                .setDepth(-1);

            this.wormLabels.push({ nameLabel, lifeLabel });
        }

        this.crosshair = this.add
            .image(
                this.worms[0].body.center.x,
                this.worms[0].body.center.y,
                "crosshair"
            )
            .setAngle(-90)
            .setOrigin(0, 0.5)
            .setDepth(-1);

        // Terreno
        this.terrain = this.add.renderTexture(400, 350, 800, 600).setDepth(0); // A1. AQUI SUMA 50 A LAS Y PARA QUE NO ESTÉ CENTRADO
        this.terrain.draw("terrain", 0, 0);

        const srcImage = this.textures.get("terrain").getSourceImage();
        this.terrainBitmap = this.textures.createCanvas(
            "terrainBitmap",
            800,
            600
        );
        this.terrainBitmap.context.drawImage(srcImage, 0, 50); // A2. POR ESO AQUI ES (0, 50)
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

        this.maxCharge = 600; // Potencia máxima de carga (en ms)
        this.maxBarLength = 80; // Longitud máxima barra carga disparo

        this.chargeBarBg = this.add.rectangle(0, 0, 0, 8, 0x333333);
        this.chargeBarBg.setOrigin(0, 0.5); // igual origen
        this.chargeBarBg.setVisible(false);

        this.chargeBar = this.add.rectangle(0, 0, 0, 8, 0x00ff00);
        this.chargeBar.setOrigin(0, 0.5); // nace desde el extremo derecho
        this.chargeBar.setVisible(false);



        // Oculta al inicio
        this.chargeBar.setVisible(false);
        this.chargeBarBg.setVisible(false);

        // Listener eventos de WebSocket
        window.addEventListener("rivalAttack", (event) => {
            const { x, y, power, angle } = event.detail;
            this.launchGrenade(x, y, power, angle); // Dispara la granada al punto donde el rival hizo click
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

        window.addEventListener("grenadePosition", (event) => {
            console.log("Actualizando posición de la granada");
            const { grenadeX, grenadeY, velocityX, velocityY } = event.detail;
            this.grenade.setPosition(grenadeX, grenadeY);
            this.grenade.body.setVelocity(velocityX, velocityY);
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
    }

    update() {
        this.fpsCounter++;
        if (this.fpsCounter % 60 === 0) {
            this.fpsCounter = 0;
        }
        const cursors = this.cursors;
        const worm1 = this.worms[this.currentWormIndex];

        // Posición etiquetas
        this.wormLabels.forEach((labels, index) => {
            const worm = this.worms[index];
            if (!worm) return;

            labels.lifeLabel.setText(`${worm.life}`); // la vida cambia dinámicamente
            labels.nameLabel.setPosition(worm.x, worm.y - 40);
            labels.lifeLabel.setPosition(worm.x, worm.y - 25);

        });

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
                sendMessage("WormMove", {
                    socketId: this.rivalSocketId,
                    x: worm.x,
                    y: worm.y,
                    velocityX: worm.body.velocity.x,
                    velocityY: worm.body.velocity.y,
                    flipX: worm.flipX,
                    anim: worm.anims.getName() || null,
                });
            }
        }

        // Cursor visual
        if (this.isMyTurn) {
            const pointer = this.input.activePointer;
            const alpha = this.textures.getPixelAlpha(
                pointer.x,
                pointer.y,
                "terrainBitmap"
            );
            this.game.canvas.style.cursor = alpha > 0 ? "crosshair" : "default";

            // Actualizar posición del crosshair para que siga al gusano
            const distance = 30;
            this.crosshair.setPosition(
                worm1.body.center.x +
                distance *
                Math.cos(Phaser.Math.DegToRad(this.crosshair.angle)),
                worm1.body.center.y +
                distance *
                Math.sin(Phaser.Math.DegToRad(this.crosshair.angle))
            );
        }
        // Explosión
        if (this.grenade.active) {
            // Colisiones de la granada
            const grenadeFlags = this.collisions.checkCollisionGrenade(
                this.collisionMap,
                this.terrainWidth,
                this.terrainHeight,
                Math.floor(this.grenade.body.center.x),
                Math.floor(this.grenade.body.center.y)
            );
            this.grenade.collisionFlags = grenadeFlags;

            if (grenadeFlags.collideLeft) {
                this.invertGrenadeX(this.grenade.body.velocity.x);
            } else if (grenadeFlags.collideRight) {
                this.invertGrenadeX(this.grenade.body.velocity.x);
            }

            if (grenadeFlags.collideTop && this.grenade.body.velocity.y < 0) {
                this.invertGrenadeY(this.grenade.body.velocity.y);
            }

            if (grenadeFlags.collideDown) {
                this.invertGrenadeY(this.grenade.body.velocity.y);
                const fall = 1;
                if (Math.abs(this.grenade.body.velocity.y) > fall) {
                    this.grenade.body.allowGravity = false;
                }
            } else {
                this.grenade.body.allowGravity = true;
            }

            if (
                this.grenade.body.x <= 0 ||
                this.grenade.body.x >= 800 ||
                this.grenade.body.y >= 600
            ) {
                this.removeGrenade();
            }
        } else if (this.isMyTurn) {
            //  Allow them to set the angle, between -90 (straight up) and 0 (facing to the right)
            if (this.cursors.up.isDown) {
                this.crosshair.angle--;
            } else if (this.cursors.down.isDown) {
                this.crosshair.angle++;
            }

            if (Phaser.Input.Keyboard.JustDown(this.fireButton)) {
                this.chargeStartTime = this.time.now;

                // Mostrar la barra de carga
                this.chargeBar.setVisible(true);
                this.chargeBarBg.setVisible(true);
            }

            if (
                Phaser.Input.Keyboard.JustUp(this.fireButton) &&
                this.chargeStartTime !== null
            ) {
                const chargeDuration = this.time.now - this.chargeStartTime;
                this.chargeStartTime = null;

                // Limita la potencia de disparo entre 100 y 600
                const firePower = Phaser.Math.Clamp(
                    chargeDuration * 0.8,
                    20,
                    this.maxCharge
                );

                this.launchGrenade(
                    worm1.body.center.x,
                    worm1.body.center.y,
                    firePower,
                    this.crosshair.angle
                );

                // Ocultar barra al disparar
                this.chargeBar.setVisible(false);
                this.chargeBarBg.setVisible(false);
            }
        }

        // Barra de carga: actualizar si se está cargando
        if (this.chargeStartTime !== null) {
            const elapsed = this.time.now - this.chargeStartTime;
            const clamped = Phaser.Math.Clamp(elapsed, 0, this.maxCharge);
            const percentage = clamped / this.maxCharge;

            const maxLength = 60;
            const currentLength = maxLength * percentage;

            // Coordenadas de origen y destino
            const fromX = worm1.body.center.x;
            const fromY = worm1.body.center.y;
            const toX = this.crosshair.x;
            const toY = this.crosshair.y;

            // Ángulo entre gusano y cruceta
            const angleRad = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
            const angleDeg = Phaser.Math.RadToDeg(angleRad);

            // Posicionar la barra desde el gusano apuntando hacia la cruceta
            this.chargeBar.setPosition(fromX, fromY);
            this.chargeBar.setRotation(angleRad); // ya no se invierte
            this.chargeBar.width = currentLength;

            // Barra de fondo con longitud máxima
            this.chargeBarBg.setPosition(fromX, fromY);
            this.chargeBarBg.setRotation(angleRad);
            this.chargeBarBg.width = maxLength;

            // Color interpolado
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                new Phaser.Display.Color(0, 255, 0),
                new Phaser.Display.Color(255, 0, 0),
                1,
                percentage
            );

            this.chargeBar.setFillStyle(
                Phaser.Display.Color.GetColor(color.r, color.g, color.b)
            );
        }

        if (this.isMyTurn && this.grenade.active && this.fpsCounter % 60 === 0) {
            sendMessage("GrenadePosition", {
                socketId: this.rivalSocketId,
                grenadeX: this.grenade.body.center.x,
                grenadeY: this.grenade.body.center.y,
                velocityX: this.grenade.body.velocity.x,
                velocityY: this.grenade.body.velocity.y,
            });
        }

        if (this.playerLife <= 0 && !this.gameOver) {
            console.log("Game Over: Has perdido")
            this.gameOver = true;
            this.scene.start("GameOverScene"); // Cambia a la escena de Game Over


        } else if (this.rivalLife <= 0 && !this.gameOver) {
            console.log("Game Over: Has ganado")
            this.gameOver = true;
            this.scene.start("VictoryScene"); // Cambia a la escena de Victory
        }

    }

    removeGrenade() {
        console.log(this.hasExploded);
        if (this.hasExploded) return;
        this.hasExploded = true;
        this.terrain.erase(
            "explosion",
            this.grenade.body.center.x - 23,
            this.grenade.body.center.y - 71.5
        );

        // Corrige el clearRect → usa el tamaño de la explosión
        this.terrainBitmap.context.clearRect(
            this.grenade.body.center.x - 23,
            this.grenade.body.center.y - 21.5,
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
            this.grenade.body.center.x - 23,
            this.grenade.body.center.y - 21.5,
            46,
            43
        );

        this.grenade.disableBody(true, true);

        this.ChangeTurn();

        console.log("es mi turno?", this.isMyTurn);
    }

    launchGrenade(x, y, power, angle) {
        if (this.grenade.active) return;
        this.hasExploded = false;
        this.grenade
            .enableBody(true, x, y, true, true)
            .setVelocity(0)
            .setDrag(0)
            .setBounce(0)
            .setCollideWorldBounds(false);

        this.physics.velocityFromAngle(
            angle,
            power,
            this.grenade.body.velocity
        );

        if (this.rivalSocketId && this.isMyTurn) {
            sendMessage("Atack", {
                socketId: this.rivalSocketId,
                x: x,
                y: y,
                power: power,
                angle: angle,
            });
        }
        this.time.delayedCall(
            3000,
            () => {
                this.worms.forEach((worm) => {
                    const receivesDamage = this.isInRange(
                        worm.body.center.x,
                        worm.body.center.y,
                        this.grenade.body.center.x,
                        this.grenade.body.center.y
                    );

                    if (receivesDamage) {
                        console.log(
                            "Gusano #" + worm.wormId + " recibe daño"
                        );
                        console.log("vida pre-explosion: " + worm.life);
                        worm.life -= this.grenade.damage;
                        console.log(
                            "vida post-explosion: " + worm.life
                        );
                        if (worm.life <= 0) {
                            worm.disableBody(true, true)
                            worm.life = ""
                            worm.wormId = ""
                        }
                    }
                });
                this.removeGrenade();
                this.ChangeLive();
            },
            [],
            this
        );
    }


    invertGrenadeX(vx) {
        const bounceFactor = 0.5;
        this.grenade.setVelocityX(-vx * bounceFactor);
    }

    invertGrenadeY(vy) {
        const bounceFactor = 0.5;
        this.grenade.setVelocityY(-vy * bounceFactor);
    }

    isInRange(wormX, wormY, explosionX, explosionY) {
        const dx = wormX - explosionX;
        const dy = wormY - explosionY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= 32;
    }

    ChangeTurn() {
        let found = false;
        let attempts = 0;
        const role = store.getState().match.playerRole;
        const num = (role === "Player1") ? 1 : 0;
        const inverseNum = (num === 1) ? 0 : 1;

        if (this.isMyTurn) {
            while (!found && attempts < this.worms.length) {
                this.currentWormIndex = (this.currentWormIndex + 1) % this.worms.length;
                const currentWorm = this.worms[this.currentWormIndex];

                if (
                    currentWorm.life > 0 &&
                    currentWorm.wormId % 2 === inverseNum
                ) {
                    found = true;
                }

                attempts++;
            }
        } else {
            while (!found && attempts < this.worms.length) {
                this.currentWormIndex = (this.currentWormIndex + 1) % this.worms.length;
                const currentWorm = this.worms[this.currentWormIndex];

                if (
                    currentWorm.life > 0 &&
                    currentWorm.wormId % 2 === num
                ) {
                    found = true;
                }

                attempts++;
            }
        }


        this.isMyTurn = !this.isMyTurn;
    }

    ChangeLive() {
        const role = store.getState().match.playerRole;
        const num = (role === "Player1") ? 1 : 0;
        var newLife = 0;
        var newRivalLife = 0;

        for (let i = 0; i < this.worms.length; i++) {
            const worm = this.worms[i];
            if (worm.wormId % 2 === num) {
                newLife += worm.life;
            } else {
                newRivalLife += worm.life;
            }
        }

        this.playerLife = newLife;
        this.rivalLife = newRivalLife;
    }


}