import { describe, expect, test } from 'bun:test';
import * as THREE from 'three';
import {
    clipmapCellSize,
    getTerrainClipmapSettings,
    snapClipmapOrigin,
} from '../terrainClipmap.ts';
import { createTerrainMaterials } from '../../r3f-shell/TerrainMaterial.tsx';
import { worldConfig } from '../../content/worldConfig.ts';
import { TerrainNaniteClipmap } from './terrainNaniteClipmap.ts';

describe('terrainNaniteClipmap', () => {
    const settings = getTerrainClipmapSettings();
    const materials = createTerrainMaterials(worldConfig.terrain.surfaces);

    test('uses a fixed ring count with static topology', () => {
        const clipmap = new TerrainNaniteClipmap({
            materials,
            settings: { levels: 4, gridSize: 17, baseCellSize: 8 },
        });
        expect(clipmap.renderedRingCount).toBe(4);
        clipmap.dispose();
    });

    test('snap updates heights without reallocating buffers', () => {
        const clipmapSettings = { levels: 1, gridSize: 9, baseCellSize: 8 };
        const clipmap = new TerrainNaniteClipmap({ materials, settings: clipmapSettings });
        const mesh = clipmap.root.children[0] as THREE.Mesh;
        const positions = mesh.geometry.attributes.position!.array as Float32Array;

        clipmap.tick(0, 0);
        expect(positions.some((value, index) => index % 3 === 1 && value !== 0)).toBe(true);

        const afterFirstTick = positions.slice();
        clipmap.tick(0.1, 0.1);
        expect(positions).toEqual(afterFirstTick);

        const cellSize = clipmapCellSize(clipmapSettings, 0);
        clipmap.tick(cellSize * 0.6, 0);
        expect(mesh.position.x).toBe(snapClipmapOrigin(cellSize * 0.6, cellSize));

        clipmap.dispose();
    });

    test('default settings match world config ring count', () => {
        const clipmap = new TerrainNaniteClipmap({ materials, settings });
        expect(clipmap.renderedRingCount).toBe(settings.levels);
        clipmap.dispose();
    });
});
