import { useEffect, useRef, useState, useCallback } from 'react'

export interface ProctoringState {
    violations: number
    lastViolationType: string | null
    isWarningVisible: boolean
    isAutoSubmitted: boolean
    tabSwitches: number
}

const MAX_VIOLATIONS = 3

export function useProctoring(onAutoSubmit: () => void) {
    const [state, setState] = useState<ProctoringState>({
        violations: 0,
        lastViolationType: null,
        isWarningVisible: false,
        isAutoSubmitted: false,
        tabSwitches: 0,
    })

    const violationsRef = useRef(0)
    const isSubmittedRef = useRef(false)

    const recordViolation = useCallback((type: string) => {
        if (isSubmittedRef.current) return

        violationsRef.current += 1
        const count = violationsRef.current

        setState((prev) => ({
            ...prev,
            violations: count,
            lastViolationType: type,
            isWarningVisible: true,
            tabSwitches: type === 'tab_switch' ? prev.tabSwitches + 1 : prev.tabSwitches,
        }))

        if (count >= MAX_VIOLATIONS) {
            isSubmittedRef.current = true
            setState((prev) => ({ ...prev, isAutoSubmitted: true, isWarningVisible: false }))
            onAutoSubmit()
        }
    }, [onAutoSubmit])

    const dismissWarning = useCallback(() => {
        setState((prev) => ({ ...prev, isWarningVisible: false }))
    }, [])

    useEffect(() => {
        // Tab switch / visibility change detection
        const handleVisibilityChange = () => {
            if (document.hidden) {
                recordViolation('tab_switch')
            }
        }

        // Window blur (switching to another app)
        const handleBlur = () => {
            recordViolation('window_blur')
        }

        // Prevent right-click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            recordViolation('right_click')
        }

        // Prevent copy-paste shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a'].includes(e.key.toLowerCase())) {
                if ((e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'INPUT') {
                    recordViolation('keyboard_shortcut')
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('blur', handleBlur)
        document.addEventListener('contextmenu', handleContextMenu)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('blur', handleBlur)
            document.removeEventListener('contextmenu', handleContextMenu)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [recordViolation])

    return { ...state, dismissWarning, maxViolations: MAX_VIOLATIONS }
}
