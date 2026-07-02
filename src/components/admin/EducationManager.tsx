import { useState } from "react"
import { useStore } from "../../lib/store"
import { type Lang } from "../../lib/data"
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

interface EduItem {
  school: string
  degree: { en: string; bn: string }
  period: string
  note: { en: string; bn: string }
}

export default function EducationManager({ lang }: { lang: Lang }) {
  const { education, updateEducation } = useStore()
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [currentItem, setCurrentItem] = useState<EduItem>({
    school: "",
    degree: { en: "", bn: "" },
    period: "",
    note: { en: "", bn: "" },
  })

  const handleStartEdit = (index: number) => {
    setEditingIdx(index)
    setIsNew(false)
    setCurrentItem(JSON.parse(JSON.stringify(education[index]))) // deep clone
  }

  const handleStartAdd = () => {
    setEditingIdx(-1)
    setIsNew(true)
    setCurrentItem({
      school: "",
      degree: { en: "", bn: "" },
      period: "",
      note: { en: "", bn: "" },
    })
  }

  const handleSaveItem = async () => {
    if (!currentItem.degree.en.trim() || !currentItem.school.trim()) {
      alert(t("Degree and School are required!", "ডিগ্রি এবং শিক্ষা প্রতিষ্ঠান পূরণ করা আবশ্যক!", lang))
      return
    }

    let updatedList = [...education]
    if (isNew) {
      updatedList.push(currentItem)
    } else if (editingIdx !== null && editingIdx >= 0) {
      updatedList[editingIdx] = currentItem
    }

    await updateEducation(updatedList)
    setEditingIdx(null)
    setIsNew(false)
  }

  const handleDeleteItem = async (index: number) => {
    if (!confirm(t("Are you sure you want to delete this education entry?", "আপনি কি নিশ্চিত যে আপনি এই শিক্ষার তথ্যটি মুছতে চান?", lang))) return
    const updatedList = education.filter((_, i) => i !== index)
    await updateEducation(updatedList)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const updatedList = [...education]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= education.length) return
    const temp = updatedList[index]
    updatedList[index] = updatedList[target]
    updatedList[target] = temp
    await updateEducation(updatedList)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[26px] font-[720] tracking-[-0.015em]">{t("Education & Qualifications", "শিক্ষা ও যোগ্যতা", lang)}</h2>
        {editingIdx === null && (
          <button
            onClick={handleStartAdd}
            aria-label={t("Add New Education Entry", "নতুন শিক্ষার বিবরণ যোগ করুন", lang)}
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
            {isNew ? t("Add New Education Entry", "নতুন শিক্ষার বিবরণ যোগ করুন", lang) : t("Edit Education Entry", "শিক্ষার বিবরণ সংশোধন করুন", lang)}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edu-degree-en" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Degree Title (English)", "ডিগ্রী (ইংরেজি)", lang)}</label>
              <input
                id="edu-degree-en"
                value={currentItem.degree.en}
                onChange={(e) => setCurrentItem({ ...currentItem, degree: { ...currentItem.degree, en: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div>
              <label htmlFor="edu-degree-bn" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Degree Title (Bangla)", "ডিগ্রী (বাংলা)", lang)}</label>
              <input
                id="edu-degree-bn"
                value={currentItem.degree.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, degree: { ...currentItem.degree, bn: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="edu-school" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Institution Name", "শিক্ষা প্রতিষ্ঠানের নাম", lang)}</label>
              <input
                id="edu-school"
                value={currentItem.school}
                onChange={(e) => setCurrentItem({ ...currentItem, school: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="edu-period" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Period (e.g. 2023 — Present)", "সময়কাল", lang)}</label>
              <input
                id="edu-period"
                value={currentItem.period}
                onChange={(e) => setCurrentItem({ ...currentItem, period: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="edu-note-en" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Note (English)", "টীকা/তথ্য (ইংরেজি)", lang)}</label>
              <textarea
                id="edu-note-en"
                value={currentItem.note.en}
                onChange={(e) => setCurrentItem({ ...currentItem, note: { ...currentItem.note, en: e.target.value } })}
                rows={3}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="edu-note-bn" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Note (Bangla)", "টীকা/তথ্য (বাংলা)", lang)}</label>
              <textarea
                id="edu-note-bn"
                value={currentItem.note.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, note: { ...currentItem.note, bn: e.target.value } })}
                rows={3}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
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
          {education.length === 0 ? (
            <div className="text-center py-6 text-[13.5px] text-[#7e8391]">
              {t("No education items added yet. Click 'Add New' to begin.", "এখনো কোনো শিক্ষার বিবরণ যোগ করা হয়নি। শুরু করতে 'নতুন যোগ' এ ক্লিক করুন।", lang)}
            </div>
          ) : (
            education.map((edu, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-[12px] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition"
              >
                <div>
                  <div className="font-[650] text-[14.5px] text-[#e8e9ef]">
                    {edu.degree[lang]} <span className="text-[#9aa0ad] font-[400]">at</span> {edu.school}
                  </div>
                  <div className="text-[12px] text-[#7e8391] mt-[3px]">{edu.period}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(idx)}
                    aria-label={`${t("Edit", "এডিট", lang)}: ${edu.degree[lang]}`}
                    className="px-3 py-[5px] rounded-full glass hover:bg-white/[0.06] text-[12px] font-[550] flex items-center gap-1 cursor-pointer transition text-[#e7c879]"
                  >
                    <Edit2 size={12} /> {t("Edit", "এডিট", lang)}
                  </button>
                  <button
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    aria-label={t("Move Up", "উপরে সরান", lang)}
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-30 flex items-center justify-center text-[#e8e9ef]"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === education.length - 1}
                    aria-label={t("Move Down", "নিচে সরান", lang)}
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-30 flex items-center justify-center text-[#e8e9ef]"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(idx)}
                    aria-label={`${t("Delete", "মুছুন", lang)}: ${edu.degree[lang]}`}
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
