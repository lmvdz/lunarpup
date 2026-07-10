import { Component, useCallback, useEffect, useMemo, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { worldConfig } from '../content/worldConfig.ts';
import { handleKeys } from '../game/input.ts';
import { stepSimulation } from '../game/simulation.ts';
import { lerpRemotePlayers } from '../game/remotePlayerMotion.ts';
import { useGame } from './GameProvider.tsx';
import { useGameStore } from './gameStore.ts';
import { CameraRig } from './CameraRig.tsx';
import { Player } from './Player.tsx';
import { RemotePlayers } from './RemotePlayers.tsx';
import { Terrain } from './Terrain.tsx';
import { WorldEnvironment } from './WorldEnvironment.tsx';
import { CanvasCrashReporter, CrashScreen, useSafeFrame } from './canvasCrash.tsx';
import type { RemotePlayerRecord } from '../game/types.ts';

function useGameInput() {
    const { runtime } = useGame();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => handleKeys(runtime.current, event, true);
        const onKeyUp = (event: KeyboardEvent) => handleKeys(runtime.current, event, false);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [runtime]);
}

function GameRuntime() {
    const { runtime, ready, remotePlayersRef } = useGame();

    useSafeFrame((_, delta) => {
        if (!ready.current) return;
        const dt = Math.min(delta, 0.05);
        lerpRemotePlayers(remotePlayersRef.current, dt);
        stepSimulation(runtime.current, dt);
    }, -1);

    useGameInput();

    return null;
}

function RendererSetup() {
    const { gl } = useThree();

    useEffect(() => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
    }, [gl]);

    return null;
}

function GameScene() {
    const { registerPlayerParts, remotePlayersRef } = useGame();
    const remotePlayerIds = useGameStore((state) => state.remotePlayerIds);
    const onPlayerReady = useCallback((parts: Parameters<typeof registerPlayerParts>[0]) => {
        registerPlayerParts(parts);
    }, [registerPlayerParts]);

    const remoteRecords = useMemo(
        () => remotePlayerIds
            .map((id) => remotePlayersRef.current.get(id))
            .filter((record): record is RemotePlayerRecord => !!record),
        [remotePlayerIds, remotePlayersRef],
    );

    return (
        <>
            <RendererSetup />
            <WorldEnvironment />
            <Player onReady={onPlayerReady} />
            <Terrain />
            <RemotePlayers records={remoteRecords} />
            <GameRuntime />
            <CameraRig />
        </>
    );
}

function GameHost({ onCrash }: { onCrash: (error: unknown) => void }) {
    const { camera: cameraDefaults } = worldConfig;

    return (
        <Canvas
            camera={{
                fov: cameraDefaults.fov,
                near: cameraDefaults.near,
                far: cameraDefaults.far,
            }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            dpr={[1, 2]}
            shadows
        >
            <CanvasCrashReporter onCrash={onCrash}>
                <GameScene />
            </CanvasCrashReporter>
        </Canvas>
    );
}

type CanvasBoundaryProps = {
    children: ReactNode;
    onCrash: (error: unknown) => void;
};
type CanvasBoundaryState = { hasError: boolean };

class CanvasErrorBoundary extends Component<CanvasBoundaryProps, CanvasBoundaryState> {
    override state: CanvasBoundaryState = { hasError: false };

    static getDerivedStateFromError(): CanvasBoundaryState {
        return { hasError: true };
    }

    override componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('R3F canvas crashed', error, info.componentStack);
        this.props.onCrash(error);
    }

    override render() {
        if (this.state.hasError) return null;
        return this.props.children;
    }
}

export function GameCanvas() {
    const [crash, setCrash] = useState<unknown>(null);

    if (crash) {
        return (
            <CrashScreen
                error={crash}
                title="Game crashed"
            />
        );
    }

    return (
        <CanvasErrorBoundary onCrash={setCrash}>
            <GameHost onCrash={setCrash} />
        </CanvasErrorBoundary>
    );
}
