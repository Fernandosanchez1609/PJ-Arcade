export class Game extends Phaser.Scene {
    constructor() {
        super({ key: "worms" });
    }

    preload() {
        this.load.image("background", "/images/sky-background.png");
    }

    create() {
        this.add.image(410, 250, "background");
    }
}
