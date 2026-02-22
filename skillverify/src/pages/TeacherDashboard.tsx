import { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import StudentCard from '../components/dashboard/StudentCard'
import SkillRadarChart from '../components/dashboard/SkillRadarChart'
import { getAllStudentSummaries } from '../services/skillEngineService'
import { StudentSummary, SkillLevel } from '../types/skill'
import {
    LayoutDashboard, Users, TrendingUp, Award, Search,
    Filter, ChevronDown, X
} from 'lucide-react'

const DEMO_STUDENTS: StudentSummary[] = [
    {
        uid: 's1', displayName: 'Alice Johnson', email: 'alice@example.com',
        overallScore: 91, skills: ['Python', 'React', 'TypeScript'], level: 'Expert',
        assessmentCount: 5, lastAssessment: '2025-02-18T14:00:00Z',
        scores: [{
            language: 'Python', metrics: { questionAccuracy: 94, repoStrength: 88, behaviourPersistence: 92, codeEfficiency: 86, integrityScore: 100, timeTaken: 1800, totalScore: 91 },
            behavior: { totalTimeSpent: 1800, totalAttempts: 21, hintsUsed: 1, idleTime: 60, tabSwitches: 0, averageTimePerQuestion: 257 },
            dimensions: [], level: 'Expert', percentile: 92,
        }],
    },
    {
        uid: 's2', displayName: 'Bob Chen', email: 'bob@example.com',
        overallScore: 73, skills: ['JavaScript', 'Node.js'], level: 'Advanced',
        assessmentCount: 3, lastAssessment: '2025-02-19T10:30:00Z',
        scores: [{
            language: 'JavaScript', metrics: { questionAccuracy: 75, repoStrength: 70, behaviourPersistence: 80, codeEfficiency: 68, integrityScore: 90, timeTaken: 2100, totalScore: 73 },
            behavior: { totalTimeSpent: 2100, totalAttempts: 18, hintsUsed: 3, idleTime: 200, tabSwitches: 1, averageTimePerQuestion: 300 },
            dimensions: [], level: 'Advanced', percentile: 65,
        }],
    },
    {
        uid: 's3', displayName: 'Carol Martinez', email: 'carol@example.com',
        overallScore: 58, skills: ['Python', 'Django'], level: 'Intermediate',
        assessmentCount: 2, lastAssessment: '2025-02-17T16:45:00Z',
        scores: [{
            language: 'Python', metrics: { questionAccuracy: 60, repoStrength: 55, behaviourPersistence: 65, codeEfficiency: 50, integrityScore: 85, timeTaken: 2800, totalScore: 58 },
            behavior: { totalTimeSpent: 2800, totalAttempts: 14, hintsUsed: 5, idleTime: 400, tabSwitches: 2, averageTimePerQuestion: 400 },
            dimensions: [], level: 'Intermediate', percentile: 45,
        }],
    },
    {
        uid: 's4', displayName: 'David Park', email: 'david@example.com',
        overallScore: 38, skills: ['JavaScript'], level: 'Beginner',
        assessmentCount: 1, lastAssessment: '2025-02-20T09:00:00Z',
        scores: [{
            language: 'JavaScript', metrics: { questionAccuracy: 40, repoStrength: 35, behaviourPersistence: 45, codeEfficiency: 30, integrityScore: 70, timeTaken: 3200, totalScore: 38 },
            behavior: { totalTimeSpent: 3200, totalAttempts: 10, hintsUsed: 7, idleTime: 600, tabSwitches: 3, averageTimePerQuestion: 457 },
            dimensions: [], level: 'Beginner', percentile: 22,
        }],
    },
    {
        uid: 's5', displayName: 'Emma Wilson', email: 'emma@example.com',
        overallScore: 85, skills: ['React', 'TypeScript', 'GraphQL'], level: 'Advanced',
        assessmentCount: 4, lastAssessment: '2025-02-20T12:00:00Z',
        scores: [{
            language: 'TypeScript', metrics: { questionAccuracy: 88, repoStrength: 82, behaviourPersistence: 90, codeEfficiency: 78, integrityScore: 100, timeTaken: 2000, totalScore: 85 },
            behavior: { totalTimeSpent: 2000, totalAttempts: 20, hintsUsed: 2, idleTime: 100, tabSwitches: 0, averageTimePerQuestion: 286 },
            dimensions: [], level: 'Advanced', percentile: 80,
        }],
    },
    {
        uid: 's6', displayName: 'Frank Liu', email: 'frank@example.com',
        overallScore: 66, skills: ['Java', 'Spring Boot'], level: 'Intermediate',
        assessmentCount: 2, lastAssessment: '2025-02-16T11:00:00Z',
        scores: [{
            language: 'Java', metrics: { questionAccuracy: 68, repoStrength: 65, behaviourPersistence: 72, codeEfficiency: 60, integrityScore: 95, timeTaken: 2400, totalScore: 66 },
            behavior: { totalTimeSpent: 2400, totalAttempts: 16, hintsUsed: 4, idleTime: 250, tabSwitches: 1, averageTimePerQuestion: 343 },
            dimensions: [], level: 'Intermediate', percentile: 55,
        }],
    },
]

const LEVEL_OPTIONS: (SkillLevel | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert']

export default function TeacherDashboard() {
    const [students, setStudents] = useState<StudentSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterLevel, setFilterLevel] = useState<SkillLevel | 'All'>('All')
    const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score')
    const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getAllStudentSummaries()
                setStudents(data.length > 0 ? data : DEMO_STUDENTS)
            } catch {
                setStudents(DEMO_STUDENTS)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = students
        .filter((s) => {
            const matchSearch = s.displayName.toLowerCase().includes(search.toLowerCase()) ||
                s.email.toLowerCase().includes(search.toLowerCase()) ||
                s.skills.some((sk) => sk.toLowerCase().includes(search.toLowerCase()))
            const matchLevel = filterLevel === 'All' || s.level === filterLevel
            return matchSearch && matchLevel
        })
        .sort((a, b) => {
            if (sortBy === 'score') return b.overallScore - a.overallScore
            if (sortBy === 'name') return a.displayName.localeCompare(b.displayName)
            return new Date(b.lastAssessment).getTime() - new Date(a.lastAssessment).getTime()
        })

    const avgScore = students.length > 0 ? Math.round(students.reduce((s, st) => s + st.overallScore, 0) / students.length) : 0
    const levelCounts = students.reduce((acc, s) => {
        acc[s.level] = (acc[s.level] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const classRadar = [
        { skill: 'Accuracy', score: Math.round(students.reduce((s, st) => s + (st.scores[0]?.metrics.questionAccuracy || 0), 0) / Math.max(students.length, 1)), fullMark: 100 },
        { skill: 'Repo Strength', score: Math.round(students.reduce((s, st) => s + (st.scores[0]?.metrics.repoStrength || 0), 0) / Math.max(students.length, 1)), fullMark: 100 },
        { skill: 'Persistence', score: Math.round(students.reduce((s, st) => s + (st.scores[0]?.metrics.behaviourPersistence || 0), 0) / Math.max(students.length, 1)), fullMark: 100 },
        { skill: 'Code Efficiency', score: Math.round(students.reduce((s, st) => s + (st.scores[0]?.metrics.codeEfficiency || 0), 0) / Math.max(students.length, 1)), fullMark: 100 },
        { skill: 'Integrity', score: Math.round(students.reduce((s, st) => s + (st.scores[0]?.metrics.integrityScore || 0), 0) / Math.max(students.length, 1)), fullMark: 100 },
    ]

    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <Sidebar />
            <main className="lg:ml-64 pt-20 px-6 pb-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                            <LayoutDashboard size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Module 7</p>
                            <h1 className="text-xl font-bold text-white">Teacher Dashboard</h1>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            { icon: Users, label: 'Total Students', value: students.length.toString(), color: 'text-blue-400', bg: 'bg-blue-500/10' },
                            { icon: TrendingUp, label: 'Average Score', value: `${avgScore}/100`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                            { icon: Award, label: 'Expert Level', value: (levelCounts['Expert'] || 0).toString(), color: 'text-violet-400', bg: 'bg-violet-500/10' },
                            { icon: TrendingUp, label: 'Assessed Today', value: students.filter(s => new Date(s.lastAssessment).toDateString() === new Date().toDateString()).length.toString(), color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        ].map(({ icon: Icon, label, value, color, bg }) => (
                            <div key={label} className="card">
                                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                                    <Icon size={17} className={color} />
                                </div>
                                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                                <p className={`text-xl font-bold ${color}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Class radar */}
                    <div className="card mb-8">
                        <h2 className="font-semibold text-white mb-5">Class Average Skill Radar</h2>
                        <SkillRadarChart data={classRadar} height={280} />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                id="student-search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-10 text-sm"
                                placeholder="Search students by name, email, or skill..."
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X size={14} className="text-slate-500 hover:text-white" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {/* Level filter */}
                            <div className="relative">
                                <select
                                    id="level-filter"
                                    value={filterLevel}
                                    onChange={(e) => setFilterLevel(e.target.value as SkillLevel | 'All')}
                                    className="input-field pr-8 text-sm appearance-none w-auto"
                                >
                                    {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Sort */}
                            <div className="relative">
                                <select
                                    id="sort-by"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className="input-field pr-8 text-sm appearance-none w-auto"
                                >
                                    <option value="score">Sort: Score</option>
                                    <option value="name">Sort: Name</option>
                                    <option value="date">Sort: Recent</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Results count */}
                    <p className="text-sm text-slate-500 mb-4">
                        Showing <span className="text-white font-medium">{filtered.length}</span> of {students.length} students
                    </p>

                    {/* Student grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-white/5 rounded w-2/3" />
                                            <div className="h-2 bg-white/5 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="h-12 bg-white/5 rounded-xl mb-4" />
                                    <div className="flex gap-2">
                                        <div className="h-5 bg-white/5 rounded-full w-16" />
                                        <div className="h-5 bg-white/5 rounded-full w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 glass rounded-2xl">
                            <Users size={40} className="mx-auto text-slate-600 mb-3" />
                            <p className="text-white font-semibold mb-1">No students found</p>
                            <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((student) => (
                                <StudentCard
                                    key={student.uid}
                                    student={student}
                                    onClick={() => setSelectedStudent(student)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Student detail modal */}
                    {selectedStudent && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}>
                            <div className="glass-dark border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold">
                                            {selectedStudent.displayName[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{selectedStudent.displayName}</h3>
                                            <p className="text-sm text-slate-500">{selectedStudent.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedStudent(null)} className="glass p-2 rounded-lg hover:bg-white/10">
                                        <X size={16} />
                                    </button>
                                </div>

                                {selectedStudent.scores[0] && (
                                    <SkillRadarChart data={[
                                        { skill: 'Accuracy', score: selectedStudent.scores[0].metrics.questionAccuracy, fullMark: 100 },
                                        { skill: 'Repo', score: selectedStudent.scores[0].metrics.repoStrength, fullMark: 100 },
                                        { skill: 'Persistence', score: selectedStudent.scores[0].metrics.behaviourPersistence, fullMark: 100 },
                                        { skill: 'Code', score: selectedStudent.scores[0].metrics.codeEfficiency, fullMark: 100 },
                                        { skill: 'Integrity', score: selectedStudent.scores[0].metrics.integrityScore, fullMark: 100 },
                                    ]} height={240} />
                                )}

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    {[
                                        { label: 'Overall Score', value: `${selectedStudent.overallScore}/100` },
                                        { label: 'Level', value: selectedStudent.level },
                                        { label: 'Assessments', value: selectedStudent.assessmentCount.toString() },
                                        { label: 'Tab Switches', value: (selectedStudent.scores[0]?.behavior.tabSwitches || 0).toString() },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="glass rounded-xl p-3 text-center">
                                            <p className="text-xs text-slate-500 mb-1">{label}</p>
                                            <p className="font-semibold text-white text-sm">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
