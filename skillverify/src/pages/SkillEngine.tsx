import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import { getSkillReport } from '../services/skillEngineService'
import { db, collection, getDocs, query, where } from '../services/firebase'
import { LearningTask } from '../types/skill'
import {
    Brain, Sparkles, Star, Calendar, Zap,
    TrendingUp, BookOpen, ArrowRight, Loader2, CheckCircle2
} from 'lucide-react'

const WEEK_COLORS = [
    'from-violet-500 to-purple-700',
    'from-blue-500 to-blue-700',
    'from-emerald-500 to-teal-700',
    'from-amber-500 to-orange-700',
]

const WEEK_BADGE_COLORS = [
    'bg-violet-500/15 border-violet-500/30 text-violet-400',
    'bg-blue-500/15 border-blue-500/20 text-blue-400',
    'bg-emerald-500/15 border-emerald-500/20 text-emerald-400',
    'bg-amber-500/15 border-amber-500/20 text-amber-400',
]

export default function SkillEngine() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [learningPath, setLearningPath] = useState<LearningTask[]>([])
    const [language, setLanguage] = useState('')
    const [overallScore, setOverallScore] = useState(0)
    const [level, setLevel] = useState('')
    const [activeWeek, setActiveWeek] = useState<number | null>(null)

    useEffect(() => {
        const load = async () => {
            if (!user) return
            setLoading(true)
            try {
                // Get latest assessment report from Firestore
                const q = query(collection(db, "users", user.uid, "assessment_reports"))
                const snap = await getDocs(q)
                let latestReport: any = null
                let latestDate = 0

                snap.forEach(doc => {
                    const d = doc.data()
                    const date = new Date(d.submittedAt || 0).getTime()
                    if (date > latestDate) {
                        latestDate = date
                        latestReport = d
                    }
                })

                if (latestReport?.reportData) {
                    const rd = latestReport.reportData
                    setLearningPath(rd.learningPath || [])
                    setLanguage(rd.scores?.[0]?.language || '')
                    setOverallScore(rd.overallScore || 0)
                    setLevel(rd.scores?.[0]?.level || '')
                } else if (latestReport?.reportId) {
                    // Fall back: fetch from backend API
                    const data = await getSkillReport(latestReport.reportId)
                    setLearningPath(data.learningPath || [])
                    setLanguage(data.scores?.[0]?.language || '')
                    setOverallScore(data.overallScore || 0)
                    setLevel(data.scores?.[0]?.level || '')
                }
            } catch (err) {
                console.error('Failed to load Skill Engine data', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <Sidebar />
            <main className="lg:ml-64 pt-20 px-6 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center glow-blue">
                            <Brain size={24} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Module 4</p>
                                <span className="badge badge-purple">Skill Engine</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Advanced Mastery Path</h1>
                            <p className="text-slate-400 text-sm">AI-personalized weekly tasks to build real, measurable skills</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <div className="text-center">
                                <Loader2 size={36} className="animate-spin text-violet-400 mx-auto mb-4" />
                                <p className="text-slate-300 font-medium">Loading your Skill Engine...</p>
                                <p className="text-slate-500 text-sm mt-1">Fetching your latest assessment data</p>
                            </div>
                        </div>
                    ) : learningPath.length === 0 ? (
                        <div className="card text-center py-16 border border-dashed border-violet-500/20">
                            <Sparkles size={40} className="text-violet-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">No Learning Path Yet</h2>
                            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
                                Complete an assessment first. The Skill Engine will generate a personalized 4-week mastery plan based on your results.
                            </p>
                            <a href="/assessment" className="btn-primary inline-flex items-center gap-2">
                                <Zap size={16} /> Take Assessment
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* Stats banner */}
                            {language && (
                                <div className="glass rounded-2xl p-5 border border-violet-500/15 mb-8 flex items-center gap-6 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 flex items-center justify-center">
                                            <TrendingUp size={18} className="text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Language</p>
                                            <p className="text-sm font-bold text-white">{language}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                            <Star size={18} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Current Level</p>
                                            <p className="text-sm font-bold text-white">{level || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center">
                                            <BookOpen size={18} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Skill Score</p>
                                            <p className="text-sm font-bold text-white">{overallScore}/100</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center">
                                            <Calendar size={18} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Learning Plan</p>
                                            <p className="text-sm font-bold text-white">{learningPath.length} Weeks</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Weekly task cards */}
                            <div className="space-y-4">
                                {learningPath.map((task, idx) => {
                                    const isOpen = activeWeek === task.week
                                    return (
                                        <div
                                            key={task.week}
                                            className={`card border transition-all duration-300 ${isOpen ? 'border-violet-500/30' : 'border-white/5 hover:border-violet-500/15'}`}
                                        >
                                            {/* Card header */}
                                            <button
                                                onClick={() => setActiveWeek(isOpen ? null : task.week)}
                                                className="w-full flex items-center gap-4 text-left"
                                            >
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${WEEK_COLORS[idx % 4]} flex items-center justify-center flex-shrink-0`}>
                                                    <span className="text-white font-black text-sm">W{task.week}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-semibold ${WEEK_BADGE_COLORS[idx % 4]}`}>
                                                            Week {task.week}
                                                        </span>
                                                    </div>
                                                    <p className="font-bold text-white text-sm truncate">{task.topic}</p>
                                                </div>
                                                <ArrowRight
                                                    size={16}
                                                    className={`text-slate-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                                                />
                                            </button>

                                            {/* Expanded content */}
                                            {isOpen && (
                                                <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                                                    {/* Advanced Knowledge */}
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                                                            <Brain size={11} /> Advanced Knowledge
                                                        </p>
                                                        <p className="text-sm text-slate-300 leading-relaxed">{task.advancedKnowledge}</p>
                                                    </div>

                                                    {/* Actionable Task */}
                                                    <div className="bg-black/30 border border-violet-500/15 rounded-xl p-4">
                                                        <p className="text-xs text-violet-400 font-semibold mb-2 flex items-center gap-1">
                                                            <CheckCircle2 size={12} /> This Week's Task
                                                        </p>
                                                        <p className="text-sm text-white leading-relaxed">{task.actionableTask}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <p className="text-xs text-slate-600 text-center mt-8 flex items-center justify-center gap-1">
                                <Sparkles size={11} /> Generated by Gemini 2.5 Flash based on your assessment results
                            </p>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
