// src/components/admin/analytics/DateRangeControl.tsx
// Top-bar controls: date range presets + custom range + CSV export + refresh.
// The range is expressed as a number of days so the existing RPC (which takes
// p_days) keeps working; custom range is converted to a day count.

import { useState } from "react"
import { type Lang } from "../../../lib/data"
import { Download, RefreshCw } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

export type RangePreset = "today" | "7" | "30" | "90" | "custom"

export interface DateRangeValue {
  preset: RangePreset
  days: number
  // ISO date strings, only used when preset === "custom"
  from?: string
  to?: string
}

interface Props {
  lang: Lang
  value: DateRangeValue
  onChange: (v: DateRangeValue) => void
  onRefresh: () => void
  loading: boolean
  onExport: () => void
}

const PRESETS: { key: RangePreset; labelEn: string; labelBn: string }[] = [
  { key: "today", labelEn: "Today", labelBn: "আজ" },
  { key: "7", labelEn: "7d", labelBn: "৭দিন" },
  { key: "30", labelEn: "30d", labelBn: "৩০দিন" },
  { key: "90", labelEn: "90d", labelBn: "৯০দিন" },
  { key: "custom", labelEn: "Custom", labelBn: "কাস্টম" },
]

function daysFromRange(from?: string, to?: string): number {
  if (!from || !to) return 30
  const diff = Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000)
  return Math.max(1, diff + 1)
}

export default function DateRangeControl({ lang, value, onChange, onRefresh, loading, onExport }: Props) {
  const [showCustom, setShowCustom] = useState(value.preset === "custom")

  const setPreset = (p: RangePreset) => {
    setShowCustom(p === "custom")
    if (p === "today") onChange({ preset: "today", days: 1 })
    else if (p === "custom") {
      // default last-30 custom range
      const to = new Date().toISOString().split("T")[0]
      const from = new Date(Date.now() - 29 * 86400000).toISOString().split("T")[0]
      onChange({ preset: "custom", days: 30, from, to })
    } else onChange({ preset: p, days: Number(p) })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset buttons */}
      <div className="flex text-[12px] rounded-lg overflow-hidden border border-white/[0.08]">
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={`px-3 py-1.5 cursor-pointer transition ${
              value.preset === p.key
                ? "bg-[#e7b84b]/20 text-[#e7b84b] font-[600]"
                : "bg-white/[0.03] text-[#9aa0ad] hover:bg-white/[0.06]"
            }`}
          >
            {t(p.labelEn, p.labelBn, lang)}
          </button>
        ))}
      </div>

      {/* Custom range inputs */}
      {showCustom && (
        <div className="flex items-center gap-1.5 text-[12px]">
          <input
            type="date"
            value={value.from || ""}
            max={value.to || undefined}
            onChange={(e) => {
              const from = e.target.value
              onChange({ ...value, from, days: daysFromRange(from, value.to) })
            }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[#e8e9ef] outline-none [color-scheme:dark]"
          />
          <span className="text-[#7e8391]">–</span>
          <input
            type="date"
            value={value.to || ""}
            min={value.from || undefined}
            onChange={(e) => {
              const to = e.target.value
              onChange({ ...value, to, days: daysFromRange(value.from, to) })
            }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 py-1.5 text-[#e8e9ef] outline-none [color-scheme:dark]"
          />
        </div>
      )}

      <div className="flex-1" />

      {/* Export CSV */}
      <button
        onClick={onExport}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] bg-white/[0.03] border border-white/[0.08] text-[#c8cdda] hover:bg-white/[0.06] transition cursor-pointer"
        title={t("Export CSV", "CSV ডাউনলোড", lang)}
      >
        <Download size={13} />
        {t("Export CSV", "CSV ডাউনলোড", lang)}
      </button>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        className="w-8 h-8 rounded-lg glass flex items-center justify-center cursor-pointer hover:bg-white/[0.06] transition"
        title={t("Refresh", "রিফ্রেশ", lang)}
      >
        <RefreshCw size={14} className={`text-[#9aa0ad] ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  )
}
