import { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeFrame } from './canvasCrash.tsx';
import * as THREE from 'three';
import { chunkSize, worldConfig } from '../content/worldConfig.ts';
import { getTerrainChunkPlan, getTerrainHeight } from '../game/terrain.ts';
import type { TerrainChunkDescriptor } from '../game/terrain.ts';
import { getPlayerRoot } from '../game/runtime.ts';
import { useGame } from './GameProvider.tsx';

type TerrainMaterials = Record<TerrainChunkDescriptor['lodName'], THREE.MeshStandardMaterial>;

function createChunkGeometry({ cx, cz, segments }: TerrainChunkDescriptor) {
    const geometry = new THREE.PlaneGeometry(chunkSize, chunkSize, segments, segments);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position!;
    const originX = cx * chunkSize;
    const originZ = cz * chunkSize;

    for (let index = 0; index < positions.count; index++) {
        positions.setY(index, getTerrainHeight(originX + positions.getX(index), originZ + positions.getZ(index)));
    }
    geometry.computeVertexNormals();
    return geometry;
}

function TerrainChunk({ chunk, material }: { chunk: TerrainChunkDescriptor; material: THREE.MeshStandardMaterial }) {
    const geometry = useMemo(() => createChunkGeometry(chunk), [chunk]);

    useEffect(() => () => geometry.dispose(), [geometry]);

    return <mesh geometry={geometry} material={material} position={[chunk.cx * chunkSize, 0, chunk.cz * chunkSize]} receiveShadow dispose={null} />;
}

export function Terrain() {
    const { runtime, ready } = useGame();
    const [chunks, setChunks] = useState<TerrainChunkDescriptor[]>(() => getTerrainChunkPlan(0, 0));
    const currentChunk = useRef('');
    const materials = useMemo<TerrainMaterials>(() => {
        const entries = Object.entries(worldConfig.terrain.surfaces).map(([lodName, surface]) => {
            const material = new THREE.MeshStandardMaterial({
                color: surface.color,
                roughness: surface.roughness,
                metalness: surface.metalness,
                flatShading: surface.flatShading,
            });
            return [lodName, material] as const;
        });
        return Object.fromEntries(entries) as TerrainMaterials;
    }, []);

    useEffect(() => () => Object.values(materials).forEach((material) => material.dispose()), [materials]);

    useSafeFrame(() => {
        if (!ready.current) return;

        const root = getPlayerRoot(runtime.current);
        if (!root) return;

        const cx = Math.round(root.position.x / chunkSize);
        const cz = Math.round(root.position.z / chunkSize);
        const key = `${cx},${cz}`;
        if (key === currentChunk.current) return;

        currentChunk.current = key;
        const nextChunks = getTerrainChunkPlan(root.position.x, root.position.z);
        runtime.current.renderedChunkCount = nextChunks.length;
        setChunks(nextChunks);
    });

    useEffect(() => {
        runtime.current.renderedChunkCount = chunks.length;
    }, [chunks.length, runtime]);

    return <group>{chunks.map((chunk) => <TerrainChunk key={chunk.key} chunk={chunk} material={materials[chunk.lodName]} />)}</group>;
}
