import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import {
    Brain, Github, Code2, Shield, BarChart3, Sparkles, ArrowRight,
    CheckCircle2, Zap, Star, Users, TrendingUp, BookOpen
} from 'lucide-react'

const FEATURES = [
    {
        icon: Github,
        title: 'GitHub Deep Analysis',
        desc: 'Playwright-powered scraping extracts your real tech stack, frameworks, libraries, and project quality signals from one or more repositories.',
        color: 'from-slate-500 to-slate-700',
        badge: 'Module 1',
    },
    {
        icon: Code2,
        title: 'Dynamic Assessment Engine',
        desc: '5 MCQs + 2 coding challenges per language — dynamically generated and tailored to your exact stack. Monaco editor for real coding.',
        color: 'from-blue-500 to-blue-700',
        badge: 'Module 2',
    },
    {
        icon: Shield,
        title: 'AI Proctoring',
        desc: 'Camera-based face tracking, tab-switch monitoring, and automated violation enforcement. Auto-submit on 3rd violation.',
        color: 'from-red-500 to-rose-700',
        badge: 'Module 3',
    },
    {
        icon: BookOpen,
        title: 'Knowledge Center',
        desc: 'Deep-dive advanced library reference for Python/AI-ML, C++, and Full Stack — with pro tips, real use cases, and level badges to help you grow.',
        color: 'from-sky-500 to-cyan-700',
        badge: 'Module 4',
    },
    {
        icon: TrendingUp,
        title: 'SkillEngine Scoring',
        desc: 'Weighted 5-dimension formula — Accuracy, Repo Strength, Behaviour Persistence, Code Efficiency, and Integrity Score — to compute your real skill.',
        color: 'from-emerald-500 to-teal-700',
        badge: 'Module 5',
    },
    {
        icon: Sparkles,
        title: 'Transparent AI Reports + Skill Engine',
        desc: 'Gemini 2.5 Flash generates human-readable skill explanations, improvement plans, and a personalized 4-week Advanced Mastery Path.',
        color: 'from-violet-500 to-purple-700',
        badge: 'Module 6 & 7',
    },
]

const STATS = [
    { value: '7', label: 'AI Modules', icon: Brain },
    { value: '50+', label: 'Languages Supported', icon: Code2 },
    { value: '99%', label: 'Accuracy Rate', icon: CheckCircle2 },
    { value: '10k+', label: 'Assessments Run', icon: Users },
]

const HOW_IT_WORKS = [
    { step: '01', title: 'Connect GitHub', desc: 'Paste your repo URL and let our AI analyse your real-world code' },
    { step: '02', title: 'Take Assessment', desc: 'Answer adaptive MCQs and coding challenges based on your stack' },
    { step: '03', title: 'Get AI Report', desc: 'Receive a transparent, explainable skill score powered by Gemini' },
]

export default function LandingPage() {
    const { user, profile } = useAuth()

    const ctaHref = user
        ? profile?.role === 'teacher' ? '/dashboard' : '/github'
        : '/signup'

    return (
        <div className="min-h-screen bg-dark-900 overflow-x-hidden">
            <Navbar />

            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
                {/* Animated background blobs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/50 rounded-full blur-3xl" />
                    {/* Grid overlay */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />
                </div>

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border border-blue-500/20 mb-8 animate-fade-in">
                        <Sparkles size={14} className="text-blue-400" />
                        <span className="text-sm text-slate-300 font-medium">Powered by Gemini 2.5 Flash AI</span>
                        <span className="badge badge-blue text-xs">NEW</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 animate-slide-up">
                        Verify Skills with
                        <br />
                        <span className="gradient-text">Real AI Intelligence</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        SkillVerify analyses your GitHub repositories, administers adaptive assessments with proctoring,
                        and generates transparent AI-powered skill reports that employers can trust.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Link to={ctaHref} className="btn-primary flex items-center gap-2 text-base px-8 py-4">
                            {user ? 'Go to Platform' : 'Start Free Assessment'}
                            <ArrowRight size={18} />
                        </Link>
                        {!user && (
                            <Link to="/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        {['No credit card required', 'Open source', '100% explainable AI'].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6 border-y border-white/5">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {STATS.map(({ value, label, icon: Icon }) => (
                        <div key={label} className="text-center">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                                <Icon size={18} className="text-blue-400" />
                            </div>
                            <p className="text-3xl font-black gradient-text-blue mb-1">{value}</p>
                            <p className="text-sm text-slate-500">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="section">
                <div className="container-max">
                    <div className="text-center mb-16">
                        <span className="badge badge-purple mb-4">7-Module Platform</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Everything You Need to <span className="gradient-text">Verify Skills</span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            From GitHub analysis to AI-generated reports — a complete end-to-end skill intelligence pipeline.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map(({ icon: Icon, title, desc, color, badge }) => (
                            <div key={title} className="card group hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:shadow-lg transition-all`}>
                                        <Icon size={18} className="text-white" />
                                    </div>
                                    <span className="badge badge-blue">{badge}</span>
                                </div>
                                <h3 className="font-bold text-white mb-2">{title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="section bg-dark-800/30 border-y border-white/5">
                <div className="container-max">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-slate-400">Get your verified skill report in 3 simple steps</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-8 left-[25%] right-[25%] h-px bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-blue-500/30" />

                        {HOW_IT_WORKS.map(({ step, title, desc }, idx) => (
                            <div key={step} className="text-center relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 glow-blue">
                                    <span className="text-2xl font-black gradient-text-blue">{step}</span>
                                </div>
                                <h3 className="font-bold text-white mb-2">{title}</h3>
                                <p className="text-slate-400 text-sm">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section">
                <div className="container-max">
                    <div className="glass rounded-3xl p-12 text-center border border-blue-500/20 glow-blue relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5" />
                        <div className="relative z-10">
                            <Brain size={48} className="mx-auto text-blue-400 mb-6 animate-float" />
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Verify Your Skills?
                            </h2>
                            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                                Join thousands of developers who use SkillVerify to get credible, AI-backed skill certifications.
                            </p>
                            <Link to={ctaHref} className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
                                <Zap size={18} />
                                {user ? 'Go to Platform' : 'Get Started Free'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
