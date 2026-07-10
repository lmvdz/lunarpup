import * as THREE from 'three';
import type { TerrainLodName, TerrainSurfaceSpec } from '../content/worldConfig.ts';

export type TerrainMaterialSet = Record<TerrainLodName, THREE.MeshStandardMaterial>;

export function createTerrainMaterials(surfaces: Record<TerrainLodName, TerrainSurfaceSpec>): TerrainMaterialSet {
    const entries = Object.entries(surfaces).map(([lodName, surface]) => {
        const material = new THREE.MeshStandardMaterial({
            color: surface.color,
            roughness: surface.roughness,
            metalness: surface.metalness,
            flatShading: surface.flatShading,
        });
        return [lodName, material] as const;
    });
    return Object.fromEntries(entries) as TerrainMaterialSet;
}

export function disposeTerrainMaterials(materials: TerrainMaterialSet) {
    for (const lodName of ['near', 'mid', 'far'] as const) {
        materials[lodName].dispose();
    }
}
