import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProfilePage from './pages/ProfilePage'
import GitHubScraper from './pages/GitHubScraper'
import Assessment from './pages/Assessment'
import BehaviorTracking from './pages/BehaviorTracking'
import SkillReport from './pages/SkillReport'
import SkillEngine from './pages/SkillEngine'
import TeacherDashboard from './pages/TeacherDashboard'

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected student routes */}
                    <Route path="/profile" element={
                        <ProtectedRoute role="student">
                            <ProfilePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/github" element={
                        <ProtectedRoute role="student">
                            <GitHubScraper />
                        </ProtectedRoute>
                    } />
                    <Route path="/assessment" element={
                        <ProtectedRoute role="student">
                            <Assessment />
                        </ProtectedRoute>
                    } />
                    <Route path="/behavior" element={
                        <ProtectedRoute role="student">
                            <BehaviorTracking />
                        </ProtectedRoute>
                    } />
                    <Route path="/report" element={
                        <ProtectedRoute role="student">
                            <SkillReport />
                        </ProtectedRoute>
                    } />
                    <Route path="/skill-engine" element={
                        <ProtectedRoute role="student">
                            <SkillEngine />
                        </ProtectedRoute>
                    } />

                    {/* Protected teacher route */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute role="teacher">
                            <TeacherDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
