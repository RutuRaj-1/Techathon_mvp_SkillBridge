import { CheckCircle2, Circle } from 'lucide-react'
import { MCQQuestion } from '../../types/question'

interface QuestionCardProps {
    question: MCQQuestion
    questionNumber: number
    totalQuestions: number
    selectedAnswer: string | null
    onSelect: (answerId: string) => void
    isSubmitted: boolean
}

const DIFFICULTY_BADGE: Record<string, string> = {
    easy: 'badge-green',
    medium: 'badge-yellow',
    hard: 'badge-red',
}

export default function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    selectedAnswer,
    onSelect,
    isSubmitted,
}: QuestionCardProps) {
    return (
        <div className="card animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                        Question {questionNumber} of {totalQuestions}
                    </span>
                    <span className={`badge ${DIFFICULTY_BADGE[question.difficulty] || 'badge-blue'}`}>
                        {question.difficulty}
                    </span>
                    <span className="badge badge-purple">{question.language}</span>
                </div>
                <span className="text-sm font-medium text-amber-400">{question.points} pts</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-dark-600 rounded-full h-1 mb-5">
                <div
                    className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                />
            </div>

            {/* Question text */}
            <p className="text-white font-medium text-base leading-relaxed mb-6">{question.question}</p>

            {/* Options */}
            <div className="space-y-3">
                {question.options.map((option) => {
                    const isSelected = selectedAnswer === option.id
                    const isCorrect = isSubmitted && option.id === question.correctAnswer
                    const isWrong = isSubmitted && isSelected && option.id !== question.correctAnswer

                    let optionClass =
                        'flex items-start gap-3 w-full px-4 py-3 rounded-xl border transition-all duration-200 text-left cursor-pointer '

                    if (isCorrect) {
                        optionClass += 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    } else if (isWrong) {
                        optionClass += 'bg-red-500/10 border-red-500/40 text-red-300'
                    } else if (isSelected) {
                        optionClass += 'bg-blue-500/15 border-blue-500/50 text-blue-300'
                    } else {
                        optionClass += 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.07] hover:border-white/20'
                    }

                    return (
                        <button
                            key={option.id}
                            onClick={() => !isSubmitted && onSelect(option.id)}
                            className={optionClass}
                            disabled={isSubmitted}
                        >
                            <div className="mt-0.5 flex-shrink-0">
                                {isSelected ? (
                                    <CheckCircle2 size={18} className={isWrong ? 'text-red-400' : 'text-blue-400'} />
                                ) : (
                                    <Circle size={18} className="text-slate-600" />
                                )}
                            </div>
                            <span className="text-sm leading-relaxed">{option.text}</span>
                        </button>
                    )
                })}
            </div>

            {/* Explanation shown after submit */}
            {isSubmitted && question.explanation && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-xs font-semibold text-blue-400 mb-1">Explanation</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{question.explanation}</p>
                </div>
            )}
        </div>
    )
}
