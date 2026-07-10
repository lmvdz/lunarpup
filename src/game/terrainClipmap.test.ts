import { describe, expect, test } from 'bun:test';
import { worldConfig } from '../content/worldConfig.ts';
import {
    buildClipmapIndices,
    clipmapCellSize,
    clipmapExtent,
    fillClipmapPositions,
    getTerrainClipmapSettings,
    isClipmapRingVertex,
    snapClipmapOrigin,
} from './terrainClipmap.ts';
import { calculateTerrainHeight } from './terrainMath.ts';

describe('terrainClipmap', () => {
    const settings = getTerrainClipmapSettings();

    test('coarse levels cover progressively larger horizons', () => {
        const nearExtent = clipmapExtent(settings, 0);
        const farExtent = clipmapExtent(settings, settings.levels - 1);
        expect(farExtent).toBeGreaterThan(nearExtent * 4);
        expect(farExtent).toBeGreaterThan(2000);
    });

    test('ring levels omit the inner fine-detail square', () => {
        const gridSize = settings.gridSize;
        const half = (gridSize - 1) / 2;
        expect(isClipmapRingVertex(half, half, gridSize, 1)).toBe(false);
        expect(isClipmapRingVertex(0, 0, gridSize, 1)).toBe(true);
    });

    test('ring seam vertices match procedural height samples', () => {
        const level = 1;
        const cellSize = clipmapCellSize(settings, level);
        const gridSize = settings.gridSize;
        const half = (gridSize - 1) / 2;
        const snap = snapClipmapOrigin(0, cellSize);

        const positions = new Float32Array(gridSize * gridSize * 3);
        const normals = new Float32Array(gridSize * gridSize * 3);
        fillClipmapPositions(positions, normals, snap, snap, settings, level);

        const seamIx = half + Math.floor(half / 2);
        const seamIz = half;
        const seamIndex = seamIz * gridSize + seamIx;
        const worldX = snap + (seamIx - half) * cellSize;
        const worldZ = snap + (seamIz - half) * cellSize;
        const expected = calculateTerrainHeight(worldX, worldZ);
        expect(positions[seamIndex * 3 + 1]).toBeCloseTo(expected, 4);
    });

    test('ring topology produces triangles only in the annulus', () => {
        const full = buildClipmapIndices(settings.gridSize, 0).length / 3;
        const ring = buildClipmapIndices(settings.gridSize, 1).length / 3;
        expect(ring).toBeLessThan(full);
        expect(ring).toBeGreaterThan(0);
    });

    test('world config exposes clipmap defaults', () => {
        expect(worldConfig.terrain.clipmap.levels).toBeGreaterThanOrEqual(5);
        expect(worldConfig.terrain.clipmap.gridSize).toBeGreaterThanOrEqual(17);
    });
});
