import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { worldConfig } from '../content/worldConfig.ts';
import type { QualityPreset } from '../content/qualityConfig.ts';
import {
    createTerrainRaymarchMaterial,
    disposeTerrainRaymarchMaterial,
    type TerrainRaymarchUniforms,
} from '../game/nanite/terrainRaymarchMaterial.ts';
import { useGame } from './GameProvider.tsx';
import { useGameStore } from './gameStore.ts';

const FULLSCREEN_TRIANGLE = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);

function stepCountForPreset(preset: QualityPreset): number {
    switch (preset) {
        case 'low': return 64;
        case 'medium': return 96;
        case 'high': return 128;
    }
}

export function Terrain() {
    const { runtime } = useGame();
    const qualityPreset = useGameStore((state) => state.qualityPreset);

    const geometry = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(FULLSCREEN_TRIANGLE, 3));
        return g;
    }, []);

    const material = useMemo(() => {
        const sun = new THREE.Color(worldConfig.environment.directionalLight.color)
            .multiplyScalar(worldConfig.environment.directionalLight.intensity);
        const sunPos = new THREE.Vector3(
            ...(worldConfig.environment.directionalLight.position as [number, number, number]),
        );
        const uniforms: TerrainRaymarchUniforms = {
            uMaxDistance: { value: worldConfig.camera.far },
            uSteps: { value: stepCountForPreset(qualityPreset) },
            uNormalDelta: { value: worldConfig.terrain.normalSampleDelta },
            uSunDir: { value: sunPos },
            uSunColor: { value: sun },
            uAmbient: {
                value: new THREE.Color(worldConfig.environment.ambientLight.color)
                    .multiplyScalar(worldConfig.environment.ambientLight.intensity),
            },
            uSurfaceColor: { value: new THREE.Color(worldConfig.terrain.surfaces.near.color) },
            uFogColor: { value: new THREE.Color(worldConfig.environment.fog.color) },
            uFogDensity: { value: worldConfig.environment.fog.density },
        };
        return createTerrainRaymarchMaterial(uniforms);
    }, [qualityPreset]);

    useEffect(() => {
        runtime.current.renderedTerrainRings = 1;
    }, [runtime]);

    useEffect(() => {
        return () => {
            disposeTerrainRaymarchMaterial(material);
        };
    }, [material]);

    useEffect(() => {
        return () => {
            geometry.dispose();
        };
    }, [geometry]);

    return (
        <mesh
            frustumCulled={false}
            renderOrder={-1000}
            geometry={geometry}
            material={material}
        />
    );
}
