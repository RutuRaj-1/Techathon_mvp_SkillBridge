import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
    Brain, Menu, X, ChevronDown, LogOut, User,
    BarChart3, Code2, Github, BookOpen, LayoutDashboard
} from 'lucide-react'

const studentLinks = [
    { to: '/github', label: 'GitHub Analysis', icon: Github },
    { to: '/assessment', label: 'Assessment', icon: Code2 },
    { to: '/behavior', label: 'Behaviour', icon: BarChart3 },
    { to: '/report', label: 'Skill Report', icon: BookOpen },
]

const teacherLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export default function Navbar() {
    const { user, profile, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const links = profile?.role === 'teacher' ? teacherLinks : studentLinks

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <img
                            src="/logo.jpg"
                            alt="SkillBridge Logo"
                            className="w-8 h-8 rounded-lg object-cover group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all"
                        />
                        <span className="font-bold text-lg gradient-text-blue">SkillBridge</span>
                    </Link>

                    {/* Desktop nav */}
                    {user && (
                        <div className="hidden md:flex items-center gap-1">
                            {links.map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(to)
                                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon size={15} />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 glass px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold">
                                        {profile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-slate-200 hidden sm:block max-w-[120px] truncate">
                                        {profile?.displayName || user.email}
                                    </span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-52 glass-dark rounded-xl border border-white/10 overflow-hidden shadow-xl z-50">
                                        <div className="px-4 py-3 border-b border-white/5">
                                            <p className="text-sm font-medium text-white truncate">{profile?.displayName}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            <span className={`badge mt-1.5 ${profile?.role === 'teacher' ? 'badge-purple' : 'badge-blue'}`}>
                                                {profile?.role}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut size={15} />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Log in</Link>
                                <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                            </div>
                        )}

                        {/* Mobile menu */}
                        {user && (
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden glass p-2 rounded-lg"
                            >
                                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu panel */}
            {mobileOpen && user && (
                <div className="md:hidden glass-dark border-t border-white/5 px-4 py-3 space-y-1">
                    {links.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(to) ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    )
}
