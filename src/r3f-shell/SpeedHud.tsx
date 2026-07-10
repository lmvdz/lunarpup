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

    return <div id="speedometer" className="lp-gameplay" ref={ref}>0.0 U/S  | chunks 0</div>;
}
