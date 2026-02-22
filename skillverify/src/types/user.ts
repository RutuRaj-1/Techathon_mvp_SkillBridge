export type UserRole = 'student' | 'teacher'

export interface UserProfile {
    uid: string
    email: string
    displayName: string
    role: UserRole
    githubUsername?: string
    skills?: string[]
    interest?: string
    techPreferences?: {
        frontend?: string
        backend?: string
        database?: string
    }
    createdAt: string
    avatarUrl?: string
}

export interface StudentProfile extends UserProfile {
    role: 'student'
    assessmentCount: number
    latestScore?: number
    latestReportId?: string
}

export interface TeacherProfile extends UserProfile {
    role: 'teacher'
    studentIds: string[]
}
