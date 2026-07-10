import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MultiplayerStatus } from '../net/client.ts';
import type { MultiplayerConfig } from '../net/protocol.ts';

export type ChatLine = {
    id: string;
    kind: 'self' | 'remote' | 'system';
    text: string;
};

type UiPreferences = {
    showControls: boolean;
    showTuning: boolean;
    reducedMotion: boolean;
};

type SessionState = {
    remotePlayerIds: string[];
    multiplayerConfig: MultiplayerConfig | null;
    mpStatus: MultiplayerStatus;
    mpStatusDetail?: string;
    mpRoom?: string;
    mpHint: string;
    mpPlayers: string;
    chatLines: ChatLine[];
};

export type GameStore = UiPreferences & SessionState & {
    setUiPreference: <K extends keyof UiPreferences>(key: K, value: UiPreferences[K]) => void;
    setRemotePlayerIds: (ids: string[]) => void;
    setMultiplayerConfig: (config: MultiplayerConfig | null) => void;
    setMpStatus: (status: MultiplayerStatus, detail?: string, room?: string) => void;
    setMpHint: (hint: string) => void;
    setMpPlayers: (players: string) => void;
    pushChatLine: (line: ChatLine) => void;
    resetSession: () => void;
};

export const DEFAULT_MP_HINT = 'Add <code>?multiplayer&amp;room=your-room</code> to the URL';

const initialSession = (): SessionState => ({
    remotePlayerIds: [],
    multiplayerConfig: null,
    mpStatus: 'disconnected',
    mpStatusDetail: undefined,
    mpRoom: undefined,
    mpHint: DEFAULT_MP_HINT,
    mpPlayers: 'Just you',
    chatLines: [],
});

export const useGameStore = create<GameStore>()(
    persist(
        (set) => ({
            showControls: true,
            showTuning: false,
            reducedMotion: false,
            ...initialSession(),
            setUiPreference: (key, value) => set({ [key]: value }),
            setRemotePlayerIds: (ids) => set({ remotePlayerIds: ids }),
            setMultiplayerConfig: (config) => set({ multiplayerConfig: config }),
            setMpStatus: (status, detail, room) => set({
                mpStatus: status,
                mpStatusDetail: detail,
                mpRoom: room,
            }),
            setMpHint: (hint) => set({ mpHint: hint }),
            setMpPlayers: (players) => set({ mpPlayers: players }),
            pushChatLine: (line) => set((state) => ({
                chatLines: [...state.chatLines.slice(-59), line],
            })),
            resetSession: () => set(initialSession()),
        }),
        {
            name: 'lunarpup-ui',
            partialize: (state) => ({
                showControls: state.showControls,
                showTuning: state.showTuning,
                reducedMotion: state.reducedMotion,
            }),
        },
    ),
);
