import * as THREE from 'three';
import type { TerrainSurfaceSpec } from '../../content/worldConfig.ts';
import { worldConfig } from '../../content/worldConfig.ts';
import { TERRAIN_HEIGHT_GLSL } from './terrainHeight.glsl.ts';

export type NaniteTerrainMaterial = THREE.MeshStandardMaterial & {
    naniteUniforms: {
        uTerrainSnap: { value: THREE.Vector2 };
        uTerrainNormalDelta: { value: number };
    };
};

export function createNaniteTerrainMaterial(surface: TerrainSurfaceSpec): NaniteTerrainMaterial {
    const material = new THREE.MeshStandardMaterial({
        color: surface.color,
        roughness: surface.roughness,
        metalness: surface.metalness,
        flatShading: surface.flatShading,
    }) as NaniteTerrainMaterial;

    const naniteUniforms = {
        uTerrainSnap: { value: new THREE.Vector2() },
        uTerrainNormalDelta: { value: worldConfig.terrain.normalSampleDelta },
    };
    material.naniteUniforms = naniteUniforms;
    material.customProgramCacheKey = () => 'lunar-nanite-terrain-v1';

    material.onBeforeCompile = (shader) => {
        shader.uniforms.uTerrainSnap = naniteUniforms.uTerrainSnap;
        shader.uniforms.uTerrainNormalDelta = naniteUniforms.uTerrainNormalDelta;

        shader.vertexShader = `${TERRAIN_HEIGHT_GLSL}\n${shader.vertexShader}`;
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            /* glsl */ `
                vec3 transformed = vec3(position);
                vec2 worldXZ = uTerrainSnap + transformed.xz;
                transformed.y = lunarTerrainHeight(worldXZ.x, worldXZ.y);
            `,
        );
        shader.vertexShader = shader.vertexShader.replace(
            '#include <beginnormal_vertex>',
            /* glsl */ `
                vec2 worldXZ = uTerrainSnap + position.xz;
                objectNormal = lunarTerrainNormal(worldXZ.x, worldXZ.y, uTerrainNormalDelta);
                #ifdef USE_TANGENT
                    vec3 worldPos = vec3(modelMatrix * vec4(position, 1.0));
                    vec3 worldNormal = normalize(mat3(modelMatrix) * objectNormal);
                    vec3 worldTangent = normalize(mat3(modelMatrix) * objectTangent.xyz);
                    vTangent = worldTangent;
                    vBitangent = cross(worldNormal, worldTangent) * objectTangent.w;
                    vNormal = worldNormal;
                #endif
            `,
        );
    };

    return material;
}

export function disposeNaniteTerrainMaterial(material: NaniteTerrainMaterial) {
    material.dispose();
}
