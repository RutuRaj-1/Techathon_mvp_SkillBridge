export type QuestionType = 'mcq' | 'code'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface MCQOption {
    id: string
    text: string
}

export interface MCQQuestion {
    id: string
    type: 'mcq'
    language: string
    topic: string
    question: string
    options: MCQOption[]
    correctAnswer: string
    difficulty: DifficultyLevel
    explanation: string
    points: number
}

export interface CodeQuestion {
    id: string
    type: 'code'
    language: string
    topic: string
    title: string
    description: string
    starterCode: string
    testCases: TestCase[]
    difficulty: DifficultyLevel
    hints: string[]
    points: number
    timeLimit: number // seconds
}

export interface TestCase {
    input: string
    expectedOutput: string
    description: string
}

export type Question = MCQQuestion | CodeQuestion

export interface MCQSubmission {
    questionId: string
    type: 'mcq'
    selectedAnswer: string
    timeTaken: number
    hintsUsed: number
}

export interface CodeSubmission {
    questionId: string
    type: 'code'
    code: string
    language: string
    timeTaken: number
    hintsUsed: number
    attempts: number
}

export type Submission = MCQSubmission | CodeSubmission

export interface AssessmentSession {
    sessionId: string
    userId: string
    languages: string[]
    questions: Question[]
    submissions: Submission[]
    startedAt: string
    completedAt?: string
    violations: number
    autoSubmitted: boolean
}
