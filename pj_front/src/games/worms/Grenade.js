export class HandleGrenade {
    constructor(scene) {
        this.scene = scene;
    }

    removeGrenade(
        collisionMap,
        terrainBitmap,
        terrainWidth,
        terrainHeight,
        grenadeX,
        grenadeY,
        explosion
    ) {
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
            collisionMap,
            terrainBitmap,
            terrainWidth,
            terrainHeight,
            grenadeX - 23,
            grenadeY - 21.5,
            46,
            43
        );

        const rivalSocketId = store.getState().match.rivalSocketId;

        if (rivalSocketId) {
            sendMessage("Atack", {
                socketId: rivalSocketId,
                x: this.grenade.body.center.x,
                y: this.grenade.body.center.y - 50,
            });
        }

        this.grenade.disableBody(true, true);
        this.camera.stopFollow();
        let delay = 1000;
        if (this.hasExploded) delay = 1000;

        this.currentWormIndex = (this.currentWormIndex + 1) % this.worms.length;
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

    launchGrenade(x, y, power) {
        if (this.grenade.active) return;
        this.hasExploded = false;
        this.grenade.delayedCallStarted = false;
        this.grenade
            .enableBody(true, x, y, true, true)
            .setVelocity(0)
            .setDrag(0)
            .setBounce(0)
            .setCollideWorldBounds(false);

        this.physics.velocityFromAngle(
            this.crosshair.angle,
            power,
            this.grenade.body.velocity
        );
    }

    invertGrenadeX(vx) {
        const bounceFactor = 0.75;
        this.grenade.setVelocityX(-vx * bounceFactor);
    }

    invertGrenadeY(vy) {
        const bounceFactor = 0.75;
        this.grenade.setVelocityY(-vy * bounceFactor);
    }

    isInRange(wormX, wormY, explosionX, explosionY) {
        const dx = wormX - explosionX;
        const dy = wormY - explosionY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= 32;
    }
}
