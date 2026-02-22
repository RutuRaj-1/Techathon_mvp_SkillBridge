import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Brain, Mail, Lock, User, AlertCircle, ArrowRight, GraduationCap, BookOpen } from 'lucide-react'
import { UserRole } from '../types/user'

export default function Signup() {
    const { register, signInWithGoogle } = useAuth()
    const navigate = useNavigate()

    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<UserRole>('student')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
        setError('')
        setLoading(true)
        try {
            await register(email, password, displayName, role)
            navigate(role === 'teacher' ? '/dashboard' : '/profile')
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed'
            setError(msg.includes('email-already-in-use')
                ? 'An account with this email already exists.'
                : 'Failed to create account. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        setError('')
        setLoading(true)
        try {
            await signInWithGoogle(role)
            navigate(role === 'teacher' ? '/dashboard' : '/profile')
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Google sign up failed'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden py-12">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center glow-blue">
                            <Brain size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl gradient-text-blue">SkillVerify</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
                    <p className="text-slate-400 text-sm">Join the AI skill verification platform</p>
                </div>

                <div className="glass rounded-2xl p-8 border border-white/10">
                    {error && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Role selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-3">I am a...</label>
                        <div className="grid grid-cols-2 gap-3">
                            {([['student', 'Student', GraduationCap, 'Take assessments & get verified'], ['teacher', 'Teacher', BookOpen, 'Track & evaluate students']] as const).map(([val, label, Icon, desc]) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setRole(val as UserRole)}
                                    className={`flex flex-col items-center p-4 rounded-xl border text-center transition-all duration-200 ${role === val
                                        ? 'bg-blue-500/15 border-blue-500/50 text-blue-300'
                                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.07] hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} className="mb-2" />
                                    <p className="text-sm font-semibold">{label}</p>
                                    <p className="text-xs mt-1 opacity-70 leading-tight">{desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Full name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="signup-name"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Your full name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="signup-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="signup-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Min. 6 characters"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                            ) : (
                                <>Create Account <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-between">
                        <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
                        <span className="text-xs text-center text-slate-500 uppercase">Or sign up with</span>
                        <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
                    </div>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            disabled={loading}
                            className="btn-secondary w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 border-white/10 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="text-sm font-medium text-slate-200">Google</span>
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
