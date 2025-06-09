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
    wormLeftOffsets = [
        { x: -10, y: -40 }, // izquierda abajo
        { x: -10, y: -45 }, // izquierda centro?
        { x: -10, y: -55 }, // izquierda arriba?
    ];

    wormRightOffsets = [
        { x: 10, y: -45 }, // derecha centro?
        { x: 10, y: -35 }, // derecha abajo
        { x: 10, y: -55 }, // derecha arriba?
    ];

    wormOffSetts = [
        this.wormBaseOffsets,
        this.wormTopOffsets,
        this.wormLeftOffsets,
        this.wormRightOffsets
    ]


    grenadeOffSetts = [
        [   // Base
            { x: 0, y: 2 }
        ],
        [   // Top
            { x: 0, y: -2 }
        ],
        [   // Sides
            { x: 2, y: 0 },
            { x: 2, y: 0 }
        ]
    ]



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
    ) {
        let collideDown = false,
            collideTop = false,
            collideLeft = false,
            collideRight = false;

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
                collideDown = true;
            }
        }

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

        for (const offset of this.wormLeftOffsets) {
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
                collideLeft = true;
            }
        }

        for (const offset of this.wormRightOffsets) {
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
                collideRight = true;
            }
        }

        return { collideDown, collideLeft, collideTop, collideRight };
    }

    canClimb(collisionMap, terrainWidth, terrainHeight, px, py, direction) {
        const stepHeight = 20;
        for (let i = 1; i <= stepHeight; i++) {
            const newX = px + direction * 10;
            const newY = py - i;

            let blocked = false;

            if ((direction === -1)) {
                for (const offset of this.wormLeftOffsets) {
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
            } else if ((direction === 1)) {
                for (const offset of this.wormLeftOffsets) {
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

    getSurfaceNormal(collisionMap, terrainWidth, terrainHeight, px, py) {
        // Se asume que (px, py) es un punto de colisión con el terreno
        // Comprobamos un área 3x3 alrededor para evaluar la pendiente

        // Vectores unitarios para vecinos 8 direcciones
        const neighbors = [
            { dx: -1, dy: -1 },
            { dx: 0, dy: -1 },
            { dx: 1, dy: -1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: -1, dy: 1 },
            { dx: 0, dy: 1 },
            { dx: 1, dy: 1 },
        ];

        // Vamos a sumar vectores "hacia fuera" para calcular normal
        let normalX = 0;
        let normalY = 0;

        for (const n of neighbors) {
            const nx = px + n.dx;
            const ny = py + n.dy;

            if (nx < 0 || ny < 0 || nx >= terrainWidth || ny >= terrainHeight) {
                continue;
            }

            const solid = collisionMap[ny * terrainWidth + nx] === 1;

            // Si el vecino está vacío (no sólido), la superficie apunta hacia allí
            if (!solid) {
                normalX += n.dx;
                normalY += n.dy;
            }
        }

        // Normalizar vector
        const length = Math.hypot(normalX, normalY);
        if (length === 0) {
            // Si no detectamos ninguna dirección, normal vertical arriba
            return { x: 0, y: -1 };
        }

        return { x: normalX / length, y: normalY / length };
    }

    reflectVector(vx, vy, nx, ny) {
        const dot = vx * nx + vy * ny;
        const rx = vx - 2 * dot * nx;
        const ry = vy - 2 * dot * ny;
        return { x: rx, y: ry };
    }



}
