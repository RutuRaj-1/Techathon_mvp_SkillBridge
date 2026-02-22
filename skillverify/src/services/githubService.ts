import api from './api'
import { RepoAnalysis } from '../types/skill'

export async function analyzeGitHubRepo(repoUrl: string): Promise<RepoAnalysis> {
    const response = await api.post<RepoAnalysis>('/api/github/analyze', { repo_url: repoUrl })
    return response.data
}
