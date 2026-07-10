import type * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { Stars } from '@react-three/drei';
import { useSafeFrame } from './canvasCrash.tsx';
import { worldConfig } from '../content/worldConfig.ts';
import { getQualitySettings } from '../content/qualityConfig.ts';
import { getPlayerRoot } from '../game/runtime.ts';
import { useGame } from './GameProvider.tsx';
import { useGameStore } from './gameStore.ts';

const { environment } = worldConfig;

function SunLight() {
    const lightRef = useRef<THREE.DirectionalLight>(null);
    const targetRef = useRef<THREE.Object3D>(null);
    const qualityPreset = useGameStore((state) => state.qualityPreset);
    const shadowMapSize = getQualitySettings(qualityPreset).shadowMapSize;
    const { runtime, ready } = useGame();
    const { directionalLight } = environment;
    const [baseX, baseY, baseZ] = directionalLight.position;

    useSafeFrame(() => {
        const light = lightRef.current;
        const target = targetRef.current;
        const root = getPlayerRoot(runtime.current);
        if (!light || !target || !ready.current || !root) return;

        light.position.set(
            root.position.x + baseX,
            baseY,
            root.position.z + baseZ,
        );
        target.position.copy(root.position);
        target.updateMatrixWorld();
    });

    return (
        <directionalLight
            ref={lightRef}
            color={directionalLight.color}
            intensity={directionalLight.intensity}
            castShadow
            shadow-mapSize={[shadowMapSize, shadowMapSize]}
            shadow-bias={directionalLight.shadowBias}
            shadow-camera-near={directionalLight.shadowCamera.near}
            shadow-camera-far={directionalLight.shadowCamera.far}
            shadow-camera-left={directionalLight.shadowCamera.left}
            shadow-camera-right={directionalLight.shadowCamera.right}
            shadow-camera-top={directionalLight.shadowCamera.top}
            shadow-camera-bottom={directionalLight.shadowCamera.bottom}
        >
            <object3D ref={targetRef} />
        </directionalLight>
    );
}

/** Soft blue fill from Earth direction — moon surfaces are very dark without earthshine. */
function EarthshineLight() {
    const lightRef = useRef<THREE.DirectionalLight>(null);
    const targetRef = useRef<THREE.Object3D>(null);
    const { runtime, ready } = useGame();
    const [earthX, earthY, earthZ] = environment.planet.position;

    useSafeFrame(() => {
        const light = lightRef.current;
        const target = targetRef.current;
        const root = getPlayerRoot(runtime.current);
        if (!light || !target || !ready.current || !root) return;

        const originX = root.position.x;
        const originZ = root.position.z;
        const dx = earthX;
        const dy = earthY;
        const dz = earthZ;
        const length = Math.hypot(dx, dy, dz) || 1;
        const distance = 220;
        light.position.set(
            originX - (dx / length) * distance,
            -(dy / length) * distance,
            originZ - (dz / length) * distance,
        );
        target.position.set(originX, root.position.y, originZ);
        target.updateMatrixWorld();
    });

    return (
        <directionalLight ref={lightRef} color="#9eb8e8" intensity={1.35}>
            <object3D ref={targetRef} />
        </directionalLight>
    );
}

/** Sky objects stay near the player so infinite travel never leaves the moon behind. */
function SkyDome() {
    const groupRef = useRef<THREE.Group>(null);
    const { runtime, ready } = useGame();
    const { planet } = environment;
    const [planetX, planetY, planetZ] = planet.position;

    const starConfig = useMemo(() => ({
        radius: environment.stars.radius,
        depth: 60,
        count: environment.stars.count,
        factor: 2.4,
        saturation: 0,
        fade: true,
        speed: 0.08,
    }), []);

    useSafeFrame(() => {
        const group = groupRef.current;
        const root = getPlayerRoot(runtime.current);
        if (!group || !ready.current || !root) return;

        group.position.set(root.position.x, 0, root.position.z);
    });

    return (
        <group ref={groupRef}>
            <Stars {...starConfig} />
            <mesh position={[planetX, planetY, planetZ]} frustumCulled={false}>
                <sphereGeometry args={[planet.radius, planet.segments, planet.segments]} />
                <meshStandardMaterial
                    color={planet.color}
                    emissive={planet.emissive}
                    emissiveIntensity={1.1}
                    roughness={0.92}
                    metalness={0.02}
                    fog={false}
                />
            </mesh>
        </group>
    );
}

export function WorldEnvironment() {
    const { fog, ambientLight } = environment;

    return (
        <>
            <color attach="background" args={[environment.background]} />
            <fogExp2 attach="fog" args={[fog.color, fog.density]} />
            <ambientLight color={ambientLight.color} intensity={ambientLight.intensity} />
            <hemisphereLight
                color="#b8c4e8"
                groundColor="#4a4e58"
                intensity={0.85}
            />
            <SunLight />
            <EarthshineLight />
            <SkyDome />
        </>
    );
}
