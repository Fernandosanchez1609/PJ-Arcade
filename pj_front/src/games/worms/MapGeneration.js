// MapGeneration.js

export function generateTerrain(
    scene,
    terrainKey = "terrainMask",
    dirtKey = "dirt",
    grassKey = "grass"
) {
    const terrainImage = scene.textures.get(terrainKey).getSourceImage();
    const width = terrainImage.width;
    const height = terrainImage.height;

    const x = scene.cameras.main.centerX - width / 2;
    const y = scene.cameras.main.centerY - height / 2;

    // Render textures
    const terrainRT = scene.add.renderTexture(x, y, width, height);
    const grassRT = scene.add.renderTexture(x, y, width, height);

    // Crear imagen de máscara en la posición correcta
    const maskImage = scene.make.image({
        key: terrainKey,
        x: x + width / 2,
        y: y + height / 2,
        add: false,
    });

    const dirtTile = scene.make.tileSprite({
        key: dirtKey,
        width: width,
        height: height,
        add: false,
    });

    const mask = new Phaser.Display.Masks.BitmapMask(scene, maskImage);
    terrainRT.setMask(mask);
    terrainRT.draw(dirtTile, 0, 0);
    terrainRT.clearMask();

    // Dibujar la hierba solo en superficies horizontales
    const canvas = scene.textures.get(terrainKey).getSourceImage();
    drawGrassOnTop(scene, grassRT, canvas, grassKey);

    terrainRT.setDepth(1);
    grassRT.setDepth(2);

    // Puedes devolver las render textures si necesitas manipularlas
    return { terrainRT, grassRT };
}

function drawGrassOnTop(scene, rt, image, grassKey) {
    const width = image.width;
    const height = image.height;

    // Copiar imagen a un canvas temporal
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    const getTopY = (x) => {
        for (let y = 0; y < height; y++) {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            if (pixel[3] > 10) return y;
        }
        return null;
    };

    for (let x = 2; x < width - 2; x += 2) {
        const y = getTopY(x);
        const yLeft = getTopY(x - 2);
        const yRight = getTopY(x + 2);

        const isFlat =
            y !== null &&
            yLeft !== null &&
            yRight !== null &&
            Math.abs(y - yLeft) <= 2 &&
            Math.abs(y - yRight) <= 2;

        if (isFlat) {
            rt.draw(grassKey, x, y - 5);
        }
    }
}
