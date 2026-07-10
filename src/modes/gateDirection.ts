export interface GateDirection {
    arrow: string;
    label: string;
    distance: number;
}

/**
 * Describes a target relative to Lunar Pup's heading convention. Positive
 * heading is a left turn (A), while negative heading is a right turn (D).
 */
export function describeGateDirection(
    playerX: number,
    playerZ: number,
    heading: number,
    targetX: number,
    targetZ: number,
): GateDirection {
    const dx = targetX - playerX;
    const dz = targetZ - playerZ;
    const targetHeading = Math.atan2(dx, dz);
    const relative = Math.atan2(Math.sin(targetHeading - heading), Math.cos(targetHeading - heading));
    const sector = Math.round(relative / (Math.PI / 4));
    const directions: Record<number, Omit<GateDirection, 'distance'>> = {
        [-4]: { arrow: '↓', label: 'behind' },
        [-3]: { arrow: '↘', label: 'behind and right' },
        [-2]: { arrow: '→', label: 'right' },
        [-1]: { arrow: '↗', label: 'ahead and right' },
        [0]: { arrow: '↑', label: 'ahead' },
        [1]: { arrow: '↖', label: 'ahead and left' },
        [2]: { arrow: '←', label: 'left' },
        [3]: { arrow: '↙', label: 'behind and left' },
        [4]: { arrow: '↓', label: 'behind' },
    };
    return {
        ...(directions[sector] ?? directions[0]!),
        distance: Math.round(Math.hypot(dx, dz)),
    };
}
