import React, { useState } from "react"
import { useStore } from "../../lib/store"
import { type Lang } from "../../lib/data"
import { Check } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

export default function ContactHireManager({ lang }: { lang: Lang }) {
  const { hireMe, updateHireMe } = useStore()
  const [formData, setFormData] = useState({
    statusEn: hireMe.status.en,
    statusBn: hireMe.status.bn,
    whatsapp: hireMe.whatsapp || "",
    calendly: hireMe.calendly || "",
    noticeEn: hireMe.notice.en,
    noticeBn: hireMe.notice.bn,
  })

  const handleSave = async () => {
    await updateHireMe({
      status: { en: formData.statusEn, bn: formData.statusBn },
      whatsapp: formData.whatsapp,
      calendly: formData.calendly,
      notice: { en: formData.noticeEn, bn: formData.noticeBn },
    })
    alert(t("Hiring settings updated successfully!", "নিয়োগ সেটিংস সফলভাবে আপডেট করা হয়েছে!", lang))
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[26px] font-[720] tracking-[-0.015em]">{t("Contact & Hire Settings", "যোগাযোগ ও নিয়োগ সেটিংস", lang)}</div>
        <p className="text-[13.5px] text-[#7e8391] mt-1.5">
          {t(
            "Manage your availability status, Calendly scheduling links, notice periods, and WhatsApp details.",
            "আপনার কাজের প্রাপ্যতা স্ট্যাটাস, ক্যালেন্ডলি লিংক, নোটিশ পিরিয়ড এবং হোয়াটসঅ্যাপ তথ্য পরিবর্তন করুন।",
            lang
          )}
        </p>
      </div>

      <div className="glass rounded-[18px] p-6 space-y-5 max-w-2xl">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Availability Status (English)", "প্রাপ্যতা স্ট্যাটাস (ইংরেজি)", lang)}</label>
            <input
              value={formData.statusEn}
              onChange={(e) => setFormData({ ...formData, statusEn: e.target.value })}
              className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Availability Status (Bangla)", "প্রাপ্যতা স্ট্যাটাস (বাংলা)", lang)}</label>
            <input
              value={formData.statusBn}
              onChange={(e) => setFormData({ ...formData, statusBn: e.target.value })}
              className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("WhatsApp Number", "হোয়াটসঅ্যাপ নম্বর", lang)}</label>
            <input
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Calendly URL", "ক্যালেন্ডলি URL", lang)}</label>
            <input
              value={formData.calendly}
              onChange={(e) => setFormData({ ...formData, calendly: e.target.value })}
              className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Notice Period (English)", "নোটিশ পিরিয়ড (ইংরেজি)", lang)}</label>
            <input
              value={formData.noticeEn}
              onChange={(e) => setFormData({ ...formData, noticeEn: e.target.value })}
              className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Notice Period (Bangla)", "নোটিশ পিরিয়ড (বাংলা)", lang)}</label>
            <input
              value={formData.noticeBn}
              onChange={(e) => setFormData({ ...formData, noticeBn: e.target.value })}
              className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08]">
          <button
            onClick={handleSave}
            className="px-6 h-[40px] rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13.8px] hover:brightness-110 transition cursor-pointer flex items-center gap-1.5"
          >
            <Check size={16} /> {t("Save Settings", "সেটিংস সংরক্ষণ করুন", lang)}
          </button>
        </div>
      </div>
    </div>
  )
}
