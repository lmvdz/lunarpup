export {
    groundClearance,
    hoverClearance,
} from './content/worldConfig.ts';

export const tuningSettings = [
    { key: 'mass', label: 'Mass', min: 20, max: 200, step: 5 },
    { key: 'thrustForce', label: 'Thrust', min: 0.5, max: 6, step: 0.05 },
    { key: 'hoverStiffness', label: 'Hover stiffness', min: 0.4, max: 4, step: 0.05 },
    { key: 'hoverDamping', label: 'Hover damping', min: 0.05, max: 1.2, step: 0.01 },
    { key: 'maxHoverForce', label: 'Max hover force', min: 0.5, max: 12, step: 0.1 },
    { key: 'maxHoverRange', label: 'Hover range', min: 0.4, max: 5, step: 0.1 },
    { key: 'coastFriction', label: 'Coast friction', min: 0, max: 0.02, step: 0.001 },
    { key: 'coastDrag', label: 'Coast drag', min: 0, max: 0.01, step: 0.0002 },
    { key: 'airDrag', label: 'Air drag', min: 0, max: 0.08, step: 0.002 },
    { key: 'airThrustMultiplier', label: 'Air thrust', min: 0, max: 1.5, step: 0.05 },
    { key: 'airTurnMultiplier', label: 'Air turn', min: 0.5, max: 2.5, step: 0.05 },
    { key: 'airSteerGrip', label: 'Air steer', min: 0, max: 0.06, step: 0.001 },
    { key: 'airHoverAssist', label: 'Air hover assist', min: 0, max: 1, step: 0.05 },
    { key: 'hoverLandingSpeed', label: 'Landing catch speed', min: 0.05, max: 0.5, step: 0.01 },
    { key: 'maxSpeed', label: 'HUD fast speed', min: 0.3, max: 2.4, step: 0.05 },
    { key: 'rotationSpeed', label: 'Turn speed', min: 0.005, max: 0.12, step: 0.005 },
    { key: 'jumpImpulse', label: 'Jump burst', min: 0.03, max: 0.25, step: 0.005 },
    { key: 'gravity', label: 'Gravity', min: 0.002, max: 0.03, step: 0.001 },
    { key: 'tiltSmoothing', label: 'Board align', min: 0.04, max: 0.6, step: 0.01 },
    { key: 'driftSlideMultiplier', label: 'Slope slide', min: 0, max: 0.35, step: 0.01 },
    { key: 'slideGrip', label: 'Lateral grip', min: 0, max: 0.05, step: 0.001 },
    { key: 'driftGripMultiplier', label: 'Drift grip', min: 0.05, max: 1, step: 0.05 },
    { key: 'driftThreshold', label: 'Drift threshold', min: 0.02, max: 0.5, step: 0.01 },
    { key: 'boostMultiplier', label: 'Boost max', min: 1.0, max: 3.5, step: 0.05 },
    { key: 'boostAccelMultiplier', label: 'Boost accel', min: 1.0, max: 5.0, step: 0.1 },
    { key: 'cameraBaseFov', label: 'Base FOV', min: 45, max: 85, step: 1 },
    { key: 'cameraMaxFov', label: 'Fast FOV', min: 60, max: 115, step: 1 },
] as const;

export type PhysicsKey = (typeof tuningSettings)[number]['key'];

export const physicsTuningDefaults: Readonly<Record<PhysicsKey, number>> = Object.freeze({
    maxSpeed: 0.8,
    accel: 0.015,
    decel: 0.01,
    rotationSpeed: 0.04,
    jumpForce: 0.15,
    gravity: 0.004,
    suspension: 0.22,
    tiltSmoothing: 0.18,
    boostMultiplier: 1.85,
    boostAccelMultiplier: 2.2,
    cameraBaseFov: 60,
    cameraMaxFov: 84,
});

export const chunkSize = 240;
export const terrainViewDistance = 3;
export const groundClearance = 0.42;

/**
 * LOD bias for terrain chunk detail. 1 = default thresholds; >1 keeps high detail
 * further out (crisper, heavier), <1 drops to low detail sooner (cheaper). A device
 * with a weak GPU can lower this; the tuning panel could expose it later.
 */
export const terrainLodBias = 1;

/**
 * Max terrain chunk geometries to BUILD per frame. Crossing a chunk border can bring
 * several new chunks into view at once; building them all in one frame is the stutter.
 * Cap the per-frame build work and queue the rest (nearest first) so the cost is spread
 * across a few frames instead of one spike. Unchanged chunks are never rebuilt.
 */
export const maxChunkBuildsPerFrame = 2;
