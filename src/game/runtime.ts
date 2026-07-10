import * as THREE from 'three';
import { physicsTuningDefaults } from '../config.ts';
import { createTrickSimulation } from './trickSimulation.ts';
import type { GameRuntime } from './types.ts';

const { camera: cameraDefaults } = worldConfig;

export function createGameRuntime(): GameRuntime {
    return {
        keys: {
            w: false,
            a: false,
            s: false,
            d: false,
            q: false,
            e: false,
            f: false,
            space: false,
            shift: false,
        },
        jumpInput: { queuedAt: 0 },
        physics: {
            speed: 0,
            ...physicsTuningDefaults,
            heading: 0,
            velocity: new THREE.Vector3(),
            isGrounded: true,
            airTime: 0,
        },
        cameraControl: {
            yaw: cameraDefaults.initialYaw,
            pitch: cameraDefaults.initialPitch,
            distance: cameraDefaults.initialDistance,
            minDistance: cameraDefaults.minDistance,
            maxDistance: cameraDefaults.maxDistance,
            sensitivity: cameraDefaults.sensitivity,
            zoomSensitivity: cameraDefaults.zoomSensitivity,
            autoFollowStrength: cameraDefaults.autoFollowStrength,
            fovSmoothing: cameraDefaults.fovSmoothing,
            isDragging: false,
            lastX: 0,
            lastY: 0,
        },
        scratch: {
            upAxis: new THREE.Vector3(0, 1, 0),
            camOffset: new THREE.Vector3(),
            targetCamPos: new THREE.Vector3(),
            lookTarget: new THREE.Vector3(),
            rightVector: new THREE.Vector3(),
            terrainNormal: new THREE.Vector3(0, 1, 0),
            normalProbeA: new THREE.Vector3(),
            normalProbeB: new THREE.Vector3(),
            normalProbeC: new THREE.Vector3(),
            playerMatrix: new THREE.Matrix4(),
            targetPlayerQuat: new THREE.Quaternion(),
            baseForward: new THREE.Vector3(),
            slopeForward: new THREE.Vector3(),
            slopeRight: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            normalAcceleration: new THREE.Vector3(),
            tangentVelocity: new THREE.Vector3(),
        },
        parts: null,
        trickState: createTrickSimulation(),
        frameHud: {},
        multiplayerClient: null,
        renderedTerrainRings: 0,
    };
}

export function getPlayerRoot(runtime: GameRuntime) {
    return runtime.parts?.playerGroup ?? runtime.parts?.group ?? null;
}
