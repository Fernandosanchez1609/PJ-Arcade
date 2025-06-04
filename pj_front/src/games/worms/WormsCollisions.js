// export class Collisions {
//     constructor(scene) {
//         this.scene = scene;
//     }

//     preload() {}

export function updateCollisionMapFromBitmap(
    terrainBitmap,
    collisionMap,
    terrainWidth,
    terrainHeight
) {
    const ctx = terrainBitmap.context;
    const imgData = ctx.getImageData(
        0,
        0,
        terrainWidth, // <--- usar el argumento
        terrainHeight
    );
    const data = imgData.data;

    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        collisionMap[j] = data[i + 3] > 0 ? 1 : 0; // <--- usar argumento
    }
}

export function updateCollisionMapArea(
    terrainBitmap,
    collisionMap,
    x,
    y,
    width,
    height,
    terrainWidth,
    terrainHeight
) {
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(terrainWidth, Math.floor(x + width)); // <--- usar argumento
    const endY = Math.min(terrainHeight, Math.floor(y + height)); // <--- usar argumento

    const ctx = terrainBitmap.context; // <--- usar argumento
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
            const alpha = data[idx * 4 + 3];
            collisionMap[py * terrainWidth + px] = alpha > 0 ? 1 : 0; // <--- usar argumento
            idx++;
        }
    }
}

export function isSolid(px, py, collisionMap, terrainWidth, terrainHeight) {
    if (px < 0 || py < 0 || px >= terrainWidth || py >= terrainHeight) {
        return false;
    }
    return collisionMap[py * terrainWidth + px] === 1;
}

export function checkCollisionDirections(
    px,
    py,
    wormShapeOffsets,
    collisionMap,
    terrainWidth,
    terrainHeight
) {
    let collideDown = false,
        collideTop = false,
        collideLeft = false,
        collideRight = false;

    for (const offset of wormShapeOffsets) {
        const checkX = Math.floor(px + offset.x);
        const checkY = Math.floor(py + offset.y);
        if (
            isSolid(checkX, checkY, collisionMap, terrainWidth, terrainHeight)
        ) {
            const offsetY = offset.y;
            const offsetX = offset.x;

            if (offsetY >= -35 && offsetY <= -30) collideDown = true;
            if (offsetY <= -100 && offsetY >= -110) collideTop = true;
            if (offsetX <= -10) collideLeft = true;
            if (offsetX >= 10) collideRight = true;
        }
    }

    return { collideDown, collideTop, collideLeft, collideRight };
}
// }
