import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { auth } from './firebase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
})

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const user = auth.currentUser
    if (user) {
        const token = await user.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response error handler
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const msg = error.response?.data?.detail || error.message || 'An error occurred'
        return Promise.reject(new Error(msg))
    },
)

export default api
