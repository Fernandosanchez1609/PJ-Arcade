

class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.load.image("game-over", "/images/game-over.png");
    }

    create() {
        this.add.image(400, 300, "game-over")
    }
}
