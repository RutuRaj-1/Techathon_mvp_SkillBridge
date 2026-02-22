export interface RepoAnalysis {
    repoUrl: string
    owner: string
    repoName: string
    description: string
    stars: number
    forks: number
    language: string
    languages: Record<string, number>
    frameworks: string[]
    libraries: string[]
    features: string[]
    readmeLength: number
    hasTests: boolean
    hasCI: boolean
    lastUpdated: string
    repoStrengthScore: number
}

export interface SkillDimension {
    name: string
    score: number
    maxScore: number
    weight: number
    details: string
}

export interface SkillMetrics {
    questionAccuracy: number     // 0-100
    repoStrength: number         // 0-100
    behaviourPersistence: number // 0-100
    codeEfficiency: number       // 0-100
    integrityScore: number       // 0-100
    timeTaken: number            // seconds
    totalScore: number           // 0-100 weighted
}

export interface BehaviorData {
    totalTimeSpent: number    // seconds
    totalAttempts: number
    hintsUsed: number
    idleTime: number          // seconds
    tabSwitches: number
    averageTimePerQuestion: number
}

export interface SkillScore {
    language: string
    metrics: SkillMetrics
    behavior: BehaviorData
    dimensions: SkillDimension[]
    level: SkillLevel
    percentile: number
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

export interface LearningTask {
    week: number
    topic: string
    advancedKnowledge: string
    actionableTask: string
}

export interface SkillReport {
    reportId: string
    userId: string
    userName: string
    generatedAt: string
    repoAnalysis: RepoAnalysis
    scores: SkillScore[]
    overallScore: number
    aiExplanation: string
    improvementSuggestions: string[]
    strengths: string[]
    weaknesses: string[]
    learningPath?: LearningTask[]
}

export interface RadarDataPoint {
    skill: string
    score: number
    fullMark: number
}

export interface StudentSummary {
    uid: string
    displayName: string
    email: string
    overallScore: number
    skills: string[]
    level: SkillLevel
    assessmentCount: number
    lastAssessment: string
    scores: SkillScore[]
}
