import {
    collection,
    query,
    where,
    getDocs,
    QueryConstraint,
    DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
export interface MCQQuestion {
    id: string;
    category: string;
    language: string;
    difficulty: "easy" | "medium" | "hard" | string;
    question: string;
    options: string[];
    answer: string;
}

export interface QuestionFilter {
    category?: MCQQuestion["category"];
    language?: string;
    difficulty?: MCQQuestion["difficulty"];
    limit?: number;
}

/** Fetch questions from Firestore mcq_bank with optional filters */
export async function fetchQuestions(filter: QuestionFilter = {}): Promise<MCQQuestion[]> {
    const constraints: QueryConstraint[] = [];

    if (filter.category) constraints.push(where("category", "==", filter.category));
    if (filter.language) constraints.push(where("language", "==", filter.language));
    if (filter.difficulty) constraints.push(where("difficulty", "==", filter.difficulty));

    const q = query(collection(db, "mcq_bank"), ...constraints);
    const snapshot = await getDocs(q);

    const questions = snapshot.docs.map((doc) => doc.data() as MCQQuestion);

    // Shuffle using Fisher-Yates
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    // Apply limit after shuffle
    return filter.limit ? questions.slice(0, filter.limit) : questions;
}

/** Generate a balanced quiz: mix of easy/medium/hard from detected tech stack */
export async function generateQuizFromTechStack(
    languages: string[],
    totalQuestions: number = 10
): Promise<MCQQuestion[]> {
    if (languages.length === 0) return [];

    const perLang = Math.ceil(totalQuestions / languages.length);
    const easyCount = Math.ceil(perLang * 0.3);
    const mediumCount = Math.ceil(perLang * 0.4);
    const hardCount = perLang - easyCount - mediumCount;

    const allQuestions: MCQQuestion[] = [];

    for (const lang of languages) {
        const [easy, medium, hard] = await Promise.all([
            fetchQuestions({ language: lang, difficulty: "easy", limit: easyCount }),
            fetchQuestions({ language: lang, difficulty: "medium", limit: mediumCount }),
            fetchQuestions({ language: lang, difficulty: "hard", limit: hardCount }),
        ]);
        allQuestions.push(...easy, ...medium, ...hard);
    }

    // Final shuffle and trim to exact count
    for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    return allQuestions.slice(0, totalQuestions);
}

/** Save quiz result to Firestore under users/{uid}/quiz_results */
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function saveQuizResult(
    uid: string,
    result: {
        score: number;
        total: number;
        category: string;
        language: string;
        answers: { question: string; selected: string; correct: boolean }[];
    }
) {
    const ref = doc(collection(db, "users", uid, "quiz_results"));
    await setDoc(ref, {
        ...result,
        percentage: Math.round((result.score / result.total) * 100),
        takenAt: serverTimestamp(),
    });
}