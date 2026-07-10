import { describe, expect, test } from 'bun:test';
import * as THREE from 'three';
import { worldConfig } from '../../content/worldConfig.ts';
import { createTerrainRaymarchMaterial, disposeTerrainRaymarchMaterial } from './terrainRaymarchMaterial.ts';

describe('terrainRaymarchMaterial', () => {
    function makeUniforms() {
        return {
            uMaxDistance: { value: worldConfig.camera.far },
            uSteps: { value: 96 },
            uNormalDelta: { value: worldConfig.terrain.normalSampleDelta },
            uSunDir: { value: new THREE.Vector3(1, 1, 1) },
            uSunColor: { value: new THREE.Color(1, 1, 1) },
            uAmbient: { value: new THREE.Color(0.2, 0.2, 0.3) },
            uSurfaceColor: { value: new THREE.Color(0.5, 0.5, 0.6) },
            uFogColor: { value: new THREE.Color(0.01, 0.01, 0.05) },
            uFogDensity: { value: worldConfig.environment.fog.density },
        };
    }

    test('produces a GLSL3 ShaderMaterial writing gl_FragDepth', () => {
        const m = createTerrainRaymarchMaterial(makeUniforms());
        expect(m.glslVersion).toBe(THREE.GLSL3);
        expect(m.depthWrite).toBe(true);
        expect(m.fragmentShader).toContain('gl_FragDepth');
        expect(m.fragmentShader).toContain('lunarTerrainHeight');
        disposeTerrainRaymarchMaterial(m);
    });

    test('vertex shader reconstructs the ray from inverse view-projection', () => {
        const m = createTerrainRaymarchMaterial(makeUniforms());
        expect(m.vertexShader).toContain('inverse(projectionMatrix * viewMatrix)');
        expect(m.vertexShader).toContain('cameraPosition');
        disposeTerrainRaymarchMaterial(m);
    });
});
