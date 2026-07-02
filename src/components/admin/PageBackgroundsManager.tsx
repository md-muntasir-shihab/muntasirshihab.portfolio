import { useState } from "react"
import { useStore } from "../../lib/store"
import { type Lang } from "../../lib/data"
import { Check } from "lucide-react"
import type { BGType } from "../backgrounds"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

const BG_EFFECTS = [
  "beamsGold",
  "floatingSpot",
  "dnaHelix",
  "geoBoxes",
  "galaxyBeams",
  "starGlow",
  "cosmicNoise",
  "neonSpot",
  "neuralWavy",
  "particleGrid",
]

export default function PageBackgroundsManager({ lang }: { lang: Lang }) {
  const { pageBackgroundMap, updatePageBackgroundMap } = useStore()
  const [bgMap, setBgMap] = useState<Record<string, BGType>>({ ...pageBackgroundMap })

  const routesList = [
    { path: "/", name: "Home / Entry Page", bnName: "হোম / মূল প্রবেশ পেজ" },
    { path: "/about", name: "About Me Page", bnName: "আমার সম্পর্কে পেজ" },
    { path: "/experience", name: "Work Experience Page", bnName: "অভিজ্ঞতা পেজ" },
    { path: "/skills", name: "Skills & Technologies Page", bnName: "দক্ষতা ও প্রযুক্তি পেজ" },
    { path: "/projects", name: "Projects Page", bnName: "প্রজেক্ট শোকেস পেজ" },
    { path: "/blog", name: "Blog List Page", bnName: "ব্লগ লিস্ট পেজ" },
    { path: "/testimonials", name: "Testimonials Page", bnName: "প্রশংসাপত্র পেজ" },
    { path: "/hire-me", name: "Hire Me Page", bnName: "হায়ার মি পেজ" },
    { path: "/contact", name: "Contact & Form Page", bnName: "যোগাযোগ পেজ" },
    { path: "/cv", name: "CV Viewer Page", bnName: "সিভি ভিউয়ার পেজ" },
  ]

  const handleSelectChange = (path: string, effect: BGType) => {
    setBgMap((prev) => ({ ...prev, [path]: effect }))
  }

  const handleSave = async () => {
    await updatePageBackgroundMap(bgMap)
    alert(t("Page background effects updated successfully!", "পেজ ব্যাকগ্রাউন্ড ইফেক্টস সফলভাবে আপডেট করা হয়েছে!", lang))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[26px] font-[720] tracking-[-0.015em]">{t("Page Background Themes", "পেজ ব্যাকগ্রাউন্ড থিম", lang)}</h2>
        <p className="text-[13.5px] text-[#7e8391] mt-1.5">
          {t(
            "Assign premium, animated background effects to each route on your portfolio.",
            "আপনার পোর্টফোলিওর প্রতিটি রুটের জন্য প্রিমিয়াম অ্যানিমেটেড ব্যাকগ্রাউন্ড ইফেক্ট নির্ধারণ করুন।",
            lang
          )}
        </p>
      </div>

      <div className="glass rounded-[18px] p-6 max-w-2xl space-y-5">
        <div className="space-y-4">
          {routesList.map((route) => {
            const currentEffect = bgMap[route.path] || "beamsGold"
            const selectId = `bg-select-${route.path.replace(/\//g, "root")}`
            return (
              <div
                key={route.path}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-[11px] bg-white/[0.015] border border-white/[0.04] gap-3"
              >
                <div>
                  <label htmlFor={selectId} className="font-[600] text-[13.8px] text-[#e8e9ef] block cursor-pointer">{t(route.name, route.bnName, lang)}</label>
                  <div className="text-[11px] font-mono text-yellow-500/80 mt-[2px]">{route.path}</div>
                </div>

                <select
                  id={selectId}
                  value={currentEffect}
                  onChange={(e) => handleSelectChange(route.path, e.target.value as BGType)}
                  className="px-3 h-[36px] rounded-[8px] bg-[#1a1a24] border border-white/[0.1] text-[13px] text-[#e8e9ef] outline-none w-full sm:w-[180px]"
                >
                  {BG_EFFECTS.map((fx) => (
                    <option key={fx} value={fx}>
                      {fx}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={handleSave}
            className="px-6 h-[40px] rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13.8px] hover:brightness-110 transition cursor-pointer flex items-center gap-1.5"
          >
            <Check size={16} /> {t("Save Backgrounds", "ব্যাকগ্রাউন্ড সংরক্ষণ করুন", lang)}
          </button>
        </div>
      </div>
    </div>
  )
}
