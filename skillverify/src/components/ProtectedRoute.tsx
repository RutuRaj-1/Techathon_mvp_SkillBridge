import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { UserRole } from '../types/user'

interface ProtectedRouteProps {
    children: React.ReactNode
    role?: UserRole
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { user, profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Authenticating...</p>
                </div>
            </div>
        )
    }

    if (!user) return <Navigate to="/login" replace />

    if (role && profile?.role !== role) {
        if (profile?.role === 'teacher') return <Navigate to="/dashboard" replace />
        return <Navigate to="/github" replace />
    }

    return <>{children}</>
}
