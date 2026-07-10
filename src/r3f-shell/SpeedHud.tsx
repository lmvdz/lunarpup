import { useEffect, useRef, useState } from 'react';
import { useGame } from './GameProvider.tsx';

const GAUGE_RADIUS = 22;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

function parseSpeedText(text: string) {
    const match = text.match(/^([\d.]+)\s+U\/S(?:\s+\|\s+rings\s+(\d+))?(?:\s+(BOOST))?/);
    const speed = match ? Number.parseFloat(match[1]!) : 0;
    const rings = match?.[2] ? Number.parseInt(match[2], 10) : 0;
    const boosting = Boolean(match?.[3]);
    const ratio = Math.min(speed / 240, 1);
    return { speed, rings, boosting, ratio };
}

export function SpeedHud() {
    const { runtime } = useGame();
    const fillRef = useRef<SVGCircleElement>(null);
    const valueRef = useRef<HTMLSpanElement>(null);
    const metaRef = useRef<HTMLSpanElement>(null);
    const boostRef = useRef<HTMLSpanElement>(null);
    const [dashOffset, setDashOffset] = useState(GAUGE_CIRCUMFERENCE);

    useEffect(() => {
        runtime.current.frameHud.setSpeedText = (text) => {
            const parsed = parseSpeedText(text);
            if (valueRef.current) valueRef.current.textContent = `${parsed.speed.toFixed(1)} U/S`;
            if (metaRef.current) metaRef.current.textContent = `Rings ${parsed.rings}`;
            if (boostRef.current) boostRef.current.hidden = !parsed.boosting;
            setDashOffset(GAUGE_CIRCUMFERENCE * (1 - parsed.ratio));
        };

        return () => {
            delete runtime.current.frameHud.setSpeedText;
        };
    }, [runtime]);

    return (
        <div id="speedometer" role="status" aria-label="Speed and terrain info">
            <svg className="speed-gauge" viewBox="0 0 54 54" aria-hidden="true">
                <circle className="speed-gauge-track" cx="27" cy="27" r={GAUGE_RADIUS} />
                <circle
                    ref={fillRef}
                    className="speed-gauge-fill"
                    cx="27"
                    cy="27"
                    r={GAUGE_RADIUS}
                    strokeDasharray={GAUGE_CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                />
            </svg>
            <div className="speed-readout">
                <span ref={valueRef} className="speed-value">0.0 U/S</span>
                <span ref={metaRef} className="speed-meta">Rings 0</span>
                <span ref={boostRef} className="speed-meta speed-boost" hidden>BOOST</span>
            </div>
        </div>
    );
}
