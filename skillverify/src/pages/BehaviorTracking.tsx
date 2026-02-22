import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import {
    Brain, Code2, Layers, ChevronDown, ChevronRight,
    BookOpen, Cpu, Globe, Sparkles, Star, Zap, ArrowRight, Database
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRACKS = [
    {
        id: 'python',
        label: 'Python · AI / ML',
        icon: Brain,
        color: 'from-blue-500 to-violet-700',
        badgeColor: 'badge-purple',
        tagline: 'From NumPy fundamentals to production model pipelines',
        overview: `Python is the undisputed language of Artificial Intelligence and Machine Learning. Its rich ecosystem spans data wrangling, mathematical computation, deep-learning frameworks, model serving, and MLOps — allowing you to move from raw data to a live, serving AI system entirely within a single language.`,
        sections: [
            {
                title: 'Core Scientific Computing',
                icon: Cpu,
                libs: [
                    { name: 'NumPy', level: 'Foundation', desc: 'N-dimensional array operations, broadcasting, vectorized math. Every ML framework builds on its dtype system.', tip: 'Master `np.einsum` for fusing multiple tensor contractions into one O(n) operation.' },
                    { name: 'Pandas', level: 'Foundation', desc: 'DataFrame-based data wrangling. Group-by aggregations, time-series resampling, multi-index joins.', tip: 'Use `.query()` + categorical dtypes for 3–10× memory reductions on large tabular datasets.' },
                    { name: 'SciPy', level: 'Intermediate', desc: 'Optimization solvers, sparse matrices, statistical tests, signal processing, ODE integrators.', tip: 'scipy.optimize.minimize with L-BFGS-B handles constrained problems faster than gradient descent.' },
                    { name: 'Matplotlib / Seaborn', level: 'Foundation', desc: 'Static visualization stack. Seaborn abstracts common statistical plots over Matplotlib axes.', tip: 'Use `fig.savefig(dpi=300, bbox_inches="tight")` for publication-ready figures from notebooks.' },
                ],
            },
            {
                title: 'Machine Learning Frameworks',
                icon: Zap,
                libs: [
                    { name: 'Scikit-learn', level: 'Core ML', desc: 'Pipeline API, cross-validation, ensemble methods (Random Forest, GBM), preprocessing transformers.', tip: 'Build `sklearn.pipeline.Pipeline` to prevent data leakage during grid search CV.' },
                    { name: 'PyTorch', level: 'Deep Learning', desc: 'Dynamic computation graph, autograd engine, `torch.nn.Module` composition, CUDA acceleration.', tip: 'Use `torch.compile()` (PyTorch 2.0+) for up to 2× inference speedup via TorchInductor.' },
                    { name: 'TensorFlow / Keras', level: 'Deep Learning', desc: 'Static graph execution, SavedModel format, TFLite for edge, TensorFlow Serving for production.', tip: 'Use `tf.data.Dataset.prefetch(tf.data.AUTOTUNE)` to hide GPU data loading latency.' },
                    { name: 'Hugging Face Transformers', level: 'Advanced', desc: 'Pre-trained BERT, GPT, T5, CLIP, Whisper models. Fine-tuning via Trainer API and PEFT/LoRA.', tip: 'Apply 4-bit quantization with `BitsAndBytesConfig` to run 7B LLMs on a single 8GB GPU.' },
                    { name: 'LangChain / LlamaIndex', level: 'Advanced', desc: 'LLM agent orchestration, RAG pipelines, vector store integrations, memory management.', tip: 'Use `ConversationSummaryMemory` + streaming to handle long multi-turn chat without context overflow.' },
                ],
            },
            {
                title: 'MLOps & Production',
                icon: Database,
                libs: [
                    { name: 'FastAPI + Pydantic', level: 'Production', desc: 'Async REST model serving. Pydantic v2 validation, OpenAPI docs auto-generated, WebSocket streaming.', tip: 'Use `background_tasks.add_task()` for async inference queuing without blocking the event loop.' },
                    { name: 'MLflow', level: 'MLOps', desc: 'Experiment tracking, model registry, artifact logging, model versioning, serving integration.', tip: 'Log `mlflow.log_metrics(step=epoch)` inside training loops for automated learning curve plots.' },
                    { name: 'FAISS / ChromaDB', level: 'Vector DBs', desc: 'Billion-scale approximate nearest neighbor (ANN) search for embeddings, RAG retrieval.', tip: 'Use FAISS `IndexHNSWFlat` for sub-millisecond queries on millions of embeddings without GPU.' },
                ],
            },
        ],
    },
    {
        id: 'cpp',
        label: 'C++ · Systems Engineering',
        icon: Cpu,
        color: 'from-emerald-500 to-teal-700',
        badgeColor: 'badge-green',
        tagline: 'Modern C++20 · memory control · high-performance systems',
        overview: `C++ dominates gaming engines, operating systems, embedded firmware, HFT trading systems, and the internals of every major ML framework. Modern C++ (C++17/20) has dramatically improved ergonomics with ranges, coroutines, modules, and concepts — while retaining zero-cost abstraction.`,
        sections: [
            {
                title: 'Modern C++20 Core',
                icon: Zap,
                libs: [
                    { name: 'STL Algorithms & Ranges', level: 'Core', desc: 'Lazy range pipelines with `std::views::filter | transform | take`. Parallel execution policies (par_unseq).', tip: 'Chain ranges instead of nested loops: `ranges::views::iota(0, n) | views::filter(pred) | views::transform(f)` compiles to tight loop.' },
                    { name: 'Smart Pointers', level: 'Core', desc: '`unique_ptr` for exclusive ownership, `shared_ptr` with reference counting, `weak_ptr` to break cycles — no raw `new/delete`.', tip: 'Prefer `make_unique<T>()` over `new T` — single allocation, exception-safe, and expresses intent.' },
                    { name: 'Move Semantics & RVO', level: 'Core', desc: 'Move constructors, `std::move`, perfect forwarding `T&&`, Named Return Value Optimization (NRVO).', tip: 'Mark move constructors `noexcept` — STL containers only use moves in resizes if `noexcept` is guaranteed.' },
                    { name: 'Coroutines (C++20)', level: 'Advanced', desc: 'Stackless coroutines via `co_await`, `co_yield`, `co_return`. Foundation for async I/O without threads.', tip: 'Use `cppcoro::task<T>` from cppcoro library for production-ready async pipelines over bare coroutines.' },
                ],
            },
            {
                title: 'Performance Engineering',
                icon: Cpu,
                libs: [
                    { name: 'SIMD Intrinsics (SSE/AVX)', level: 'Expert', desc: 'Vectorize hot loops using `__m256` AVX2 intrinsics for 8× float throughput over scalar code.', tip: 'Align data to 32-byte boundaries with `alignas(32)` to avoid cross-lane penalties in AVX loads.' },
                    { name: 'Google Benchmark', level: 'Profiling', desc: 'Micro-benchmark harness with statistical analysis, CPU counters, and dead-code prevention.', tip: 'Use `benchmark::DoNotOptimize(result)` to prevent the compiler from eliding your benchmarked computation.' },
                    { name: 'Valgrind / AddressSanitizer', level: 'Debugging', desc: 'Memory leak detection, heap buffer overflow, use-after-free, and thread race condition analysis.', tip: 'Compile with `-fsanitize=address,undefined -g` for zero-overhead local debug builds with full diagnostics.' },
                ],
            },
            {
                title: 'Ecosystem & Frameworks',
                icon: Layers,
                libs: [
                    { name: 'CMake 3.x + Conan', level: 'Build', desc: 'Modern CMake targets-based builds, `FetchContent` for deps, Conan 2.0 package manager integration.', tip: 'Use `target_compile_options(mylib PRIVATE -O3 -march=native)` only on leaf targets to avoid ABI breaks.' },
                    { name: 'Boost.Asio', level: 'Async I/O', desc: 'Proactor-pattern async networking, SSL, serial ports. Basis for standalone Asio in C++ networking TS.', tip: 'Use `asio::thread_pool` with `co_spawn` for structured concurrency without raw `std::thread`.' },
                    { name: 'CUDA (via CuBLAS)', level: 'GPU', desc: 'GPU parallel computation. cuBLAS for GEMM, cuDNN for DNN primitives, Thrust for GPU STL operations.', tip: 'Fuse multiple kernels into a single kernel using CUDA cooperative groups for 40–60% memory bandwidth savings.' },
                ],
            },
        ],
    },
    {
        id: 'fullstack',
        label: 'Full Stack Development',
        icon: Globe,
        color: 'from-amber-500 to-orange-700',
        badgeColor: 'badge-yellow',
        tagline: 'React · Node · TypeScript · Cloud-native deployment',
        overview: `Full Stack development demands fluency across the browser, server, database, and cloud. The modern stack — TypeScript, React 19, Next.js App Router, tRPC, Prisma, and edge deployment — lets small teams ship production-grade software at scale.`,
        sections: [
            {
                title: 'Frontend Engineering',
                icon: Layers,
                libs: [
                    { name: 'React 19 + Concurrent Mode', level: 'Core', desc: 'Server Components, `use()` hook, transitions, Suspense boundaries, and fine-grained re-rendering with React Compiler.', tip: 'Wrap data fetching in `<Suspense>` with skeleton UI — React 19 streams RSC payloads to the client progressively.' },
                    { name: 'TypeScript (strict mode)', level: 'Core', desc: 'Discriminated unions, mapped/conditional types, `infer`, template literal types, const type parameters.', tip: 'Use `satisfies` operator (TS 4.9+) to assert shape without widening the type — best of both worlds.' },
                    { name: 'Vite + Rollup', level: 'Tooling', desc: 'Native ESM dev server, HMR, tree-shaking via Rollup, plugin ecosystem, build analysis.', tip: 'Use `vite-plugin-checker` with `tsc --noEmit` for real-time type errors in the Vite dev overlay.' },
                    { name: 'Zustand / React Query', level: 'State', desc: 'Zustand for client state with immer middleware, TanStack Query for server-state caching + invalidation.', tip: 'Set `staleTime: Infinity` for near-static reference data — eliminates redundant network refetches on tab focus.' },
                ],
            },
            {
                title: 'Backend & API',
                icon: Database,
                libs: [
                    { name: 'Node.js + Fastify', level: 'Server', desc: 'Fastify 4.x with schema-based validation (JSON Schema / Zod), serialization optimization, plugin architecture.', tip: 'Fastify serializes responses 2–3× faster than Express via `fast-json-stringify` — always define response schemas.' },
                    { name: 'tRPC', level: 'Type-safe API', desc: 'End-to-end type-safe APIs without codegen. Procedure-based with React Query integration.', tip: 'Use `trpc.createCallerFactory` for server-side tRPC calls inside Next.js RSC without HTTP roundtrips.' },
                    { name: 'Prisma ORM', level: 'Database', desc: 'Type-safe DB client, migrations, seeding, Prisma Studio GUI. Works with PostgreSQL, MySQL, SQLite, MongoDB.', tip: 'Use `prisma.$transaction([...])` with isolation levels for atomic batch writes preventing dirty reads.' },
                    { name: 'Redis (ioredis)', level: 'Caching', desc: 'Sub-millisecond key-value caching, pub/sub, rate limiting, session storage, Lua scripting.', tip: 'Use `SETNX` + `EXPIRE` for distributed locks — prevents race conditions in multi-instance deployments.' },
                ],
            },
            {
                title: 'Cloud & DevOps',
                icon: Zap,
                libs: [
                    { name: 'Docker + Docker Compose', level: 'Containers', desc: 'Multi-stage builds for minimal images, bind mounts for dev, health checks, Docker networks.', tip: 'Use `--mount=type=cache,target=/root/.npm` in Dockerfile to cache npm dependencies across layer rebuilds.' },
                    { name: 'GitHub Actions', level: 'CI/CD', desc: 'Matrix builds, reusable workflows, OIDC federated credentials to AWS/GCP without hardcoded secrets.', tip: 'Use `actions/cache` with a hash of your lockfile as key for near-instant dependency restoration.' },
                    { name: 'Vercel / Fly.io', level: 'Deployment', desc: 'Vercel for frontend + edge functions, Fly.io for persistent backend containers with global anycast.', tip: 'Set `NEXT_REVALIDATE_SECRET` + ISR for hybrid static/dynamic pages — best of SSG speed and SSR freshness.' },
                ],
            },
        ],
    },
]

const LEVEL_BADGE: Record<string, string> = {
    Foundation: 'bg-slate-700/60 text-slate-300',
    Core: 'bg-blue-500/15 text-blue-400',
    'Core ML': 'bg-violet-500/15 text-violet-400',
    'Deep Learning': 'bg-purple-500/15 text-purple-400',
    Advanced: 'bg-amber-500/15 text-amber-400',
    Expert: 'bg-red-500/15 text-red-400',
    Production: 'bg-emerald-500/15 text-emerald-400',
    MLOps: 'bg-teal-500/15 text-teal-400',
    'Vector DBs': 'bg-sky-500/15 text-sky-400',
    Intermediate: 'bg-indigo-500/15 text-indigo-400',
    Profiling: 'bg-orange-500/15 text-orange-400',
    Debugging: 'bg-red-500/15 text-red-300',
    Build: 'bg-slate-600/60 text-slate-300',
    'Async I/O': 'bg-cyan-500/15 text-cyan-400',
    GPU: 'bg-green-500/15 text-green-400',
    Server: 'bg-blue-500/15 text-blue-400',
    'Type-safe API': 'bg-violet-500/15 text-violet-400',
    Database: 'bg-amber-500/15 text-amber-400',
    Caching: 'bg-rose-500/15 text-rose-400',
    Containers: 'bg-sky-500/15 text-sky-400',
    'CI/CD': 'bg-slate-600/60 text-slate-300',
    Deployment: 'bg-emerald-500/15 text-emerald-400',
    State: 'bg-pink-500/15 text-pink-400',
    Tooling: 'bg-yellow-500/15 text-yellow-400',
}

export default function KnowledgeCenter() {
    const [activeTrack, setActiveTrack] = useState('python')
    const [openLib, setOpenLib] = useState<string | null>(null)

    const track = TRACKS.find(t => t.id === activeTrack)!

    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <Sidebar />
            <main className="lg:ml-64 pt-20 px-6 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center flex-shrink-0">
                            <BookOpen size={22} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Knowledge Center</p>
                                <span className="badge badge-purple flex items-center gap-1"><Sparkles size={10} /> Advanced</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Deep Tech Reference</h1>
                            <p className="text-slate-400 text-sm">Advanced libraries, patterns, and tips curated for senior developers</p>
                        </div>
                    </div>

                    {/* Track tabs */}
                    <div className="flex gap-3 mb-8 flex-wrap">
                        {TRACKS.map(t => {
                            const Icon = t.icon
                            const isActive = activeTrack === t.id
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => { setActiveTrack(t.id); setOpenLib(null) }}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${isActive
                                        ? `bg-gradient-to-br ${t.color} text-white border-transparent shadow-lg`
                                        : 'glass text-slate-400 border-white/5 hover:text-white hover:border-white/15'
                                        }`}
                                >
                                    <Icon size={15} />
                                    {t.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Overview card */}
                    <div className={`rounded-2xl bg-gradient-to-br ${track.color} p-px mb-6`}>
                        <div className="bg-dark-800 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Star size={14} className="text-amber-400" />
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{track.tagline}</p>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">{track.overview}</p>
                        </div>
                    </div>

                    {/* Sections + libraries */}
                    {track.sections.map(section => {
                        const SectionIcon = section.icon
                        return (
                            <div key={section.title} className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <SectionIcon size={14} className="text-slate-500" />
                                    <h2 className="text-xs text-slate-500 font-semibold uppercase tracking-widest">{section.title}</h2>
                                </div>
                                <div className="space-y-2">
                                    {section.libs.map(lib => {
                                        const libKey = `${track.id}-${lib.name}`
                                        const isOpen = openLib === libKey
                                        return (
                                            <div key={lib.name} className={`card border transition-all duration-200 ${isOpen ? 'border-white/15' : 'border-white/5 hover:border-white/10'}`}>
                                                <button
                                                    onClick={() => setOpenLib(isOpen ? null : libKey)}
                                                    className="w-full flex items-center gap-3 text-left"
                                                >
                                                    <Code2 size={15} className="text-slate-500 flex-shrink-0" />
                                                    <p className="flex-1 font-semibold text-white text-sm">{lib.name}</p>
                                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${LEVEL_BADGE[lib.level] || 'bg-slate-700 text-slate-300'}`}>
                                                        {lib.level}
                                                    </span>
                                                    {isOpen
                                                        ? <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />
                                                        : <ChevronRight size={14} className="text-slate-500 flex-shrink-0" />
                                                    }
                                                </button>

                                                {isOpen && (
                                                    <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
                                                        <p className="text-sm text-slate-300 leading-relaxed">{lib.desc}</p>
                                                        <div className="flex items-start gap-2 bg-black/30 rounded-xl p-3 border border-amber-500/10">
                                                            <Zap size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-xs text-amber-400 font-semibold mb-0.5">Pro Tip</p>
                                                                <p className="text-xs text-slate-300 leading-relaxed font-mono">{lib.tip}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}

                    {/* CTA */}
                    <div className="glass rounded-2xl p-5 border border-violet-500/15 flex items-center justify-between gap-4 flex-wrap mt-4">
                        <div>
                            <p className="font-semibold text-white text-sm mb-0.5">Ready to test your knowledge?</p>
                            <p className="text-xs text-slate-500">Take an assessment and get your personalized Skill Engine learning path</p>
                        </div>
                        <a href="/assessment" className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
                            <Zap size={14} /> Start Assessment <ArrowRight size={14} />
                        </a>
                    </div>
                </div>
            </main>
        </div>
    )
}
