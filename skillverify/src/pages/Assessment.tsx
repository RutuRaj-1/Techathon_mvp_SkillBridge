import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { saveQuizResult } from "../services/mcqService";
import { getQuestions, submitAssessment } from '../services/assessmentService'
import { getSkillReport } from '../services/skillEngineService'
import { db, collection, getDocs, query, where, addDoc } from '../services/firebase'
import { useProctoring } from '../hooks/useProctoring'
import { useBehaviorTracking } from '../hooks/useBehaviorTracking'
import { MCQQuestion, CodeQuestion, Question, MCQSubmission, CodeSubmission } from '../types/question'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import CodeEditorPanel from '../components/assessment/CodeEditorPanel'
import Timer from '../components/assessment/Timer'
import ProctoringOverlay from '../components/assessment/ProctoringOverlay'
import VisualProctor from '../components/assessment/VisualProctor'
import { Code2, AlertTriangle, Loader2, ChevronLeft, ChevronRight, Send, CheckSquare, Camera } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type QuizState = "config" | "loading" | "camera-check" | "quiz" | "result" | "error" | "submitting";

interface AnswerRecord {
    question: string;
    selected: string;
    correct: boolean;
}

interface MergedAssessmentState {
    // MCQ state
    mcqQuestions: MCQQuestion[];
    mcqAnswers: Record<string, string>;
    mcqScore: number;
    mcqAnswersRecord: AnswerRecord[];

    // Code state
    codeQuestions: CodeQuestion[];
    codeAnswers: Record<string, string>;
    codeHints: Record<string, number>;

    // Combined
    currentSection: 'mcq' | 'code' | 'result';
    currentIdx: number;
    sessionId: string;
    violations: number;
    tabSwitches: number;
}

const ASSESSMENT_DURATION = 60 * 60; // 60 minutes
const MCQ_TIME = 30 * 60; // 30 minutes for MCQ section
const CODE_TIME = 30 * 60; // 30 minutes for code section

// ─── Difficulty badge ─────────────────────────────────────────────────────────
function DiffBadge({ level }: { level: string }) {
    const styles: Record<string, string> = {
        easy: "bg-emerald-900/40 text-emerald-400 border-emerald-800",
        medium: "bg-amber-900/40   text-amber-400   border-amber-800",
        hard: "bg-red-900/40     text-red-400     border-red-800",
    };
    return (
        <span className={`px-2 py-0.5 rounded border font-mono text-xs uppercase ${styles[level] ?? styles.easy}`}>
            {level}
        </span>
    );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total, label }: { current: number; total: number; label?: string }) {
    const pct = Math.round((current / total) * 100);
    return (
        <div className="space-y-1">
            <div className="flex justify-between font-mono text-xs text-emerald-700">
                <span>{label || `Q ${current} of ${total}`}</span>
                <span>{pct}%</span>
            </div>
            <div className="h-1 bg-emerald-950 rounded-full overflow-hidden">
                <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

// ─── Config screen ────────────────────────────────────────────────────────────
const CATEGORIES = ["web development", "machine learning", "competitive programming"] as const;
const LANGUAGES: Record<string, string[]> = {
    "web development": ["html", "css", "javascript", "typescript", "react"],
    "machine learning": ["python", "scikit-learn", "tensorflow"],
    "competitive programming": ["cpp", "java", "python"],
};
const DIFFICULTIES = ["easy", "medium", "hard", "mixed"] as const;

interface ConfigScreenProps {
    onStart: (cat: string, lang: string[], diff: string, count: number) => void;
    loading: boolean;
    techStack?: any;
}

function ConfigScreen({ onStart, loading, techStack }: ConfigScreenProps) {
    const { profile } = useAuth();

    // Auto-detect defaults from profile & github techStack
    const defaultCat = profile?.interest?.toLowerCase() as any;
    const initialCategory = CATEGORIES.includes(defaultCat) ? defaultCat : CATEGORIES[0];

    // Initialize languages once — reads from profile, techStack, AND localStorage (set by GitHub scraper)
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
        const langs: string[] = [];
        // Priority 1: languages saved from multi-repo GitHub scraper
        try {
            const stored = localStorage.getItem('sb_detected_languages');
            if (stored) {
                const parsed: string[] = JSON.parse(stored);
                langs.push(...parsed.map(l => l.toLowerCase()));
            }
        } catch { /* ignore */ }
        // Priority 2: user profile preferences
        if (profile?.techPreferences?.frontend) langs.push(...profile.techPreferences.frontend.split(',').map((s: string) => s.trim().toLowerCase()));
        if (profile?.techPreferences?.backend) langs.push(...profile.techPreferences.backend.split(',').map((s: string) => s.trim().toLowerCase()));
        // Priority 3: Firestore-fetched techStack
        if (techStack?.language) langs.push(techStack.language.toLowerCase());
        if (techStack?.languages) langs.push(...Object.keys(techStack.languages).map(l => l.toLowerCase()));

        const validLangs = Array.from(new Set(langs)).filter(l => LANGUAGES[initialCategory]?.includes(l));
        return validLangs.length > 0 ? validLangs : [LANGUAGES[initialCategory][0]];
    });

    const hasSkills = selectedLanguages.length > 0;

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/20 text-center">
                <h2 className="text-emerald-400 font-mono text-xl mb-2">
                    Let's begin your journey of being credible, <span className="text-white">{profile?.displayName?.split(' ')[0] || 'Developer'}</span>!
                </h2>
                <p className="text-emerald-700 font-mono text-sm leading-relaxed mb-4">
                    We've scanned your profile and analyzed your GitHub projects. Based on your experience, we have curated a personalized skill assessment containing <strong>5 Multiple Choice Questions</strong> and <strong>2 Subjective Code Editor Challenges</strong> designed specifically for your skillset.
                </p>

                <div className="text-left bg-black/40 p-3 rounded border border-emerald-900/30">
                    <p className="font-mono text-xs text-emerald-600 uppercase tracking-widest mb-2">▸ Auto-Detected Skill Map</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedLanguages.map(lang => (
                            <span key={lang} className="px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-900/20 text-emerald-300 font-mono text-xs uppercase">
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {techStack && techStack.language && (
                <div className="p-3 rounded border border-emerald-900/40 bg-emerald-950/20">
                    <p className="font-mono text-xs text-emerald-700">
                        Detected from GitHub: <span className="text-emerald-500">{techStack.language}</span>
                        {techStack.frameworks?.length > 0 && (
                            <> · Frameworks: <span className="text-emerald-500">{techStack.frameworks.join(', ')}</span></>
                        )}
                    </p>
                </div>
            )}

            <button
                onClick={() => onStart(initialCategory, selectedLanguages, "mixed", 5)}
                disabled={loading || !hasSkills}
                className="w-full py-3 rounded font-mono text-sm font-bold tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.3))",
                    border: "1px solid rgba(16,185,129,0.4)",
                    color: "#34d399",
                }}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                        loading questions...
                    </span>
                ) : "[ START ASSESSMENT ]"}
            </button>
        </div>
    );
}

// ─── Camera Check / Proctoring consent screen ──────────────────────────────────
function CameraCheckScreen({ onProceed, onCancel }: { onProceed: () => void, onCancel: () => void }) {
    const [status, setStatus] = useState<"idle" | "pending" | "granted" | "denied">("idle");
    const videoRef = useRef<HTMLVideoElement>(null);

    const requestCamera = async () => {
        setStatus("pending");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            setStatus("granted");
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => { });
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setStatus("denied");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    const handleProceed = () => {
        stopCamera();
        onProceed();
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#030712", fontFamily: "'JetBrains Mono', monospace" }}>
            <div className="max-w-xl w-full border border-emerald-900/40 rounded-xl bg-black/40 overflow-hidden shadow-2xl">
                <div className="bg-emerald-950/40 border-b border-emerald-900/30 p-4">
                    <h2 className="text-emerald-400 font-mono text-lg font-bold flex items-center gap-2">
                        <Camera size={20} /> AI Proctoring Setup
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-lg text-red-200/80 text-sm leading-relaxed">
                        <strong className="text-red-500 block mb-2 tracking-wide uppercase">Strict monitoring rules</strong>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Your webcam will remain active during the assessment.</li>
                            <li>Looking away from the screen will trigger a warning.</li>
                            <li>Your face must remain fully visible; covering the camera or low light guarantees auto-submission.</li>
                            <li>Tab-switching or minimizing the window is prohibited.</li>
                        </ul>
                        <p className="mt-3 text-red-400/80 font-bold">If you exceed the maximum warnings, your assessment will automatically submit.</p>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-black/60 border border-emerald-900/30 rounded-lg overflow-hidden h-48 relative">
                        {status === "granted" ? (
                            <video ref={videoRef} className="w-full h-full object-cover transform -scale-x-100" muted playsInline />
                        ) : status === "denied" ? (
                            <p className="text-red-400 text-sm">Camera access denied. Please allow camera permissions to continue.</p>
                        ) : status === "pending" ? (
                            <div className="flex flex-col items-center">
                                <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                                <p className="text-emerald-500/80 text-sm">Requesting camera access...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center p-4 text-center">
                                <Camera size={32} className="text-emerald-500/50 mb-2" />
                                <p className="text-emerald-400/80 text-sm mb-4">We need to verify your camera works.</p>
                                <button
                                    onClick={requestCamera}
                                    className="px-4 py-2 rounded border border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/40 transition-colors text-xs uppercase tracking-wider font-bold"
                                >
                                    Enable Camera
                                </button>
                            </div>
                        )}
                        {status === "granted" && (
                            <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-emerald-300">
                                Camera Preview
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded border border-red-900/40 text-red-400 font-bold uppercase transition hover:bg-red-950/20"
                        >
                            Decline & Cancel
                        </button>
                        <button
                            onClick={handleProceed}
                            disabled={status !== "granted"}
                            className="flex-1 py-3 rounded text-emerald-300 font-bold uppercase transition disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.3))",
                                border: "1px solid rgba(16,185,129,0.4)",
                            }}
                        >
                            I Agree & Start
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── MCQ Question card ────────────────────────────────────────────────────────
interface MCQQuestionCardProps {
    question: MCQQuestion;
    index: number;
    total: number;
    onAnswer: (selected: string) => void;
    selectedAnswer?: string | null;
}

function MCQQuestionCard({ question, index, total, onAnswer, selectedAnswer }: MCQQuestionCardProps) {
    const [selected, setSelected] = useState<string | null>(selectedAnswer || null);
    const [revealed, setRevealed] = useState(!!selectedAnswer);

    function handleSelect(opt: string) {
        if (revealed) return;
        setSelected(opt);
        setRevealed(true);
        setTimeout(() => onAnswer(opt), 900);
    }

    const optionLetters = ["A", "B", "C", "D"];

    return (
        <div className="space-y-5">
            <ProgressBar current={index + 1} total={total} />

            <div className="flex items-center gap-3 flex-wrap">
                <DiffBadge level={question.difficulty} />
                <span className="font-mono text-xs text-emerald-800">{question.language}</span>
            </div>

            <p className="font-mono text-sm text-emerald-200 leading-relaxed">
                Q{index + 1}. {question.question}
            </p>

            <div className="space-y-2">
                {question.options.map((optObj: any, i: number) => {
                    const optText = typeof optObj === 'string' ? optObj : optObj.text;
                    const optId = typeof optObj === 'string' ? optText : optObj.id;
                    let style = "border-emerald-900/40 bg-black/40 text-emerald-700 hover:border-emerald-700 hover:text-emerald-400";
                    if (revealed) {
                        if (optId === question.correctAnswer || optText === question.correctAnswer) {
                            style = "border-emerald-500 bg-emerald-900/40 text-emerald-300";
                        } else if (optId === selected || optText === selected) {
                            style = "border-red-500/60 bg-red-900/30 text-red-400";
                        }
                    } else if (optId === selected || optText === selected) {
                        style = "border-emerald-500/60 bg-emerald-900/30 text-emerald-300";
                    }
                    return (
                        <button
                            key={optId}
                            onClick={() => handleSelect(optId)}
                            disabled={revealed}
                            className={`w-full text-left px-4 py-3 rounded border font-mono text-xs transition-all duration-200 ${style}`}
                        >
                            <span className="mr-3 opacity-50">{optionLetters[i]}.</span>
                            {optText}
                        </button>
                    );
                })}
            </div>

            {revealed && (
                <div className={`px-3 py-2 rounded border font-mono text-xs ${selected === question.correctAnswer
                    ? "border-emerald-700/50 bg-emerald-950/50 text-emerald-400"
                    : "border-red-700/50 bg-red-950/40 text-red-400"
                    }`}>
                    {selected === question.correctAnswer ? "✓ Correct!" : `✗ Correct answer: ${question.correctAnswer}`}
                </div>
            )}
        </div>
    );
}

// ─── Result screen ────────────────────────────────────────────────────────────
function ResultScreen({
    mcqScore, mcqTotal, codeScore, codeTotal, answers, onRetry, onHome,
}: {
    mcqScore: number;
    mcqTotal: number;
    codeScore?: number;
    codeTotal?: number;
    answers: AnswerRecord[];
    onRetry: () => void;
    onHome: () => void;
}) {
    const totalScore = mcqScore + (codeScore || 0);
    const totalPossible = mcqTotal + (codeTotal || 0);
    const pct = Math.round((totalScore / totalPossible) * 100);
    const grade = pct >= 80 ? "EXCELLENT" : pct >= 60 ? "GOOD" : pct >= 40 ? "FAIR" : "NEEDS WORK";
    const gradeColor = pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-cyan-400" : pct >= 40 ? "text-amber-400" : "text-red-400";

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2 py-4">
                <div className="font-mono text-xs text-emerald-700 uppercase tracking-widest">Assessment Complete</div>
                <div className={`font-mono text-4xl font-bold ${gradeColor}`}>{pct}%</div>
                <div className={`font-mono text-sm font-bold tracking-widest ${gradeColor}`}>{grade}</div>
                <div className="font-mono text-xs text-emerald-800">
                    MCQ: {mcqScore}/{mcqTotal} · Code: {codeScore || 0}/{codeTotal || 0}
                </div>
            </div>

            {/* Score bar */}
            <div className="h-2 bg-emerald-950 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                        width: `${pct}%`,
                        background: pct >= 80 ? "#10b981" : pct >= 60 ? "#06b6d4" : pct >= 40 ? "#f59e0b" : "#ef4444",
                    }}
                />
            </div>

            {/* Answer review */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <div className="font-mono text-xs text-emerald-700 uppercase tracking-widest mb-2">Review</div>
                {answers.map((a, i) => (
                    <div
                        key={i}
                        className={`px-3 py-2 rounded border text-xs font-mono ${a.correct
                            ? "border-emerald-900/40 bg-emerald-950/40 text-emerald-600"
                            : "border-red-900/40 bg-red-950/30 text-red-500"
                            }`}
                    >
                        <span className="mr-2">{a.correct ? "✓" : "✗"}</span>
                        <span className="opacity-70 truncate">{a.question.slice(0, 60)}...</span>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    onClick={onRetry}
                    className="flex-1 py-2.5 rounded border border-emerald-900/40 font-mono text-xs text-emerald-700 hover:text-emerald-400 hover:border-emerald-700/40 transition-all"
                >
                    retry
                </button>
                <button
                    onClick={onHome}
                    className="flex-1 py-2.5 rounded font-mono text-xs font-bold tracking-wider uppercase transition-all"
                    style={{
                        background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.3))",
                        border: "1px solid rgba(16,185,129,0.4)",
                        color: "#34d399",
                    }}
                >
                    [ done ]
                </button>
            </div>
        </div>
    );
}

// ─── Main Merged Assessment Page ─────────────────────────────────────────────
export default function Assessment() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // State management
    const [quizState, setQuizState] = useState<QuizState>("config");
    const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
    const [codeQuestions, setCodeQuestions] = useState<CodeQuestion[]>([]);
    const [currentSection, setCurrentSection] = useState<'mcq' | 'code'>('mcq');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
    const [mcqAnswersRecord, setMcqAnswersRecord] = useState<AnswerRecord[]>([]);
    const [mcqScore, setMcqScore] = useState(0);
    const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>({});
    const [codeHints, setCodeHints] = useState<Record<string, number>>({});
    const [sessionId, setSessionId] = useState('');
    const [error, setError] = useState("");

    // Tech stack passed from GitHub scraper or fetch from DB
    const [techStack, setTechStack] = useState<any>((location.state as { tech_stack?: any })?.tech_stack || null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            try {
                if (!techStack) {
                    const q = query(collection(db, "github_analysis"), where("userId", "==", user.uid));
                    const querySnapshot = await getDocs(q);
                    let latestAnalysis = null;
                    let maxDate = 0;

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        const date = new Date(data.scrapedAt || 0).getTime();
                        if (date > maxDate) {
                            maxDate = date;
                            latestAnalysis = data;
                        }
                    });

                    if (latestAnalysis) {
                        setTechStack(latestAnalysis);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch github data", err);
            }
        };
        fetchUserData();
    }, [user, techStack]);

    // Proctoring hooks
    const { recordAttempt, recordHint, onNextQuestion, getBehaviorData } = useBehaviorTracking();
    const { violations, lastViolationType, isWarningVisible, maxViolations, tabSwitches, dismissWarning } =
        useProctoring(() => submitAll(true));

    // Load questions
    async function startQuiz(category: string, languages: string[], difficulty: string, count: number) {
        setQuizState("loading");
        setError("");

        try {
            // Fetch ALL questions (MCQs and Code) directly from the backend API
            const allQuestions = await getQuestions(languages);

            // Separate and extract MCQs
            let mcqQs = allQuestions.filter(q => q.type === 'mcq') as MCQQuestion[];

            // Aggressive shuffle for MCQs
            for (let i = mcqQs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [mcqQs[i], mcqQs[j]] = [mcqQs[j], mcqQs[i]];
            }
            // Exactly 5 MCQs
            mcqQs = mcqQs.slice(0, 5);

            // Separate and extract Code questions
            let codeQs = allQuestions.filter(q => q.type === 'code') as CodeQuestion[];

            // Aggressive shuffle for Code
            for (let i = codeQs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [codeQs[i], codeQs[j]] = [codeQs[j], codeQs[i]];
            }
            // Exactly 2 Code questions
            codeQs = codeQs.slice(0, 2);

            if (mcqQs.length === 0 && codeQs.length === 0) {
                setError("No questions found for this selection. Ensure the backend engine is running.");
                setQuizState("error");
                return;
            }

            setMcqQuestions(mcqQs);
            setCodeQuestions(codeQs);

            // Initialize code answers with starter code
            const codeDefaults: Record<string, string> = {};
            codeQs.filter(q => q.type === 'code').forEach(q => {
                codeDefaults[q.id] = (q as CodeQuestion).starterCode;
            });
            setCodeAnswers(codeDefaults);

            setCurrentIdx(0);
            setCurrentSection('mcq');
            setMcqAnswers({});
            setMcqAnswersRecord([]);
            setMcqScore(0);
            setCodeHints({});
            setSessionId(`session_${Date.now()}`);
            setQuizState("camera-check");
        } catch (e) {
            console.error("Failed to load questions:", e);
            setError("Failed to load questions. Make sure Firestore is seeded and rules allow reads.");
            setQuizState("error");
        }
    }

    const startActualAssessment = () => {
        setQuizState("quiz");
    };

    // Handle MCQ answer
    const handleMCQAnswer = useCallback(async (selected: string) => {
        const q = mcqQuestions[currentIdx];
        const correct = selected === q.correctAnswer;
        const record: AnswerRecord = { question: q.question, selected, correct };

        const newAnswers = [...mcqAnswersRecord, record];
        const newScore = mcqScore + (correct ? 1 : 0);

        setMcqAnswers(prev => ({ ...prev, [q.id]: selected }));
        setMcqAnswersRecord(newAnswers);
        setMcqScore(newScore);

        // Move to next question or section
        if (currentIdx + 1 >= mcqQuestions.length) {
            if (codeQuestions.length > 0) {
                // Move to code section
                setCurrentSection('code');
                setCurrentIdx(0);
            } else {
                // No code questions, finish assessment
                await finishAssessment(newAnswers, newScore, {});
            }
        } else {
            setCurrentIdx(i => i + 1);
        }
    }, [mcqQuestions, currentIdx, mcqScore, mcqAnswersRecord, codeQuestions.length, user]);

    // Handle code answer (auto-save on change)
    const handleCodeChange = (questionId: string, code: string) => {
        setCodeAnswers(prev => ({ ...prev, [questionId]: code }));
        recordAttempt();
    };

    // Handle hint usage
    const handleHintUsed = (questionId: string) => {
        recordHint();
        setCodeHints(prev => ({ ...prev, [questionId]: (prev[questionId] || 0) + 1 }));
    };

    // Finish assessment
    const finishAssessment = async (
        mcqAnswersList: AnswerRecord[] = mcqAnswersRecord,
        finalMcqScore: number = mcqScore,
        finalCodeAnswers: Record<string, string> = codeAnswers,
        autoSubmitted = false
    ) => {
        setQuizState('submitting');

        const behavior = getBehaviorData(tabSwitches);

        // Save MCQ results to Firestore
        if (user && mcqQuestions.length > 0) {
            await saveQuizResult(user.uid, {
                score: finalMcqScore,
                total: mcqQuestions.length,
                category: mcqQuestions[0]?.topic || 'unknown',
                language: mcqQuestions[0]?.language || 'unknown',
                answers: mcqAnswersList,
            }).catch(console.error);
        }

        // Submit full assessment if we have code questions
        if (codeQuestions.length > 0) {
            const submissions: Array<MCQSubmission | CodeSubmission> = [
                ...mcqQuestions.map(q => ({
                    questionId: q.id,
                    type: 'mcq' as const,
                    selectedAnswer: mcqAnswers[q.id] || '',
                    timeTaken: behavior.averageTimePerQuestion,
                    hintsUsed: 0,
                })),
                ...codeQuestions.map(q => ({
                    questionId: q.id,
                    type: 'code' as const,
                    code: finalCodeAnswers[q.id] || '',
                    language: q.language,
                    timeTaken: behavior.averageTimePerQuestion,
                    hintsUsed: codeHints[q.id] || 0,
                    attempts: 1,
                }))
            ];

            try {
                const res = await submitAssessment({
                    sessionId,
                    submissions,
                    behavior,
                    violations,
                    autoSubmitted,
                });

                // Fetch the generated report and store it in Firestore for the recruiter dashboard
                if (user) {
                    try {
                        const generatedReport = await getSkillReport(res.reportId);
                        await addDoc(collection(db, "users", user.uid, "assessment_reports"), {
                            userId: user.uid,
                            reportId: res.reportId,
                            reportData: generatedReport,
                            // Raw user answers — stores everything the user submitted
                            mcqAnswers: mcqAnswersList.map((a: AnswerRecord) => ({
                                question: a.question,
                                selected: a.selected,
                                correct: a.correct,
                            })),
                            codeAnswers: Object.entries(finalCodeAnswers).map(([qId, code]) => ({
                                questionId: qId,
                                submittedCode: code,
                            })),
                            hintsUsed: Object.entries(codeHints).map(([qId, count]) => ({ questionId: qId, count })),
                            behavior,
                            violations,
                            autoSubmitted,
                            submittedAt: new Date().toISOString()
                        });
                    } catch (dbErr) {
                        console.error("Warning: Failed to backup generated report to Firestore", dbErr);
                    }
                }

                navigate(`/report?reportId=${res.reportId}`);
                return;
            } catch (error) {
                console.error("Failed to submit assessment:", error);
            }
        }

        // If no code questions or submission failed, show results
        setQuizState("result");
    };

    // Handle auto-submit from proctoring or timer expiration
    const submitAll = async (autoSubmitted = false) => {
        await finishAssessment(mcqAnswersRecord, mcqScore, codeAnswers, autoSubmitted);
    };

    // Handle retry
    function handleRetry() {
        setQuizState("config");
        setMcqQuestions([]);
        setCodeQuestions([]);
        setCurrentIdx(0);
        setCurrentSection('mcq');
        setMcqAnswers({});
        setMcqAnswersRecord([]);
        setMcqScore(0);
        setCodeAnswers({});
        setCodeHints({});
    }

    // Get current questions based on section
    const currentQuestions = currentSection === 'mcq' ? mcqQuestions : codeQuestions;
    const currentQ = currentQuestions[currentIdx];
    const totalQuestions = currentQuestions.length;
    const mcqTotal = mcqQuestions.length;
    const codeTotal = codeQuestions.length;

    // Config screen
    if (quizState === 'config') {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#030712", fontFamily: "'JetBrains Mono', monospace" }}>
                {/* Ambient glow */}
                <div className="fixed inset-0 pointer-events-none">
                    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(16,185,129,0.05) 0%, transparent 70%)" }} />
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)", backgroundSize: "100% 4px" }} />
                </div>

                <div className="relative w-full max-w-xl">
                    {/* Terminal chrome */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-t-xl border border-emerald-900/40 border-b-0" style={{ background: "rgba(16,185,129,0.04)" }}>
                        <span className="w-3 h-3 rounded-full bg-red-500/60" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                        <span className="ml-3 font-mono text-xs text-emerald-700 flex-1 text-center">
                            auth@skill-proof-engine ~ /assessment
                        </span>
                        <button onClick={() => navigate("/github-scraper")} className="font-mono text-xs text-emerald-900 hover:text-emerald-600 transition-colors">
                            ← back
                        </button>
                    </div>

                    {/* Card */}
                    <div className="border border-emerald-900/40 rounded-b-xl p-8" style={{ background: "rgba(3,7,18,0.92)", backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(16,185,129,0.05), inset 0 1px 0 rgba(16,185,129,0.06)" }}>
                        {/* Header */}
                        <div className="mb-6 space-y-1">
                            <h1 className="text-emerald-400 text-lg font-mono font-bold tracking-tight">
                                SKILL ASSESSMENT
                                <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 align-middle animate-pulse" />
                            </h1>
                            <p className="text-emerald-800 font-mono text-xs">
                                ─── configure your assessment ───
                            </p>
                        </div>

                        <ConfigScreen onStart={startQuiz} loading={false} techStack={techStack} />

                        {/* Proctoring notice */}
                        <div className="mt-6 p-3 rounded border border-amber-800/30 bg-amber-950/20">
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-mono text-xs font-bold text-amber-500 mb-1">AI PROCTORING ACTIVE</p>
                                    <p className="font-mono text-xs text-amber-700/80">Tab switches, window blur monitored. 3 violations = auto-submit.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 flex justify-between px-1">
                        <span className="font-mono text-xs text-emerald-900">mcq_bank + code_engine ← firestore</span>
                        <span className="font-mono text-xs text-emerald-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {user?.email}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Camera Check state
    if (quizState === 'camera-check') {
        return <CameraCheckScreen onProceed={startActualAssessment} onCancel={handleRetry} />;
    }

    // Loading state
    if (quizState === 'loading') {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-emerald-900 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-emerald-400 font-mono font-semibold mb-1">Generating your assessment...</p>
                    <p className="text-emerald-700 font-mono text-sm">Creating personalized questions</p>
                </div>
            </div>
        );
    }

    // Submitting state
    if (quizState === 'submitting') {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-emerald-900 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-emerald-400 font-mono font-semibold mb-1">Calculating your skill score...</p>
                    <p className="text-emerald-700 font-mono text-sm">SkillEngine is processing your answers</p>
                </div>
            </div>
        );
    }

    // Error state
    if (quizState === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#030712" }}>
                <div className="max-w-md w-full border border-red-900/40 rounded-xl p-8 bg-black/40">
                    <div className="space-y-4">
                        <div className="px-3 py-3 rounded border border-red-800/50 bg-red-950/40 font-mono text-xs text-red-400">
                            <p className="font-bold mb-1">✗ Error</p>
                            <p>{error}</p>
                        </div>
                        <div className="font-mono text-xs text-emerald-900 space-y-1">
                            <p>Make sure you've:</p>
                            <p>1. Seeded Firestore (run scripts/seedFirestore.ts)</p>
                            <p>2. Set Firestore rules to allow reads</p>
                            <p>3. Enabled Firestore in Firebase Console</p>
                        </div>
                        <button
                            onClick={handleRetry}
                            className="w-full py-2 rounded border border-emerald-900/40 font-mono text-xs text-emerald-700 hover:text-emerald-400 transition-colors"
                        >
                            ← back to config
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Result state
    if (quizState === 'result') {
        const codeScore = Object.values(codeAnswers).filter((code, idx) => {
            // Simple scoring for code questions (you might want more sophisticated scoring)
            return code && code.length > 0;
        }).length;

        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#030712" }}>
                <div className="relative w-full max-w-xl">
                    <div className="border border-emerald-900/40 rounded-xl p-8" style={{ background: "rgba(3,7,18,0.92)", backdropFilter: "blur(20px)" }}>
                        <ResultScreen
                            mcqScore={mcqScore}
                            mcqTotal={mcqQuestions.length}
                            codeScore={codeScore}
                            codeTotal={codeQuestions.length}
                            answers={mcqAnswersRecord}
                            onRetry={handleRetry}
                            onHome={() => navigate("/github-scraper")}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Active quiz state
    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />

            {/* Proctoring overlay (Original tab-switching one) */}
            {isWarningVisible && (
                <ProctoringOverlay
                    violationCount={violations}
                    maxViolations={maxViolations}
                    violationType={lastViolationType}
                    onDismiss={dismissWarning}
                />
            )}

            {/* AI Visual Proctoring */}
            <VisualProctor onLogout={() => submitAll(true)} />

            <main className="pt-20 px-4 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Assessment header */}
                    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <span className={`badge ${currentSection === 'mcq' ? 'badge-blue' : 'badge-purple'}`}>
                                {currentSection === 'mcq' ? 'MCQ Section' : 'Code Challenge'}
                            </span>
                            <span className="text-sm text-slate-400">
                                {currentIdx + 1} / {totalQuestions}
                            </span>
                            {currentSection === 'mcq' && mcqQuestions.length > 0 && (
                                <span className="text-xs text-emerald-700">
                                    {mcqQuestions[0]?.topic} · {mcqQuestions[0]?.language}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {violations > 0 && (
                                <span className="badge badge-red">
                                    <AlertTriangle size={12} />
                                    {violations}/{maxViolations} violations
                                </span>
                            )}
                            <Timer
                                durationSeconds={ASSESSMENT_DURATION}
                                onExpire={() => {
                                    submitAll(true);
                                }}
                            />
                        </div>
                    </div>

                    {/* Section progress */}
                    {mcqQuestions.length > 0 && codeQuestions.length > 0 && (
                        <div className="flex gap-2 mb-4">
                            <div className={`flex-1 h-1 rounded-full ${currentSection === 'mcq' ? 'bg-emerald-500' : 'bg-emerald-900'}`} />
                            <div className={`flex-1 h-1 rounded-full ${currentSection === 'code' ? 'bg-emerald-500' : 'bg-emerald-900'}`} />
                        </div>
                    )}

                    {/* Question content */}
                    {currentQ && (
                        currentSection === 'mcq' ? (
                            <MCQQuestionCard
                                key={currentQ.id}
                                question={currentQ as MCQQuestion}
                                index={currentIdx}
                                total={mcqQuestions.length}
                                onAnswer={handleMCQAnswer}
                                selectedAnswer={mcqAnswers[currentQ.id]}
                            />
                        ) : (
                            <CodeEditorPanel
                                question={currentQ as CodeQuestion}
                                code={codeAnswers[currentQ.id] || (currentQ as CodeQuestion).starterCode}
                                onChange={(code) => handleCodeChange(currentQ.id, code)}
                                onHintUsed={() => handleHintUsed(currentQ.id)}
                                hintsRevealed={codeHints[currentQ.id] || 0}
                            />
                        )
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={() => {
                                onNextQuestion();
                                setCurrentIdx(i => Math.max(0, i - 1));
                            }}
                            disabled={currentIdx === 0}
                            className="btn-secondary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed py-2.5"
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>

                        {currentIdx < totalQuestions - 1 ? (
                            <button
                                onClick={() => {
                                    onNextQuestion();
                                    setCurrentIdx(i => i + 1);
                                }}
                                className="btn-primary flex items-center gap-2 py-2.5"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            currentSection === 'mcq' && codeQuestions.length > 0 ? (
                                <button
                                    onClick={() => {
                                        setCurrentSection('code');
                                        setCurrentIdx(0);
                                    }}
                                    className="btn-primary flex items-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600"
                                >
                                    Start Code Challenges <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => finishAssessment()}
                                    className="btn-primary flex items-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600"
                                >
                                    <Send size={16} /> Submit Assessment
                                </button>
                            )
                        )}
                    </div>

                    {/* Question nav dots */}
                    <div className="flex flex-wrap gap-2 mt-6 justify-center">
                        {currentQuestions.map((q, idx) => {
                            const answered = currentSection === 'mcq'
                                ? !!mcqAnswers[q.id]
                                : !!codeAnswers[q.id] && codeAnswers[q.id].length > 0;
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIdx(idx)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${idx === currentIdx
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : answered
                                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                                            : 'bg-white/5 border-white/10 text-slate-500'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}