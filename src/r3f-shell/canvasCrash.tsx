import {
    createContext,
    useContext,
    useRef,
    type ReactNode,
} from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { RenderCallback } from '@react-three/fiber';

type CrashReporter = (error: unknown) => void;

const CanvasCrashContext = createContext<CrashReporter | null>(null);

export function createCrashReporter(onCrash: CrashReporter): CrashReporter {
    let reported = false;
    return (error: unknown) => {
        if (reported) return;
        reported = true;
        onCrash(error);
    };
}

export function CanvasCrashReporter({
    onCrash,
    children,
}: {
    onCrash: CrashReporter;
    children: ReactNode;
}) {
    const onCrashRef = useRef(onCrash);
    onCrashRef.current = onCrash;

    const reportCrash = useRef<CrashReporter | undefined>(undefined);
    if (!reportCrash.current) {
        reportCrash.current = createCrashReporter((error) => onCrashRef.current(error));
    }

    return (
        <CanvasCrashContext.Provider value={reportCrash.current}>
            {children}
        </CanvasCrashContext.Provider>
    );
}

function useReportCanvasCrash(): CrashReporter {
    const reportCrash = useContext(CanvasCrashContext);
    if (!reportCrash) {
        throw new Error('useReportCanvasCrash must be used within CanvasCrashReporter');
    }
    return reportCrash;
}

function stopRenderLoop(setFrameloop: (mode: 'never') => void, gl: { setAnimationLoop: (loop: null) => void }) {
    setFrameloop('never');
    gl.setAnimationLoop(null);
}

export function useSafeFrame(callback: RenderCallback, renderPriority?: number) {
    const reportCrash = useReportCanvasCrash();
    const setFrameloop = useThree((state) => state.setFrameloop);
    const gl = useThree((state) => state.gl);

    useFrame((state, delta, frame) => {
        try {
            callback(state, delta, frame);
        } catch (error) {
            stopRenderLoop(setFrameloop, gl);
            console.error('R3F frame loop crashed', error);
            reportCrash(error);
        }
    }, renderPriority);
}

export function CrashScreen({
    error,
    title = 'Game stopped',
    hint,
}: {
    error?: unknown;
    title?: string;
    hint?: string;
}) {
    return (
        <section className="r3f-fallback" role="alert">
            <h2>{title}</h2>
            <p>{hint ?? 'A runtime error stopped the game loop. Reload to try again.'}</p>
            {error instanceof Error && <p className="r3f-fallback-detail">{error.message}</p>}
            <button type="button" onClick={() => window.location.reload()}>Reload game</button>
        </section>
    );
}
