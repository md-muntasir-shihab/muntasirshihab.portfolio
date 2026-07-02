// src/components/admin/analytics/WorldMap.tsx
// Choropleth world map — darker = fewer visitors, gold = more visitors.
// Uses d3-geo + topojson-client (no react-simple-maps, since it doesn't
// support React 19). Topojson is fetched once from a CDN.

import { useEffect, useMemo, useState } from "react"
import { geoPath, geoEqualEarth } from "d3-geo"
import { feature } from "topojson-client"
import { type Lang } from "../../../lib/data"
import { countryFlag } from "../../../lib/analytics"
import { Globe, Loader2 } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

// Dark → gold color scale
function colorFor(t: number): string {
  // t in [0,1]. Interpolate between #1a1a2e (dark) and #e7b84b (gold)
  const c1 = [26, 26, 46]
  const c2 = [231, 184, 75]
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t)
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t)
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t)
  return `rgb(${r},${g},${b})`
}

interface WorldMapProps {
  data: { country: string; count: number }[]
  lang: Lang
  title: string
}

// Minimal GeoJSON FeatureCollection shape we use
type GeoFeature = {
  type: "Feature"
  properties: { name?: string }
  geometry: any
}
type GeoCollection = {
  type: "FeatureCollection"
  features: GeoFeature[]
}

export default function WorldMap({ data, lang, title }: WorldMapProps) {
  const [geo, setGeo] = useState<GeoCollection | null>(null)
  const [loadErr, setLoadErr] = useState(false)
  const [hover, setHover] = useState<{ name: string; x: number; y: number; count: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    // World-atlas 110m resolution — small (~100KB), good enough for a dashboard
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => {
        if (!r.ok) throw new Error(`map fetch ${r.status}`)
        return r.json()
      })
      .then((topo: any) => {
        if (cancelled) return
        const fc = feature(topo, topo.objects.countries) as unknown as GeoCollection
        setGeo(fc)
      })
      .catch(() => { if (!cancelled) setLoadErr(true) })
    return () => { cancelled = true }
  }, [])

  // Build a lookup of country → count
  const countMap = useMemo(() => {
    const m = new Map<string, number>()
    data.forEach(d => m.set(d.country.toLowerCase(), d.count))
    return m
  }, [data])

  const maxCount = useMemo(() => Math.max(1, ...data.map(d => d.count)), [data])

  // Projection + path generator depend on the geo bounds
  const pathD = useMemo(() => {
    if (!geo) return [] as { d: string; name: string; count: number }[]
    const proj = geoEqualEarth().fitSize([800, 380], geo as any)
    const path = geoPath(proj)
    return geo.features.map(f => {
      const d = path(f as any) || ""
      const name = f.properties?.name || "Unknown"
      const count = countMap.get(name.toLowerCase()) || 0
      return { d, name, count }
    })
  }, [geo, countMap])

  // City pulse dots (top countries as proxy centroid — using visitor counts).
  // We approximate centroid by country rank position is not reliable; instead
  // we skip precise city plotting and use the choropleth only, which is robust.

  return (
    <div className="glass rounded-[18px] p-5">
      <div className="flex items-center gap-2 text-[16px] font-[680] text-[#ccd0dc]">
        <Globe size={18} className="text-[#e7b84b]" /> {title}
      </div>
      <p className="text-[12.5px] text-[#7e8391] mt-1">
        {t("Darker = fewer visitors · Gold = more visitors. Hover a country for details.",
           "গাঢ় = কম ভিজিটর · সোনালী = বেশি ভিজিটর। বিস্তারিত জানতে দেশের ওপর হোভার করুন।", lang)}
      </p>

      <div className="relative mt-4">
        {loadErr ? (
          <div className="h-[300px] flex items-center justify-center text-[13px] text-[#7e8391]">
            {t("Map data unavailable (offline).", "ম্যাপ ডেটা লোড করা যায়নি (অফলাইন)।", lang)}
          </div>
        ) : !geo ? (
          <div className="h-[300px] flex items-center justify-center gap-2 text-[13px] text-[#7e8391]">
            <Loader2 size={16} className="animate-spin" />
            {t("Loading world map...", "ওয়ার্ল্ড ম্যাপ লোড হচ্ছে...", lang)}
          </div>
        ) : (
          <svg viewBox="0 0 800 380" className="w-full h-auto" style={{ maxHeight: 360 }}>
            {/* Ocean background */}
            <rect width="800" height="380" fill="#0d0d14" rx="8" />
            {pathD.map((f, i) => {
              const ratio = f.count / maxCount
              const fill = f.count > 0 ? colorFor(0.25 + 0.75 * ratio) : "#16161f"
              return (
                <path
                  key={i}
                  d={f.d}
                  fill={fill}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth={0.4}
                  style={{ cursor: f.count > 0 ? "pointer" : "default", transition: "fill .15s" }}
                  onMouseEnter={(e) => {
                    if (f.count === 0) return
                    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
                    setHover({
                      name: f.name,
                      count: f.count,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    })
                  }}
                  onMouseMove={(e) => {
                    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
                    setHover(h => h ? { ...h, x: e.clientX - rect.left, y: e.clientY - rect.top } : h)
                  }}
                  onMouseLeave={() => setHover(null)}
                />
              )
            })}
          </svg>
        )}

        {/* Hover tooltip */}
        {hover && (
          <div
            className="absolute pointer-events-none bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-[#e8e9ef] shadow-lg z-10"
            style={{ left: hover.x, top: hover.y, transform: "translate(8px, -100%)" }}
          >
            <div className="font-[600]">{countryFlag(hover.name)} {hover.name}</div>
            <div className="text-[#e7b84b] font-mono">{hover.count} {t("visitors", "ভিজিটর", lang)}</div>
          </div>
        )}
      </div>

      {/* Top countries legend strip */}
      {data.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {data.slice(0, 6).map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11.5px] text-[#a3a7b4]">
              <span>{countryFlag(c.country)}</span>
              <span>{c.country}</span>
              <span className="text-[#e7b84b] font-mono">{c.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
