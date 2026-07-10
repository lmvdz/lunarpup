import type * as THREE from 'three';
import type { PhysicsState } from './types.ts';
import { worldConfig } from '../content/worldConfig.ts';
import { calculateTerrainHeight } from './terrainMath.ts';

export { calculateTerrainHeight } from './terrainMath.ts';

export function getTerrainHeight(x: number, z: number) {
    return calculateTerrainHeight(x, z);
}

export function getTerrainNormal(
    x: number,
    z: number,
    scratch: { terrainNormal: THREE.Vector3 },
) {
    const d = worldConfig.terrain.normalSampleDelta;
    const hL = getTerrainHeight(x - d, z);
    const hR = getTerrainHeight(x + d, z);
    const hD = getTerrainHeight(x, z - d);
    const hU = getTerrainHeight(x, z + d);
    scratch.terrainNormal.set(hL - hR, d * 2, hD - hU).normalize();
    return scratch.terrainNormal;
}

export function getHeightAboveTerrain(
    x: number,
    y: number,
    z: number,
    scratch: {
        terrainNormal: THREE.Vector3;
        normalProbeA: THREE.Vector3;
        normalProbeB: THREE.Vector3;
    },
) {
    const terrainH = getTerrainHeight(x, z);
    const normal = getTerrainNormal(x, z, scratch);
    scratch.normalProbeA.set(x, terrainH, z);
    scratch.normalProbeB.set(x, y, z).sub(scratch.normalProbeA);
    return scratch.normalProbeB.dot(normal);
}

export function alignPlayerToTerrain(
    playerGroup: THREE.Group,
    physics: PhysicsState,
    scratch: {
        baseForward: THREE.Vector3;
        slopeForward: THREE.Vector3;
        slopeRight: THREE.Vector3;
        terrainNormal: THREE.Vector3;
        playerMatrix: THREE.Matrix4;
        targetPlayerQuat: THREE.Quaternion;
    },
    frameScale = 1,
) {
    const normal = getTerrainNormal(playerGroup.position.x, playerGroup.position.z, scratch);
    scratch.baseForward.set(Math.sin(physics.heading), 0, Math.cos(physics.heading));
    scratch.slopeForward.copy(scratch.baseForward).addScaledVector(normal, -scratch.baseForward.dot(normal)).normalize();
    if (scratch.slopeForward.lengthSq() < 0.0001) scratch.slopeForward.set(0, 0, 1);
    scratch.slopeRight.crossVectors(normal, scratch.slopeForward).normalize();

    scratch.playerMatrix.makeBasis(scratch.slopeRight, normal, scratch.slopeForward);
    scratch.targetPlayerQuat.setFromRotationMatrix(scratch.playerMatrix);
    const tiltSmoothing = 1 - Math.pow(1 - physics.tiltSmoothing, frameScale);
    playerGroup.quaternion.slerp(scratch.targetPlayerQuat, tiltSmoothing);
}

export function alignPlayerHeadingInAir(
    playerGroup: THREE.Group,
    physics: PhysicsState,
    scratch: { upAxis: THREE.Vector3; targetPlayerQuat: THREE.Quaternion },
    frameScale = 1,
) {
    scratch.upAxis.set(0, 1, 0);
    scratch.targetPlayerQuat.setFromAxisAngle(scratch.upAxis, physics.heading);
    const tiltSmoothing = 1 - Math.pow(1 - physics.tiltSmoothing * 1.3, frameScale);
    playerGroup.quaternion.slerp(scratch.targetPlayerQuat, tiltSmoothing);
}
