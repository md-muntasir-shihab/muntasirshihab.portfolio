// src/lib/analytics.ts
// Visitor tracking & analytics data fetching

import { supabase } from "./supabase"

// ---------- User Agent Parser ----------
export function parseUserAgent(ua: string) {
  let device = "Desktop"
  let browser = "Unknown"
  let os = "Unknown"

  if (/iPad|Tablet/i.test(ua)) device = "Tablet"
  else if (/Mobile|Android|iPhone|iPod/i.test(ua)) device = "Mobile"

  if (/Edg/i.test(ua)) browser = "Edge"
  else if (/OPR|Opera/i.test(ua)) browser = "Opera"
  else if (/Chrome/i.test(ua)) browser = "Chrome"
  else if (/Firefox/i.test(ua)) browser = "Firefox"
  else if (/Safari/i.test(ua)) browser = "Safari"

  if (/Windows/i.test(ua)) os = "Windows"
  else if (/Android/i.test(ua)) os = "Android"
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS"
  else if (/Mac/i.test(ua)) os = "macOS"
  else if (/Linux/i.test(ua)) os = "Linux"

  return { device, browser, os }
}

// ---------- Session ID ----------
const SESSION_KEY = "rm_session_id"
function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    sessionStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

// ---------- Geolocation ----------
// ipapi.co can be slow or rate-limited; give it a short timeout and a fallback.
export async function getGeo(): Promise<{ ip: string; country: string; city: string }> {
  const empty = { ip: "", country: "", city: "" }
  const withTimeout = (ms: number) =>
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error("geo timeout")), ms))

  const providers = [
    async () => {
      const res = await fetch("https://ipapi.co/json/")
      if (!res.ok) throw new Error(`ipapi ${res.status}`)
      const g = await res.json()
      return { ip: g.ip || "", country: g.country_name || "", city: g.city || "" }
    },
    async () => {
      // Fallback provider
      const res = await fetch("https://ipwho.is/")
      if (!res.ok) throw new Error(`ipwho ${res.status}`)
      const g = await res.json()
      if (!g.success) throw new Error(g.message || "ipwho failed")
      return { ip: g.ip || "", country: g.country || "", city: g.city || "" }
    },
  ]

  for (const p of providers) {
    try {
      return await Promise.race([p(), withTimeout(5000)])
    } catch {
      // try next provider
    }
  }
  return empty
}

// ---------- Track Visitor ----------
let _startTime = Date.now()

export async function trackVisitor(): Promise<boolean> {
  try {
    const sid = getSessionId()
    // Avoid double tracking within the same session/tab
    if (sessionStorage.getItem("rm_tracked")) {
      _startTime = Date.now()
      return true
    }
    sessionStorage.setItem("rm_tracked", "1")
    _startTime = Date.now()

    const { device, browser, os } = parseUserAgent(navigator.userAgent)
    const referrer = document.referrer
      ? (() => {
          try { return new URL(document.referrer).hostname } catch { return document.referrer }
        })()
      : "Direct"

    const { ip, country, city } = await getGeo()

    const { error } = await supabase.rpc("track_visitor", {
      p_session_id: sid,
      p_country: country,
      p_city: city,
      p_device: device,
      p_browser: browser,
      p_os: os,
      p_ip: ip,
      p_referrer: referrer,
    })

    if (error) {
      console.warn("[Analytics] track_visitor RPC error:", error.message)
      // Clear flag so a later retry can succeed
      sessionStorage.removeItem("rm_tracked")
      return false
    }
    return true
  } catch (e) {
    console.warn("[Analytics] track_visitor failed:", e)
    sessionStorage.removeItem("rm_tracked")
    return false
  }
}

// ---------- Track CV Download ----------
// Centralised so both the public CV page and any other entry point log consistently.
export async function trackCvDownload(): Promise<boolean> {
  try {
    const { device, browser, os } = parseUserAgent(navigator.userAgent)
    let ip = "", country = ""
    try {
      const geo = await getGeo()
      ip = geo.ip; country = geo.country
    } catch { /* ignore */ }

    // device column in cv_downloads is free text; store a compact label
    const deviceLabel = `${device} · ${browser} · ${os}`
    const { error } = await supabase.from("cv_downloads").insert([{
      ip,
      country,
      device: deviceLabel,
    }])
    if (error) {
      console.warn("[Analytics] cv_downloads insert error:", error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn("[Analytics] trackCvDownload failed:", e)
    return false
  }
}

// ---------- Update Duration on page unload ----------
// IMPORTANT: navigator.sendBeacon() CANNOT set custom headers (apikey/Authorization),
// so the Supabase REST endpoint returns 401 and duration is never saved.
// We use fetch() with keepalive:true which survives page unload and allows headers.
export function sendDuration(): void {
  const sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid) return
  const dur = Math.round((Date.now() - _startTime) / 1000)
  if (dur < 2) return

  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/update_visitor_duration`
  const body = JSON.stringify({ p_session_id: sid, p_duration: dur })
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  }

  // Primary path: keepalive fetch (works on unload, supports headers)
  try {
    if (!fetch(url, { method: "POST", headers, body, keepalive: true }).catch(() => {})) {
      // fetch returned falsy only in unsupported environments — fall back below
      throw new Error("fetch unavailable")
    }
  } catch {
    // Last-resort fallback: sendBeacon without headers (may 401, but better than nothing)
    try {
      navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))
    } catch { /* nothing more we can do */ }
  }
}

// ---------- Fetch Full Analytics ----------
export interface AnalyticsData {
  overview: {
    total_visitors: number
    visitors_7d: number
    visitors_30d: number
    visitors_today: number
    total_cv_downloads: number
    cv_downloads_7d: number
    cv_downloads_today: number
    total_messages: number
    unread_messages: number
    messages_7d: number
    avg_duration: number
    returning_visitors: number
    new_visitors: number
    bounce_rate: number
  }
  visitors_by_country: { country: string; count: number }[]
  cv_by_country: { country: string; count: number }[]
  daily_visitors: { date: string; count: number }[]
  daily_cv: { date: string; count: number }[]
  daily_messages: { date: string; count: number }[]
  devices: { name: string; count: number }[]
  browsers: { name: string; count: number }[]
  os_list: { name: string; count: number }[]
  referrers: { name: string; count: number }[]
  recent_visitors: { id: string; country: string; city: string; device: string; browser: string; os: string; referrer: string; duration: number; created_at: string }[]
  recent_cv_downloads: { id: string; country: string; device: string; created_at: string }[]
  top_cities: { city: string; country: string; count: number }[]
  peak_hours: { hour: number; count: number }[]
}

export const emptyAnalytics: AnalyticsData = {
  overview: {
    total_visitors: 0,
    visitors_7d: 0,
    visitors_30d: 0,
    visitors_today: 0,
    total_cv_downloads: 0,
    cv_downloads_7d: 0,
    cv_downloads_today: 0,
    total_messages: 0,
    unread_messages: 0,
    messages_7d: 0,
    avg_duration: 0,
    returning_visitors: 0,
    new_visitors: 0,
    bounce_rate: 0
  },
  visitors_by_country: [], cv_by_country: [], daily_visitors: [], daily_cv: [], daily_messages: [],
  devices: [], browsers: [], os_list: [], referrers: [],
  recent_visitors: [], recent_cv_downloads: [],
  top_cities: [], peak_hours: []
}

// Result includes an error code so the UI can tell "no data yet" apart from "RPC not deployed".
export type AnalyticsErrorCode = "none" | "function_not_found" | "permission_denied" | "network" | "unknown"
export interface AnalyticsResult {
  data: AnalyticsData
  error: AnalyticsErrorCode
  errorMessage?: string
}

export async function fetchAnalytics(days = 30): Promise<AnalyticsResult> {
  try {
    const { data, error } = await supabase.rpc("get_full_analytics", { p_days: days })
    if (error) {
      const msg = error.message || ""
      let code: AnalyticsErrorCode = "unknown"
      if (msg.includes("Could not find the function") || msg.includes("function") && msg.includes("does not exist")) {
        code = "function_not_found"
      } else if (msg.includes("permission denied") || msg.includes("JWT") || msg.includes("role") || msg.includes("Denied")) {
        code = "permission_denied"
      }
      console.warn("[Analytics] RPC error:", msg)
      return { data: emptyAnalytics, error: code, errorMessage: msg }
    }
    return { data: (data as AnalyticsData) || emptyAnalytics, error: "none" }
  } catch (e: any) {
    console.warn("[Analytics] fetch failed:", e)
    const msg = String(e?.message || e)
    const code: AnalyticsErrorCode = /network|fetch|Failed to fetch/i.test(msg) ? "network" : "unknown"
    return { data: emptyAnalytics, error: code, errorMessage: msg }
  }
}

// ---------- Country Flag Helper ----------
const FLAG_MAP: Record<string, string> = {
  Bangladesh:"🇧🇩",India:"🇮🇳","United States":"🇺🇸","United Kingdom":"🇬🇧",Canada:"🇨🇦",
  Germany:"🇩🇪",France:"🇫🇷",Japan:"🇯🇵",China:"🇨🇳",Australia:"🇦🇺",Brazil:"🇧🇷",
  Russia:"🇷🇺",Pakistan:"🇵🇰",Indonesia:"🇮🇩",Turkey:"🇹🇷",Italy:"🇮🇹",Spain:"🇪🇸",
  Mexico:"🇲🇽","South Korea":"🇰🇷",Netherlands:"🇳🇱",Sweden:"🇸🇪",Norway:"🇳🇴",
  Denmark:"🇩🇰",Finland:"🇫🇮",Poland:"🇵🇱",Portugal:"🇵🇹",Singapore:"🇸🇬",
  Malaysia:"🇲🇾",Thailand:"🇹🇭",Vietnam:"🇻🇳",Philippines:"🇵🇭",
  "Saudi Arabia":"🇸🇦","United Arab Emirates":"🇦🇪",Nepal:"🇳🇵",Myanmar:"🇲🇲",
  "Sri Lanka":"🇱🇰",Egypt:"🇪🇬",Nigeria:"🇳🇬","South Africa":"🇿🇦",
  Argentina:"🇦🇷",Colombia:"🇨🇴",Chile:"🇨🇱",Ireland:"🇮🇪",Switzerland:"🇨🇭",
  Austria:"🇦🇹",Belgium:"🇧🇪",Ukraine:"🇺🇦",Romania:"🇷🇴",Greece:"🇬🇷",
  "Czech Republic":"🇨🇿",Hungary:"🇭🇺","New Zealand":"🇳🇿",Israel:"🇮🇱",
}
export function countryFlag(name: string): string {
  return FLAG_MAP[name] || "🌍"
}

// ---------- Realtime Activity Feed ----------
// A unified event type for the live activity feed. Built from inserts into
// visitors / cv_downloads / messages tables via Supabase Realtime.
export type ActivityType = "visitor" | "cv" | "message"
export interface ActivityEvent {
  id: string
  type: ActivityType
  country: string
  city: string
  device: string
  // ISO timestamp from the row's created_at
  createdAt: string
  // Optional human label (e.g. message sender name) — only for non-sensitive types
  label?: string
}

// Normalise a raw realtime payload (different per-table) into an ActivityEvent.
export function toActivityEvent(type: ActivityType, row: any): ActivityEvent | null {
  if (!row) return null
  const id = row.id || `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const createdAt = row.created_at || new Date().toISOString()
  if (type === "message") {
    return { id, type, country: row.country || "", city: "", device: "", createdAt, label: row.name || "" }
  }
  return {
    id, type, createdAt,
    country: row.country || "",
    city: row.city || "",
    device: row.device || "",
  }
}

// Human-readable relative time, kept here so the feed component stays light.
export function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 5) return "just now"
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ---------- CSV Export ----------
// Build a CSV string from the analytics payload and trigger a browser download.
function csvEscape(v: any): string {
  const s = v == null ? "" : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
function csvRow(cols: any[]): string {
  return cols.map(csvEscape).join(",")
}
export function exportAnalyticsCsv(data: AnalyticsData, rangeLabel: string): void {
  const lines: string[] = []
  lines.push(csvRow([`Analytics Export - ${rangeLabel} - ${new Date().toISOString()}`]))
  lines.push("")
  // Overview
  lines.push("SECTION,OVERVIEW")
  lines.push("Metric,Value")
  const o = data.overview
  Object.entries({
    "Total Visitors": o.total_visitors,
    "Visitors (7d)": o.visitors_7d,
    "Visitors (30d)": o.visitors_30d,
    "Visitors Today": o.visitors_today,
    "CV Downloads": o.total_cv_downloads,
    "Messages": o.total_messages,
    "Unread Messages": o.unread_messages,
    "Avg Duration (s)": o.avg_duration,
    "Returning Visitors": o.returning_visitors,
    "New Visitors": o.new_visitors,
    "Bounce Rate (%)": o.bounce_rate,
  }).forEach(([k, v]) => lines.push(csvRow([k, v])))
  lines.push("")
  // Visitors by country
  lines.push("SECTION,VISITORS BY COUNTRY")
  lines.push("Country,Count")
  data.visitors_by_country.forEach(r => lines.push(csvRow([r.country, r.count])))
  lines.push("")
  // Top cities
  lines.push("SECTION,TOP CITIES")
  lines.push("City,Country,Count")
  data.top_cities.forEach(r => lines.push(csvRow([r.city, r.country, r.count])))
  lines.push("")
  // Devices / Browsers / OS
  lines.push("SECTION,DEVICES")
  lines.push("Device,Count")
  data.devices.forEach(r => lines.push(csvRow([r.name, r.count])))
  lines.push("")
  lines.push("SECTION,BROWSERS")
  lines.push("Browser,Count")
  data.browsers.forEach(r => lines.push(csvRow([r.name, r.count])))
  lines.push("")
  lines.push("SECTION,OPERATING SYSTEMS")
  lines.push("OS,Count")
  data.os_list.forEach(r => lines.push(csvRow([r.name, r.count])))
  lines.push("")
  // Referrers
  lines.push("SECTION,TRAFFIC SOURCES")
  lines.push("Source,Visits")
  data.referrers.forEach(r => lines.push(csvRow([r.name, r.count])))
  lines.push("")
  // Recent visitors
  lines.push("SECTION,RECENT VISITORS")
  lines.push("Country,City,Device,Browser,OS,Duration(s),Created At")
  data.recent_visitors.forEach(r => lines.push(csvRow([r.country, r.city, r.device, r.browser, r.os, r.duration, r.created_at])))

  const csv = lines.join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
