import { describe, expect, test } from 'bun:test';
import { clipmapLodForLevel, getTerrainClipmapSettings } from '../game/terrainClipmap.ts';
import { worldConfig } from './worldConfig.ts';

describe('worldConfig', () => {
    test('terrain clipmap covers the camera horizon', () => {
        const settings = getTerrainClipmapSettings(worldConfig.terrain.clipmap);
        const topLevel = settings.levels - 1;
        const extent = (settings.gridSize - 1) * settings.baseCellSize * 2 ** topLevel;
        expect(extent).toBeGreaterThan(worldConfig.camera.far * 0.8);
    });

    test('clipmap LOD bands map near, mid, and far rings', () => {
        expect(clipmapLodForLevel(0, 6)).toBe('near');
        expect(clipmapLodForLevel(2, 6)).toBe('mid');
        expect(clipmapLodForLevel(5, 6)).toBe('far');
    });

    test('camera defaults match physics tuning keys', () => {
        expect(worldConfig.camera.baseFov).toBe(worldConfig.camera.fov);
    });
});
