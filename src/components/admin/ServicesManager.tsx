import React, { useState } from "react"
import { useStore } from "../../lib/store"
import { type Lang } from "../../lib/data"
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

interface ServiceItem {
  title: { en: string; bn: string }
  desc: { en: string; bn: string }
  iconName: string
}

const AVAILABLE_ICONS = ["Palette", "Video", "Code2", "BarChart3", "Layers", "Cpu", "Globe", "MessageCircle"]

export default function ServicesManager({ lang }: { lang: Lang }) {
  const { services, updateServices } = useStore()
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [currentItem, setCurrentItem] = useState<ServiceItem>({
    title: { en: "", bn: "" },
    desc: { en: "", bn: "" },
    iconName: "Palette",
  })

  const handleStartEdit = (index: number) => {
    setEditingIdx(index)
    setIsNew(false)
    setCurrentItem(JSON.parse(JSON.stringify(services[index])))
  }

  const handleStartAdd = () => {
    setEditingIdx(-1)
    setIsNew(true)
    setCurrentItem({
      title: { en: "", bn: "" },
      desc: { en: "", bn: "" },
      iconName: "Palette",
    })
  }

  const handleSaveItem = async () => {
    if (!currentItem.title.en.trim() || !currentItem.desc.en.trim()) {
      alert(t("Title and description are required!", "শিরোনাম এবং বিবরণ পূরণ করা আবশ্যক!", lang))
      return
    }

    let updatedList = [...services]
    if (isNew) {
      updatedList.push(currentItem)
    } else if (editingIdx !== null && editingIdx >= 0) {
      updatedList[editingIdx] = currentItem
    }

    await updateServices(updatedList)
    setEditingIdx(null)
    setIsNew(false)
  }

  const handleDeleteItem = async (index: number) => {
    if (!confirm(t("Are you sure you want to delete this service?", "আপনি কি নিশ্চিত যে আপনি এই সার্ভিসটি মুছতে চান?", lang))) return
    const updatedList = services.filter((_, i) => i !== index)
    await updateServices(updatedList)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const updatedList = [...services]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= services.length) return
    const temp = updatedList[index]
    updatedList[index] = updatedList[target]
    updatedList[target] = temp
    await updateServices(updatedList)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-[26px] font-[720] tracking-[-0.015em]">{t("Services I Offer", "আমার সার্ভিসসমূহ", lang)}</div>
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
            {isNew ? t("Add New Service", "নতুন সার্ভিস যোগ করুন", lang) : t("Edit Service", "সার্ভিস সংশোধন করুন", lang)}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Service Title (English)", "সার্ভিস টাইটেল (ইংরেজি)", lang)}</label>
              <input
                value={currentItem.title.en}
                onChange={(e) => setCurrentItem({ ...currentItem, title: { ...currentItem.title, en: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Service Title (Bangla)", "সার্ভিস টাইটেল (বাংলা)", lang)}</label>
              <input
                value={currentItem.title.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, title: { ...currentItem.title, bn: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Icon Selection", "আইকন নির্বাচন", lang)}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setCurrentItem({ ...currentItem, iconName: ic })}
                    className={`px-3 py-1.5 rounded-lg border text-[12px] font-mono transition ${
                      currentItem.iconName === ic
                        ? "bg-[#e7b84b]/10 border-[#e7b84b] text-[#e7b84b]"
                        : "bg-white/[0.02] border-white/[0.08] text-[#9aa0ad] hover:border-white/20"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Description (English)", "বিবরণ (ইংরেজি)", lang)}</label>
              <textarea
                value={currentItem.desc.en}
                onChange={(e) => setCurrentItem({ ...currentItem, desc: { ...currentItem.desc, en: e.target.value } })}
                rows={3}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Description (Bangla)", "বিবরণ (বাংলা)", lang)}</label>
              <textarea
                value={currentItem.desc.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, desc: { ...currentItem.desc, bn: e.target.value } })}
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
          {services.length === 0 ? (
            <div className="text-center py-6 text-[13.5px] text-[#7e8391]">
              {t("No services added yet. Click 'Add New' to begin.", "এখনো কোনো সার্ভিস যোগ করা হয়নি। শুরু করতে 'নতুন যোগ' এ ক্লিক করুন।", lang)}
            </div>
          ) : (
            services.map((svc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-[12px] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition"
              >
                <div>
                  <div className="font-[650] text-[14.5px] text-[#e8e9ef]">
                    {svc.title[lang]}
                  </div>
                  <div className="text-[12px] text-[#7e8391] mt-[3px]">{t("Icon: ", "আইকন: ", lang)}{svc.iconName}</div>
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
                    disabled={idx === services.length - 1}
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
