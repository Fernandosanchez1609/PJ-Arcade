

class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        this.add.text(400, 300, 'GAME OVER', { fontSize: '48px', fill: '#ff0000', color: "#FF5805" }).setOrigin(0.5);
    }
}
