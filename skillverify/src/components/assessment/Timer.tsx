import { useEffect, useState, useRef } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface TimerProps {
    durationSeconds: number
    onExpire: () => void
}

export default function Timer({ durationSeconds, onExpire }: TimerProps) {
    const [remaining, setRemaining] = useState(durationSeconds)
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    useEffect(() => {
        setRemaining(durationSeconds)
    }, [durationSeconds])

    useEffect(() => {
        if (durationSeconds <= 0) { onExpireRef.current(); return; }
        const timer = setInterval(() => {
            setRemaining((r) => {
                if (r <= 1) {
                    clearInterval(timer);
                    setTimeout(() => onExpireRef.current(), 0);
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [durationSeconds]);

    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60
    const pct = (remaining / durationSeconds) * 100
    const isWarning = remaining < 300 // < 5 min
    const isCritical = remaining < 60

    return (
        <div className={`flex items-center gap-3 glass px-4 py-2.5 rounded-xl border ${isCritical ? 'border-red-500/40 bg-red-500/10' :
            isWarning ? 'border-amber-500/30 bg-amber-500/5' :
                'border-white/10'
            }`}>
            {isCritical ? (
                <AlertTriangle size={16} className="text-red-400 animate-pulse" />
            ) : (
                <Clock size={16} className={isWarning ? 'text-amber-400' : 'text-blue-400'} />
            )}
            <span className={`font-mono font-semibold text-sm tabular-nums ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'
                }`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <div className="w-24 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}
