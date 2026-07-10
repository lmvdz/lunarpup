import type { TerrainClipmapSettings } from '../game/terrainClipmap.ts';

export type QualityPreset = 'low' | 'medium' | 'high';

export type QualitySettings = {
    shadowMapSize: number;
    dpr: [number, number];
    exposure: number;
    postFx: 'minimal' | 'bloom' | 'full';
    clipmap: Partial<TerrainClipmapSettings>;
};

export const qualityPresets: Record<QualityPreset, QualitySettings> = {
    low: {
        shadowMapSize: 1024,
        dpr: [1, 1],
        exposure: 1.25,
        postFx: 'minimal',
        clipmap: {
            levels: 5,
            gridSize: 25,
            baseCellSize: 10,
        },
    },
    medium: {
        shadowMapSize: 1024,
        dpr: [1, 1.25],
        exposure: 1.35,
        postFx: 'minimal',
        clipmap: {
            levels: 6,
            gridSize: 33,
            baseCellSize: 8,
        },
    },
    high: {
        shadowMapSize: 2048,
        dpr: [1, 1.5],
        exposure: 1.4,
        postFx: 'bloom',
        clipmap: {
            levels: 6,
            gridSize: 41,
            baseCellSize: 8,
        },
    },
};

export function getQualitySettings(preset: QualityPreset): QualitySettings {
    return qualityPresets[preset];
}
