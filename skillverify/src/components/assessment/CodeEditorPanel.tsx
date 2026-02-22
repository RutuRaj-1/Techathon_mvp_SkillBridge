import Editor from '@monaco-editor/react'
import { Lightbulb, Code2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { CodeQuestion } from '../../types/question'

interface CodeEditorPanelProps {
    question: CodeQuestion
    code: string
    onChange: (code: string) => void
    onHintUsed: () => void
    hintsRevealed: number
}

export default function CodeEditorPanel({
    question,
    code,
    onChange,
    onHintUsed,
    hintsRevealed,
}: CodeEditorPanelProps) {
    const [showHint, setShowHint] = useState(false)

    const handleHint = () => {
        if (hintsRevealed < question.hints.length) {
            onHintUsed()
            setShowHint(true)
        }
    }

    const resetCode = () => {
        onChange(question.starterCode)
    }

    const langMap: Record<string, string> = {
        python: 'python', javascript: 'javascript', typescript: 'typescript',
        java: 'java', cpp: 'cpp', c: 'c', go: 'go', rust: 'rust',
    }
    const monacoLang = langMap[question.language?.toLowerCase()] || 'python'

    return (
        <div className="card flex flex-col gap-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Code2 size={16} className="text-blue-400" />
                        <span className="badge badge-blue">{question.language}</span>
                        <span className={`badge ${question.difficulty === 'hard' ? 'badge-red' : question.difficulty === 'medium' ? 'badge-yellow' : 'badge-green'}`}>
                            {question.difficulty}
                        </span>
                        <span className="text-sm text-amber-400 font-medium">{question.points} pts</span>
                    </div>
                    <h3 className="font-semibold text-white text-base">{question.title}</h3>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">{question.description}</p>
                </div>
            </div>

            {/* Test cases */}
            {question.testCases.length > 0 && (
                <div className="bg-dark-800/60 border border-white/5 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Test Cases</p>
                    <div className="space-y-2">
                        {question.testCases.slice(0, 2).map((tc, i) => (
                            <div key={i} className="flex gap-4 text-xs font-code">
                                <div>
                                    <span className="text-slate-600">Input: </span>
                                    <span className="text-slate-300 bg-dark-700 px-2 py-0.5 rounded">{tc.input}</span>
                                </div>
                                <div>
                                    <span className="text-slate-600">Expected: </span>
                                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{tc.expectedOutput}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Monaco Editor */}
            <div className="rounded-xl overflow-hidden border border-white/10">
                <div className="flex items-center gap-2 px-4 py-2 bg-dark-800 border-b border-white/5">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/60" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                    </div>
                    <span className="text-xs text-slate-500 font-code ml-2">solution.{monacoLang === 'python' ? 'py' : monacoLang === 'javascript' ? 'js' : monacoLang}</span>
                </div>
                <Editor
                    height="300px"
                    language={monacoLang}
                    value={code}
                    onChange={(val) => onChange(val || '')}
                    theme="vs-dark"
                    options={{
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        padding: { top: 12, bottom: 12 },
                    }}
                />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handleHint}
                    disabled={hintsRevealed >= question.hints.length}
                    className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    <Lightbulb size={15} />
                    {hintsRevealed >= question.hints.length ? 'No more hints' : `Hint (${hintsRevealed}/${question.hints.length})`}
                </button>
                <button onClick={resetCode} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    <RefreshCw size={14} />
                    Reset code
                </button>
            </div>

            {/* Hint panel */}
            {showHint && hintsRevealed > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-400 mb-1">💡 Hint {hintsRevealed}</p>
                    <p className="text-sm text-slate-300">{question.hints[hintsRevealed - 1]}</p>
                </div>
            )}
        </div>
    )
}
