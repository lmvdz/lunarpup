import * as THREE from 'three';
import { worldConfig } from '../content/worldConfig.ts';
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
            mass: 70,
            thrustForce: 3.35,
            hoverStiffness: 1.55,
            hoverDamping: 0.28,
            maxHoverForce: 5.2,
            maxHoverRange: 2.6,
            coastFriction: 0.001,
            coastDrag: 0.00045,
            airDrag: 0.008,
            maxSpeed: 1.25,
            rotationSpeed: 0.058,
            gravity: 0.0032,
            jumpImpulse: 0.16,
            tiltSmoothing: 0.24,
            driftSlideMultiplier: 0.06,
            slideGrip: 0.018,
            driftGripMultiplier: 0.38,
            driftThreshold: 0.2,
            boostMultiplier: 1.95,
            boostAccelMultiplier: 2.45,
            airThrustMultiplier: 0.82,
            airTurnMultiplier: 1.45,
            airSteerGrip: 0.012,
            airHoverAssist: 0.55,
            hoverLandingSpeed: 0.28,
            cameraBaseFov: cameraDefaults.baseFov,
            cameraMaxFov: cameraDefaults.maxFov,
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
