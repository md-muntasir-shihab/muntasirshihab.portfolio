import React, { useState } from "react"
import { useStore } from "../../lib/store"
import { type Lang } from "../../lib/data"
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

interface ExpItem {
  role: { en: string; bn: string }
  company: string
  period: string
  desc: { en: string; bn: string }
  bullets: { en: string[]; bn: string[] }
}

export default function ExperienceManager({ lang }: { lang: Lang }) {
  const { experience, updateExperience } = useStore()
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [currentItem, setCurrentItem] = useState<ExpItem>({
    role: { en: "", bn: "" },
    company: "",
    period: "",
    desc: { en: "", bn: "" },
    bullets: { en: [], bn: [] },
  })

  const [newBulletEn, setNewBulletEn] = useState("")
  const [newBulletBn, setNewBulletBn] = useState("")

  const handleStartEdit = (index: number) => {
    setEditingIdx(index)
    setIsNew(false)
    setCurrentItem(JSON.parse(JSON.stringify(experience[index]))) // deep clone
  }

  const handleStartAdd = () => {
    setEditingIdx(-1)
    setIsNew(true)
    setCurrentItem({
      role: { en: "", bn: "" },
      company: "",
      period: "",
      desc: { en: "", bn: "" },
      bullets: { en: [], bn: [] },
    })
    setNewBulletEn("")
    setNewBulletBn("")
  }

  const handleSaveItem = async () => {
    if (!currentItem.company.trim() || !currentItem.role.en.trim()) {
      alert(t("Company and English Role are required!", "কোম্পানি এবং ইংরেজি রোল পূরণ করা আবশ্যক!", lang))
      return
    }

    let updatedList = [...experience]
    if (isNew) {
      updatedList.push(currentItem)
    } else if (editingIdx !== null && editingIdx >= 0) {
      updatedList[editingIdx] = currentItem
    }

    await updateExperience(updatedList)
    setEditingIdx(null)
    setIsNew(false)
  }

  const handleDeleteItem = async (index: number) => {
    if (!confirm(t("Are you sure you want to delete this experience?", "আপনি কি নিশ্চিত যে আপনি এই অভিজ্ঞতাটি মুছতে চান?", lang))) return
    const updatedList = experience.filter((_, i) => i !== index)
    await updateExperience(updatedList)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const updatedList = [...experience]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= experience.length) return
    const temp = updatedList[index]
    updatedList[index] = updatedList[target]
    updatedList[target] = temp
    await updateExperience(updatedList)
  }

  const addBullet = () => {
    if (!newBulletEn.trim() && !newBulletBn.trim()) return
    setCurrentItem({
      ...currentItem,
      bullets: {
        en: [...currentItem.bullets.en, newBulletEn.trim()],
        bn: [...currentItem.bullets.bn, newBulletBn.trim() || newBulletEn.trim()],
      },
    })
    setNewBulletEn("")
    setNewBulletBn("")
  }

  const removeBullet = (bulletIdx: number) => {
    setCurrentItem({
      ...currentItem,
      bullets: {
        en: currentItem.bullets.en.filter((_, i) => i !== bulletIdx),
        bn: currentItem.bullets.bn.filter((_, i) => i !== bulletIdx),
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-[26px] font-[720] tracking-[-0.015em]">{t("Work Experience", "কাজের অভিজ্ঞতা", lang)}</div>
        {editingIdx === null && (
          <button
            onClick={handleStartAdd}
            className="px-4 h-9 rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13px] flex items-center gap-1 cursor-pointer transition hover:brightness-110"
          >
            <Plus size={15} /> {t("Add New", "নতুন যোগ", lang)}
          </button>
        )}
      </div>

      {editingIdx !== null ? (
        // Editor Panel
        <div className="glass rounded-[18px] p-6 space-y-5 max-w-3xl">
          <div className="text-[17px] font-[700] text-[#e7b84b]">
            {isNew ? t("Add New Work Experience", "নতুন কাজের অভিজ্ঞতা যোগ করুন", lang) : t("Edit Work Experience", "কাজের অভিজ্ঞতা সংশোধন করুন", lang)}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Company Name", "কোম্পানির নাম", lang)}</label>
              <input
                value={currentItem.company}
                onChange={(e) => setCurrentItem({ ...currentItem, company: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Period (e.g. Feb 2024 — Present)", "সময়কাল", lang)}</label>
              <input
                value={currentItem.period}
                onChange={(e) => setCurrentItem({ ...currentItem, period: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Role Title (English)", "রোল / পদবী (ইংরেজি)", lang)}</label>
              <input
                value={currentItem.role.en}
                onChange={(e) => setCurrentItem({ ...currentItem, role: { ...currentItem.role, en: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Role Title (Bangla)", "রোল / পদবী (বাংলা)", lang)}</label>
              <input
                value={currentItem.role.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, role: { ...currentItem.role, bn: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Short Description (English)", "ছোট বিবরণ (ইংরেজি)", lang)}</label>
              <textarea
                value={currentItem.desc.en}
                onChange={(e) => setCurrentItem({ ...currentItem, desc: { ...currentItem.desc, en: e.target.value } })}
                rows={2}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Short Description (Bangla)", "ছোট বিবরণ (বাংলা)", lang)}</label>
              <textarea
                value={currentItem.desc.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, desc: { ...currentItem.desc, bn: e.target.value } })}
                rows={2}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
          </div>

          {/* Bullets Sub-Editor */}
          <div className="border-t border-white/[0.08] pt-4">
            <label className="text-[13px] font-[650] text-[#e8e9ef]">{t("Key Achievements / Duties", "মূল দায়িত্ব ও অর্জনসমূহ", lang)}</label>
            
            <div className="space-y-2 mt-3">
              {currentItem.bullets.en.map((bullet, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-white/[0.015] border border-white/[0.04] p-2.5 rounded-[9px] text-[12.8px]">
                  <div className="flex-1 space-y-1">
                    <div><b className="text-yellow-500/80 font-mono text-[10.5px]">EN:</b> {bullet}</div>
                    <div><b className="text-yellow-500/80 font-mono text-[10.5px]">BN:</b> {currentItem.bullets.bn[idx]}</div>
                  </div>
                  <button
                    onClick={() => removeBullet(idx)}
                    className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-3 items-end">
              <div>
                <label className="text-[11px] text-[#9aa0ad]">{t("Add Bullet Achievement (English)", "অর্জন যোগ করুন (ইংরেজি)", lang)}</label>
                <input
                  value={newBulletEn}
                  onChange={(e) => setNewBulletEn(e.target.value)}
                  className="w-full mt-[4px] px-3 h-[36px] rounded-[8px] bg-black/20 border border-white/[0.1] text-[13px]"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] text-[#9aa0ad]">{t("Add Bullet Achievement (Bangla)", "অর্জন যোগ করুন (বাংলা)", lang)}</label>
                  <input
                    value={newBulletBn}
                    onChange={(e) => setNewBulletBn(e.target.value)}
                    className="w-full mt-[4px] px-3 h-[36px] rounded-[8px] bg-black/20 border border-white/[0.1] text-[13px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={addBullet}
                  className="h-[36px] px-4 rounded-[8px] bg-[#e7b84b]/10 border border-[#e7b84b]/30 text-[#e7b84b] font-[600] text-[12.5px] cursor-pointer hover:bg-[#e7b84b]/20"
                >
                  {t("Add", "যোগ", lang)}
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-white/[0.08] flex gap-3">
            <button
              onClick={handleSaveItem}
              className="px-5 h-[38px] rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13.5px] hover:brightness-110 transition flex items-center gap-1 cursor-pointer"
            >
              <Check size={15} /> {t("Save", "সংরক্ষণ", lang)}
            </button>
            <button
              onClick={() => {
                setEditingIdx(null)
                setIsNew(false)
              }}
              className="px-5 h-[38px] rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-[#d2d5de] font-[650] text-[13.5px] flex items-center gap-1 cursor-pointer transition"
            >
              <X size={15} /> {t("Cancel", "বাতিল", lang)}
            </button>
          </div>
        </div>
      ) : (
        // List View
        <div className="glass rounded-[18px] p-4 space-y-3">
          {experience.length === 0 ? (
            <div className="text-center py-6 text-[13.5px] text-[#7e8391]">
              {t("No experience items added yet. Click 'Add New' to begin.", "এখনো কোনো কাজের অভিজ্ঞতা যোগ করা হয়নি। শুরু করতে 'নতুন যোগ' এ ক্লিক করুন।", lang)}
            </div>
          ) : (
            experience.map((exp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-[12px] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition"
              >
                <div>
                  <div className="font-[650] text-[14.5px] text-[#e8e9ef]">
                    {exp.role[lang]} <span className="text-[#9aa0ad] font-[400]">at</span> {exp.company}
                  </div>
                  <div className="text-[12px] text-[#7e8391] mt-[3px]">{exp.period}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(idx)}
                    className="px-3 py-[5px] rounded-full glass hover:bg-white/[0.06] text-[12px] font-[550] flex items-center gap-1 cursor-pointer transition text-[#e7c879]"
                  >
                    <Edit2 size={12} /> {t("Edit", "এডিট", lang)}
                  </button>
                  <button
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-30 flex items-center justify-center text-[#e8e9ef]"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === experience.length - 1}
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-30 flex items-center justify-center text-[#e8e9ef]"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(idx)}
                    className="px-3 py-[5px] rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-[12px] font-[550] text-red-400 cursor-pointer transition"
                  >
                    <Trash2 size={12} /> {t("Delete", "মুছুন", lang)}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
