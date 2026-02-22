import { useCallback, useEffect, useRef, useState } from 'react'
import { BehaviorData } from '../types/skill'

const IDLE_THRESHOLD = 30 // seconds of no activity = idle

export function useBehaviorTracking() {
    const startTimeRef = useRef<number>(Date.now())
    const lastActivityRef = useRef<number>(Date.now())
    const idleTimeRef = useRef<number>(0)
    const attemptsRef = useRef<number>(0)
    const hintsUsedRef = useRef<number>(0)
    const questionTimesRef = useRef<number[]>([])
    const questionStartRef = useRef<number>(Date.now())

    const [snapshot, setSnapshot] = useState<BehaviorData>({
        totalTimeSpent: 0,
        totalAttempts: 0,
        hintsUsed: 0,
        idleTime: 0,
        tabSwitches: 0,
        averageTimePerQuestion: 0,
    })

    // Track activity for idle detection
    useEffect(() => {
        const trackActivity = () => {
            const now = Date.now()
            const gap = (now - lastActivityRef.current) / 1000
            if (gap > IDLE_THRESHOLD) {
                idleTimeRef.current += gap
            }
            lastActivityRef.current = now
        }

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
        events.forEach((e) => window.addEventListener(e, trackActivity))

        const ticker = setInterval(() => {
            const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000)
            const avgTime =
                questionTimesRef.current.length > 0
                    ? questionTimesRef.current.reduce((a, b) => a + b, 0) / questionTimesRef.current.length
                    : 0

            setSnapshot({
                totalTimeSpent: totalTime,
                totalAttempts: attemptsRef.current,
                hintsUsed: hintsUsedRef.current,
                idleTime: Math.round(idleTimeRef.current),
                tabSwitches: 0, // passed from proctoring hook externally
                averageTimePerQuestion: Math.round(avgTime),
            })
        }, 1000)

        return () => {
            events.forEach((e) => window.removeEventListener(e, trackActivity))
            clearInterval(ticker)
        }
    }, [])

    const recordAttempt = useCallback(() => {
        attemptsRef.current += 1
    }, [])

    const recordHint = useCallback(() => {
        hintsUsedRef.current += 1
    }, [])

    const onNextQuestion = useCallback(() => {
        const elapsed = (Date.now() - questionStartRef.current) / 1000
        questionTimesRef.current.push(elapsed)
        questionStartRef.current = Date.now()
    }, [])

    const getBehaviorData = useCallback((tabSwitches = 0): BehaviorData => {
        const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000)
        const avgTime =
            questionTimesRef.current.length > 0
                ? questionTimesRef.current.reduce((a, b) => a + b, 0) / questionTimesRef.current.length
                : 0
        return {
            totalTimeSpent: totalTime,
            totalAttempts: attemptsRef.current,
            hintsUsed: hintsUsedRef.current,
            idleTime: Math.round(idleTimeRef.current),
            tabSwitches,
            averageTimePerQuestion: Math.round(avgTime),
        }
    }, [])

    return { snapshot, recordAttempt, recordHint, onNextQuestion, getBehaviorData }
}
