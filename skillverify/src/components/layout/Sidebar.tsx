import { NavLink } from 'react-router-dom'
import {
    Github, Code2, BarChart3, BookOpen, LayoutDashboard,
    Brain, Sparkles
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const studentItems = [
    { to: '/github', label: 'GitHub Analysis', icon: Github, desc: 'Analyze repositories' },
    { to: '/assessment', label: 'Assessment', icon: Code2, desc: 'Take skill tests' },
    { to: '/behavior', label: 'Knowledge Center', icon: BookOpen, desc: 'Deep tech reference' },
    { to: '/report', label: 'Skill Report', icon: BookOpen, desc: 'View AI analysis' },
    { to: '/skill-engine', label: 'Skill Engine', icon: Brain, desc: 'Weekly mastery path' },
]

const teacherItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Student overview' },
]

export default function Sidebar() {
    const { profile } = useAuth()
    const items = profile?.role === 'teacher' ? teacherItems : studentItems

    return (
        <aside className="hidden lg:flex flex-col w-64 min-h-screen glass-dark border-r border-white/5 pt-20 pb-6 fixed left-0 top-0">
            {/* Brand badge */}
            <div className="px-4 mb-6">
                <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2.5">
                    <img
                        src="/logo.jpg"
                        alt="SkillBridge"
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                    <div>
                        <p className="text-xs font-semibold text-white">SkillBridge</p>
                        <p className="text-xs text-slate-500 capitalize">{profile?.role} Portal</p>
                    </div>
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 space-y-1">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">
                    Navigation
                </p>
                {items.map(({ to, label, icon: Icon, desc }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                    <Icon size={15} />
                                </div>
                                <div>
                                    <p className="leading-none">{label}</p>
                                    <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                                </div>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer badge */}
            <div className="px-4">
                <div className="glass rounded-xl px-3 py-3 flex items-start gap-2">
                    <Sparkles size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-medium text-violet-300">Powered by Gemini 2.5</p>
                        <p className="text-xs text-slate-600">AI skill intelligence</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
