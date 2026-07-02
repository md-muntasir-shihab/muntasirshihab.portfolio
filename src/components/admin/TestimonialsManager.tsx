import React, { useState } from "react"
import { useStore } from "../../lib/store"
import { uploadImage } from "../../lib/supabase"
import { type Lang, type Recommendation } from "../../lib/data"
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X, Upload, Loader } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

interface UnifiedItem {
  name: string
  role: { en: string; bn: string }
  company: string
  text: { en: string; bn: string }
  
  // Recommendation specific fields
  designation?: string
  relationship?: { en: string; bn: string }
  date?: string
  category?: string
  rating?: number
  linkedin?: string
  avatar?: string
}

export default function TestimonialsManager({ lang }: { lang: Lang }) {
  const { testimonials, recommendations, updateTestimonials, updateRecommendations } = useStore()
  const [activeTab, setActiveTab] = useState<"testimonials" | "recommendations">("testimonials")
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [isNew, setIsNew] = useState(false)
  
  const [currentItem, setCurrentItem] = useState<UnifiedItem>({
    name: "",
    role: { en: "", bn: "" },
    company: "",
    text: { en: "", bn: "" },
  })

  const [uploading, setUploading] = useState(false)

  const items = activeTab === "testimonials" ? testimonials : recommendations

  const handleStartEdit = (index: number) => {
    setEditingIdx(index)
    setIsNew(false)
    const original = items[index]
    if (activeTab === "testimonials") {
      const tItem = original as typeof testimonials[number]
      setCurrentItem({
        name: tItem.name || "",
        role: tItem.role || { en: "", bn: "" },
        company: tItem.company || "",
        text: tItem.text || { en: "", bn: "" },
      })
    } else {
      const rItem = original as Recommendation
      setCurrentItem({
        name: rItem.name || "",
        role: { en: "", bn: "" },
        company: rItem.company || "",
        text: rItem.text || { en: "", bn: "" },
        designation: rItem.designation || "",
        relationship: rItem.relationship || { en: "", bn: "" },
        date: rItem.date || new Date().toISOString().split("T")[0],
        category: rItem.category || "colleague",
        rating: rItem.rating || 5,
        linkedin: rItem.linkedin || "",
        avatar: rItem.avatar || "",
      })
    }
  }

  const handleStartAdd = () => {
    setEditingIdx(-1)
    setIsNew(true)
    if (activeTab === "testimonials") {
      setCurrentItem({
        name: "",
        role: { en: "", bn: "" },
        company: "",
        text: { en: "", bn: "" },
      })
    } else {
      setCurrentItem({
        name: "",
        role: { en: "", bn: "" },
        company: "",
        text: { en: "", bn: "" },
        designation: "",
        relationship: { en: "", bn: "" },
        date: new Date().toISOString().split("T")[0],
        category: "colleague",
        rating: 5,
        linkedin: "",
        avatar: "",
      })
    }
  }

  const handleSaveItem = async () => {
    if (!currentItem.name.trim() || !currentItem.text.en.trim()) {
      alert(t("Name and English feedback text are required!", "নাম এবং ইংরেজি প্রতিক্রিয়া পূরণ করা আবশ্যক!", lang))
      return
    }

    if (activeTab === "testimonials") {
      const savedTestimonial = {
        name: currentItem.name,
        role: currentItem.role,
        company: currentItem.company,
        text: currentItem.text,
      }
      let updatedList = [...testimonials]
      if (isNew) {
        updatedList.push(savedTestimonial)
      } else if (editingIdx !== null && editingIdx >= 0) {
        updatedList[editingIdx] = savedTestimonial
      }
      await updateTestimonials(updatedList)
    } else {
      const savedRecommendation: Recommendation = {
        name: currentItem.name,
        designation: currentItem.designation || "",
        company: currentItem.company,
        relationship: currentItem.relationship || { en: "", bn: "" },
        text: currentItem.text,
        date: currentItem.date || new Date().toISOString().split("T")[0],
        category: currentItem.category || "colleague",
        rating: currentItem.rating || 5,
        linkedin: currentItem.linkedin || "",
        avatar: currentItem.avatar || "",
      }
      let updatedList = [...recommendations]
      if (isNew) {
        updatedList.push(savedRecommendation)
      } else if (editingIdx !== null && editingIdx >= 0) {
        updatedList[editingIdx] = savedRecommendation
      }
      await updateRecommendations(updatedList)
    }

    setEditingIdx(null)
    setIsNew(false)
  }

  const handleDeleteItem = async (index: number) => {
    if (!confirm(t("Are you sure you want to delete this item?", "আপনি কি নিশ্চিত যে আপনি এটি মুছতে চান?", lang))) return
    
    if (activeTab === "testimonials") {
      const updatedList = testimonials.filter((_, i) => i !== index)
      await updateTestimonials(updatedList)
    } else {
      const updatedList = recommendations.filter((_, i) => i !== index)
      await updateRecommendations(updatedList)
    }
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const updatedList = [...items]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= updatedList.length) return
    const temp = updatedList[index]
    updatedList[index] = updatedList[target]
    updatedList[target] = temp
    
    if (activeTab === "testimonials") {
      await updateTestimonials(updatedList as typeof testimonials)
    } else {
      await updateRecommendations(updatedList as Recommendation[])
    }
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
            aria-label={t("Show Client Testimonials", "ক্লায়েন্ট প্রশংসাপত্র দেখান", lang)}
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
            aria-label={t("Show Peer Recommendations", "সহকর্মী সুপারিশ দেখান", lang)}
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
            aria-label={t("Add New Entry", "নতুন বিবরণ যোগ করুন", lang)}
            className="px-4 h-9 rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13px] flex items-center gap-1 cursor-pointer transition hover:brightness-110"
          >
            <Plus size={15} /> {t("Add New", "নতুন যোগ", lang)}
          </button>
        )}
      </div>

      {editingIdx !== null ? (
        // Editor Panel
        <div className="glass rounded-[18px] p-6 space-y-5 max-w-3xl">
          <h3 className="text-[17px] font-[700] text-[#e7b84b]">
            {isNew
              ? t("Add New Entry", "নতুন বিবরণ যোগ করুন", lang)
              : t("Edit Entry", "বিবরণ সংশোধন করুন", lang)}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="testi-name" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Name", "নাম", lang)}</label>
              <input
                id="testi-name"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>

            <div>
              <label htmlFor="testi-company" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Company / Organization", "কোম্পানি / সংগঠন", lang)}</label>
              <input
                id="testi-company"
                value={currentItem.company}
                onChange={(e) => setCurrentItem({ ...currentItem, company: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>

            {activeTab === "testimonials" ? (
              <>
                <div>
                  <label htmlFor="testi-role-en" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Role/Designation (English)", "পদবী/রোল (ইংরেজি)", lang)}</label>
                  <input
                    id="testi-role-en"
                    value={currentItem.role.en}
                    onChange={(e) => setCurrentItem({ ...currentItem, role: { ...currentItem.role, en: e.target.value } })}
                    className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                  />
                </div>
                <div>
                  <label htmlFor="testi-role-bn" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Role/Designation (Bangla)", "পদবী/রোল (বাংলা)", lang)}</label>
                  <input
                    id="testi-role-bn"
                    value={currentItem.role.bn}
                    onChange={(e) => setCurrentItem({ ...currentItem, role: { ...currentItem.role, bn: e.target.value } })}
                    className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="rec-designation" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Designation (e.g. Central Board)", "পদবী (যেমন: সেন্ট্রাল বোর্ড)", lang)}</label>
                  <input
                    id="rec-designation"
                    value={currentItem.designation || ""}
                    onChange={(e) => setCurrentItem({ ...currentItem, designation: e.target.value })}
                    className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                  />
                </div>
                <div>
                  <label htmlFor="rec-avatar" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Avatar Image URL", "অ্যাভাটার ছবি URL", lang)}</label>
                  <div className="flex gap-2 mt-[6px]">
                    <input
                      id="rec-avatar"
                      value={currentItem.avatar || ""}
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
                  <label htmlFor="rec-rel-en" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Relationship (English, e.g. Colleague)", "সম্পর্ক (ইংরেজি)", lang)}</label>
                  <input
                    id="rec-rel-en"
                    value={currentItem.relationship?.en || ""}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      relationship: { en: e.target.value, bn: currentItem.relationship?.bn || "" }
                    })}
                    className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                  />
                </div>
                <div>
                  <label htmlFor="rec-rel-bn" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Relationship (Bangla)", "সম্পর্ক (বাংলা)", lang)}</label>
                  <input
                    id="rec-rel-bn"
                    value={currentItem.relationship?.bn || ""}
                    onChange={(e) => setCurrentItem({
                      ...currentItem,
                      relationship: { en: currentItem.relationship?.en || "", bn: e.target.value }
                    })}
                    className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                  />
                </div>

                <div>
                  <label htmlFor="rec-linkedin" className="text-[12px] text-[#9aa0ad] font-[600]">{t("LinkedIn Profile URL", "লিঙ্কডইন প্রোফাইল URL", lang)}</label>
                  <input
                    id="rec-linkedin"
                    value={currentItem.linkedin || ""}
                    onChange={(e) => setCurrentItem({ ...currentItem, linkedin: e.target.value })}
                    className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                  />
                </div>
                <div>
                  <label htmlFor="rec-date" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Date (YYYY-MM-DD)", "তারিখ (YYYY-MM-DD)", lang)}</label>
                  <input
                    id="rec-date"
                    value={currentItem.date || ""}
                    onChange={(e) => setCurrentItem({ ...currentItem, date: e.target.value })}
                    className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                  />
                </div>

                <div>
                  <label htmlFor="rec-rating" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Rating (1-5 Stars)", "রেটিং (১-৫ স্টার)", lang)}</label>
                  <select
                    id="rec-rating"
                    value={currentItem.rating || 5}
                    onChange={(e) => setCurrentItem({ ...currentItem, rating: Number(e.target.value) })}
                    className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r} {t("Stars", "স্টার", lang)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="rec-category" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Category", "ক্যাটাগরি", lang)}</label>
                  <select
                    id="rec-category"
                    value={currentItem.category || "colleague"}
                    onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                    className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                  >
                    <option value="colleague">{t("Colleague / Partner", "সহকর্মী / পার্টনার", lang)}</option>
                    <option value="client">{t("Client", "ক্লায়েন্ট", lang)}</option>
                    <option value="mentor">{t("Mentor / Teacher", "মেন্টর / শিক্ষক", lang)}</option>
                  </select>
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label htmlFor="testi-text-en" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Feedback Message (English)", "বিবরণ (ইংরেজি)", lang)}</label>
              <textarea
                id="testi-text-en"
                value={currentItem.text.en}
                onChange={(e) => setCurrentItem({ ...currentItem, text: { ...currentItem.text, en: e.target.value } })}
                rows={3}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="testi-text-bn" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Feedback Message (Bangla)", "বিবরণ (বাংলা)", lang)}</label>
              <textarea
                id="testi-text-bn"
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
            items.map((item, idx) => {
              const displayAvatar = activeTab === "recommendations" ? (item as Recommendation).avatar : "";
              const displayRole = activeTab === "recommendations" ? 
                `${(item as Recommendation).designation} | ${item.company}` : 
                ((item as any).role ? (item as any).role[lang] : item.company);
              
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-[12px] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition"
                >
                  <div className="flex gap-3 items-center">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt={item.name} className="w-10 h-10 object-cover rounded-full border border-white/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-[10px] text-[#7e8391]">No Avatar</div>
                    )}
                    <div>
                      <div className="font-[650] text-[14.5px] text-[#e8e9ef]">
                        {item.name}
                      </div>
                      <div className="text-[12px] text-[#7e8391] mt-[2px]">{displayRole}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(idx)}
                      aria-label={`${t("Edit", "এডিট", lang)}: ${item.name}`}
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
                      disabled={idx === items.length - 1}
                      aria-label={t("Move Down", "নিচে সরান", lang)}
                      className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-30 flex items-center justify-center text-[#e8e9ef]"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(idx)}
                      aria-label={`${t("Delete", "মুছুন", lang)}: ${item.name}`}
                      className="px-3 py-[5px] rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-[12px] font-[550] text-red-400 cursor-pointer transition"
                    >
                      <Trash2 size={12} /> {t("Delete", "মুছুন", lang)}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
