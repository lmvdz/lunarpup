import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import type * as THREE from 'three';
import { setupCameraControls, updateCamera } from '../game/camera.ts';
import { useGame } from './GameProvider.tsx';
import { useSafeFrame } from './canvasCrash.tsx';

export function CameraRig() {
    const { runtime, ready } = useGame();
    const { camera, gl } = useThree();

    useEffect(() => {
        return setupCameraControls(gl.domElement, runtime.current);
    }, [gl, runtime]);

    useSafeFrame((_, delta) => {
        if (!ready.current) return;
        updateCamera(runtime.current, camera as THREE.PerspectiveCamera, Math.min(delta, 0.05));
    });

    return null;
}
