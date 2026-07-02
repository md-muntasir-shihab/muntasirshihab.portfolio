import { useState } from "react"
import { useStore } from "../../lib/store"
import { type Lang } from "../../lib/data"
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

interface AchievementItem {
  en: string
  bn: string
}

export default function AchievementsManager({ lang }: { lang: Lang }) {
  const { achievements, updateAchievements } = useStore()
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [currentItem, setCurrentItem] = useState<AchievementItem>({
    en: "",
    bn: "",
  })

  const handleStartEdit = (index: number) => {
    setEditingIdx(index)
    setIsNew(false)
    setCurrentItem({ ...achievements[index] })
  }

  const handleStartAdd = () => {
    setEditingIdx(-1)
    setIsNew(true)
    setCurrentItem({
      en: "",
      bn: "",
    })
  }

  const handleSaveItem = async () => {
    if (!currentItem.en.trim() || !currentItem.bn.trim()) {
      alert(t("Both English and Bangla achievements are required!", "ইংরেজি ও বাংলা উভয় বিবরণী পূরণ করা আবশ্যক!", lang))
      return
    }

    let updatedList = [...achievements]
    if (isNew) {
      updatedList.push(currentItem)
    } else if (editingIdx !== null && editingIdx >= 0) {
      updatedList[editingIdx] = currentItem
    }

    await updateAchievements(updatedList)
    setEditingIdx(null)
    setIsNew(false)
  }

  const handleDeleteItem = async (index: number) => {
    if (!confirm(t("Are you sure you want to delete this achievement?", "আপনি কি নিশ্চিত যে আপনি এই অর্জনটি মুছতে চান?", lang))) return
    const updatedList = achievements.filter((_, i) => i !== index)
    await updateAchievements(updatedList)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const updatedList = [...achievements]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= achievements.length) return
    const temp = updatedList[index]
    updatedList[index] = updatedList[target]
    updatedList[target] = temp
    await updateAchievements(updatedList)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[26px] font-[720] tracking-[-0.015em]">{t("Achievements & Awards", "অর্জিত সাফল্য ও পুরস্কার", lang)}</h2>
        {editingIdx === null && (
          <button
            onClick={handleStartAdd}
            aria-label={t("Add New Achievement", "নতুন সাফল্য যোগ করুন", lang)}
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
            {isNew ? t("Add New Achievement", "নতুন সাফল্য যোগ করুন", lang) : t("Edit Achievement", "সাফল্যের বিবরণ সংশোধন করুন", lang)}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="ach-en" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Achievement (English)", "সাফল্য/অর্জন (ইংরেজি)", lang)}</label>
              <input
                id="ach-en"
                value={currentItem.en}
                onChange={(e) => setCurrentItem({ ...currentItem, en: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div>
              <label htmlFor="ach-bn" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Achievement (Bangla)", "সাফল্য/অর্জন (বাংলা)", lang)}</label>
              <input
                id="ach-bn"
                value={currentItem.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, bn: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
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
          {achievements.length === 0 ? (
            <div className="text-center py-6 text-[13.5px] text-[#7e8391]">
              {t("No achievements added yet. Click 'Add New' to begin.", "এখনো কোনো অর্জিত সাফল্য যোগ করা হয়নি। শুরু করতে 'নতুন যোগ' এ ক্লিক করুন।", lang)}
            </div>
          ) : (
            achievements.map((ach, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-[12px] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition"
              >
                <div>
                  <div className="font-[650] text-[14.5px] text-[#e8e9ef]">
                    {ach[lang]}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(idx)}
                    aria-label={`${t("Edit", "এডিট", lang)}: ${ach[lang]}`}
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
                    disabled={idx === achievements.length - 1}
                    aria-label={t("Move Down", "নিচে সরান", lang)}
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-30 flex items-center justify-center text-[#e8e9ef]"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(idx)}
                    aria-label={`${t("Delete", "মুছুন", lang)}: ${ach[lang]}`}
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
