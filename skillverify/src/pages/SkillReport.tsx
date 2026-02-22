import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import SkillRadarChart from '../components/dashboard/SkillRadarChart'
import SkillBarChart from '../components/dashboard/SkillBarChart'
import { getSkillReport, generateReport } from '../services/skillEngineService'
import { SkillReport as SkillReportType, RadarDataPoint } from '../types/skill'
import {
    BookOpen, Sparkles, TrendingUp, TrendingDown, CheckCircle2,
    AlertCircle, Download, RefreshCw, Loader2, Star
} from 'lucide-react'

// Demo report for when no reportId is provided
const DEMO_REPORT: SkillReportType = {
    reportId: 'demo_001',
    userId: 'demo',
    userName: 'Demo User',
    generatedAt: new Date().toISOString(),
    repoAnalysis: {
        repoUrl: 'https://github.com/example/demo',
        owner: 'example',
        repoName: 'demo-project',
        description: 'A sample React + Node.js project',
        stars: 142,
        forks: 28,
        language: 'TypeScript',
        languages: { TypeScript: 55, JavaScript: 25, CSS: 15, HTML: 5 },
        frameworks: ['React', 'Express', 'TailwindCSS'],
        libraries: ['axios', 'lodash', 'dayjs', 'zod'],
        features: ['REST API', 'Authentication', 'Database Integration'],
        readmeLength: 3821,
        hasTests: true,
        hasCI: true,
        lastUpdated: new Date().toISOString(),
        repoStrengthScore: 76,
    },
    scores: [
        {
            language: 'TypeScript',
            metrics: {
                questionAccuracy: 82,
                repoStrength: 76,
                behaviourPersistence: 88,
                codeEfficiency: 74,
                integrityScore: 100,
                timeTaken: 2240,
                totalScore: 84,
            },
            behavior: {
                totalTimeSpent: 2240,
                totalAttempts: 19,
                hintsUsed: 2,
                idleTime: 120,
                tabSwitches: 0,
                averageTimePerQuestion: 320,
            },
            dimensions: [],
            level: 'Advanced',
            percentile: 78,
        },
    ],
    overallScore: 84,
    aiExplanation: `Based on your performance across the TypeScript assessment and repository analysis, you demonstrate **Advanced-level competency** with a strong foundation in modern full-stack development.

Your **question accuracy of 82%** indicates solid understanding of TypeScript concepts, including generics, interfaces, and async patterns. The **repo strength score of 76/100** reflects good code organisation, documentation quality, and the presence of CI/CD — hallmarks of production-ready development.

**Behavioural persistence** was particularly impressive at 88% — you maintained focus throughout the session and relied minimally on hints (only 2 used), showing confidence in your approach. The **perfect integrity score of 100%** means zero proctoring violations, confirming a honest and independent performance.

Areas for growth: Your **code efficiency** score of 74% suggests opportunities to optimise algorithmic solutions — specifically around time complexity awareness and edge case handling in the coding challenges.`,
    improvementSuggestions: [
        'Practice algorithmic challenges focused on time/space complexity (LeetCode Medium-Hard)',
        'Deepen understanding of TypeScript advanced types: conditional types, mapped types, template literals',
        'Explore design patterns: Observer, Factory, Adapter in TypeScript',
        'Contribute to open-source projects to strengthen your collaboration skills',
    ],
    strengths: [
        'Strong TypeScript fundamentals and type safety practices',
        'Excellent behavioural persistence and focus during assessment',
        'Perfect proctoring integrity — trustworthy performance',
        'Good project documentation and CI/CD practices in your repo',
    ],
    weaknesses: [
        'Code efficiency and algorithmic optimisation needs improvement',
        'Some gaps in advanced TypeScript patterns',
    ],
}

export default function SkillReport() {
    const [searchParams] = useSearchParams()
    const reportId = searchParams.get('reportId')

    const [report, setReport] = useState<SkillReportType | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState<'radar' | 'bar'>('radar')

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                if (reportId && reportId !== 'demo_001') {
                    const data = await getSkillReport(reportId)
                    setReport(data)
                } else {
                    // Use demo data
                    await new Promise((r) => setTimeout(r, 800))
                    setReport(DEMO_REPORT)
                }
            } catch {
                setReport(DEMO_REPORT)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [reportId])

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-white font-semibold mb-1">Generating your AI report...</p>
                    <p className="text-slate-400 text-sm">Gemini 2.5 Flash is analysing your results</p>
                </div>
            </div>
        )
    }

    if (!report) return null

    const radarData: RadarDataPoint[] = [
        { skill: 'Accuracy', score: report.scores[0]?.metrics.questionAccuracy || 0, fullMark: 100 },
        { skill: 'Repo Strength', score: report.scores[0]?.metrics.repoStrength || 0, fullMark: 100 },
        { skill: 'Persistence', score: report.scores[0]?.metrics.behaviourPersistence || 0, fullMark: 100 },
        { skill: 'Code Efficiency', score: report.scores[0]?.metrics.codeEfficiency || 0, fullMark: 100 },
        { skill: 'Integrity', score: report.scores[0]?.metrics.integrityScore || 0, fullMark: 100 },
    ]

    const barData = radarData.map((d) => ({ name: d.skill, score: d.score }))

    const level = report.scores[0]?.level || 'Intermediate'
    const percentile = report.scores[0]?.percentile || 0

    const LEVEL_COLORS: Record<string, string> = {
        Beginner: 'badge-yellow',
        Intermediate: 'badge-blue',
        Advanced: 'badge-purple',
        Expert: 'badge-green',
    }

    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <Sidebar />
            <main className="lg:ml-64 pt-20 px-6 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                                <BookOpen size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Module 5 + 6</p>
                                <h1 className="text-xl font-bold text-white">Skill Intelligence Report</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`badge ${LEVEL_COLORS[level]}`}>{level}</span>
                            <span className="badge badge-yellow"><Star size={11} /> Top {100 - percentile}%</span>
                        </div>
                    </div>

                    {/* Overall score banner */}
                    <div className="card mb-6 bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="relative w-24 h-24 flex-shrink-0">
                                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                                    <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                    <circle
                                        cx="48" cy="48" r="40"
                                        fill="none"
                                        stroke="url(#scoreGrad)"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(report.overallScore / 100) * 251.2} 251.2`}
                                    />
                                    <defs>
                                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-white">{report.overallScore}</span>
                                    <span className="text-xs text-slate-500">/100</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold text-white">Overall Skill Score</h2>
                                </div>
                                <p className="text-slate-400 text-sm mb-3">
                                    Assessed on {new Date(report.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {report.scores.map((s) => (
                                        <div key={s.language} className="glass px-3 py-1.5 rounded-lg text-sm">
                                            <span className="text-slate-500 text-xs">{s.language}: </span>
                                            <span className="font-semibold text-white">{s.metrics.totalScore}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart tabs */}
                    <div className="card mb-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-semibold text-white">Skill Radar Analysis</h2>
                            <div className="flex gap-2">
                                {(['radar', 'bar'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${activeTab === tab ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-white'
                                            }`}
                                    >
                                        {tab === 'radar' ? 'Radar' : 'Bar Chart'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {activeTab === 'radar' ? (
                            <SkillRadarChart data={radarData} height={320} />
                        ) : (
                            <SkillBarChart data={barData} height={250} />
                        )}
                    </div>

                    {/* Score breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                        {radarData.map(({ skill, score }) => (
                            <div key={skill} className="card text-center py-4">
                                <p className="text-lg font-black gradient-text-blue">{score}</p>
                                <p className="text-xs text-slate-500 mt-1">{skill}</p>
                            </div>
                        ))}
                    </div>

                    {/* AI Explanation */}
                    <div className="card mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={18} className="text-violet-400" />
                            <h2 className="font-semibold text-white">AI Analysis</h2>
                            <span className="badge badge-purple">Gemini 2.5 Flash</span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                            {report.aiExplanation.split('\n\n').map((para, i) => (
                                <p key={i} className="text-slate-300 text-sm leading-relaxed mb-3" dangerouslySetInnerHTML={{
                                    __html: para.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        {/* Strengths */}
                        <div className="card">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={16} className="text-emerald-400" />
                                <h3 className="font-semibold text-white text-sm">Strengths</h3>
                            </div>
                            <div className="space-y-2.5">
                                {report.strengths.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-slate-300 leading-snug">{s}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weaknesses */}
                        <div className="card">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingDown size={16} className="text-amber-400" />
                                <h3 className="font-semibold text-white text-sm">Areas to Improve</h3>
                            </div>
                            <div className="space-y-2.5">
                                {report.weaknesses.map((w, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-slate-300 leading-snug">{w}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Improvement suggestions */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen size={16} className="text-blue-400" />
                            <h3 className="font-semibold text-white">Improvement Plan</h3>
                        </div>
                        <div className="space-y-3">
                            {report.improvementSuggestions.map((sug, i) => (
                                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
                                    <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed">{sug}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skill Engine: Learning Path */}
                    {(report.learningPath && report.learningPath.length > 0) && (
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-white">Skill Engine: Advanced Mastery Path</h2>
                                    <p className="text-xs text-slate-500">AI-generated weekly learning plan to accelerate your skills</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {report.learningPath.map((task) => (
                                    <div key={task.week} className="card border border-violet-500/10 hover:-translate-y-0.5 transition-transform">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-black text-violet-400">W{task.week}</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-violet-400 font-semibold uppercase tracking-wide">Week {task.week}</p>
                                                <p className="text-sm font-bold text-white leading-tight">{task.topic}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed mb-3">{task.advancedKnowledge}</p>
                                        <div className="bg-black/30 border border-violet-500/10 rounded-lg p-3">
                                            <p className="text-xs text-violet-300 font-semibold mb-1 flex items-center gap-1">
                                                <Star size={11} /> This Week's Task
                                            </p>
                                            <p className="text-xs text-slate-300 leading-relaxed">{task.actionableTask}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SkillEngine formula note */}
                    <div className="mt-6 glass rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">SkillEngine Formula</p>
                        <p className="text-xs text-slate-600 font-code leading-relaxed">
                            Score = (0.30 × Accuracy) + (0.20 × Repo Strength) + (0.20 × Behaviour Persistence)
                            + (0.15 × Code Efficiency) + (0.15 × Integrity) + Time Bonus
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
