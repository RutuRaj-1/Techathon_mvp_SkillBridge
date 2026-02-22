import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="border-t border-white/5 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <img src="/logo.jpg" alt="SkillBridge" className="w-8 h-8 rounded-lg object-cover" />
                            <span className="font-bold gradient-text-blue">SkillBridge</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            AI-powered real skill verification platform — from GitHub analysis to transparent AI reports.
                        </p>
                    </div>

                    {/* Platform links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Platform Modules</h4>
                        <div className="space-y-2">
                            {[
                                { label: 'GitHub Analysis', href: '/github' },
                                { label: 'Assessment Engine', href: '/assessment' },
                                { label: 'Knowledge Center', href: '/behavior' },
                                { label: 'Skill Report', href: '/report' },
                                { label: 'Skill Engine', href: '/skill-engine' },
                            ].map(({ label, href }) => (
                                <Link key={label} to={href} className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Built For</h4>
                        <div className="space-y-2">
                            {['Students & Developers', 'Teachers & Counsellors', 'Recruitment Teams', 'Skill Assessment'].map(item => (
                                <p key={item} className="text-sm text-slate-500">{item}</p>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-600 text-sm">© 2026 SkillBridge. All rights reserved.</p>
                    <p className="text-slate-600 text-xs flex items-center gap-1">
                        Powered by <span className="text-violet-400 font-medium">Gemini 2.5 Flash</span> · Built with ❤️ for real skill intelligence
                    </p>
                </div>
            </div>
        </footer>
    )
}
