import { sendMessage } from "@/lib/WsClient";
import { store } from "@/store/store";
import { Clouds } from "@/games/worms/WormsClouds";

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
            this.updateCollisionMapArea(x - 23, y - 21.5, 46, 43);
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
                .body.setSize(20, 45, true);

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
        this.updateCollisionMapFromBitmap(); // <- Esto es clave

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
            { x: -15, y: -45 }, // izquierda
            { x: 15, y: -45 }, // derecha
        ];

        // this.wormShapeOffsets = [
        //     ...this.wormBaseOffsets,
        //     ...this.wormTopOffsets,
        //     ...this.wormSidesOffsets,
        // ];

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
            this.updateCollisionMapArea(localX - 23, localY - 21.5, 46, 43);

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
        const worm = this.worms[0]; // ← Controla solo el gusano 1 por ahora

        this.wormLabels.forEach((label, index) => {
            const worm = this.worms[index];
            label.setPosition(worm.x, worm.y - 40);
        });

        // Movimiento horizontal controlado
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

        // Salto
        if (cursors.up.isDown && worm.body.blocked.down) {
            worm.setVelocityY(-300); // ← valor negativo para saltar hacia arriba
        }

        // Comprobar colisiones con el terreno usando el mapa lógico
        const collisions = this.checkCollisionDirections(worm.x, worm.y);

        // Si colisión abajo, parar gravedad y velocidad Y
        if (collisions.collideDown) {
            worm.setVelocityY(0);
            worm.body.allowGravity = false;
            worm.body.blocked.down = true; // opcional para estados Phaser
        } else {
            worm.body.allowGravity = true;
            worm.body.blocked.down = false;
        }

        if (collisions.collideTop) {
            worm.setVelocityY(0);
            worm.body.allowGravity = true;
        }

        // Bloquear movimiento lateral solo si se mueve hacia colisión
        if (collisions.collideLeft && worm.body.velocity.x < 0) {
            const climbStep = this.canClimb(worm.x, worm.y, -1);
            if (climbStep > 0) {
                worm.y -= climbStep; // sube
            } else {
                worm.setVelocityX(0);
            }
        }

        if (collisions.collideRight && worm.body.velocity.x > 0) {
            const climbStep = this.canClimb(worm.x, worm.y, 1);
            if (climbStep > 0) {
                worm.y -= climbStep; // sube
            } else {
                worm.setVelocityX(0);
            }
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

    // --- Métodos auxiliares para el mapa lógico y colisión ---

    updateCollisionMapFromBitmap() {
        const ctx = this.terrainBitmap.context;
        const imgData = ctx.getImageData(
            0,
            0,
            this.terrainWidth,
            this.terrainHeight
        );
        const data = imgData.data;

        for (let i = 0, j = 0; i < data.length; i += 4, j++) {
            // data[i+3] es el alpha
            this.collisionMap[j] = data[i + 3] > 0 ? 1 : 0;
        }
    }

    updateCollisionMapArea(x, y, width, height) {
        // Limitar a tamaño válido
        const startX = Math.max(0, Math.floor(x));
        const startY = Math.max(0, Math.floor(y));
        const endX = Math.min(this.terrainWidth, Math.floor(x + width));
        const endY = Math.min(this.terrainHeight, Math.floor(y + height));

        const ctx = this.terrainBitmap.context;
        const imgData = ctx.getImageData(
            startX,
            startY,
            endX - startX,
            endY - startY
        );
        const data = imgData.data;

        let idx = 0;
        for (let py = startY; py < endY; py++) {
            for (let px = startX; px < endX; px++) {
                // Actualizamos el mapa lógico pixel a pixel
                const alpha = data[idx * 4 + 3];
                this.collisionMap[py * this.terrainWidth + px] =
                    alpha > 0 ? 1 : 0;
                idx++;
            }
        }
    }

    isSolid(px, py) {
        if (
            px < 0 ||
            py < 0 ||
            px >= this.terrainWidth ||
            py >= this.terrainHeight
        ) {
            return false;
        }
        return this.collisionMap[py * this.terrainWidth + px] === 1;
    }

    checkCollisionDirections(px, py) {
        // px, py son coordenadas centrales del gusano
        let collideDown = false,
            collideTop = false,
            collideLeft = false,
            collideRight = false;

        // for (const offset of this.wormShapeOffsets) {
        //     const checkX = Math.floor(px + offset.x);
        //     const checkY = Math.floor(py + offset.y);
        //     if (this.isSolid(checkX, checkY)) {
        //         const offsetY = offset.y;
        //         const offsetX = offset.x;

        //         if (offsetY >= -35 && offsetY <= -30) collideDown = true; // zona baja
        //         // if (offsetY <= -100 && offsetY >= -110) collideTop = true; // zona alta
        //         if (offsetX < 0) collideLeft = true;
        //         if (offsetX > 0) collideRight = true;
        //     }
        // }

        for (const offset of this.wormBaseOffsets) {
            const checkX = Math.floor(px + offset.x);
            const checkY = Math.floor(py + offset.y);
            if (this.isSolid(checkX, checkY)) {
                collideDown = true;
            }
        }

        // for (const offset of this.wormTopOffsets) {
        //     const checkX = Math.floor(px + offset.x);
        //     const checkY = Math.floor(py + offset.y);
        //     if (this.isSolid(checkX, checkY)) {
        //         collideTop = true;
        //     }
        // }

        for (const offset of this.wormSidesOffsets) {
            const checkX = Math.floor(px + offset.x);
            const checkY = Math.floor(py + offset.y);
            if (this.isSolid(checkX, checkY)) {
                if (offset.x < 0) collideLeft = true;
                else if (offset.x > 0) collideRight = true;
            }
        }

        return { collideDown, collideTop, collideLeft, collideRight };
    }

    canClimb(px, py, direction) {
        // direction: -1 para izquierda, +1 para derecha
        const stepHeight = 15; // cuantos pixeles "sube" el gusano para escalar
        for (let i = 1; i <= stepHeight; i++) {
            // Verificamos si al subir i pixeles y movernos en dirección lateral podemos pasar
            const newX = px + direction * 10; // offset lateral igual que wormSidesOffsets
            const newY = py - i; // subimos

            // Comprobamos si hay colisión lateral en la nueva posición (simular checkCollisionDirections para el lateral)
            let blocked = false;
            for (const offset of this.wormSidesOffsets) {
                if (
                    (direction === -1 && offset.x < 0) ||
                    (direction === 1 && offset.x > 0)
                ) {
                    const checkX = Math.floor(newX + offset.x);
                    const checkY = Math.floor(newY + offset.y);
                    if (this.isSolid(checkX, checkY)) {
                        blocked = true;
                        break;
                    }
                }
            }
            // También asegurarse que el suelo debajo está sólido para "apoyarse"
            const baseOffset = this.wormBaseOffsets[0];
            const baseX = Math.floor(newX + baseOffset.x);
            const baseY = Math.floor(newY + baseOffset.y + 1); // un pixel más abajo del pie
            if (!this.isSolid(baseX, baseY)) {
                blocked = true; // si no hay suelo, no subir (no puede flotar)
            }

            if (!blocked) {
                // Podemos subir i pixeles sin colisionar
                return i;
            }
        }
        return 0; // no puede subir
    }
}
