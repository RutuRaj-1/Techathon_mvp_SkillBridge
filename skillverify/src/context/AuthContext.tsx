import React, { createContext, useContext, useEffect, useState } from 'react'
import {
    auth, db,
    onAuthStateChanged, signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    doc, setDoc, getDoc,
    User,
} from '../services/firebase'
import { UserProfile, UserRole } from '../types/user'

interface AuthContextType {
    user: User | null
    profile: UserProfile | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    signInWithGoogle: (role?: UserRole) => Promise<void>
    register: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser)
            if (firebaseUser) {
                const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
                if (snap.exists()) {
                    setProfile(snap.data() as UserProfile)
                }
            } else {
                setProfile(null)
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password)
    }

    const register = async (email: string, password: string, displayName: string, role: UserRole) => {
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(newUser, { displayName })
        const userProfile: UserProfile = {
            uid: newUser.uid,
            email,
            displayName,
            role,
            skills: [],
            createdAt: new Date().toISOString(),
        }
        await setDoc(doc(db, 'users', newUser.uid), userProfile)
        setProfile(userProfile)
    }

    const signInWithGoogle = async (role: UserRole = 'student') => {
        const provider = new GoogleAuthProvider()
        const { user: newUser } = await signInWithPopup(auth, provider)

        // Check if user exists in firestore
        const snap = await getDoc(doc(db, 'users', newUser.uid))
        if (!snap.exists()) {
            // First time login - create default profile
            const userProfile: UserProfile = {
                uid: newUser.uid,
                email: newUser.email || '',
                displayName: newUser.displayName || 'User',
                role,
                skills: [],
                createdAt: new Date().toISOString(),
            }
            await setDoc(doc(db, 'users', newUser.uid), userProfile)
            setProfile(userProfile)
        } else {
            setProfile(snap.data() as UserProfile)
        }
    }

    const logout = async () => {
        await signOut(auth)
        setProfile(null)
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, signInWithGoogle, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext(): AuthContextType {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
    return ctx
}
