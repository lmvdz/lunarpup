import { describe, expect, test } from 'bun:test';
import { calculateTerrainHeight } from './terrainMath.ts';

describe('calculateTerrainHeight', () => {
    test('returns a stable height for the same coordinates', () => {
        expect(calculateTerrainHeight(120, -340)).toBe(calculateTerrainHeight(120, -340));
    });

    // Heights updated after domain-warped ridges and refined crater profiles.
    test.each([
        { x: 0, z: 0, expected: 13.414347787423988 },
        { x: 120, z: -340, expected: 50.69646287962965 },
        { x: 720, z: 560, expected: 24.183133568713664 },
        { x: -1024, z: 2048, expected: 44.09242115439644 },
    ])('preserves the terrain shape at ($x, $z)', ({ x, z, expected }) => {
        expect(calculateTerrainHeight(x, z)).toBeCloseTo(expected, 9);
    });
});
