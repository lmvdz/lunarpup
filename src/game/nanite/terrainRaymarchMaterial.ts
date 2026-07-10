import * as THREE from 'three';
import { TERRAIN_HEIGHT_GLSL } from './terrainHeight.glsl.ts';

export type TerrainRaymarchUniforms = {
    uMaxDistance: { value: number };
    uSteps: { value: number };
    uNormalDelta: { value: number };
    uSunDir: { value: THREE.Vector3 };
    uSunColor: { value: THREE.Color };
    uAmbient: { value: THREE.Color };
    uSurfaceColor: { value: THREE.Color };
    uFogColor: { value: THREE.Color };
    uFogDensity: { value: number };
};

export const TERRAIN_RAYMARCH_VERTEX_SHADER = /* glsl */ `
precision highp float;

out vec3 vRayOrigin;
out vec3 vRayDir;

void main() {
    gl_Position = vec4(position.xy, 1.0, 1.0);
    mat4 invVP = inverse(projectionMatrix * viewMatrix);
    vec4 farWorld = invVP * vec4(position.xy, 1.0, 1.0);
    farWorld /= farWorld.w;
    vRayOrigin = cameraPosition;
    vRayDir = normalize(farWorld.xyz - vRayOrigin);
}
`;

export const TERRAIN_RAYMARCH_FRAGMENT_SHADER = /* glsl */ `
precision highp float;
precision highp int;
` + TERRAIN_HEIGHT_GLSL + /* glsl */ `

in vec3 vRayOrigin;
in vec3 vRayDir;

uniform float uMaxDistance;
uniform int   uSteps;
uniform float uNormalDelta;
uniform vec3  uSunDir;
uniform vec3  uSunColor;
uniform vec3  uAmbient;
uniform vec3  uSurfaceColor;
uniform vec3  uFogColor;
uniform float uFogDensity;

out highp vec4 fragColor;

bool raymarchTerrain(vec3 ro, vec3 rd, out vec3 hitPos, out float hitDepth) {
    float t = 0.0;
    float prevT = 0.0;
    bool wasAbove = true;
    for (int i = 0; i < 256; i++) {
        if (i >= uSteps) break;
        vec3 p = ro + rd * t;
        float h = lunarTerrainHeight(p.x, p.z);
        float diff = p.y - h;
        if (diff < 0.0) {
            if (!wasAbove) { t = prevT; break; }
            float lo = prevT, hi = t;
            for (int j = 0; j < 6; j++) {
                float mid = (lo + hi) * 0.5;
                vec3 pm = ro + rd * mid;
                if (pm.y - lunarTerrainHeight(pm.x, pm.z) < 0.0) hi = mid;
                else lo = mid;
            }
            t = (lo + hi) * 0.5;
            hitPos = ro + rd * t;
            vec4 clip = projectionMatrix * viewMatrix * vec4(hitPos, 1.0);
            hitDepth = clip.z / clip.w;
            return true;
        }
        wasAbove = (diff >= 0.0);
        prevT = t;
        float step = max(uMaxDistance / float(uSteps), clamp(diff, 1.0, 0.25 * uMaxDistance));
        t += step;
        if (t > uMaxDistance) break;
    }
    return false;
}

void main() {
    vec3 hitPos;
    float hitDepth;
    if (!raymarchTerrain(vRayOrigin, vRayDir, hitPos, hitDepth)) {
        discard;
    }
    vec3 n = lunarTerrainNormal(hitPos.x, hitPos.z, uNormalDelta);
    vec3 sun = normalize(uSunDir);
    float ndl = clamp(dot(n, sun), 0.0, 1.0);
    vec3 col = uSurfaceColor * (uAmbient + uSunColor * ndl);

    float dist = length(hitPos - vRayOrigin);
    float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
    col = mix(col, uFogColor, clamp(fog, 0.0, 1.0));

    gl_FragDepth = hitDepth;
    fragColor = vec4(col, 1.0);
}
`;

export function createTerrainRaymarchMaterial(uniforms: TerrainRaymarchUniforms): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms,
        vertexShader: TERRAIN_RAYMARCH_VERTEX_SHADER,
        fragmentShader: TERRAIN_RAYMARCH_FRAGMENT_SHADER,
        transparent: false,
        depthWrite: true,
        depthTest: true,
        side: THREE.FrontSide,
    });
}

export function disposeTerrainRaymarchMaterial(material: THREE.ShaderMaterial): void {
    material.dispose();
}
