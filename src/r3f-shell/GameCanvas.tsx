import { Component, useCallback, useEffect, useMemo, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { handleKeys } from '../game/input.ts';
import { stepSimulation } from '../game/simulation.ts';
import { lerpRemotePlayers } from '../game/remotePlayerMotion.ts';
import { setupCameraControls, updateCamera } from '../game/camera.ts';
import { useGame } from './GameProvider.tsx';
import { CameraRig } from './CameraRig.tsx';
import { Player } from './Player.tsx';
import { RemotePlayers } from './RemotePlayers.tsx';
import { Terrain } from './Terrain.tsx';
import { WorldEnvironment } from './WorldEnvironment.tsx';
import { CanvasCrashReporter, CrashScreen, useSafeFrame } from './canvasCrash.tsx';
import type { VoxelDogParts } from '../game/types.ts';

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
    const { registerPlayerParts, remotePlayersRef, remotePlayerIds } = useGame();
    const [player, setPlayer] = useState<VoxelDogParts | null>(null);
    const onPlayerReady = useCallback((parts: VoxelDogParts) => {
        registerPlayerParts(parts);
        setPlayer(parts);
    }, [registerPlayerParts]);

    const remoteRecords = useMemo(
        () => remotePlayerIds
            .map((id) => remotePlayersRef.current.get(id))
            .filter((record): record is NonNullable<typeof record> => !!record),
        [remotePlayerIds, remotePlayersRef],
    );

    return (
        <>
            <RendererSetup />
            <WorldEnvironment />
            <Player onReady={onPlayerReady} />
            {player && <Terrain player={player} />}
            <RemotePlayers records={remoteRecords} />
            {player && <GameRuntime />}
            <CameraRig />
        </>
    );
}

function GameHost({ onCrash }: { onCrash: (error: unknown) => void }) {
    return (
        <Canvas
            camera={{ fov: 60, near: 0.1, far: 2500 }}
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
