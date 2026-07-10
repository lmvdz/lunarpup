/**
 * GLSL port of `calculateTerrainHeight` from terrainMath.ts.
 * Keep in sync with the CPU implementation — physics samples the TS version.
 */
export const TERRAIN_HEIGHT_GLSL = /* glsl */ `
float lunarHash2(float x, float z) {
    return fract(sin(x * 127.1 + z * 311.7) * 43758.5453123);
}

float lunarSmoothstep(float t) {
    return t * t * (3.0 - 2.0 * t);
}

float lunarLerp(float a, float b, float t) {
    return a + (b - a) * t;
}

float lunarValueNoise(float x, float z) {
    float ix = floor(x);
    float iz = floor(z);
    float fx = lunarSmoothstep(x - ix);
    float fz = lunarSmoothstep(z - iz);
    float a = lunarHash2(ix, iz);
    float b = lunarHash2(ix + 1.0, iz);
    float c = lunarHash2(ix, iz + 1.0);
    float d = lunarHash2(ix + 1.0, iz + 1.0);
    float ab = lunarLerp(a, b, fx);
    float cd = lunarLerp(c, d, fx);
    return lunarLerp(ab, cd, fz) * 2.0 - 1.0;
}

float lunarFractalNoise(float x, float z) {
    float total = 0.0;
    float amp = 1.0;
    float freq = 1.0;
    float norm = 0.0;
    for (int i = 0; i < 5; i++) {
        total += lunarValueNoise(x * freq, z * freq) * amp;
        norm += amp;
        amp *= 0.5;
        freq *= 2.0;
    }
    return total / norm;
}

vec2 lunarDomainWarp(float x, float z) {
    float warpX = lunarFractalNoise(x * 0.0016 + 17.0, z * 0.0016 - 9.0) * 140.0;
    float warpZ = lunarFractalNoise(x * 0.0016 - 31.0, z * 0.0016 + 23.0) * 140.0;
    return vec2(x + warpX, z + warpZ);
}

float lunarTerrainHeight(float x, float z) {
    vec2 warped = lunarDomainWarp(x, z);
    float y = lunarFractalNoise(warped.x * 0.0032, warped.y * 0.0032) * 28.0;
    y += lunarFractalNoise(warped.x * 0.012 + 50.0, warped.y * 0.012 - 20.0) * 9.0;
    y += pow(max(0.0, sin(warped.x * 0.0033 + sin(warped.y * 0.0025) * 2.2)), 2.15) * 64.0;
    y += pow(max(0.0, cos((warped.x + warped.y) * 0.0028)), 2.8) * 38.0;

    float cell = 720.0;
    float baseCx = floor(x / cell);
    float baseCz = floor(z / cell);
    for (int oz = -1; oz <= 1; oz++) {
        for (int ox = -1; ox <= 1; ox++) {
            float gx = baseCx + float(ox);
            float gz = baseCz + float(oz);
            float px = (gx + lunarHash2(gx, gz) * 0.8 + 0.1) * cell;
            float pz = (gz + lunarHash2(gx + 91.0, gz - 47.0) * 0.8 + 0.1) * cell;
            float radius = 170.0 + lunarHash2(gx - 12.0, gz + 31.0) * 260.0;
            float height = 45.0 + lunarHash2(gx + 7.0, gz + 13.0) * 95.0;
            float dx = x - px;
            float dz = z - pz;
            float dist = sqrt(dx * dx + dz * dz);
            float t = max(0.0, 1.0 - dist / radius);
            y += pow(t, 2.35) * height;
        }
    }

    float craterCell = 560.0;
    float ccx = floor(x / craterCell);
    float ccz = floor(z / craterCell);
    for (int coz = -1; coz <= 1; coz++) {
        for (int cox = -1; cox <= 1; cox++) {
            float gx = ccx + float(cox);
            float gz = ccz + float(coz);
            if (lunarHash2(gx + 201.0, gz - 109.0) < 0.48) continue;

            float cx = (gx + 0.18 + lunarHash2(gx + 5.0, gz + 6.0) * 0.64) * craterCell;
            float cz = (gz + 0.18 + lunarHash2(gx - 8.0, gz + 3.0) * 0.64) * craterCell;
            float radius = 105.0 + lunarHash2(gx + 22.0, gz + 22.0) * 105.0;
            float depth = 36.0 + lunarHash2(gx - 44.0, gz + 11.0) * 52.0;
            float rimHeight = 10.0 + lunarHash2(gx + 14.0, gz - 14.0) * 14.0;
            float dx = x - cx;
            float dz = z - cz;
            float dist = sqrt(dx * dx + dz * dz);
            if (dist < radius * 1.18) {
                float t = dist / radius;
                if (t < 1.0) {
                    float bowl = -depth * pow(1.0 - t * t, 1.55);
                    float rim = exp(-pow((t - 0.92) * 7.4, 2.0)) * rimHeight;
                    float peak = lunarHash2(gx + 77.0, gz - 33.0) > 0.82
                        ? (8.0 + lunarHash2(gx - 3.0, gz + 19.0) * 16.0) * exp(-pow(t - 0.18, 2.0) * 18.0)
                        : 0.0;
                    y += bowl + rim + peak;
                } else {
                    float outer = max(0.0, 1.0 - (t - 1.0) / 0.18);
                    y += outer * rimHeight * 0.35;
                }
            }
        }
    }

    return y;
}

vec3 lunarTerrainNormal(float x, float z, float sampleDelta) {
    float hL = lunarTerrainHeight(x - sampleDelta, z);
    float hR = lunarTerrainHeight(x + sampleDelta, z);
    float hD = lunarTerrainHeight(x, z - sampleDelta);
    float hU = lunarTerrainHeight(x, z + sampleDelta);
    return normalize(vec3(hL - hR, sampleDelta * 4.0, hD - hU));
}
`;
