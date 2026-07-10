import { useEffect, useId } from 'react';
import { useGameStore } from './gameStore.ts';

const CONTROL_ROWS = [
    { keys: ['▲', 'W'], action: 'Thrust forward' },
    { keys: ['▼', 'S'], action: 'Brake / reverse' },
    { keys: ['◀', '▶', 'A', 'D'], action: 'Steer' },
    { keys: ['Spacebar'], action: 'Hover burst (jump)' },
    { keys: ['Mid-air'], action: 'Steer and thrust still work in jumps' },
    { keys: ['Shift'], action: 'Boost' },
    { keys: ['Mouse drag'], action: 'Orbit camera' },
    { keys: ['Wheel'], action: 'Zoom in / out' },
    { keys: ['?'], action: 'Toggle this panel' },
    { keys: ['T'], action: 'Toggle chat (multiplayer)' },
] as const;

export function ControlsPanel() {
    const panelId = useId();
    const { showControls, setUiPreference } = useGameStore();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== '?' || event.metaKey || event.ctrlKey || event.altKey) return;
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
            event.preventDefault();
            setUiPreference('showControls', !showControls);
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [setUiPreference, showControls]);

    if (!showControls) return null;

    return (
        <section
            id="controls-panel"
            className="controls-panel"
            aria-label="Controls reference"
        >
            <div className="controls-panel-header">
                <h2 id={`${panelId}-title`}>Controls</h2>
                <button
                    type="button"
                    className="controls-panel-close"
                    aria-expanded={showControls}
                    aria-controls={panelId}
                    onClick={() => setUiPreference('showControls', false)}
                >
                    Hide
                </button>
            </div>
            <dl id={panelId} className="controls" aria-labelledby={`${panelId}-title`}>
                {CONTROL_ROWS.map((row) => (
                    <div key={row.action} className="controls-row">
                        <dt>
                            {row.keys.map((key) => (
                                <span key={key} className="key">{key}</span>
                            ))}
                        </dt>
                        <dd>{row.action}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
