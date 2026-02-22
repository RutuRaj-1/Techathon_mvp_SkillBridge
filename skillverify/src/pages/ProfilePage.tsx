import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { db, doc, updateDoc } from "../services/firebase";

interface ProfileFormData {
    name: string;
    branch: string;
    interest: string;
    skills: string;
    github: string;
    frontend: string;
    backend: string;
    database: string;
}

const ProfilePage: React.FC = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<ProfileFormData>({
        name: profile?.displayName || "",
        branch: "",
        interest: "",
        skills: profile?.skills?.join(", ") || "",
        github: "",
        frontend: "",
        backend: "",
        database: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.github.trim() || !formData.github.startsWith("https://github.com/")) {
            setError("Please provide a valid GitHub public link!");
            return;
        }

        if (!user) {
            setError("You must be logged in to save your profile.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Convert skills back into an array
            const skillsArray = formData.skills
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            // Update user profile in Firestore
            await updateDoc(doc(db, "users", user.uid), {
                displayName: formData.name,
                branch: formData.branch,
                interest: formData.interest,
                skills: skillsArray,
                githubUrl: formData.github,
                techPreferences: {
                    frontend: formData.frontend,
                    backend: formData.backend,
                    database: formData.database
                },
                profileCompleted: true
            });

            // Redirect user to the Assessment/Github Page
            navigate("/github");

        } catch (err) {
            console.error("Submission error:", err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6 radial-grid">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl w-full max-w-2xl p-8 md:p-10 transition-all hover:border-slate-700">
                <div className="text-center space-y-2 mb-10">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        User Profile Details
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Complete your profile to personalize your assessment experience.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300 ml-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                                placeholder="Enter your name"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Branch */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300 ml-1">Branch</label>
                            <input
                                type="text"
                                name="branch"
                                required
                                value={formData.branch}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                                placeholder="e.g. Computer Science"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Interest */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300 ml-1">Interest</label>
                            <select
                                name="interest"
                                required
                                value={formData.interest}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                disabled={isSubmitting}
                            >
                                <option value="" disabled className="bg-slate-900 text-slate-500">Select Interest</option>
                                <option value="Web Development" className="bg-slate-900">Web Development</option>
                                <option value="Python" className="bg-slate-900">Python</option>
                                <option value="Machine Learning" className="bg-slate-900">Machine Learning</option>
                                <option value="Data Science" className="bg-slate-900">Data Science</option>
                                <option value="App Development" className="bg-slate-900">App Development</option>
                            </select>
                        </div>

                        {/* GitHub */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300 ml-1">
                                GitHub Public Link
                            </label>
                            <input
                                type="url"
                                name="github"
                                required
                                value={formData.github}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                                placeholder="https://github.com/username"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300 ml-1">
                            Skills (comma separated)
                        </label>
                        <input
                            type="text"
                            name="skills"
                            required
                            value={formData.skills}
                            onChange={handleChange}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                            placeholder="e.g. C++, Java, ML"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="pt-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">
                            Tech Stack Preferences
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-400 ml-1">Frontend</label>
                                <input
                                    type="text"
                                    name="frontend"
                                    value={formData.frontend}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                                    placeholder="React, Vue..."
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-400 ml-1">Backend</label>
                                <input
                                    type="text"
                                    name="backend"
                                    value={formData.backend}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                                    placeholder="Node, Go..."
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-400 ml-1">Database</label>
                                <input
                                    type="text"
                                    name="database"
                                    value={formData.database}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                                    placeholder="SQL, NoSQL..."
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 ${isSubmitting
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting Profile...
                            </>
                        ) : (
                            "Submit Profile & Start Experience"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
