import { TrendingUp, Award, ExternalLink, Calendar, Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StudentSummary, SkillLevel } from '../../types/skill'

interface StudentCardProps {
    student: StudentSummary
    onClick: () => void
}

const LEVEL_BADGE: Record<SkillLevel, string> = {
    Beginner: 'badge-yellow',
    Intermediate: 'badge-blue',
    Advanced: 'badge-purple',
    Expert: 'badge-green',
}

export default function StudentCard({ student, onClick }: StudentCardProps) {
    const pct = student.overallScore
    const bgGradient = pct >= 80 ? 'from-emerald-500/20' : pct >= 60 ? 'from-blue-500/20' : pct >= 40 ? 'from-amber-500/20' : 'from-red-500/20'

    return (
        <div
            onClick={onClick}
            className={`card cursor-pointer border-glow hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 bg-gradient-to-br ${bgGradient} to-transparent`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-sm">
                        {student.displayName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-white text-sm">{student.displayName}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[140px]">{student.email}</p>
                    </div>
                </div>
                <span className={`badge ${LEVEL_BADGE[student.level]}`}>{student.level}</span>
            </div>

            {/* Score ring */}
            <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 flex-shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                        <circle
                            cx="28" cy="28" r="22"
                            fill="none"
                            stroke={pct >= 80 ? '#10b981' : pct >= 60 ? '#3b82f6' : pct >= 40 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={`${(pct / 100) * 138.2} 138.2`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{pct}</span>
                    </div>
                </div>
                <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">Overall Score</p>
                    <div className="w-full bg-dark-600 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{student.assessmentCount} assessment{student.assessmentCount !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Skills */}
            {student.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {student.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="badge badge-blue text-xs">{skill}</span>
                    ))}
                    {student.skills.length > 4 && <span className="badge text-xs text-slate-500 bg-white/5">+{student.skills.length - 4}</span>}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Calendar size={12} />
                    {student.lastAssessment ? new Date(student.lastAssessment).toLocaleDateString() : 'Never'}
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-400">
                    View Report <ExternalLink size={11} />
                </div>
            </div>
        </div>
    )
}
