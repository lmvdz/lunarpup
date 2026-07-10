export type TerrainLodName = 'near' | 'mid' | 'far';

export type TerrainSurfaceSpec = {
    materialId: string;
    color: number;
    roughness: number;
    metalness: number;
    flatShading: boolean;
};

export const worldConfig = {
    environment: {
        background: '#020208',
        fog: { color: '#08081a', density: 0.0012 },
        stars: { count: 1000, radius: 600, size: 0.8, color: '#ffffff' },
        ambientLight: { color: '#4a5070', intensity: 2.8 },
        directionalLight: {
            color: '#fff8f0',
            intensity: 3.2,
            position: [100, 150, 50] as [number, number, number],
            shadowMapSize: 1024,
            shadowBias: -0.0002,
            shadowCamera: {
                near: 0.5,
                far: 500,
                left: -250,
                right: 250,
                top: 250,
                bottom: -250,
            },
        },
        rendering: {
            toneMappingExposure: 1.35,
        },
        planet: {
            /** Offset from the player — Earth hanging on the lunar horizon. */
            position: [-420, 260, -680] as [number, number, number],
            radius: 52,
            segments: 32,
            color: '#5b8fd9',
            emissive: '#2a4f8c',
        },
    },
    terrain: {
        nanite: {
            enabled: true,
            gpuDisplacement: false,
        },
        clipmap: {
            levels: 6,
            gridSize: 33,
            baseCellSize: 8,
        },
        hoverClearance: 0.42,
        normalSampleDelta: 2.8,
        surfaces: {
            near: { materialId: 'lunar', color: 0xb8c0cc, roughness: 0.88, metalness: 0.04, flatShading: false },
            mid: { materialId: 'lunar', color: 0xa8b0bc, roughness: 0.9, metalness: 0.04, flatShading: false },
            far: { materialId: 'lunar', color: 0x98a0ac, roughness: 0.92, metalness: 0.03, flatShading: false },
        } satisfies Record<TerrainLodName, TerrainSurfaceSpec>,
    },
    camera: {
        fov: 60,
        near: 0.1,
        far: 2500,
        baseFov: 60,
        maxFov: 84,
        initialYaw: Math.PI,
        initialPitch: 0.38,
        initialDistance: 14,
        minDistance: 5,
        maxDistance: 42,
        sensitivity: 0.006,
        zoomSensitivity: 0.0015,
        autoFollowStrength: 0.025,
        fovSmoothing: 0.08,
    },
} as const;

export const hoverClearance = worldConfig.terrain.hoverClearance;

/** @deprecated Use hoverClearance */
export const groundClearance = hoverClearance;

