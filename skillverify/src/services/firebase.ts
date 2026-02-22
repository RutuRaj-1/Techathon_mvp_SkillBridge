import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    User,
} from 'firebase/auth'
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    addDoc,
    collection,
    getDocs,
    query,
    where,
} from 'firebase/firestore'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Analytics — only initialise in browser environments that support it
isSupported().then((supported) => {
    if (supported) getAnalytics(app)
})

// Auth & Firestore
export const auth = getAuth(app)
export const db = getFirestore(app)

export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    addDoc,
    collection,
    getDocs,
    query,
    where,
}
export type { User }

export default app
