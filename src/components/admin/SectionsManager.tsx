
import { useStore } from "../../lib/store"
import { type Lang } from "../../lib/data"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

export default function SectionsManager({ lang }: { lang: Lang }) {
  const { visibility, setVisibility } = useStore()

  const sectionsList: { key: keyof typeof visibility; label: string; bnLabel: string }[] = [
    { key: "experience", label: "Work Experience", bnLabel: "কাজের অভিজ্ঞতা" },
    { key: "skills", label: "Skills & Technologies", bnLabel: "দক্ষতা ও প্রযুক্তি" },
    { key: "services", label: "Services I Offer", bnLabel: "আমার সার্ভিসসমূহ" },
    { key: "projects", label: "Projects Portfolio", bnLabel: "প্রজেক্ট পোর্টফোলিও" },
    { key: "blog", label: "Blog & Articles", bnLabel: "লেখালেখি ও ব্লগ" },
    { key: "testimonials", label: "Client Testimonials", bnLabel: "ক্লায়েন্ট ফিডব্যাক" },
    { key: "recommendations", label: "Peer Recommendations", bnLabel: "সহকর্মী সুপারিশ" },
    { key: "achievements", label: "Achievements & Awards", bnLabel: "সাফল্য ও পুরস্কার" },
  ]

  const toggleSection = async (key: keyof typeof visibility) => {
    await setVisibility(key, !visibility[key])
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[26px] font-[720] tracking-[-0.015em]">{t("Homepage Sections", "হোমপেজ সেকশনসমূহ", lang)}</h2>
        <p className="text-[13.5px] text-[#7e8391] mt-1.5">
          {t(
            "Toggle visibility of each main section on the public landing page.",
            "পাবলিক হোমপেজে প্রতিটি মূল সেকশনের ভিজিবিলিটি অন বা অফ করুন।",
            lang
          )}
        </p>
      </div>

      <div className="glass rounded-[18px] p-6 max-w-2xl grid sm:grid-cols-2 gap-4">
        {sectionsList.map((sec) => {
          const isEnabled = visibility[sec.key]
          return (
            <div
              key={sec.key}
              className="flex items-center justify-between p-3.5 rounded-[12px] bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.03] transition"
            >
              <span className="hidden">{sec.key}</span>
              <div className="font-[600] text-[13.8px] text-[#e8e9ef]">{t(sec.label, sec.bnLabel, lang)}</div>
              <button
                onClick={() => toggleSection(sec.key)}
                aria-label={`${t("Toggle section", "সেকশন টগল করুন", lang)}: ${t(sec.label, sec.bnLabel, lang)}`}
                className={`w-[60px] h-[30px] rounded-full p-1 transition-colors duration-250 cursor-pointer ${
                  isEnabled ? "bg-[#5bd07a]" : "bg-white bg-white/10"
                }`}
              >
                <div
                  className={`w-[22px] h-[22px] rounded-full bg-[#171721] shadow-md transform transition-transform duration-250 ${
                    isEnabled ? "translate-x-[30px]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
