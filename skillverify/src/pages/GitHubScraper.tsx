import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import { analyzeGitHubRepo } from '../services/githubService'
import { RepoAnalysis } from '../types/skill'
import {
    Github, Search, Star, GitFork, FileText, CheckCircle2,
    AlertCircle, Code2, Package, Layers, ArrowRight, ExternalLink, Loader2
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { db, collection, addDoc } from '../services/firebase'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function GitHubScraper() {
    const [repoUrl, setRepoUrl] = useState('')
    const [status, setStatus] = useState<Status>('idle')
    const [result, setResult] = useState<RepoAnalysis | null>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const navigate = useNavigate()
    const { profile } = useAuth()

    const validateUrl = (url: string) =>
        /^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/.test(url)

    const handleAnalyze = async () => {
        if (!validateUrl(repoUrl)) {
            setErrorMsg('Please enter a valid GitHub repository URL (e.g. https://github.com/user/repo)')
            setStatus('error')
            return
        }
        setStatus('loading')
        setErrorMsg('')
        setResult(null)
        try {
            const data = await analyzeGitHubRepo(repoUrl)
            setResult(data)
            setStatus('success')

            // Save analysis to the user's separate github_analysis collection
            if (profile?.uid) {
                await addDoc(collection(db, "github_analysis"), {
                    userId: profile.uid,
                    ...dictToObject(data),
                    scrapedAt: new Date().toISOString()
                });
            }
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
            setStatus('error')
        }
    }

    // Helper to safely convert complex nested data for Firestore
    const dictToObject = (obj: any) => JSON.parse(JSON.stringify(obj));

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
                            Enter any GitHub repository URL. Our AI scraper extracts your tech stack, frameworks, libraries, and project metrics.
                        </p>
                    </div>

                    {/* Input */}
                    <div className="card mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-3">Repository URL</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Github size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="repo-url-input"
                                    type="url"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                                    className="input-field pl-10"
                                    placeholder="https://github.com/username/repository"
                                />
                            </div>
                            <button
                                id="analyze-btn"
                                onClick={handleAnalyze}
                                disabled={status === 'loading' || !repoUrl.trim()}
                                className="btn-primary flex items-center gap-2 px-6 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? (
                                    <><Loader2 size={16} className="animate-spin" /> Analysing...</>
                                ) : (
                                    <><Search size={16} /> Analyse</>
                                )}
                            </button>
                        </div>

                        {status === 'error' && (
                            <div className="flex items-start gap-2 mt-3 text-sm text-red-400">
                                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                                {errorMsg}
                            </div>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                            {['https://github.com/facebook/react', 'https://github.com/microsoft/vscode', 'https://github.com/torvalds/linux'].map((sample) => (
                                <button
                                    key={sample}
                                    onClick={() => setRepoUrl(sample)}
                                    className="text-xs text-slate-600 hover:text-slate-400 transition-colors border border-white/5 px-2 py-1 rounded-lg"
                                >
                                    {sample.split('/').slice(-2).join('/')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loading skeleton */}
                    {status === 'loading' && (
                        <div className="card">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-white/5 rounded animate-pulse w-1/3" />
                                    <div className="h-2 bg-white/5 rounded animate-pulse w-1/2" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
                            </div>
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => <div key={i} className="h-3 bg-white/5 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />)}
                            </div>
                            <p className="text-center text-sm text-slate-500 mt-6 flex items-center justify-center gap-2">
                                <Loader2 size={14} className="animate-spin text-blue-400" />
                                Playwright is scraping your repository...
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {status === 'success' && result && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Repo header */}
                            <div className="card">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                                            <Github size={22} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-white text-lg">{result.owner}/{result.repoName}</h2>
                                            <p className="text-slate-400 text-sm">{result.description || 'No description provided'}</p>
                                        </div>
                                    </div>
                                    <a href={result.repoUrl} target="_blank" rel="noopener noreferrer" className="glass p-2 rounded-lg hover:bg-white/10 transition-colors">
                                        <ExternalLink size={14} className="text-slate-400" />
                                    </a>
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                    {[
                                        { icon: Star, label: 'Stars', value: result.stars.toLocaleString(), color: 'text-amber-400' },
                                        { icon: GitFork, label: 'Forks', value: result.forks.toLocaleString(), color: 'text-blue-400' },
                                        { icon: FileText, label: 'README Length', value: `${result.readmeLength} chars`, color: 'text-violet-400' },
                                        { icon: CheckCircle2, label: 'Repo Strength', value: `${result.repoStrengthScore}/100`, color: 'text-emerald-400' },
                                    ].map(({ icon: Icon, label, value, color }) => (
                                        <div key={label} className="glass rounded-xl p-3 text-center">
                                            <Icon size={16} className={`${color} mx-auto mb-2`} />
                                            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                                            <p className={`font-semibold text-sm ${color}`}>{value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {result.hasTests && <span className="badge badge-green"><CheckCircle2 size={12} /> Tests detected</span>}
                                    {result.hasCI && <span className="badge badge-blue">CI/CD configured</span>}
                                    <span className="badge badge-purple">Updated {new Date(result.lastUpdated).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Tech stack table */}
                            <div className="card">
                                <div className="flex items-center gap-2 mb-5">
                                    <Code2 size={18} className="text-blue-400" />
                                    <h3 className="font-semibold text-white">Tech Stack Breakdown</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Primary language */}
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Primary Language</p>
                                        <span className="badge badge-blue text-sm">{result.language}</span>
                                    </div>

                                    {/* Languages breakdown */}
                                    {Object.keys(result.languages).length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Language Distribution</p>
                                            <div className="space-y-2">
                                                {Object.entries(result.languages)
                                                    .sort(([, a], [, b]) => b - a)
                                                    .slice(0, 5)
                                                    .map(([lang, pct]) => (
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

                                    {/* Frameworks */}
                                    {result.frameworks.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Layers size={14} className="text-violet-400" />
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Frameworks</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {result.frameworks.map((f) => <span key={f} className="badge badge-purple">{f}</span>)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Libraries */}
                                    {result.libraries.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Package size={14} className="text-emerald-400" />
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Libraries & Dependencies</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {result.libraries.slice(0, 20).map((l) => <span key={l} className="badge badge-green text-xs">{l}</span>)}
                                                {result.libraries.length > 20 && <span className="badge text-slate-500 bg-white/5">+{result.libraries.length - 20} more</span>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Features */}
                                    {result.features.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Detected Features</p>
                                            <div className="flex flex-wrap gap-2">
                                                {result.features.map((feat) => <span key={feat} className="badge badge-yellow">{feat}</span>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => navigate('/assessment')}
                                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
                            >
                                Proceed to Assessment
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
