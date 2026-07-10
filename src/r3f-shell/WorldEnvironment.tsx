import { useMemo } from 'react';
import { worldConfig } from '../content/worldConfig.ts';

const { environment } = worldConfig;

function createStarPositions() {
    const positions = new Float32Array(environment.stars.count * 3);

    for (let index = 0; index < positions.length; index += 3) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2 * Math.PI;
        const phi = Math.acos(2 * v - 1);

        positions[index] = environment.stars.radius * Math.sin(phi) * Math.cos(theta);
        positions[index + 1] = environment.stars.radius * Math.sin(phi) * Math.sin(theta);
        positions[index + 2] = environment.stars.radius * Math.cos(phi);
    }

    return positions;
}

function Starfield() {
    const positions = useMemo(createStarPositions, []);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                color={environment.stars.color}
                size={environment.stars.size}
                sizeAttenuation
            />
        </points>
    );
}

export function WorldEnvironment() {
    const { fog, ambientLight, directionalLight, planet } = environment;
    const [planetX, planetY, planetZ] = planet.position;
    const [lightX, lightY, lightZ] = directionalLight.position;

    return (
        <>
            <color attach="background" args={[environment.background]} />
            <fogExp2 attach="fog" args={[fog.color, fog.density]} />
            <ambientLight color={ambientLight.color} intensity={ambientLight.intensity} />
            <directionalLight
                color={directionalLight.color}
                intensity={directionalLight.intensity}
                position={[lightX, lightY, lightZ]}
                castShadow
                shadow-mapSize={[directionalLight.shadowMapSize, directionalLight.shadowMapSize]}
                shadow-camera-near={directionalLight.shadowCamera.near}
                shadow-camera-far={directionalLight.shadowCamera.far}
                shadow-camera-left={directionalLight.shadowCamera.left}
                shadow-camera-right={directionalLight.shadowCamera.right}
                shadow-camera-top={directionalLight.shadowCamera.top}
                shadow-camera-bottom={directionalLight.shadowCamera.bottom}
            />
            <Starfield />
            <mesh position={[planetX, planetY, planetZ]}>
                <sphereGeometry args={[planet.radius, planet.segments, planet.segments]} />
                <meshPhongMaterial color={planet.color} emissive={planet.emissive} flatShading />
            </mesh>
        </>
    );
}
