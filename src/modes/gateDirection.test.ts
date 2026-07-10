import { describe, expect, test } from 'bun:test';
import { describeGateDirection } from './gateDirection.ts';

describe('gate direction guidance', () => {
    test('uses the same left/right convention as player steering', () => {
        expect(describeGateDirection(0, 0, 0, 0, 100)).toMatchObject({ arrow: '↑', label: 'ahead' });
        expect(describeGateDirection(0, 0, 0, 100, 100)).toMatchObject({ arrow: '↖', label: 'ahead and left' });
        expect(describeGateDirection(0, 0, 0, -100, 100)).toMatchObject({ arrow: '↗', label: 'ahead and right' });
        expect(describeGateDirection(0, 0, 0, 100, 0)).toMatchObject({ arrow: '←', label: 'left' });
        expect(describeGateDirection(0, 0, 0, -100, 0)).toMatchObject({ arrow: '→', label: 'right' });
    });

    test('accounts for current heading and rounds distance for the HUD', () => {
        expect(describeGateDirection(10, 20, -Math.PI / 2, -90, 20)).toEqual({
            arrow: '↑',
            label: 'ahead',
            distance: 100,
        });
    });
});
