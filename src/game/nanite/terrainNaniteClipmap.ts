import * as THREE from 'three';
import type { TerrainLodName } from '../../content/worldConfig.ts';
import { worldConfig } from '../../content/worldConfig.ts';
import type { TerrainMaterialSet } from '../../r3f-shell/TerrainMaterial.tsx';
import {
    buildClipmapIndices,
    clipmapCellSize,
    clipmapLodForLevel,
    fillClipmapPositions,
    getTerrainClipmapSettings,
    snapClipmapOrigin,
    type TerrainClipmapSettings,
} from '../terrainClipmap.ts';

type NaniteClipmapLevelState = {
    mesh: THREE.Mesh;
    positions: Float32Array;
    normals: Float32Array;
    snapX: number;
    snapZ: number;
};

export type TerrainNaniteClipmapOptions = {
    materials: TerrainMaterialSet;
    settings?: Partial<TerrainClipmapSettings>;
};

/**
 * Nanite-inspired terrain renderer:
 * - static clipmap topology (built once)
 * - CPU height/normal fill on snap (matches physics exactly)
 * - standard lit materials
 */
export class TerrainNaniteClipmap {
    private readonly group = new THREE.Group();
    private readonly materials: TerrainMaterialSet;
    private readonly settings: TerrainClipmapSettings;
    private readonly levels: NaniteClipmapLevelState[] = [];

    constructor(options: TerrainNaniteClipmapOptions) {
        this.materials = options.materials;
        this.settings = getTerrainClipmapSettings(options.settings);

        for (let level = 0; level < this.settings.levels; level++) {
            const lodName: TerrainLodName = clipmapLodForLevel(level, this.settings.levels);
            const { gridSize } = this.settings;
            const vertexCount = gridSize * gridSize;
            const positions = new Float32Array(vertexCount * 3);
            const normals = new Float32Array(vertexCount * 3);
            const indices = buildClipmapIndices(gridSize, level);

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
            geometry.setIndex(new THREE.BufferAttribute(indices, 1));

            const mesh = new THREE.Mesh(geometry, this.materials[lodName]);
            mesh.receiveShadow = true;
            mesh.frustumCulled = false;
            this.group.add(mesh);
            this.levels.push({ mesh, positions, normals, snapX: Number.NaN, snapZ: Number.NaN });
        }
    }

    get root() {
        return this.group;
    }

    get renderedRingCount() {
        return this.levels.length;
    }

    dispose() {
        for (const level of this.levels) {
            this.group.remove(level.mesh);
            level.mesh.geometry.dispose();
        }
        this.levels.length = 0;
    }

    tick(x: number, z: number) {
        for (let level = 0; level < this.levels.length; level++) {
            const state = this.levels[level]!;
            const cellSize = clipmapCellSize(this.settings, level);
            const snapX = snapClipmapOrigin(x, cellSize);
            const snapZ = snapClipmapOrigin(z, cellSize);
            if (snapX === state.snapX && snapZ === state.snapZ) continue;

            fillClipmapPositions(state.positions, state.normals, snapX, snapZ, this.settings, level);
            state.snapX = snapX;
            state.snapZ = snapZ;
            state.mesh.position.set(snapX, 0, snapZ);

            const geometry = state.mesh.geometry;
            geometry.attributes.position!.needsUpdate = true;
            geometry.attributes.normal!.needsUpdate = true;
            geometry.computeBoundingSphere();
        }
    }
}
