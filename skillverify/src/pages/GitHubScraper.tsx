import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import { analyzeGitHubRepo } from '../services/githubService'
import { RepoAnalysis } from '../types/skill'
import {
    Github, Search, Star, GitFork, FileText, CheckCircle2,
    AlertCircle, Code2, Package, Layers, ArrowRight, ExternalLink,
    Loader2, Plus, Trash2, ChevronDown, ChevronRight, Zap
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { db, collection, addDoc } from '../services/firebase'

interface RepoJob {
    url: string
    status: 'idle' | 'loading' | 'success' | 'error'
    result: RepoAnalysis | null
    error: string
}

const SAMPLE_REPOS = [
    'https://github.com/facebook/react',
    'https://github.com/microsoft/vscode',
    'https://github.com/tiangolo/fastapi',
]

export default function GitHubScraper() {
    const [jobs, setJobs] = useState<RepoJob[]>([{ url: '', status: 'idle', result: null, error: '' }])
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
    const [allDone, setAllDone] = useState(false)
    const navigate = useNavigate()
    const { profile, user } = useAuth()

    const validateUrl = (url: string) =>
        /^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/.test(url.trim())

    const updateJob = (idx: number, patch: Partial<RepoJob>) =>
        setJobs(jobs => jobs.map((j, i) => i === idx ? { ...j, ...patch } : j))

    const addRepo = () => {
        setJobs(prev => [...prev, { url: '', status: 'idle', result: null, error: '' }])
    }

    const removeRepo = (idx: number) => {
        if (jobs.length === 1) return
        setJobs(prev => prev.filter((_, i) => i !== idx))
    }

    const analyzeOne = async (idx: number) => {
        const job = jobs[idx]
        if (!validateUrl(job.url)) {
            updateJob(idx, { status: 'error', error: 'Please enter a valid GitHub repository URL (e.g. https://github.com/user/repo)' })
            return
        }
        updateJob(idx, { status: 'loading', error: '' })
        try {
            const data = await analyzeGitHubRepo(job.url.trim())
            updateJob(idx, { status: 'success', result: data })
            setExpandedIdx(idx)

            // Save to Firestore
            if (user) {
                await addDoc(collection(db, 'github_analysis'), {
                    userId: user.uid,
                    ...JSON.parse(JSON.stringify(data)),
                    scrapedAt: new Date().toISOString(),
                })
            }
        } catch (err: unknown) {
            updateJob(idx, { status: 'error', error: err instanceof Error ? err.message : 'Analysis failed. Please try again.' })
        }
    }

    const analyzeAll = async () => {
        for (let i = 0; i < jobs.length; i++) {
            if (jobs[i].status !== 'success') await analyzeOne(i)
        }
        setAllDone(true)
    }

    // Collect all unique detected languages across all analysed repos → carry to Assessment
    const goToAssessment = () => {
        const langs: string[] = []
        jobs.forEach(j => {
            if (j.result) {
                const primary = j.result.language
                if (primary && !langs.includes(primary)) langs.push(primary)
                Object.keys(j.result.languages || {}).forEach(l => {
                    if (!langs.includes(l) && l !== primary) langs.push(l)
                })
            }
        })
        // Persist languages for Assessment page to pick up
        if (langs.length) localStorage.setItem('sb_detected_languages', JSON.stringify(langs.slice(0, 5)))
        navigate('/assessment')
    }

    const successCount = jobs.filter(j => j.status === 'success').length

    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <Sidebar />
            <main className="lg:ml-64 pt-20 px-6 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
                                <Github size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Module 1</p>
                                <h1 className="text-xl font-bold text-white">GitHub Repository Analysis</h1>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm ml-13">
                            Add one or more of your GitHub project repos. Our AI scraper extracts your real tech stack, frameworks, libraries, and project quality metrics — forming the foundation of your skill profile.
                        </p>
                    </div>

                    {/* Repo list */}
                    <div className="space-y-4 mb-4">
                        {jobs.map((job, idx) => (
                            <div key={idx} className="card border border-white/5">
                                {/* URL Row */}
                                <div className="flex gap-3 mb-2">
                                    <div className="relative flex-1">
                                        <Github size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="url"
                                            value={job.url}
                                            onChange={(e) => updateJob(idx, { url: e.target.value, status: 'idle', error: '' })}
                                            onKeyDown={(e) => e.key === 'Enter' && analyzeOne(idx)}
                                            className="input-field pl-10"
                                            placeholder="https://github.com/username/repository"
                                            disabled={job.status === 'loading'}
                                        />
                                    </div>
                                    <button
                                        onClick={() => analyzeOne(idx)}
                                        disabled={job.status === 'loading' || !job.url.trim()}
                                        className="btn-primary flex items-center gap-2 px-5 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {job.status === 'loading'
                                            ? <><Loader2 size={14} className="animate-spin" /> Scanning...</>
                                            : <><Search size={14} /> Analyse</>
                                        }
                                    </button>
                                    {jobs.length > 1 && (
                                        <button
                                            onClick={() => removeRepo(idx)}
                                            className="glass p-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-colors"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>

                                {/* Sample quickfill buttons */}
                                {job.status === 'idle' && !job.url && (
                                    <div className="flex flex-wrap gap-2 mb-1">
                                        <span className="text-xs text-slate-600">Try:</span>
                                        {SAMPLE_REPOS.map(s => (
                                            <button key={s} onClick={() => updateJob(idx, { url: s })}
                                                className="text-xs text-slate-600 hover:text-slate-400 border border-white/5 px-2 py-0.5 rounded-lg transition-colors">
                                                {s.split('/').slice(-2).join('/')}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Error */}
                                {job.status === 'error' && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                                        <AlertCircle size={14} className="flex-shrink-0" />
                                        {job.error}
                                    </div>
                                )}

                                {/* Success badge + expand toggle */}
                                {job.status === 'success' && job.result && (
                                    <>
                                        <button
                                            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                                            className="w-full flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-left"
                                        >
                                            <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                                            <span className="text-sm text-emerald-400 font-medium flex-1">
                                                {job.result.owner}/{job.result.repoName} analysed
                                            </span>
                                            <div className="flex gap-2 items-center">
                                                <span className="badge badge-blue">{job.result.language}</span>
                                                <span className="badge badge-green">{job.result.repoStrengthScore}/100</span>
                                                {expandedIdx === idx
                                                    ? <ChevronDown size={14} className="text-slate-500" />
                                                    : <ChevronRight size={14} className="text-slate-500" />
                                                }
                                            </div>
                                        </button>

                                        {/* Expanded results */}
                                        {expandedIdx === idx && (
                                            <div className="mt-4 space-y-4 animate-fade-in">
                                                {/* Stats */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {[
                                                        { icon: Star, label: 'Stars', value: job.result.stars.toLocaleString(), color: 'text-amber-400' },
                                                        { icon: GitFork, label: 'Forks', value: job.result.forks.toLocaleString(), color: 'text-blue-400' },
                                                        { icon: FileText, label: 'README', value: `${job.result.readmeLength} chars`, color: 'text-violet-400' },
                                                        { icon: CheckCircle2, label: 'Strength Score', value: `${job.result.repoStrengthScore}/100`, color: 'text-emerald-400' },
                                                    ].map(({ icon: Icon, label, value, color }) => (
                                                        <div key={label} className="glass rounded-xl p-3 text-center">
                                                            <Icon size={15} className={`${color} mx-auto mb-1.5`} />
                                                            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                                                            <p className={`font-semibold text-sm ${color}`}>{value}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Badges */}
                                                <div className="flex flex-wrap gap-2">
                                                    {job.result.hasTests && <span className="badge badge-green"><CheckCircle2 size={11} /> Tests found</span>}
                                                    {job.result.hasCI && <span className="badge badge-blue">CI/CD configured</span>}
                                                    <span className="badge badge-purple">Updated {new Date(job.result.lastUpdated).toLocaleDateString()}</span>
                                                </div>

                                                {/* Language distribution */}
                                                {Object.keys(job.result.languages).length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Language Distribution</p>
                                                        <div className="space-y-1.5">
                                                            {Object.entries(job.result.languages).sort(([, a], [, b]) => b - a).slice(0, 5).map(([lang, pct]) => (
                                                                <div key={lang} className="flex items-center gap-3">
                                                                    <span className="text-sm text-slate-300 w-24 truncate">{lang}</span>
                                                                    <div className="flex-1 bg-dark-600 rounded-full h-1.5">
                                                                        <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                    <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Frameworks + Libraries */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {job.result.frameworks.length > 0 && (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Layers size={13} className="text-violet-400" />
                                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Frameworks</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {job.result.frameworks.map(f => <span key={f} className="badge badge-purple text-xs">{f}</span>)}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {job.result.libraries.length > 0 && (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Package size={13} className="text-emerald-400" />
                                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Libraries</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {job.result.libraries.slice(0, 12).map(l => <span key={l} className="badge badge-green text-xs">{l}</span>)}
                                                                {job.result.libraries.length > 12 && <span className="badge text-slate-500 bg-white/5 text-xs">+{job.result.libraries.length - 12} more</span>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Features */}
                                                {job.result.features.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Detected Features</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {job.result.features.map(f => <span key={f} className="badge badge-yellow text-xs">{f}</span>)}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Description */}
                                                {job.result.description && (
                                                    <p className="text-xs text-slate-500 italic border-t border-white/5 pt-3">{job.result.description}</p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add repo + Analyse All */}
                    <div className="flex gap-3 mb-8">
                        <button
                            onClick={addRepo}
                            className="glass flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white border border-white/5 hover:border-white/15 transition-all"
                        >
                            <Plus size={15} /> Add Another Repository
                        </button>
                        {jobs.some(j => j.status !== 'success') && (
                            <button
                                onClick={analyzeAll}
                                disabled={jobs.every(j => j.status === 'loading' || !j.url.trim())}
                                className="btn-primary flex items-center gap-2 px-5 disabled:opacity-50"
                            >
                                <Zap size={15} /> Analyse All
                            </button>
                        )}
                    </div>

                    {/* Progress + CTA */}
                    {successCount > 0 && (
                        <div className="glass rounded-2xl p-5 border border-emerald-500/15">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <p className="font-semibold text-white text-sm mb-0.5">
                                        {successCount} of {jobs.length} {successCount === 1 ? 'repository' : 'repositories'} analysed ✓
                                    </p>
                                    <p className="text-xs text-slate-500">Detected languages will be auto-loaded into your Assessment</p>
                                </div>
                                <button
                                    onClick={goToAssessment}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    Proceed to Assessment <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
