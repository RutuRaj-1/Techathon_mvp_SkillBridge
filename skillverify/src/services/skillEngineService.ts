import api from './api'
import { SkillReport, StudentSummary } from '../types/skill'

export async function getSkillReport(reportId: string): Promise<SkillReport> {
    const response = await api.get<SkillReport>(`/api/report/${reportId}`)
    return response.data
}

export async function generateReport(sessionId: string): Promise<SkillReport> {
    const response = await api.post<SkillReport>('/api/report/generate', { session_id: sessionId })
    return response.data
}

export async function getAllStudentSummaries(): Promise<StudentSummary[]> {
    const response = await api.get<StudentSummary[]>('/api/skill/students')
    return response.data
}

export async function getStudentReport(userId: string): Promise<SkillReport> {
    const response = await api.get<SkillReport>(`/api/skill/student/${userId}/report`)
    return response.data
}
