export class Game extends Phaser.Scene {
    constructor() {
        super({ key: "worms" });
    }

    preload() {
        this.load.image("background", "/images/sky-background.png");

        // Cargar las 6 imágenes de nubes
        for (let i = 1; i <= 6; i++) {
            this.load.image(`cloud${i}`, `/images/cloud${i}.png`);
        }
    }

    create() {
        this.add.image(410, 250, "background");

        // Grupos para nubes por capa
        this.cloudBackGroup = this.add.group(); // fondo
        this.cloudFrontGroup = this.add.group(); // frente

        // Spawnea nubes del fondo más lento
        this.time.addEvent({
            delay: 8500,
            callback: () => this.spawnCloud("back"),
            loop: true,
        });

        // Spawnea nubes del frente más rápido
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

        // Crear nube fuera de pantalla derecha
        const cloud = this.add.image(1200, y, cloudKey);

        let scale, speed, group;

        // Parallax
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

        // Animar hacia la izquierda
        this.tweens.add({
            targets: cloud,
            x: -150,
            duration: (cloud.x + 200) / speed,
            ease: "Linear",
            onComplete: () => {
                cloud.destroy(); // La imagen se elimina al salir de pantalla
            },
        });
    }
}
