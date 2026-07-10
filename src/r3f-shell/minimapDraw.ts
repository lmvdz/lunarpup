import * as THREE from 'three';
import { getTerrainHeight } from '../game/terrain.ts';

const SIZE = 132;
const RANGE = 600;
const GRID = 48;

export interface MinimapMarker {
    x: number;
    z: number;
    color: number;
    radius: number;
    pulse?: boolean;
}

export interface MinimapFrame {
    playerX: number;
    playerZ: number;
    markers: MinimapMarker[];
}

let heightCache: Float32Array | null = null;
let cacheCenterX = NaN;
let cacheCenterZ = NaN;

export function drawMinimap(ctx: CanvasRenderingContext2D, frame: MinimapFrame) {
    const { playerX, playerZ } = frame;

    if (playerX !== cacheCenterX || playerZ !== cacheCenterZ) {
        heightCache = sampleHeights(playerX, playerZ);
        cacheCenterX = playerX;
        cacheCenterZ = playerZ;
    }

    ctx.clearRect(0, 0, SIZE, SIZE);
    drawTerrain(ctx, heightCache!);
    drawContours(ctx, heightCache!);
    drawMarkers(ctx, frame);
    drawNorthIndicator(ctx);
}

function drawContours(ctx: CanvasRenderingContext2D, heights: Float32Array) {
    const cell = SIZE / GRID;
    const levels = [0.2, 0.35, 0.5, 0.65, 0.8];

    ctx.strokeStyle = 'rgba(200, 208, 220, 0.18)';
    ctx.lineWidth = 1;

    for (const level of levels) {
        for (let z = 0; z < GRID - 1; z++) {
            for (let x = 0; x < GRID - 1; x++) {
                const tl = heights[z * GRID + x]!;
                const tr = heights[z * GRID + x + 1]!;
                const bl = heights[(z + 1) * GRID + x]!;
                const br = heights[(z + 1) * GRID + x + 1]!;
                const edges = [
                    [tl, tr, x * cell, z * cell, (x + 1) * cell, z * cell],
                    [tr, br, (x + 1) * cell, z * cell, (x + 1) * cell, (z + 1) * cell],
                    [br, bl, (x + 1) * cell, (z + 1) * cell, x * cell, (z + 1) * cell],
                    [bl, tl, x * cell, (z + 1) * cell, x * cell, z * cell],
                ] as const;

                for (const [a, b, x1, y1, x2, y2] of edges) {
                    const crosses = (a < level && b >= level) || (b < level && a >= level);
                    if (!crosses) continue;
                    const t = (level - a) / (b - a || 1);
                    const px = x1 + (x2 - x1) * t;
                    const py = y1 + (y2 - y1) * t;
                    ctx.fillStyle = 'rgba(200, 208, 220, 0.35)';
                    ctx.fillRect(px - 0.5, py - 0.5, 1, 1);
                }
            }
        }
    }
}

function drawNorthIndicator(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(SIZE - 14, 14);
    ctx.strokeStyle = 'rgba(200, 208, 220, 0.7)';
    ctx.fillStyle = 'rgba(200, 208, 220, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, -8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-4, -1);
    ctx.lineTo(4, -1);
    ctx.closePath();
    ctx.fill();
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, 12);
    ctx.restore();
}

function sampleHeights(cx: number, cz: number) {
    const data = new Float32Array(GRID * GRID);
    const half = RANGE / 2;
    let min = Infinity;
    let max = -Infinity;

    for (let z = 0; z < GRID; z++) {
        for (let x = 0; x < GRID; x++) {
            const wx = cx - half + (x / (GRID - 1)) * RANGE;
            const wz = cz - half + (z / (GRID - 1)) * RANGE;
            const h = getTerrainHeight(wx, wz);
            data[z * GRID + x] = h;
            if (h < min) min = h;
            if (h > max) max = h;
        }
    }

    const span = Math.max(max - min, 1);
    for (let i = 0; i < data.length; i++) {
        data[i] = (data[i]! - min) / span;
    }
    return data;
}

function drawTerrain(ctx: CanvasRenderingContext2D, heights: Float32Array) {
    const cell = SIZE / GRID;
    for (let z = 0; z < GRID; z++) {
        for (let x = 0; x < GRID; x++) {
            const t = heights[z * GRID + x]!;
            const r = Math.floor(70 + t * 55);
            const g = Math.floor(75 + t * 60);
            const b = Math.floor(95 + t * 70);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x * cell, z * cell, cell + 0.5, cell + 0.5);
        }
    }

    ctx.strokeStyle = 'rgba(160,196,255,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, SIZE - 1, SIZE - 1);
}

function worldToMap(wx: number, wz: number, cx: number, cz: number) {
    const half = RANGE / 2;
    const x = ((wx - (cx - half)) / RANGE) * SIZE;
    const y = ((wz - (cz - half)) / RANGE) * SIZE;
    return { x, y };
}

function drawMarkers(ctx: CanvasRenderingContext2D, frame: MinimapFrame) {
    for (const marker of frame.markers) {
        const { x, y } = worldToMap(marker.x, marker.z, frame.playerX, frame.playerZ);
        if (x < -4 || y < -4 || x > SIZE + 4 || y > SIZE + 4) continue;
        drawDot(ctx, x, y, marker.color, marker.radius, marker.pulse);
    }
}

function drawDot(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: number,
    radius: number,
    pulse = false,
) {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    if (pulse) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},0.25)`;
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

export function resetMinimapCache() {
    heightCache = null;
    cacheCenterX = NaN;
    cacheCenterZ = NaN;
}

export const MINIMAP_SIZE = SIZE;
