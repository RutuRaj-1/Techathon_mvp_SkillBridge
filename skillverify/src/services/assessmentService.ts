import api from './api'
import { Question, Submission, AssessmentSession } from '../types/question'

export interface StartSessionPayload {
    languages: string[]
    userId: string
}

export interface SubmitPayload {
    sessionId: string
    submissions: Submission[]
    behavior: {
        totalTimeSpent: number
        totalAttempts: number
        hintsUsed: number
        idleTime: number
        tabSwitches: number
        averageTimePerQuestion: number
    }
    violations: number
    autoSubmitted: boolean
}

export async function getQuestions(languages: string[]): Promise<Question[]> {
    const response = await api.post<Question[]>('/api/assessment/questions', { languages })
    return response.data
}

export async function startSession(payload: StartSessionPayload): Promise<AssessmentSession> {
    const response = await api.post<AssessmentSession>('/api/assessment/start', payload)
    return response.data
}

export async function submitAssessment(payload: SubmitPayload): Promise<{ sessionId: string; reportId: string }> {
    const response = await api.post('/api/assessment/submit', payload)
    return response.data
}
