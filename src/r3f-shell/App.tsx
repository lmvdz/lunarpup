import { GameProvider } from './GameProvider.tsx';
import { ChatPanel } from './ChatPanel.tsx';
import { ControlsPanel } from './ControlsPanel.tsx';
import { GameCanvas } from './GameCanvas.tsx';
import { MinimapPanel } from './MinimapPanel.tsx';
import { MultiplayerPanel } from './MultiplayerPanel.tsx';
import { SettingsPanel } from './SettingsPanel.tsx';
import { TrickHud } from './TrickHud.tsx';
import { TuningPanel } from './TuningPanel.tsx';
import { SpeedHud } from './SpeedHud.tsx';
import { SpeedLines } from './SpeedLines.tsx';
import { UpdateNotice } from './UpdateNotice.tsx';
import { useGameStore } from './gameStore.ts';
import '../styles.css';
import './shell.css';

function HudPanels() {
    const showTuning = useGameStore((state) => state.showTuning);
    const multiplayerConfig = useGameStore((state) => state.multiplayerConfig);

    return (
        <>
            <SettingsPanel />
            <ControlsPanel />
            {showTuning && <TuningPanel />}
            <TrickHud />
            <MinimapPanel />
            <MultiplayerPanel />
            <ChatPanel multiplayerEnabled={multiplayerConfig?.enabled ?? false} />
            <SpeedHud />
            <SpeedLines />
            <UpdateNotice />
        </>
    );
}

export function App() {
    return (
        <GameProvider>
            <main className="r3f-shell">
                <div id="canvas-container" className="r3f-canvas-layer">
                    <GameCanvas />
                </div>
                <div id="hud-layer" className="r3f-hud-layer">
                    <div id="ui">
                        <h1>🌙 Lunar Pup Hover</h1>
                    </div>
                    <HudPanels />
                </div>
            </main>
        </GameProvider>
    );
}
