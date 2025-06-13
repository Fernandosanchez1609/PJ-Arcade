// this is a conversion of the code from Phaser Coding Tips1-2 "Creating a game like Tanks / Worms" from Phaser 2 to Phaser 3
// original tutorial is here: https://phaser.io/tutorials/coding-tips-002
// github of the original code here: https://github.com/photonstorm/phaser-coding-tips/tree/master/issue-002

class Game extends Phaser.Scene {
    constructor() {
        super({ key: "game" });
        this.tank = null;
        this.turret = null;
        this.flame = null;
        this.bullet = null;

        this.background = null;
        this.targets = null;
        this.land = null;
        this.emitter = null;

        this.power = 300;
        this.powerText = null;

        this.cursors = null;
        this.fireButton = null;
    }

    preload() {
        this.load.baseURL =
            "https://raw.githubusercontent.com/photonstorm/phaser-coding-tips/master/issue-002/";

        this.load.image("tank", "assets/tank.png");
        this.load.image("turret", "assets/turret.png");
        this.load.image("bullet", "assets/bullet.png");
        this.load.image("background", "assets/background.png"); // 992 x 512 image
        this.load.image("flame", "assets/flame.png");
        this.load.image("target", "assets/target.png");
        this.load.image("land", "assets/land.png"); // 992 x 480 image

        //  Note: Graphics from Amiga Tanx Copyright 1991 Gary Roberts
    }

    create() {
        //  Set the camera bounds to be the size of the land image
        this.cameras.main.setBounds(0, 0, 992, 480);
        this.camera = this.cameras.main;
        //  Simple but pretty background (in the original, it is created as a sprite - I have created an image, which seems to work just as well)
        this.background = this.add.image(0, 0, "background").setOrigin(0, 0);

        //  The targets to hit (hidden behind the land slightly)
        this.targets = this.physics.add.group();

        this.targets.create(284, 378, "target");
        this.targets.create(456, 153, "target");
        this.targets.create(545, 305, "target");
        this.targets.create(726, 391, "target");
        this.targets.create(972, 74, "target");
        this.targets.children.each((target) => {
            target.setOrigin(0);
            target.body.setAllowGravity(false);
        });

        // you access the Texture manager (a singleton class) via scene.textures
        // createCanvas creates a new Textures using a blank Canvas element of the size given
        this.canvas = this.textures.createCanvas("canvastexture", 992, 480);
        // get(key) returns the Texture with the given key
        // getSourceImage returns the source image the Texture Manager uses to render with
        this.land = this.textures.get("land").getSourceImage();
        // draw(x,y,source) draws the given image or Canvas element to his canvas texture
        this.canvas.draw(0, 0, this.land);
        //  Now, display the Canvas Texture by adding it to an Image
        this.add.image(0, 0, "canvastexture").setOrigin(0);
        // the globalCompositeOperation property sets or returns how a source image is dawn onto a destination iamge
        // 'destination-out' basically means the part of the destination image drawn over by the source image will be transparent
        this.canvas.context.globalCompositeOperation = "destination-out";
        //  Now anything drawn to the canvas will use this op

        this.emitter = this.add.particles("flame").createEmitter({
            speedX: { min: -120, max: 120 },
            speedY: { min: -200, max: -120 },
            rotation: { min: -15, max: 15 },
            lifespan: 2000,
            maxParticles: 30,
            quantity: 10,
            on: false,
        });

        //  A single bullet that the tank will fire
        this.bullet = this.physics.add.sprite(10, 10, "bullet");
        this.bullet.disableBody(true, true);

        //  The body of the tank (in Phaser 2, orogin is at top left hand corner as opposed to middle, by default)
        this.tank = this.add.sprite(24, 383, "tank").setOrigin(0);
        //  The turret which we rotate (offset 30x14 from the tank)
        this.turret = this.add
            .sprite(this.tank.x + 30, this.tank.y + 14, "turret")
            .setOrigin(0);

        //  When we shoot this little flame sprite will appear briefly at the end of the turret
        this.flame = this.add.sprite(0, 0, "flame");
        this.flame.setVisible(false);

        //  Used to display the power of the shot
        this.power = 300;
        this.powerText = this.add.text(8, 8, "Power: 300", {
            font: "18px Arial",
            fill: "#ffffff",
        });
        this.powerText.setShadow(1, 1, "rgba(0, 0, 0, 0.8)", 1);
        this.powerText.fixedToCamera = true;

        //  Some basic controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireButton = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.physics.add.overlap(
            this.bullet,
            this.targets,
            this.hitTarget,
            null,
            this
        );
    }

    update(time, delta) {
        //  If the bullet is in flight we don't let them control anything
        if (this.bullet.active) {
            //  Bullet vs. the land
            this.bulletVsLand();
        } else {
            //  Allow them to set the power between 100 and 600
            if (this.cursors.left.isDown && this.power > 100) {
                this.power -= 2;
            } else if (this.cursors.right.isDown && this.power < 600) {
                this.power += 2;
            }
            //  Allow them to set the angle, between -90 (straight up) and 0 (facing to the right)
            if (this.cursors.up.isDown && this.turret.angle > -90) {
                this.turret.angle--;
            } else if (this.cursors.down.isDown && this.turret.angle < 0) {
                this.turret.angle++;
            }

            if (Phaser.Input.Keyboard.JustDown(this.fireButton)) { // Con esto calculamos potencia disparo!!!!!!!!!!!
                this.fire();
            }
            //  Update the text
            this.powerText.text = "Power: " + this.power;
        }
    }

    bulletVsLand() {
        //  Simple bounds check
        if (this.bullet.x < 0 || this.bullet.x > 992 || this.bullet.y > 480) {
            this.removeBullet();
            return;
        }

        var x = Math.floor(this.bullet.x);
        var y = Math.floor(this.bullet.y);
        var rgba = this.canvas.getPixel(x, y);

        if (rgba.a > 0) {
            this.canvas.context.beginPath();
            this.canvas.context.arc(x, y, 16, 0, Math.PI * 2);
            this.canvas.context.fill();
            this.canvas.update();

            this.removeBullet();
        }
    }

    fire() {
        if (this.bullet.active) return;
        //  Re-position the bullet where the turret is
        this.bullet.enableBody(true, this.turret.x, this.turret.y, true, true);
        //  Our launch trajectory is based on the angle of the turret and the power
        this.physics.velocityFromAngle( // CON ESTO CALCULAMOS TRAYECTORIA DISPAROS
            this.turret.angle,
            this.power,
            this.bullet.body.velocity
        );
        //  Now work out where the END of the turret is
        let p = new Phaser.Geom.Point();
        Phaser.Math.RotateAroundDistance(
            p,
            this.turret.x,
            this.turret.y,
            this.turret.rotation + Math.PI / 2,
            34
        );
        //  And position the flame sprite there
        this.flame.x = p.x;
        this.flame.y = p.y;
        this.flame.alpha = 1;
        this.flame.visible = true;
        //  Boom
        this.flameTween = this.tweens.add({
            targets: this.flame,
            alpha: 0,
            duration: 1000,
            ease: "Linear",
        });
        //  So we can see what's going on when the bullet leaves the screen
        this.cameras.main.startFollow(this.bullet);
    }

    hitTarget(bullet, target) {
        const { x, y } = bullet;
        this.emitter.emitParticleAt(x, y);
        target.disableBody(true, true);
        this.removeBullet(true);
    }

    removeBullet(hasExploded) {
        if (typeof hasExploded === "undefined") {
            hasExploded = false;
        }
        this.bullet.disableBody(true, true);
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
}

const config = {
    type: Phaser.CANVAS,
    width: 640,
    height: 480,
    backgroundColor: 0x000000,
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 200 },
            debug: false,
            //debugShowVelocity: false
        },
    },
    scene: [Game],
};

SCREEN_WIDTH = config.width;
SCREEN_HEIGHT = config.height;

var game = new Phaser.Game(config);
