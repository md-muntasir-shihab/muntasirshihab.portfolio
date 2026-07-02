// src/components/GitHubLiveStats.tsx
// Live GitHub Stats — Firebase/Supabase/Upstash এর সাথে connected
// Static data এর বদলে live GitHub API data দেখাবে

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, GitFork, Users, BookMarked, Flame, RefreshCw, ExternalLink } from "lucide-react"
import { fetchGitHubStats, invalidateGitHubCache, type GitHubStats as TGitHubStats } from "../lib/github"
import { githubStats as fallbackStats } from "../lib/data"
import type { Lang } from "../lib/data"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

interface Props {
  lang: Lang
  light?: boolean
}

export function GitHubLiveStats({ lang, light = false }: Props) {
  const [stats, setStats] = useState<TGitHubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const lt = light
  const accent = lt ? "text-[#a0782e]" : "text-[#f0cf85]"
  const monoAccent = lt ? "text-[#a0782e]" : "text-[#e5c371]"
  const subtle = lt ? "text-[#8a8278]" : "text-[#a7acb9]"

  async function load(force = false) {
    setLoading(true)
    setError(null)
    if (force) setRefreshing(true)
    try {
      if (force) await invalidateGitHubCache()
      const data = await fetchGitHubStats()
      setStats(data)
    } catch (err) {
      console.error("[GitHub] Live fetch failed:", err)
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Loading skeleton
  if (loading && !stats) {
    return (
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="glass rounded-[18px] p-5 animate-pulse">
            <div className="h-4 w-40 bg-white/10 rounded mb-4" />
            <div className="grid grid-cols-[repeat(52,minmax(0,1fr))] gap-[3.5px]">
              {Array.from({ length: 364 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-[3px] bg-white/5" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="glass rounded-[18px] p-5 animate-pulse">
            <div className="h-4 w-24 bg-white/10 rounded mb-3" />
            <div className="w-full aspect-square rounded-full bg-white/5" />
          </div>
          <div className="glass rounded-[18px] p-5 animate-pulse">
            <div className="h-4 w-16 bg-white/10 rounded mb-2" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-white/5 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Live data বা fallback
  const liveData = stats
  const totalContributions = liveData?.totalCommits || fallbackStats.contributions
  const streak = liveData?.currentStreak || fallbackStats.streak
  const repos = liveData?.repos.length || liveData?.user.public_repos || fallbackStats.repos
  const stars = liveData?.totalStars || fallbackStats.stars
  const followers = liveData?.user.followers || fallbackStats.followers
  const forks = liveData?.totalForks || 0

  // Languages — live বা fallback
  const languages =
    liveData && liveData.languages.length > 0
      ? liveData.languages.slice(0, 6)
      : fallbackStats.langs.map((l) => ({ name: l.name, count: 0, color: "#e7b84b", percentage: l.pct }))

  // Contribution heatmap data
  const contributionWeeks = liveData?.contributions.weeks || []

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {/* Contribution Heatmap */}
      <div className="lg:col-span-2 space-y-5">
        <div className="glass rounded-[18px] p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className={`text-[12px] font-mono ${monoAccent}`}>
              {t("CONTRIBUTION HEATMAP", "কন্ট্রিবিউশন হিটম্যাপ", lang)}
            </div>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className={`flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-full ${lt ? "bg-[#f0e6cf] text-[#8a6b2b] border border-[#dbc897]" : "bg-white/5 border border-white/10 text-[#c8cad4]"} hover:opacity-80 disabled:opacity-50`}
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? t("Refreshing...", "রিফ্রেশ...", lang) : t("Refresh", "রিফ্রেশ", lang)}
            </button>
          </div>

          {contributionWeeks.length > 0 ? (
            <div className="grid grid-cols-[repeat(52,minmax(0,1fr))] gap-[3.5px] overflow-x-auto">
              {contributionWeeks.flatMap((week) =>
                week.contributionDays.map((day, i) => {
                  const count = day.contributionCount
                  let intensity = 0.06
                  if (count > 0) intensity = 0.18
                  if (count >= 3) intensity = 0.35
                  if (count >= 6) intensity = 0.55
                  if (count >= 10) intensity = 0.8
                  return (
                    <motion.div
                      key={`${day.date}-${i}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="aspect-square rounded-[3px] cursor-pointer hover:scale-125 transition-transform"
                      style={{ background: `rgba(231,184,75,${intensity})` }}
                      title={`${day.date}: ${count} contributions`}
                    />
                  )
                })
              )}
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(52,minmax(0,1fr))] gap-[3.5px]">
              {Array.from({ length: 364 }).map((_, i) => {
                const intensity = [0.07, 0.17, 0.3, 0.52, 0.8][i % 5]
                return <div key={i} className="aspect-square rounded-[3px]" style={{ background: `rgba(231,184,75,${intensity})` }} />
              })}
            </div>
          )}

          <div className={`flex flex-wrap gap-x-6 gap-y-2 mt-5 text-[12.5px] ${subtle}`}>
            <span>{t("Contributions", "কন্ট্রিবিউশন", lang)}: <b className={accent}>{totalContributions}</b></span>
            <span>{t("Streak", "ধারাবাহিক", lang)}: <b className={accent}>{streak} {t("days", "দিন", lang)}</b> 🔥</span>
            <span>{t("Repos", "রিপো", lang)}: <b className={accent}>{repos}</b></span>
          </div>
          {error && (
            <div className={`mt-3 text-[11px] ${lt ? "text-[#a0782e]" : "text-[#d5b56a]"}`}>
              {t("(Showing cached/sample data)", "(ক্যাশেড/নমুনা ডেটা দেখানো হচ্ছে)", lang)}
            </div>
          )}
        </div>

        {/* Top Repositories */}
        {liveData && liveData.repos.length > 0 && (
          <div className="glass rounded-[18px] p-5">
            <div className={`text-[12px] font-mono mb-4 ${monoAccent}`}>{t("TOP REPOSITORIES", "শীর্ষ রিপোজিটরি", lang)}</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {liveData.repos
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 4)
                .map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className={`block rounded-[12px] p-3.5 transition hover:scale-[1.02] ${lt ? "bg-[#f5f3ee] border border-[#e5e0d4] hover:border-[#dbc897]" : "bg-white/[0.03] border border-white/[0.07] hover:border-yellow-500/25"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-[600] text-[13.5px] truncate">{repo.name}</div>
                      <ExternalLink size={13} className={accent} />
                    </div>
                    {repo.description && (
                      <div className={`text-[12px] mt-1.5 line-clamp-2 ${lt ? "text-[#7a7366]" : "text-[#aeb3c0]"}`}>{repo.description}</div>
                    )}
                    <div className="flex items-center gap-3 mt-2.5 text-[11.5px]">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: liveData.languages.find((l) => l.name === repo.language)?.color || "#888" }} />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Star size={11} /> {repo.stargazers_count}</span>
                      <span className="flex items-center gap-1"><GitFork size={11} /> {repo.forks_count}</span>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-5">
        {/* Language Mix */}
        <div className="glass rounded-[18px] p-5 hidden lg:block">
          <div className={`text-[12px] font-mono mb-3 ${monoAccent}`}>{t("LANGUAGE MIX", "ভাষার মিশ্রণ", lang)}</div>
          <div
            className="w-full aspect-square rounded-full"
            style={{
              background: `conic-gradient(${languages
                .map((l, i) => {
                  const start = languages.slice(0, i).reduce((s, x) => s + x.percentage, 0)
                  return `${l.color} ${start}% ${start + l.percentage}%`
                })
                .join(", ")})`,
            }}
          />
          <div className="grid grid-cols-2 gap-[8px] text-[12px] mt-4">
            {languages.map((l) => (
              <div key={l.name} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  <span className="truncate">{l.name}</span>
                </span>
                <span className={accent}>{l.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="glass rounded-[18px] p-5">
          <div className={`text-[12px] font-mono mb-3 ${monoAccent}`}>{t("GITHUB STATS", "গিটহাব পরিসংখ্যান", lang)}</div>
          <div className="space-y-[10px]">
            <div className={`flex items-center justify-between text-[13.5px] ${lt ? "text-[#5a5449]" : "text-[#c9ccd6]"}`}>
              <span className="flex items-center gap-2"><Star size={14} className={accent} /> {t("Stars", "স্টার", lang)}</span>
              <b className={accent}>{stars}</b>
            </div>
            <div className={`flex items-center justify-between text-[13.5px] ${lt ? "text-[#5a5449]" : "text-[#c9ccd6]"}`}>
              <span className="flex items-center gap-2"><GitFork size={14} className={accent} /> {t("Forks", "ফর্ক", lang)}</span>
              <b className={accent}>{forks}</b>
            </div>
            <div className={`flex items-center justify-between text-[13.5px] ${lt ? "text-[#5a5449]" : "text-[#c9ccd6]"}`}>
              <span className="flex items-center gap-2"><Users size={14} className={accent} /> {t("Followers", "ফলোয়ার", lang)}</span>
              <b className={accent}>{followers}</b>
            </div>
            <div className={`flex items-center justify-between text-[13.5px] ${lt ? "text-[#5a5449]" : "text-[#c9ccd6]"}`}>
              <span className="flex items-center gap-2"><BookMarked size={14} className={accent} /> {t("Repos", "রিপো", lang)}</span>
              <b className={accent}>{repos}</b>
            </div>
            <div className={`flex items-center justify-between text-[13.5px] ${lt ? "text-[#5a5449]" : "text-[#c9ccd6]"}`}>
              <span className="flex items-center gap-2"><Flame size={14} className={accent} /> {t("Streak", "ধারাবাহিক", lang)}</span>
              <b className={accent}>{streak}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
