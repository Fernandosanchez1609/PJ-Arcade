export class Collisions {
    constructor(scene) {
        this.scene = scene;
    }

    wormBaseOffsets = [
        { x: -7, y: -35 }, // abajo izquierda
        { x: 0, y: -35 }, // abajo centro
        { x: 7, y: -35 }, // abajo derecha
    ];

    wormTopOffsets = [
        { x: -10, y: -60 }, // arriba izquierda
        { x: 0, y: -60 }, // arriba centro
        { x: 10, y: -60 }, // arriba derecha
    ];

    wormSidesOffsets = [
        { x: -10, y: -35 }, // izquierda abajo
        { x: 10, y: -35 }, // derecha abajo
        { x: -10, y: -45 }, // izquierda centro?
        { x: 10, y: -45 }, // derecha centro?
        { x: -10, y: -55 }, // izquierda arriba?
        { x: 10, y: -55 }, // derecha arriba?
    ];

    updateCollisionMapFromBitmap(
        collisionMap,
        terrainBitmap,
        terrainWidth,
        terrainHeight
    ) {
        const ctx = terrainBitmap.context;
        const imgData = ctx.getImageData(0, 0, terrainWidth, terrainHeight);
        const data = imgData.data;

        for (let i = 0, j = 0; i < data.length; i += 4, j++) {
            collisionMap[j] = data[i + 3] > 0 ? 1 : 0;
        }
    }

    updateCollisionMapArea(
        collisionMap,
        terrainBitmap,
        terrainWidth,
        terrainHeight,
        x,
        y,
        width,
        height
    ) {
        const startX = Math.max(0, Math.floor(x));
        const startY = Math.max(0, Math.floor(y));
        const endX = Math.min(terrainWidth, Math.floor(x + width));
        const endY = Math.min(terrainHeight, Math.floor(y + height));

        const ctx = terrainBitmap.context;
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
                collisionMap[py * terrainWidth + px] = alpha > 0 ? 1 : 0;
                idx++;
            }
        }
    }

    isSolid(collisionMap, terrainWidth, terrainHeight, px, py) {
        if (px < 0 || py < 0 || px >= terrainWidth || py >= terrainHeight) {
            return false;
        }
        return collisionMap[py * terrainWidth + px] === 1;
    }

    checkCollisionDirections(
        collisionMap,
        terrainWidth,
        terrainHeight,
        px,
        py
        // ,
        // wormBaseOffsets,
        // wormTopOffsets,
        // wormSidesOffsets
    ) {
        let collideDown = false,
            collideTop = false,
            collideLeft = false,
            collideRight = false,
            collisionsArray = [];

        for (let i = 0; i < this.wormBaseOffsets.length - 1; i++) {
            const checkX = Math.floor(px + this.wormBaseOffsets[i].x);
            const checkY = Math.floor(py + this.wormBaseOffsets[i].y);

            if (
                this.isSolid(
                    collisionMap,
                    terrainWidth,
                    terrainHeight,
                    checkX,
                    checkY
                )
            ) {
                collisionsArray[i] = true;
            }
        }

        collideDown =
            (collisionsArray[0] && collisionsArray[1]) ||
            (collisionsArray[1] && collisionsArray[2]);

        for (const offset of this.wormTopOffsets) {
            const checkX = Math.floor(px + offset.x);
            const checkY = Math.floor(py + offset.y);
            if (
                this.isSolid(
                    collisionMap,
                    terrainWidth,
                    terrainHeight,
                    checkX,
                    checkY
                )
            ) {
                collideTop = true;
            }
        }

        for (const offset of this.wormSidesOffsets) {
            const checkX = Math.floor(px + offset.x);
            const checkY = Math.floor(py + offset.y);
            if (
                this.isSolid(
                    collisionMap,
                    terrainWidth,
                    terrainHeight,
                    checkX,
                    checkY
                )
            ) {
                if (offset.x < 0) collideLeft = true;
                else if (offset.x > 0) collideRight = true;
            }
        }

        return { collideDown, collideLeft, collideTop, collideRight };
    }

    canClimb(
        collisionMap,
        terrainWidth,
        terrainHeight,
        px,
        py,
        direction
        // ,
        // wormSidesOffsets,
        // wormBaseOffsets
    ) {
        const stepHeight = 20;
        for (let i = 1; i <= stepHeight; i++) {
            const newX = px + direction * 10;
            const newY = py - i;

            let blocked = false;
            for (const offset of this.wormSidesOffsets) {
                if (
                    (direction === -1 && offset.x < 0) ||
                    (direction === 1 && offset.x > 0)
                ) {
                    const checkX = Math.floor(newX + offset.x);
                    const checkY = Math.floor(newY + offset.y);
                    if (
                        this.isSolid(
                            collisionMap,
                            terrainWidth,
                            terrainHeight,
                            checkX,
                            checkY
                        )
                    ) {
                        blocked = true;
                        break;
                    }
                }
            }

            let hasGround = false;
            for (const baseOffset of this.wormBaseOffsets) {
                const baseX = Math.floor(newX + baseOffset.x);
                const baseY = Math.floor(newY + baseOffset.y + 1);
                if (
                    this.isSolid(
                        collisionMap,
                        terrainWidth,
                        terrainHeight,
                        baseX,
                        baseY
                    )
                ) {
                    hasGround = true;
                    break;
                }
            }

            if (!blocked && hasGround) {
                return i;
            }
        }
        return 0;
    }

    preload() {}

    create() {}

    update() {}
}
