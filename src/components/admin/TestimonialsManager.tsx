import React, { useState } from "react"
import { useStore } from "../../lib/store"
import { uploadImage } from "../../lib/supabase"
import { type Lang } from "../../lib/data"
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X, Upload, Loader } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

interface TestimonialItem {
  name: string
  role: { en: string; bn: string }
  avatar: string
  text: { en: string; bn: string }
}

export default function TestimonialsManager({ lang }: { lang: Lang }) {
  const { testimonials, recommendations, updateTestimonials, updateRecommendations } = useStore()
  const [activeTab, setActiveTab] = useState<"testimonials" | "recommendations">("testimonials")
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [currentItem, setCurrentItem] = useState<TestimonialItem>({
    name: "",
    role: { en: "", bn: "" },
    avatar: "",
    text: { en: "", bn: "" },
  })

  const [uploading, setUploading] = useState(false)

  const items = activeTab === "testimonials" ? testimonials : recommendations
  const updateFn = activeTab === "testimonials" ? updateTestimonials : updateRecommendations

  const handleStartEdit = (index: number) => {
    setEditingIdx(index)
    setIsNew(false)
    setCurrentItem(JSON.parse(JSON.stringify(items[index])))
  }

  const handleStartAdd = () => {
    setEditingIdx(-1)
    setIsNew(true)
    setCurrentItem({
      name: "",
      role: { en: "", bn: "" },
      avatar: "",
      text: { en: "", bn: "" },
    })
  }

  const handleSaveItem = async () => {
    if (!currentItem.name.trim() || !currentItem.text.en.trim()) {
      alert(t("Name and English feedback text are required!", "নাম এবং ইংরেজি প্রতিক্রিয়া পূরণ করা আবশ্যক!", lang))
      return
    }

    let updatedList = [...items]
    if (isNew) {
      updatedList.push(currentItem)
    } else if (editingIdx !== null && editingIdx >= 0) {
      updatedList[editingIdx] = currentItem
    }

    await updateFn(updatedList)
    setEditingIdx(null)
    setIsNew(false)
  }

  const handleDeleteItem = async (index: number) => {
    if (!confirm(t("Are you sure you want to delete this item?", "আপনি কি নিশ্চিত যে আপনি এটি মুছতে চান?", lang))) return
    const updatedList = items.filter((_, i) => i !== index)
    await updateFn(updatedList)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const updatedList = [...items]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= items.length) return
    const temp = updatedList[index]
    updatedList[index] = updatedList[target]
    updatedList[target] = temp
    await updateFn(updatedList)
  }

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadImage(file, "testimonials")
      setCurrentItem((prev) => ({ ...prev, avatar: result.url }))
    } catch (err: any) {
      alert(t("Upload failed: ", "আপলোড ব্যর্থ হয়েছে: ", lang) + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab switcher */}
        <div className="flex border-b border-white/[0.08] p-1 bg-white/[0.02] rounded-full self-start">
          <button
            onClick={() => {
              setActiveTab("testimonials")
              setEditingIdx(null)
            }}
            className={`px-4 py-1.5 rounded-full text-[13px] font-[650] transition cursor-pointer ${
              activeTab === "testimonials" ? "bg-[#e7b84b] text-[#1a1410]" : "text-[#d2d5de] hover:text-white"
            }`}
          >
            {t("Client Testimonials", "প্রশংসাপত্র", lang)}
          </button>
          <button
            onClick={() => {
              setActiveTab("recommendations")
              setEditingIdx(null)
            }}
            className={`px-4 py-1.5 rounded-full text-[13px] font-[650] transition cursor-pointer ${
              activeTab === "recommendations" ? "bg-[#e7b84b] text-[#1a1410]" : "text-[#d2d5de] hover:text-white"
            }`}
          >
            {t("Peer Recommendations", "সুপারিশসমূহ", lang)}
          </button>
        </div>

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
            {isNew
              ? t("Add New Entry", "নতুন বিবরণ যোগ করুন", lang)
              : t("Edit Entry", "বিবরণ সংশোধন করুন", lang)}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Name", "নাম", lang)}</label>
              <input
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Avatar URL", "অ্যাভাটার ছবি URL", lang)}</label>
              <div className="flex gap-2 mt-[6px]">
                <input
                  value={currentItem.avatar}
                  onChange={(e) => setCurrentItem({ ...currentItem, avatar: e.target.value })}
                  className="flex-1 px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                />
                <label className="px-4 h-[40px] rounded-[9px] bg-[#e7b84b]/10 border border-[#e7b84b]/30 hover:bg-[#e7b84b]/20 text-[#e7b84b] flex items-center justify-center gap-2 cursor-pointer transition text-[13.5px] font-[600]">
                  {uploading ? <Loader size={15} className="animate-spin" /> : <Upload size={15} />}
                  {t("Upload", "আপলোড", lang)}
                  <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Designation/Role (English)", "পদবী/রোল (ইংরেজি)", lang)}</label>
              <input
                value={currentItem.role.en}
                onChange={(e) => setCurrentItem({ ...currentItem, role: { ...currentItem.role, en: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Designation/Role (Bangla)", "পদবী/রোল (বাংলা)", lang)}</label>
              <input
                value={currentItem.role.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, role: { ...currentItem.role, bn: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Feedback Message (English)", "বিবরণ (ইংরেজি)", lang)}</label>
              <textarea
                value={currentItem.text.en}
                onChange={(e) => setCurrentItem({ ...currentItem, text: { ...currentItem.text, en: e.target.value } })}
                rows={3}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Feedback Message (Bangla)", "বিবরণ (বাংলা)", lang)}</label>
              <textarea
                value={currentItem.text.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, text: { ...currentItem.text, bn: e.target.value } })}
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
          {items.length === 0 ? (
            <div className="text-center py-6 text-[13.5px] text-[#7e8391]">
              {t("No items added yet. Click 'Add New' to begin.", "এখনো কোনো তথ্য যোগ করা হয়নি। শুরু করতে 'নতুন যোগ' এ ক্লিক করুন।", lang)}
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-[12px] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition"
              >
                <div className="flex gap-3 items-center">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} className="w-10 h-10 object-cover rounded-full border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-[10px] text-[#7e8391]">No Avatar</div>
                  )}
                  <div>
                    <div className="font-[650] text-[14.5px] text-[#e8e9ef]">
                      {item.name}
                    </div>
                    <div className="text-[12px] text-[#7e8391] mt-[2px]">{item.role[lang]}</div>
                  </div>
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
                    disabled={idx === items.length - 1}
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
