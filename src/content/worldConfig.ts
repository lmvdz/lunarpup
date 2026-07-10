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
        fog: { color: '#020208', density: 0.0018 },
        stars: { count: 1000, radius: 600, size: 0.8, color: '#ffffff' },
        ambientLight: { color: '#222233', intensity: 1.5 },
        directionalLight: {
            color: '#ddddff',
            intensity: 1.8,
            position: [100, 150, 50] as [number, number, number],
            shadowMapSize: 1024,
            shadowCamera: {
                near: 0.5,
                far: 500,
                left: -250,
                right: 250,
                top: 250,
                bottom: -250,
            },
        },
        planet: {
            position: [-420, 220, -520] as [number, number, number],
            radius: 15,
            segments: 16,
            color: '#223388',
            emissive: '#111133',
        },
    },
    terrain: {
        chunkSize: 240,
        viewDistance: 3,
        viewDistancePadding: 0.35,
        hoverClearance: 0.42,
        normalSampleDelta: 2.8,
        lod: [
            { name: 'near' as const, maxDistance: 1.25, segments: 56 },
            { name: 'mid' as const, maxDistance: 2.25, segments: 28 },
            { name: 'far' as const, maxDistance: Number.POSITIVE_INFINITY, segments: 12 },
        ],
        surfaces: {
            near: { materialId: 'lunar', color: 0x7d8490, roughness: 0.95, metalness: 0.05, flatShading: false },
            mid: { materialId: 'lunar', color: 0x737b86, roughness: 0.95, metalness: 0.05, flatShading: false },
            far: { materialId: 'lunar', color: 0x666e78, roughness: 0.95, metalness: 0.05, flatShading: false },
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

export const chunkSize = worldConfig.terrain.chunkSize;
export const terrainViewDistance = worldConfig.terrain.viewDistance;
export const hoverClearance = worldConfig.terrain.hoverClearance;

/** @deprecated Use hoverClearance */
export const groundClearance = hoverClearance;

export function getTerrainLod(distanceInChunks: number): Pick<{ lodName: TerrainLodName; segments: number }, 'lodName' | 'segments'> {
    for (const lod of worldConfig.terrain.lod) {
        if (distanceInChunks <= lod.maxDistance) {
            return { lodName: lod.name, segments: lod.segments };
        }
    }
    const far = worldConfig.terrain.lod[worldConfig.terrain.lod.length - 1]!;
    return { lodName: far.name, segments: far.segments };
}
