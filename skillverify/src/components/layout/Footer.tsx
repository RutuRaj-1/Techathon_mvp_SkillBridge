import { Brain, Github, Twitter, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="border-t border-white/5 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                                <Brain size={16} className="text-white" />
                            </div>
                            <span className="font-bold gradient-text-blue">SkillVerify</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            AI-powered skill verification platform for the next generation of developers.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
                        <div className="space-y-2">
                            {['GitHub Analysis', 'Assessment Engine', 'AI Proctoring', 'Skill Reports'].map((item) => (
                                <p key={item} className="text-sm text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">{item}</p>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
                        <div className="flex gap-3">
                            {[Github, Twitter, Mail].map((Icon, i) => (
                                <div key={i} className="glass w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
                                    <Icon size={16} className="text-slate-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-600 text-sm">© 2025 SkillVerify. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/" className="text-slate-600 text-sm hover:text-slate-400 transition-colors">Privacy</Link>
                        <Link to="/" className="text-slate-600 text-sm hover:text-slate-400 transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
