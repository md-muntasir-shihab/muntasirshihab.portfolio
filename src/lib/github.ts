// src/lib/github.ts
// GitHub API Utility — Live data with Upstash Redis caching
// সব GitHub data এখান থেকে fetch হবে (1 hour cache)

import { cacheGet, cacheSet, githubCacheKey } from "./upstash"

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME || "md-muntasir-shihab"
const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN

// GitHub API headers (authenticated = 5000 req/hour)
const githubHeaders: Record<string, string> = {
  Accept: "application/vnd.github.v3+json",
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
}

// Cache TTL: 1 hour (3600 seconds)
const CACHE_TTL = 3600

// ========================
// Types
// ========================

export interface GitHubUserProfile {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
  html_url: string
  created_at: string
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
  fork: boolean
  updated_at: string
  pushed_at: string
}

export interface GitHubContributionDay {
  contributionCount: number
  date: string
}

export interface GitHubContributionWeek {
  contributionDays: GitHubContributionDay[]
}

export interface GitHubContributions {
  totalContributions: number
  weeks: GitHubContributionWeek[]
}

export interface GitHubLanguageStat {
  name: string
  count: number
  color: string
  percentage: number
}

export interface GitHubStats {
  user: GitHubUserProfile
  repos: GitHubRepo[]
  totalStars: number
  totalForks: number
  totalCommits: number
  contributions: GitHubContributions
  languages: GitHubLanguageStat[]
  currentStreak: number
  longestStreak: number
}

// ========================
// Fetch Functions
// ========================

/**
 * GitHub user profile fetch করো (with cache)
 */
async function fetchUser(): Promise<GitHubUserProfile> {
  const cacheKey = githubCacheKey("user", GITHUB_USERNAME)
  const cached = await cacheGet<GitHubUserProfile>(cacheKey)
  if (cached) return cached

  const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
    headers: githubHeaders,
  })
  if (!res.ok) throw new Error(`GitHub user fetch failed: ${res.status}`)
  const data: GitHubUserProfile = await res.json()
  await cacheSet(cacheKey, data, CACHE_TTL)
  return data
}

/**
 * GitHub repos fetch করো (with cache)
 */
async function fetchRepos(): Promise<GitHubRepo[]> {
  const cacheKey = githubCacheKey("repos", GITHUB_USERNAME)
  const cached = await cacheGet<GitHubRepo[]>(cacheKey)
  if (cached) return cached

  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
    { headers: githubHeaders }
  )
  if (!res.ok) throw new Error(`GitHub repos fetch failed: ${res.status}`)
  const data: GitHubRepo[] = await res.json()
  // শুধু original repos (fork skip)
  const originalRepos = data.filter((r) => !r.fork)
  await cacheSet(cacheKey, originalRepos, CACHE_TTL)
  return originalRepos
}

/**
 * GitHub contribution calendar fetch করো (GraphQL API — বেশি accurate)
 */
async function fetchContributions(): Promise<GitHubContributions> {
  const cacheKey = githubCacheKey("contributions", GITHUB_USERNAME)
  const cached = await cacheGet<GitHubContributions>(cacheKey)
  if (cached) return cached

  // GraphQL query for contribution calendar
  const query = `
    query {
      user(login: "${GITHUB_USERNAME}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...githubHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) throw new Error(`GitHub GraphQL failed: ${res.status}`)
  const result = await res.json()

  if (result.errors) {
    console.warn("[GitHub] GraphQL errors:", result.errors)
    // fallback: empty contributions
    return { totalContributions: 0, weeks: [] }
  }

  const calendar = result.data?.user?.contributionsCollection?.contributionCalendar
  const data: GitHubContributions = {
    totalContributions: calendar?.totalContributions || 0,
    weeks: calendar?.weeks || [],
  }

  await cacheSet(cacheKey, data, CACHE_TTL)
  return data
}

/**
 * Language statistics calculate করো (repos থেকে)
 */
function calculateLanguages(repos: GitHubRepo[]): GitHubLanguageStat[] {
  const langMap: Record<string, { count: number; color: string }> = {}

  // GitHub language colors
  const langColors: Record<string, string> = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    Go: "#00ADD8",
    Rust: "#dea584",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    Shell: "#89e051",
    Vue: "#41b883",
    Svelte: "#ff3e00",
    Markdown: "#083fa1",
    SCSS: "#c6538c",
    "Jupyter Notebook": "#DA5B0B",
  }

  repos.forEach((repo) => {
    if (repo.language) {
      if (!langMap[repo.language]) {
        langMap[repo.language] = { count: 0, color: langColors[repo.language] || "#8b8b8b" }
      }
      langMap[repo.language].count++
    }
  })

  const total = Object.values(langMap).reduce((sum, l) => sum + l.count, 0)

  return Object.entries(langMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      color: data.color,
      percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
}

/**
 * Streak calculate করো (contribution calendar থেকে)
 */
function calculateStreak(contributions: GitHubContributions) {
  const allDays = contributions.weeks.flatMap((w) => w.contributionDays)

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Reverse chronological order এ calculate
  const reversed = [...allDays].reverse()

  for (const day of reversed) {
    if (day.contributionCount > 0) {
      tempStreak++
      if (tempStreak > longestStreak) longestStreak = tempStreak
    } else {
      // streak break
      if (currentStreak === 0) {
        currentStreak = tempStreak
      }
      tempStreak = 0
    }
  }

  // যদি streak still active থাকে (today ও contribution আছে)
  if (tempStreak > 0) {
    currentStreak = tempStreak
  }

  return { currentStreak, longestStreak }
}

// ========================
// Main fetch function — সব data একসাথে
// ========================

/**
 * সব GitHub data একসাথে fetch করো (cached)
 * একবার call করলেই সব data পাওয়া যাবে
 */
export async function fetchGitHubStats(): Promise<GitHubStats> {
  const [user, repos, contributions] = await Promise.all([
    fetchUser().catch(() => ({
      login: GITHUB_USERNAME,
      name: GITHUB_USERNAME,
      avatar_url: "",
      bio: null,
      public_repos: 0,
      followers: 0,
      following: 0,
      html_url: `https://github.com/${GITHUB_USERNAME}`,
      created_at: "",
    })),
    fetchRepos().catch(() => []),
    fetchContributions().catch(() => ({ totalContributions: 0, weeks: [] })),
  ])

  const languages = calculateLanguages(repos)
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0)
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0)
  const { currentStreak, longestStreak } = calculateStreak(contributions)

  return {
    user,
    repos,
    totalStars,
    totalForks,
    totalCommits: contributions.totalContributions,
    contributions,
    languages,
    currentStreak,
    longestStreak,
  }
}

/**
 * GitHub cache invalidate করো (force refresh)
 */
export async function invalidateGitHubCache(): Promise<void> {
  const { cacheDelete } = await import("./upstash")
  await Promise.all([
    cacheDelete(githubCacheKey("user", GITHUB_USERNAME)),
    cacheDelete(githubCacheKey("repos", GITHUB_USERNAME)),
    cacheDelete(githubCacheKey("contributions", GITHUB_USERNAME)),
  ])
}

export { GITHUB_USERNAME }
