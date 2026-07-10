import * as THREE from 'three';
import type { TerrainLodName } from '../content/worldConfig.ts';
import { worldConfig } from '../content/worldConfig.ts';
import type { TerrainMaterialSet } from '../r3f-shell/TerrainMaterial.tsx';
import { calculateTerrainHeight } from './terrainMath.ts';

export type TerrainClipmapSettings = {
    levels: number;
    gridSize: number;
    baseCellSize: number;
};

export function getTerrainClipmapSettings(
    overrides?: Partial<TerrainClipmapSettings>,
): TerrainClipmapSettings {
    const clipmap = worldConfig.terrain.clipmap;
    return {
        levels: overrides?.levels ?? clipmap.levels,
        gridSize: overrides?.gridSize ?? clipmap.gridSize,
        baseCellSize: overrides?.baseCellSize ?? clipmap.baseCellSize,
    };
}

export function clipmapLodForLevel(level: number, levels: number): TerrainLodName {
    const ratio = level / Math.max(1, levels - 1);
    if (ratio < 0.34) return 'near';
    if (ratio < 0.67) return 'mid';
    return 'far';
}

export function clipmapCellSize(settings: TerrainClipmapSettings, level: number) {
    return settings.baseCellSize * 2 ** level;
}

export function clipmapExtent(settings: TerrainClipmapSettings, level: number) {
    return (settings.gridSize - 1) * clipmapCellSize(settings, level);
}

export function snapClipmapOrigin(value: number, cellSize: number) {
    return Math.floor(value / cellSize) * cellSize;
}

export function isClipmapRingVertex(
    ix: number,
    iz: number,
    gridSize: number,
    level: number,
) {
    if (level === 0) return true;
    const half = (gridSize - 1) / 2;
    const innerHalf = Math.floor(half / 2);
    const dx = Math.abs(ix - half);
    const dz = Math.abs(iz - half);
    return dx > innerHalf || dz > innerHalf;
}

export function isClipmapRingCell(
    ix: number,
    iz: number,
    gridSize: number,
    level: number,
) {
    if (level === 0) return true;
    return (
        isClipmapRingVertex(ix, iz, gridSize, level)
        || isClipmapRingVertex(ix + 1, iz, gridSize, level)
        || isClipmapRingVertex(ix, iz + 1, gridSize, level)
        || isClipmapRingVertex(ix + 1, iz + 1, gridSize, level)
    );
}

export function buildClipmapIndices(gridSize: number, level: number) {
    const indices: number[] = [];
    const vertexIndex = (ix: number, iz: number) => iz * gridSize + ix;

    for (let iz = 0; iz < gridSize - 1; iz++) {
        for (let ix = 0; ix < gridSize - 1; ix++) {
            if (!isClipmapRingCell(ix, iz, gridSize, level)) continue;
            const a = vertexIndex(ix, iz);
            const b = vertexIndex(ix + 1, iz);
            const c = vertexIndex(ix, iz + 1);
            const d = vertexIndex(ix + 1, iz + 1);
            indices.push(a, c, b, b, c, d);
        }
    }

    return new Uint32Array(indices);
}

export function fillClipmapPositions(
    positions: Float32Array,
    normals: Float32Array,
    snapX: number,
    snapZ: number,
    settings: TerrainClipmapSettings,
    level: number,
) {
    const { gridSize } = settings;
    const cellSize = clipmapCellSize(settings, level);
    const half = (gridSize - 1) / 2;
    const step = cellSize;

    for (let iz = 0; iz < gridSize; iz++) {
        for (let ix = 0; ix < gridSize; ix++) {
            const index = iz * gridSize + ix;
            const attr = index * 3;
            const localX = (ix - half) * cellSize;
            const localZ = (iz - half) * cellSize;
            const worldX = snapX + localX;
            const worldZ = snapZ + localZ;
            const height = calculateTerrainHeight(worldX, worldZ);
            positions[attr] = localX;
            positions[attr + 1] = height;
            positions[attr + 2] = localZ;
        }
    }

    for (let iz = 0; iz < gridSize; iz++) {
        for (let ix = 0; ix < gridSize; ix++) {
            const left = iz * gridSize + Math.max(0, ix - 1);
            const right = iz * gridSize + Math.min(gridSize - 1, ix + 1);
            const down = Math.max(0, iz - 1) * gridSize + ix;
            const up = Math.min(gridSize - 1, iz + 1) * gridSize + ix;
            const index = (iz * gridSize + ix) * 3;
            const dx = positions[right * 3 + 1]! - positions[left * 3 + 1]!;
            const dz = positions[up * 3 + 1]! - positions[down * 3 + 1]!;
            const nx = -dx / (step * 2);
            const nz = -dz / (step * 2);
            const ny = 1;
            const length = Math.hypot(nx, ny, nz) || 1;
            normals[index] = nx / length;
            normals[index + 1] = ny / length;
            normals[index + 2] = nz / length;
        }
    }
}

type ClipmapLevelState = {
    mesh: THREE.Mesh;
    positions: Float32Array;
    normals: Float32Array;
    snapX: number;
    snapZ: number;
};

export type TerrainClipmapOptions = {
    materials: TerrainMaterialSet;
    settings?: Partial<TerrainClipmapSettings>;
};

export class TerrainClipmap {
    private readonly group = new THREE.Group();
    private readonly materials: TerrainMaterialSet;
    private readonly settings: TerrainClipmapSettings;
    private readonly levels: ClipmapLevelState[] = [];

    constructor(options: TerrainClipmapOptions) {
        this.materials = options.materials;
        this.settings = getTerrainClipmapSettings(options.settings);

        for (let level = 0; level < this.settings.levels; level++) {
            const { gridSize } = this.settings;
            const vertexCount = gridSize * gridSize;
            const positions = new Float32Array(vertexCount * 3);
            const normals = new Float32Array(vertexCount * 3);
            const indices = buildClipmapIndices(gridSize, level);
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
            geometry.setIndex(new THREE.BufferAttribute(indices, 1));

            const mesh = new THREE.Mesh(geometry, this.materials[clipmapLodForLevel(level, this.settings.levels)]);
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
