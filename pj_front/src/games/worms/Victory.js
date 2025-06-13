class Victory extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create() {
        this.add.text(400, 300, 'YOU WIN!', { fontSize: '48px', fill: '#00ff00', color: "#FF5805" }).setOrigin(0.5);
    }
}
