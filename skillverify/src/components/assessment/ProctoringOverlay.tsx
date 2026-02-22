import { AlertTriangle, X } from 'lucide-react'

interface ProctoringOverlayProps {
    violationCount: number
    maxViolations: number
    violationType: string | null
    onDismiss: () => void
}

const VIOLATION_MESSAGES: Record<string, { title: string; msg: string }> = {
    tab_switch: {
        title: 'Tab Switch Detected',
        msg: 'You navigated away from the assessment tab. This is a proctoring violation.',
    },
    window_blur: {
        title: 'Window Focus Lost',
        msg: 'You switched to another application window during the assessment.',
    },
    right_click: {
        title: 'Right-Click Blocked',
        msg: 'Right-clicking is not allowed during the assessment.',
    },
    keyboard_shortcut: {
        title: 'Keyboard Shortcut Blocked',
        msg: 'Certain keyboard shortcuts are disabled during the assessment.',
    },
}

export default function ProctoringOverlay({
    violationCount,
    maxViolations,
    violationType,
    onDismiss,
}: ProctoringOverlayProps) {
    const info = violationType ? VIOLATION_MESSAGES[violationType] : null
    const remaining = maxViolations - violationCount

    return (
        <div className="proctoring-alert animate-fade-in">
            <div className="glass-dark border border-red-500/30 rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-slide-up">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                    <AlertTriangle size={28} className="text-red-400" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white text-center mb-2">
                    ⚠️ {info?.title || 'Violation Detected'}
                </h2>
                <p className="text-sm text-slate-400 text-center leading-relaxed mb-5">
                    {info?.msg || 'A proctoring violation has been recorded.'}
                </p>

                {/* Violation count */}
                <div className="glass rounded-xl p-4 mb-5 text-center">
                    <p className="text-sm text-slate-500 mb-1">Violations Recorded</p>
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: maxViolations }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${i < violationCount
                                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                        : 'bg-white/5 border-white/10 text-slate-600'
                                    }`}
                            >
                                {i < violationCount ? '✗' : i + 1}
                            </div>
                        ))}
                    </div>
                    <p className={`text-sm font-medium mt-3 ${remaining <= 1 ? 'text-red-400' : 'text-amber-400'}`}>
                        {remaining <= 0
                            ? 'Assessment auto-submitted!'
                            : `${remaining} violation${remaining === 1 ? '' : 's'} remaining before auto-submit`}
                    </p>
                </div>

                <button onClick={onDismiss} className="btn-primary w-full flex items-center justify-center gap-2">
                    <X size={16} />
                    I Understand – Resume Assessment
                </button>
            </div>
        </div>
    )
}
