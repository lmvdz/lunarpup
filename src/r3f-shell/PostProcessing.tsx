import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useGameStore } from './gameStore.ts';
import { getQualitySettings } from '../content/qualityConfig.ts';

function BloomEffects() {
    return (
        <EffectComposer>
            <Bloom
                intensity={0.28}
                luminanceThreshold={0.82}
                luminanceSmoothing={0.25}
                mipmapBlur
            />
            <Vignette eskil={false} offset={0.22} darkness={0.22} />
        </EffectComposer>
    );
}

export function PostProcessing() {
    const qualityPreset = useGameStore((state) => state.qualityPreset);
    const settings = getQualitySettings(qualityPreset);

    if (settings.postFx === 'minimal') {
        return null;
    }

    if (settings.postFx === 'bloom') {
        return <BloomEffects />;
    }

    return <BloomEffects />;
}
