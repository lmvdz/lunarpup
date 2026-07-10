import { useEffect, useId } from 'react';
import { useGameStore } from './gameStore.ts';

export function SettingsPanel() {
    const panelId = useId();
    const {
        showControls,
        showTuning,
        reducedMotion,
        setUiPreference,
    } = useGameStore();

    useEffect(() => {
        document.documentElement.classList.toggle('reduced-motion', reducedMotion);
    }, [reducedMotion]);

    return (
        <aside id="settings-panel" className="settings-panel" aria-label="Game settings">
            <h2 id={`${panelId}-title`}>Settings</h2>
            <ul id={panelId} className="settings-list" aria-labelledby={`${panelId}-title`}>
                <li>
                    <label htmlFor="setting-show-controls">
                        <input
                            id="setting-show-controls"
                            type="checkbox"
                            checked={showControls}
                            onChange={(event) => setUiPreference('showControls', event.target.checked)}
                        />
                        Show controls reference
                    </label>
                </li>
                <li>
                    <label htmlFor="setting-show-tuning">
                        <input
                            id="setting-show-tuning"
                            type="checkbox"
                            checked={showTuning}
                            onChange={(event) => setUiPreference('showTuning', event.target.checked)}
                        />
                        Show live physics tuning
                    </label>
                </li>
                <li>
                    <label htmlFor="setting-reduced-motion">
                        <input
                            id="setting-reduced-motion"
                            type="checkbox"
                            checked={reducedMotion}
                            onChange={(event) => setUiPreference('reducedMotion', event.target.checked)}
                        />
                        Reduce motion effects
                    </label>
                </li>
            </ul>
        </aside>
    );
}
