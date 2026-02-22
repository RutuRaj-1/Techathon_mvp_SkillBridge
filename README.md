# SkillBridge (SkillVerify AI)

An AI-driven Skill Verification Platform designed to replace subjective resume screening with objective, dynamically generated technical assessments based on a candidate's actual GitHub portfolio.

## 🚀 The Problem We Are Solving

Traditional hiring processes rely heavily on static resumes and generic coding tests, which often fail to capture a candidate's true technical capabilities or their specific experience with a given tech stack. Recruiters struggle to verify if a candidate actually possesses the skills they claim, and developers are tired of taking one-size-fits-all coding exams that don't reflect their real-world expertise.

**SkillVerify** solves this by:
1. **Analyzing Real Work:** Automatically scraping and analyzing a candidate's GitHub repositories to precisely identify their primary languages, frameworks, and skill level.
2. **Personalized Assessments:** Dynamically generating a bespoke exam consisting of exactly 5 Multiple Choice Questions (MCQs) and 2 subjective Code Challenges tailored specifically to the candidate's detected tech stack.
3. **Ensuring Integrity:** Enforcing strict, automated AI-proctoring via webcam and browser behavior tracking (tab switches, face visibility) during the assessment to guarantee objective results.
4. **Actionable Insights:** Leveraging AI to grade the assessment, analyze the code written, and generate a comprehensive, persistent "Skill Report" that recruiters can trust.

## 🔄 How It Works (Project Flow)

1. **Authentication:** Candidate logs in using Google Authentication (via Firebase).
2. **GitHub Analysis:** 
   - Candidate enters their GitHub Username.
   - The Python Backend uses Playwright to scrape their public repositories.
   - An AI engine analyzes the repos to extract their primary Tech Stack and preferred technologies.
3. **Assessment Generation:**
   - The platform dynamically creates a customized exam (5 MCQs + 2 Code challenges) directly from the SkillEngine Python backend based on the detected tech stack.
4. **Proctored Examination:**
   - Candidate consents to webcam monitoring.
   - A strict 60-minute overall timer begins.
   - Real-time AI visual proctoring monitors for face absence, multiple people, and tab-switching violations. Exceeding warnings triggers an auto-submit.
5. **AI Grading & Reporting:**
   - Completed answers are sent to the backend.
   - The LLM evaluates the code submissions, assigning scores and generating detailed explanations of the candidate's strengths and weaknesses.
   - The final `SkillReport` json is persistently stored in Firebase Firestore (`users/{uid}/assessment_reports`) for future review by recruiters.

## 🛠️ What We Built (Tech Stack)

### Frontend (`/skillverify`)
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS (Vanilla CSS & custom modern design system)
- **Database / Auth:** Firebase (Authentication & Firestore)
- **State Management:** React Hooks
- **Proctoring:** MediaPipe Tasks Vision (Webcam tracking) + Custom Browser Behavior Hooks

### Backend (`/skillverify-backend`)
- **Framework:** FastAPI (Python)
- **Web Scraping:** Playwright (Async)
- **AI Integration:** Google Gemini 2.5 Flash API (for Repo Analysis, Question Generation, and Report Grading)

---

## 💻 Running the Project Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Firebase Project setup (with Auth and Firestore enabled)

### 1. Start the Backend API
Open a terminal and navigate to the backend directory:
```bash
cd skillverify-backend

# Activate your virtual environment (Windows)
.venv\Scripts\Activate.ps1

# Install dependencies if you haven't already
pip install -r requirements.txt

# Start the Backend Server (Runs on port 8000 with the correct Windows Event Loop)
python run.py
```

### 2. Start the Frontend Application
Open a second terminal and navigate to the frontend directory:
```bash
cd skillverify

# Install dependencies
npm install

# Start the Vite development server (Runs on port 5173/5174)
npm run dev
```

### Environment Variables
Ensure you have the appropriate `.env` files set up in both directories:

**Frontend (`skillverify/.env`):**
```env
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_API_BASE_URL="http://localhost:8000"
```

**Backend (`skillverify-backend/.env`):**
```env
GEMINI_API_KEY="..."
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
```
