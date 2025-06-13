export class Victory extends Phaser.Scene {
    constructor() {
        super('VictoryScene' );
    }

    preload() {
        this.load.image("you-win", "/images/you-win.png");
    }

    create() {
        this.add.image(400, 300, "you-win")
    }
}
