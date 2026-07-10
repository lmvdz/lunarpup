import { describe, expect, test } from 'bun:test';
import { getTerrainLod, worldConfig } from './worldConfig.ts';

describe('worldConfig', () => {
    test('terrain chunk plan distance uses configured view distance', () => {
        expect(worldConfig.terrain.viewDistance).toBe(3);
        expect(worldConfig.terrain.chunkSize).toBe(240);
    });

    test('getTerrainLod picks near, mid, and far bands', () => {
        expect(getTerrainLod(0.5).lodName).toBe('near');
        expect(getTerrainLod(1.25).lodName).toBe('near');
        expect(getTerrainLod(2).lodName).toBe('mid');
        expect(getTerrainLod(3).lodName).toBe('far');
    });

    test('camera defaults match physics tuning keys', () => {
        expect(worldConfig.camera.baseFov).toBe(worldConfig.camera.fov);
    });
});
