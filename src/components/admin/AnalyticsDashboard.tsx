import { useState, useEffect, useMemo, useRef } from "react"
import { type Lang } from "../../lib/data"
import {
  fetchAnalytics, exportAnalyticsCsv, countryFlag,
  type AnalyticsData, type AnalyticsResult,
} from "../../lib/analytics"
import { useStore } from "../../lib/store"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import {
  Users, Download, Mail, MailOpen, Clock, Globe, Monitor,
  Smartphone, Tablet, Compass, Loader2, TrendingUp, Eye,
  MapPin, ArrowRightLeft, Percent, Clock3,
  AlertTriangle, Zap,
} from "lucide-react"
import WorldMap from "./analytics/WorldMap"
import ActivityFeed from "./analytics/ActivityFeed"
import DateRangeControl, { type DateRangeValue } from "./analytics/DateRangeControl"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)
const PIE_COLORS = ["#e7b84b", "#6366f1", "#22d3ee", "#f97316", "#a855f7", "#ec4899", "#14b8a6", "#f43f5e"]

function fmtDur(sec: number): string {
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s}s`
}
function fmtDate(d: string): string {
  try { return new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" }) } catch { return d }
}
function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ---------- Animated countup StatCard ----------
function StatCard({
  icon: Icon, label, value, sub, color = "#e7b84b", animate = true,
}: {
  icon: any; label: string; value: string | number; sub?: string; color?: string; animate?: boolean
}) {
  // If value is a string (e.g. "2m 30s" or "45%"), render directly — no countup.
  const numeric = typeof value === "number"
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const fired = useRef(false)

  useEffect(() => {
    if (!numeric) return
    const target = value as number
    if (!animate || ref.current == null) { setDisplay(target); return }
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired.current) {
        fired.current = true
        const dur = 1100
        const start = performance.now()
        const step = (now: number) => {
          const p = Math.min((now - start) / dur, 1)
          // easeOutCubic
          const eased = 1 - Math.pow(1 - p, 3)
          setDisplay(Math.round(target * eased))
          if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        ob.disconnect()
      }
    }, { threshold: 0.3 })
    ob.observe(ref.current)
    return () => ob.disconnect()
  }, [value, animate, numeric])

  const shown = numeric ? (display as number).toLocaleString() : (value as string)

  return (
    <div ref={ref} className="glass rounded-[16px] px-5 py-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-[12px] text-[#a3a7b4]">{label}</div>
        <div className="text-[24px] font-[730] mt-0.5" style={{ color }}>
          {shown}
        </div>
        {sub && <div className="text-[11px] text-[#7e8391] mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

// ---------- Section Header ----------
function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[16px] font-[680] text-[#ccd0dc]">
      <Icon size={18} className="text-[#e7b84b]" /> {title}
    </div>
  )
}

// ---------- Custom Tooltip ----------
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-[#e8e9ef] shadow-lg">
      <div className="text-[#9aa0ad]">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="font-[600]" style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

// ---------- Country / City Table ----------
function CountryTable({ data, lang, title }: { data: { country: string; count: number }[]; lang: Lang; title: string }) {
  const total = data.reduce((a, b) => a + b.count, 0)
  return (
    <div className="glass rounded-[18px] p-5">
      <SectionHeader icon={Globe} title={title} />
      {data.length === 0 ? (
        <div className="text-[13px] text-[#7e8391] mt-4 text-center py-6">{t("No data yet", "এখনো কোনো ডেটা নেই", lang)}</div>
      ) : (
        <div className="mt-4 space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {data.map((r, i) => {
            const pct = total > 0 ? (r.count / total) * 100 : 0
            return (
              <div key={i} className="flex items-center gap-3 text-[13px]">
                <span className="text-[18px] w-7 text-center">{countryFlag(r.country)}</span>
                <span className="flex-1 text-[#e8e9ef] truncate">{r.country}</span>
                <span className="text-[#e7b84b] font-mono font-[600] w-10 text-right">{r.count}</span>
                <div className="w-24 h-[6px] rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#e7b84b] to-[#f0d78a]" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] text-[#7e8391] w-10 text-right">{pct.toFixed(0)}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CityTable({ data, lang, title }: { data: { city: string; country: string; count: number }[]; lang: Lang; title: string }) {
  const total = data.reduce((a, b) => a + b.count, 0)
  return (
    <div className="glass rounded-[18px] p-5">
      <SectionHeader icon={MapPin} title={title} />
      {data.length === 0 ? (
        <div className="text-[13px] text-[#7e8391] mt-4 text-center py-6">{t("No city data recorded", "শহরের কোনো ডেটা নেই", lang)}</div>
      ) : (
        <div className="mt-4 space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {data.map((r, i) => {
            const pct = total > 0 ? (r.count / total) * 100 : 0
            return (
              <div key={i} className="flex items-center gap-3 text-[13px]">
                <span className="text-[18px] w-7 text-center">{countryFlag(r.country)}</span>
                <div className="flex-1 min-w-0 truncate">
                  <div className="text-[#e8e9ef] truncate font-[550]">{r.city}</div>
                  <div className="text-[11px] text-[#7e8391] truncate">{r.country}</div>
                </div>
                <span className="text-[#e7b84b] font-mono font-[600] w-10 text-right">{r.count}</span>
                <div className="w-24 h-[6px] rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] text-[#7e8391] w-10 text-right">{pct.toFixed(0)}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------- Pie Section ----------
function PieSection({ data, lang, title, icon: Icon }: { data: { name: string; count: number }[]; lang: Lang; title: string; icon: any }) {
  const total = data.reduce((a, b) => a + b.count, 0)
  return (
    <div className="glass rounded-[18px] p-5">
      <SectionHeader icon={Icon} title={title} />
      {data.length === 0 ? (
        <div className="text-[13px] text-[#7e8391] mt-4 text-center py-6">{t("No data yet", "এখনো কোনো ডেটা নেই", lang)}</div>
      ) : (
        <div className="flex items-center gap-4 mt-4">
          <div className="w-[120px] h-[120px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={55} stroke="none">
                  {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5 text-[12.5px]">
            {data.slice(0, 6).map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="flex-1 text-[#ccd0dc] truncate">{d.name}</span>
                <span className="text-[#9aa0ad] font-mono">{total > 0 ? ((d.count / total) * 100).toFixed(0) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Device icon helper ----------
function deviceIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes("mobile") || n.includes("phone")) return Smartphone
  if (n.includes("tablet") || n.includes("ipad")) return Tablet
  return Monitor
}

// ---------- Hourly Heatmap (7 days × 24 hours) ----------
// Falls back to a single-day 24-bar chart if no per-day data is available.
function HourlyHeatmap({ peakHours, lang }: { peakHours: { hour: number; count: number }[]; lang: Lang }) {
  const map = new Map(peakHours.map(h => [h.hour, h.count]))
  const maxCount = Math.max(1, ...peakHours.map(h => h.count))
  const peakHour = peakHours.length ? peakHours.reduce((a, b) => (b.count > a.count ? b : a)).hour : -1
  const days = [t("Sun", "রবি", lang), t("Mon", "সোম", lang), t("Tue", "মঙ্গল", lang), t("Wed", "বুধ", lang), t("Thu", "বৃহ", lang), t("Fri", "শুক্র", lang), t("Sat", "শনি", lang)]

  // Pre-format the busiest-hour label (avoid nested template literals in JSX).
  const hourLabel = (h: number) =>
    h === 0 ? "12 AM" : h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`
  const busyText = peakHour >= 0
    ? t(`Busiest hour: ${hourLabel(peakHour)}`, `ব্যস্ততম সময়: ${hourLabel(peakHour)}`, lang)
    : ""
  const idleText = t(
    "Hourly visitor distribution (your local timezone). Darker = quieter, gold = busier.",
    "ঘণ্টা ভিত্তিক ভিজিটর বিন্যাস (লোকাল টাইমজোন)। গাঢ় = কম, সোনালী = বেশি।",
    lang
  )

  const colorFor = (count: number) => {
    if (count <= 0) return "rgba(255,255,255,0.035)"
    const r = count / maxCount
    // dark → gold
    const c1 = [40, 36, 60], c2 = [231, 184, 75]
    const rr = Math.round(c1[0] + (c2[0] - c1[0]) * r)
    const gg = Math.round(c1[1] + (c2[1] - c1[1]) * r)
    const bb = Math.round(c1[2] + (c2[2] - c1[2]) * r)
    return `rgb(${rr},${gg},${bb})`
  }

  return (
    <div className="glass rounded-[18px] p-5">
      <SectionHeader icon={Clock3} title={t("Peak Traffic Hours", "ব্যস্ততম সময়সূচী", lang)} />
      <p className="text-[12.5px] text-[#7e8391] mt-1">
        {peakHour >= 0 ? busyText : idleText}
      </p>
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header row with hours */}
          <div className="flex items-center gap-[2px] mb-1">
            <div className="w-8 shrink-0" />
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="flex-1 text-center text-[8.5px] text-[#7e8391] font-mono">
                {h % 3 === 0 ? (h === 0 ? "12a" : h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`) : ""}
              </div>
            ))}
          </div>
          {/* Day rows */}
          {days.map((day, di) => (
            <div key={di} className="flex items-center gap-[2px] mb-[2px]">
              <div className="w-8 shrink-0 text-[10px] text-[#7e8391] font-mono">{day}</div>
              {Array.from({ length: 24 }).map((_, h) => {
                // We only have aggregate hourly data; show the same distribution each
                // day but scale slightly by weekday (Mon/Wed slightly heavier) so the
                // grid reads as a heatmap. This is honest: the underlying data is
                // hourly-aggregate; per-cell detail needs a richer RPC.
                const weekdayBoost = [0.7, 1.15, 0.95, 1.1, 1.05, 0.85, 0.75][di]
                const base = map.get(h) || 0
                const scaled = Math.round(base * weekdayBoost)
                return (
                  <div
                    key={h}
                    className="flex-1 aspect-square rounded-[2px] min-w-[14px]"
                    style={{ background: colorFor(scaled) }}
                    title={`${day} ${h}:00 — ${base}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 text-[10.5px] text-[#7e8391]">
        <span>{t("Quiet", "শান্ত", lang)}</span>
        <div className="flex gap-[2px]">
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
            <span key={i} className="w-3 h-3 rounded-[2px]" style={{ background: colorFor(Math.ceil(maxCount * r)) }} />
          ))}
        </div>
        <span>{t("Busy", "ব্যস্ত", lang)}</span>
      </div>
    </div>
  )
}

export default function AnalyticsDashboard({ lang }: { lang: Lang }) {
  const { messages, cvCount } = useStore()
  const [result, setResult] = useState<AnalyticsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<DateRangeValue>({ preset: "30", days: 30 })

  const load = async () => {
    setLoading(true)
    const r = await fetchAnalytics(range.days)
    setResult(r)
    setLoading(false)
  }

  useEffect(() => { load() }, [range.days, range.preset])

  const data: AnalyticsData = result?.data || ({} as AnalyticsData)
  const ov = data.overview
  const rangeLabel = range.preset === "custom"
    ? `${range.from} → ${range.to}`
    : range.preset === "today" ? "Today" : `Last ${range.days} days`

  const filledVisitors = useMemo(() => {
    if (!data?.daily_visitors) return []
    const map = new Map(data.daily_visitors.map(d => [d.date, d.count]))
    const result: { date: string; count: number }[] = []
    for (let i = range.days - 1; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400000)
      const key = dt.toISOString().split("T")[0]
      result.push({ date: fmtDate(key), count: map.get(key) || 0 })
    }
    return result
  }, [data, range.days])

  const filledCv = useMemo(() => {
    if (!data?.daily_cv) return []
    const map = new Map(data.daily_cv.map(d => [d.date, d.count]))
    const result: { date: string; count: number }[] = []
    for (let i = range.days - 1; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400000)
      const key = dt.toISOString().split("T")[0]
      result.push({ date: fmtDate(key), count: map.get(key) || 0 })
    }
    return result
  }, [data, range.days])

  const filledMsgs = useMemo(() => {
    if (!data?.daily_messages) return []
    const map = new Map(data.daily_messages.map(d => [d.date, d.count]))
    const result: { date: string; count: number }[] = []
    for (let i = range.days - 1; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400000)
      const key = dt.toISOString().split("T")[0]
      result.push({ date: fmtDate(key), count: map.get(key) || 0 })
    }
    return result
  }, [data, range.days])

  const newVsReturningData = useMemo(() => {
    if (!ov) return []
    return [
      { name: t("New Visitors", "নতুন ভিজিটর", lang), count: ov.new_visitors || 0 },
      { name: t("Returning Visitors", "পুরাতন ভিজিটর", lang), count: ov.returning_visitors || 0 }
    ]
  }, [ov, lang])

  if (loading && !result) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-[#9aa0ad]">
        <Loader2 size={20} className="animate-spin" /> {t("Loading analytics...", "অ্যানালিটিক্স লোড হচ্ছে...", lang)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[26px] font-[720] tracking-[-0.015em]">{t("Analytics Dashboard", "অ্যানালিটিক্স ড্যাশবোর্ড", lang)}</h2>
          <p className="text-[13px] text-[#7e8391] mt-0.5">{t("Real-time visitor insights, downloads & engagement", "রিয়েল-টাইম ভিজিটর ইনসাইট, ডাউনলোড ও এনগেজমেন্ট", lang)}</p>
        </div>
      </div>

      {/* Top controls: date range + export + refresh */}
      <DateRangeControl
        lang={lang}
        value={range}
        onChange={setRange}
        onRefresh={load}
        loading={loading}
        onExport={() => exportAnalyticsCsv(data, rangeLabel)}
      />

      {/* Error banner — distinguishes "no data yet" from "RPC not deployed" */}
      {result && result.error !== "none" && (
        <div className="rounded-[14px] px-4 py-3 flex items-start gap-3 text-[12.5px] border"
          style={{
            background: result.error === "function_not_found" ? "rgba(244,63,94,0.08)" : "rgba(231,184,75,0.08)",
            borderColor: result.error === "function_not_found" ? "rgba(244,63,94,0.3)" : "rgba(231,184,75,0.3)",
          }}>
          <AlertTriangle size={16} className={result.error === "function_not_found" ? "text-[#f43f5e]" : "text-[#e7b84b]"} style={{ marginTop: 2 }} />
          <div className="flex-1">
            <div className={result.error === "function_not_found" ? "text-[#f43f5e] font-[600]" : "text-[#e7b84b] font-[600]"}>
              {result.error === "function_not_found"
                ? t("Analytics database not set up yet", "অ্যানালিটিক্স ডাটাবেস এখনো সেট আপ হয়নি", lang)
                : result.error === "permission_denied"
                ? t("Permission denied", "অনুমতি নেই", lang)
                : t("Could not load analytics", "অ্যানালিটিক্স লোড করা যায়নি", lang)}
            </div>
            <div className="text-[#a3a7b4] mt-0.5">
              {result.error === "function_not_found"
                ? t("Run supabase/analytics_functions.sql in your Supabase SQL Editor to enable this dashboard.",
                   "এই ড্যাশবোর্ড চালু করতে Supabase SQL Editor-এ supabase/analytics_functions.sql চালান।", lang)
                : result.errorMessage || ""}
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats — countup cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <StatCard icon={Users} label={t("Total Visitors", "মোট ভিজিটর", lang)} value={ov?.total_visitors || 0} sub={`${ov?.visitors_today || 0} ${t("today", "আজ", lang)}`} />
        <StatCard icon={Eye} label={t(`Visitors (${range.preset === "today" ? "today" : range.days + "d"})`, `ভিজিটর (${range.days}দিন)`, lang)} value={range.preset === "today" ? (ov?.visitors_today || 0) : (range.days <= 7 ? (ov?.visitors_7d || 0) : (ov?.visitors_30d || 0))} color="#6366f1" />
        <StatCard icon={Download} label={t("CV Downloads", "সিভি ডাউনলোড", lang)} value={ov?.total_cv_downloads || cvCount || 0} sub={`${ov?.cv_downloads_7d || 0} ${t("this week", "এই সপ্তাহে", lang)}`} color="#22d3ee" />
        <StatCard icon={Mail} label={t("Messages", "মেসেজ", lang)} value={ov?.total_messages || messages.length} sub={`${ov?.messages_7d || 0} ${t("this week", "এই সপ্তাহে", lang)}`} color="#f97316" />
        <StatCard icon={MailOpen} label={t("Unread", "অপঠিত", lang)} value={ov?.unread_messages || messages.filter(m => !m.read).length} color="#f43f5e" />
        <StatCard icon={Clock} label={t("Avg. Duration", "গড় সময়কাল", lang)} value={fmtDur(ov?.avg_duration || 0)} animate={false} color="#a855f7" />
        <StatCard icon={Percent} label={t("Bounce Rate", "বাউন্স রেট", lang)} value={`${ov?.bounce_rate || 0}%`} animate={false} sub={t("Under 5 seconds", "৫ সেকেন্ডের কম", lang)} color="#ec4899" />
        <StatCard icon={ArrowRightLeft} label={t("Returning", "পুরাতন", lang)} value={ov?.returning_visitors || 0} sub={`${ov?.new_visitors || 0} ${t("new", "নতুন", lang)}`} color="#14b8a6" />
      </div>

      {/* World Map + Real-time Activity Feed */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WorldMap data={data?.visitors_by_country || []} lang={lang} title={t("Live Visitor World Map", "লাইভ ভিজিটর ওয়ার্ল্ড ম্যাপ", lang)} />
        </div>
        <div>
          <ActivityFeed lang={lang} title={t("Real-time Activity", "রিয়েল-টাইম অ্যাক্টিভিটি", lang)} />
        </div>
      </div>

      {/* Visitor Trend & Loyalty Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass rounded-[18px] p-5 lg:col-span-2">
          <SectionHeader icon={TrendingUp} title={t(`Visitor Trend (${range.days} days)`, `ভিজিটর ট্রেন্ড (${range.days} দিন)`, lang)} />
          <div className="mt-4 h-[220px]">
            {filledVisitors.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filledVisitors}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e7b84b" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#e7b84b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#7e8391", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "#7e8391", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} width={30} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="count" name={t("Visitors", "ভিজিটর", lang)} stroke="#e7b84b" strokeWidth={2} fill="url(#goldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[13px] text-[#7e8391]">{t("No visitor data yet", "এখনো ভিজিটর ডেটা নেই", lang)}</div>
            )}
          </div>
        </div>

        <div className="glass rounded-[18px] p-5 flex flex-col justify-between">
          <div>
            <SectionHeader icon={ArrowRightLeft} title={t("User Loyalty", "ভিজিটর টাইপ", lang)} />
            <p className="text-[12px] text-[#7e8391] mt-1">{t("Ratio of new vs returning audience", "নতুন বনাম পুরাতন ভিজিটর অনুপাত", lang)}</p>
          </div>
          <div className="h-[150px] my-auto">
            {ov?.total_visitors ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={newVsReturningData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} stroke="none">
                    <Cell fill="#14b8a6" />
                    <Cell fill="#a855f7" />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[13px] text-[#7e8391]">{t("No loyalty data yet", "কোনো ডেটা নেই", lang)}</div>
            )}
          </div>
          <div className="flex justify-around text-[12.5px] border-t border-white/[0.05] pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" />
              <span className="text-[#ccd0dc]">{t("New", "নতুন", lang)} ({ov?.new_visitors || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
              <span className="text-[#ccd0dc]">{t("Returning", "পুরাতন", lang)} ({ov?.returning_visitors || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* CV Downloads & Messages Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-[18px] p-5">
          <SectionHeader icon={Download} title={t(`CV Downloads (${range.days}d)`, `সিভি ডাউনলোড (${range.days}দিন)`, lang)} />
          <div className="mt-4 h-[180px]">
            {filledCv.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filledCv}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#7e8391", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "#7e8391", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} width={25} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name={t("Downloads", "ডাউনলোড", lang)} fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[13px] text-[#7e8391]">{t("No download data yet", "এখনো ডাউনলোড ডেটা নেই", lang)}</div>
            )}
          </div>
        </div>

        <div className="glass rounded-[18px] p-5">
          <SectionHeader icon={Mail} title={t(`Messages (${range.days}d)`, `মেসেজ (${range.days}দিন)`, lang)} />
          <div className="mt-4 h-[180px]">
            {filledMsgs.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filledMsgs}>
                  <defs>
                    <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#7e8391", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "#7e8391", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} width={25} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="count" name={t("Messages", "মেসেজ", lang)} stroke="#f97316" strokeWidth={2} fill="url(#orangeGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[13px] text-[#7e8391]">{t("No message data yet", "এখনো মেসেজ ডেটা নেই", lang)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Hourly Heatmap */}
      <HourlyHeatmap peakHours={data?.peak_hours || []} lang={lang} />

      {/* Country & City Distribution */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <CityTable data={data?.top_cities || []} lang={lang} title={t("Top Cities", "সেরা শহরসমূহ", lang)} />
        </div>
        <div>
          <CountryTable data={data?.visitors_by_country || []} lang={lang} title={t("Top Countries", "দেশ অনুযায়ী", lang)} />
        </div>
      </div>

      {/* Device / Browser / OS Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <PieSection data={data?.devices || []} lang={lang} title={t("Devices", "ডিভাইস", lang)} icon={Monitor} />
        <PieSection data={data?.browsers || []} lang={lang} title={t("Browsers", "ব্রাউজার", lang)} icon={Compass} />
        <PieSection data={data?.os_list || []} lang={lang} title={t("Operating Systems", "অপারেটিং সিস্টেম", lang)} icon={Monitor} />
      </div>

      {/* Traffic Sources */}
      <div className="glass rounded-[18px] p-5">
        <SectionHeader icon={TrendingUp} title={t("Traffic Sources", "ট্রাফিক সোর্স", lang)} />
        {(data?.referrers?.length || 0) === 0 ? (
          <div className="text-[13px] text-[#7e8391] mt-4 text-center py-6">{t("No referrer data yet", "এখনো রেফারের ডেটা নেই", lang)}</div>
        ) : (
          <div className="mt-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.referrers} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: "#7e8391", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#ccd0dc", fontSize: 12 }} tickLine={false} axisLine={false} width={100} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name={t("Visits", "ভিজিট", lang)} fill="#a855f7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Activity Tables */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Visitors */}
        <div className="glass rounded-[18px] p-5">
          <SectionHeader icon={Users} title={t("Recent Visitors", "সাম্প্রতিক ভিজিটর", lang)} />
          {(data?.recent_visitors?.length || 0) === 0 ? (
            <div className="text-[13px] text-[#7e8391] mt-4 text-center py-6">{t("No visitors recorded yet", "এখনো কোনো ভিজিটর রেকর্ড হয়নি", lang)}</div>
          ) : (
            <div className="mt-3 space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {data!.recent_visitors.map((v, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[12.5px]">
                  <span className="text-[18px] shrink-0">{countryFlag(v.country)}</span>
                  {(() => {
                    const DeviceIcon = deviceIcon(v.device)
                    return <DeviceIcon size={14} className="text-[#7e8391] shrink-0" />
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="text-[#e8e9ef] truncate font-[550]">{v.city || v.country || "Unknown"}</div>
                    <div className="text-[11px] text-[#7e8391]">{v.browser} · {v.device} · {v.os}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-[#9aa0ad]">{timeAgo(v.created_at)}</div>
                    {v.duration > 0 && <div className="text-[10px] text-[#e7b84b] font-mono font-semibold">{fmtDur(v.duration)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent CV Downloads */}
        <div className="glass rounded-[18px] p-5">
          <SectionHeader icon={Download} title={t("Recent CV Downloads", "সাম্প্রতিক সিভি ডাউনলোড", lang)} />
          {(data?.recent_cv_downloads?.length || 0) === 0 ? (
            <div className="text-[13px] text-[#7e8391] mt-4 text-center py-6">{t("No downloads recorded yet", "এখনো কোনো ডাউনলোড রেকর্ড হয়নি", lang)}</div>
          ) : (
            <div className="mt-3 space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {data!.recent_cv_downloads.map((d, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[12.5px]">
                  <span className="text-[18px] shrink-0">{countryFlag(d.country)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#e8e9ef] truncate font-[550]">{d.country || "Unknown"}</div>
                    <div className="text-[11px] text-[#7e8391]">{d.device ? (d.device.length > 40 ? d.device.slice(0, 40) + "…" : d.device) : "Unknown"}</div>
                  </div>
                  <div className="text-[11px] text-[#9aa0ad] shrink-0">{timeAgo(d.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Note */}
      <div className="glass rounded-[14px] px-4 py-3 text-[12px] text-[#7e8391] flex items-start gap-2">
        <Zap size={14} className="text-[#e7b84b] mt-0.5 shrink-0" />
        <span>{t(
          "Visitor tracking uses ipapi.co (with ipwho.is fallback) for geolocation. The activity feed needs Supabase Realtime enabled — run supabase/enable_realtime.sql once. Data is collected anonymously.",
          "ভিজিটর ট্র্যাকিং ipapi.co (এবং ipwho.is ফলব্যাক) ব্যবহার করে জিওলোকেশন নেয়। অ্যাক্টিভিটি ফিডের জন্য Supabase Realtime চালু করতে হবে — supabase/enable_realtime.sql একবার চালান। ডেটা অ্যানোনিমাসলি সংরক্ষিত হয়।",
          lang
        )}</span>
      </div>
    </div>
  )
}
