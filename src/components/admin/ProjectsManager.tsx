import React, { useState } from "react"
import { useStore } from "../../lib/store"
import { uploadImage } from "../../lib/supabase"
import { type Lang } from "../../lib/data"
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X, Upload, Loader } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

interface ProjectItem {
  id: string
  title: { en: string; bn: string }
  blurb: { en: string; bn: string }
  desc?: { en: string; bn: string }
  year: string
  tags: string[]
  img: string
  link: string
  github?: string
  featured: boolean
  images?: string[]
}

export default function ProjectsManager({ lang }: { lang: Lang }) {
  const { projects, updateProjects } = useStore()
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [currentItem, setCurrentItem] = useState<ProjectItem>({
    id: "",
    title: { en: "", bn: "" },
    blurb: { en: "", bn: "" },
    desc: { en: "", bn: "" },
    year: new Date().getFullYear().toString(),
    tags: [],
    img: "",
    link: "",
    github: "",
    featured: false,
    images: [],
  })

  const [newTag, setNewTag] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [galleryUrlInput, setGalleryUrlInput] = useState("")

  const handleStartEdit = (index: number) => {
    setEditingIdx(index)
    setIsNew(false)
    const original = projects[index]
    setCurrentItem({
      id: original.id || "p" + Date.now(),
      title: original.title || { en: "", bn: "" },
      blurb: original.blurb || { en: "", bn: "" },
      desc: original.desc || { en: "", bn: "" },
      year: original.year || new Date().getFullYear().toString(),
      tags: original.tags || [],
      img: original.img || "",
      link: original.link || "",
      github: original.github || "",
      featured: !!original.featured,
      images: original.images || [],
    })
  }

  const handleStartAdd = () => {
    setEditingIdx(-1)
    setIsNew(true)
    setCurrentItem({
      id: "p" + Date.now(),
      title: { en: "", bn: "" },
      blurb: { en: "", bn: "" },
      desc: { en: "", bn: "" },
      year: new Date().getFullYear().toString(),
      tags: [],
      img: "",
      link: "",
      github: "",
      featured: false,
      images: [],
    })
  }

  const handleSaveItem = async () => {
    if (!currentItem.title.en.trim() || !currentItem.blurb.en.trim()) {
      alert(t("Title and Blurb/Short Description are required!", "শিরোনাম এবং সংক্ষিপ্ত বিবরণ পূরণ করা আবশ্যক!", lang))
      return
    }

    let updatedList = [...projects]
    if (isNew) {
      updatedList.push(currentItem)
    } else if (editingIdx !== null && editingIdx >= 0) {
      updatedList[editingIdx] = currentItem
    }

    await updateProjects(updatedList)
    setEditingIdx(null)
    setIsNew(false)
  }

  const handleDeleteItem = async (index: number) => {
    if (!confirm(t("Are you sure you want to delete this project?", "আপনি কি নিশ্চিত যে আপনি এই প্রজেক্টটি মুছতে চান?", lang))) return
    const updatedList = projects.filter((_, i) => i !== index)
    await updateProjects(updatedList)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const updatedList = [...projects]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= projects.length) return
    const temp = updatedList[index]
    updatedList[index] = updatedList[target]
    updatedList[target] = temp
    await updateProjects(updatedList)
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      // First file → cover image
      const firstResult = await uploadImage(files[0], "projects")
      setCurrentItem((prev) => ({ ...prev, img: firstResult.url }))
      // Remaining files → gallery
      if (files.length > 1) {
        const galleryUrls: string[] = []
        for (let i = 1; i < files.length; i++) {
          const r = await uploadImage(files[i], "projects")
          galleryUrls.push(r.url)
        }
        setCurrentItem((prev) => ({ ...prev, images: [...(prev.images || []), ...galleryUrls] }))
      }
    } catch (err: any) {
      alert(t("Upload failed: ", "আপলোড ব্যর্থ হয়েছে: ", lang) + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleUploadGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingGallery(true)
    try {
      const urls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const result = await uploadImage(files[i], "projects")
        urls.push(result.url)
      }
      const currentGallery = currentItem.images || []
      setCurrentItem((prev) => ({ ...prev, images: [...currentGallery, ...urls] }))
    } catch (err: any) {
      alert(t("Upload failed: ", "আপলোড ব্যর্থ হয়েছে: ", lang) + err.message)
    } finally {
      setUploadingGallery(false)
    }
  }

  const addGalleryUrl = () => {
    const url = galleryUrlInput.trim()
    if (!url) return
    const currentGallery = currentItem.images || []
    setCurrentItem((prev) => ({ ...prev, images: [...currentGallery, url] }))
    setGalleryUrlInput("")
  }

  const removeGalleryImage = (index: number) => {
    const currentGallery = currentItem.images || []
    setCurrentItem((prev) => ({
      ...prev,
      images: currentGallery.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    const val = newTag.trim()
    if (!val) return
    if (currentItem.tags.includes(val)) return
    setCurrentItem({ ...currentItem, tags: [...currentItem.tags, val] })
    setNewTag("")
  }

  const removeTag = (idx: number) => {
    setCurrentItem({
      ...currentItem,
      tags: currentItem.tags.filter((_, i) => i !== idx),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[26px] font-[720] tracking-[-0.015em]">{t("Projects", "প্রজেক্টসমূহ", lang)}</h2>
        {editingIdx === null && (
          <button
            onClick={handleStartAdd}
            aria-label={t("Add New Project", "নতুন প্রজেক্ট যোগ করুন", lang)}
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
            {isNew ? t("Add New Project", "নতুন প্রজেক্ট যোগ করুন", lang) : t("Edit Project", "প্রজেক্ট সংশোধন করুন", lang)}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proj-title-en" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Project Title (English)", "প্রজেক্ট টাইটেল (ইংরেজি)", lang)}</label>
              <input
                id="proj-title-en"
                value={currentItem.title.en}
                onChange={(e) => setCurrentItem({ ...currentItem, title: { ...currentItem.title, en: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div>
              <label htmlFor="proj-title-bn" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Project Title (Bangla)", "প্রজেক্ট টাইটেল (বাংলা)", lang)}</label>
              <input
                id="proj-title-bn"
                value={currentItem.title.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, title: { ...currentItem.title, bn: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="proj-img" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Cover Image URL", "কভার ছবি URL", lang)}</label>
              <div className="flex gap-2 mt-[6px]">
                <input
                  id="proj-img"
                  value={currentItem.img}
                  onChange={(e) => setCurrentItem({ ...currentItem, img: e.target.value })}
                  className="flex-1 px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                />
                <label className="px-4 h-[40px] rounded-[9px] bg-[#e7b84b]/10 border border-[#e7b84b]/30 hover:bg-[#e7b84b]/20 text-[#e7b84b] flex items-center justify-center gap-2 cursor-pointer transition text-[13.5px] font-[600]">
                  {uploading ? <Loader size={15} className="animate-spin" /> : <Upload size={15} />}
                  {t("Upload", "আপলোড", lang)}
                  <input type="file" accept="image/*" multiple onChange={handleUploadImage} className="hidden" />
                </label>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Project Gallery / Additional Images", "প্রজেক্ট গ্যালারি / অতিরিক্ত ছবিসমূহ", lang)}</label>
              <div className="flex gap-2">
                <input
                  title={t("Image URL", "ছবি URL", lang)}
                  placeholder={t("Paste image URL here...", "এখানে ছবি URL পেস্ট করুন...", lang)}
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  className="flex-1 px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                />
                <button
                  type="button"
                  onClick={addGalleryUrl}
                  className="px-4 h-[40px] rounded-[9px] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[#e8e9ef] font-[600] text-[13px] cursor-pointer"
                >
                  {t("Add URL", "URL যোগ করুন", lang)}
                </button>
                <label className="px-4 h-[40px] rounded-[9px] bg-[#e7b84b]/10 border border-[#e7b84b]/30 hover:bg-[#e7b84b]/20 text-[#e7b84b] flex items-center justify-center gap-2 cursor-pointer transition text-[13.5px] font-[600]">
                  {uploadingGallery ? <Loader size={15} className="animate-spin" /> : <Upload size={15} />}
                  {t("Upload Images", "ছবি আপলোড", lang)}
                  <input type="file" accept="image/*" multiple onChange={handleUploadGalleryImage} className="hidden" />
                </label>
              </div>
              
              {currentItem.images && currentItem.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
                  {currentItem.images.map((imgUrl, gIdx) => (
                    <div key={gIdx} className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-white/10 bg-black/40">
                      <img src={imgUrl} alt={`Gallery ${gIdx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(gIdx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition"
                        title={t("Remove Image", "ছবি সরান", lang)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="proj-link" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Live Link (e.g. Website URL)", "লাইভ প্রজেক্ট লিংক", lang)}</label>
              <input
                id="proj-link"
                value={currentItem.link}
                onChange={(e) => setCurrentItem({ ...currentItem, link: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div>
              <label htmlFor="proj-github" className="text-[12px] text-[#9aa0ad] font-[600]">{t("GitHub Link", "গিটহাব লিংক", lang)}</label>
              <input
                id="proj-github"
                value={currentItem.github || ""}
                onChange={(e) => setCurrentItem({ ...currentItem, github: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>

            <div>
              <label htmlFor="proj-year" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Year (e.g. 2024)", "বছর (যেমন: ২০২৪)", lang)}</label>
              <input
                id="proj-year"
                value={currentItem.year}
                onChange={(e) => setCurrentItem({ ...currentItem, year: e.target.value })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>

            <div>
              <label htmlFor="proj-tags" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Technologies & Tags", "টেকনোলজি ও ট্যাগসমূহ", lang)}</label>
              <div className="flex gap-2 mt-[6px]">
                <input
                  id="proj-tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. React"
                  className="flex-1 px-3 h-[36px] rounded-[8px] bg-black/20 border border-white/[0.1] text-[13.5px] text-[#e8e9ef]"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 h-[36px] rounded-[8px] bg-white/[0.04] border border-white/[0.08] text-[#e8e9ef] font-[600] text-[12.5px] cursor-pointer"
                >
                  {t("Add", "যোগ", lang)}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {currentItem.tags.map((tg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[11.5px] text-[#d2d5de]"
                  >
                    <span>{tg}</span>
                    <button type="button" onClick={() => removeTag(idx)} className="text-red-400 font-[700] ml-1">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Featured Showcase", "ফিচার্ড শোকেস", lang)}</label>
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentItem({ ...currentItem, featured: !currentItem.featured })}
                  className={`px-4 h-[34px] rounded-lg border text-[12.8px] font-[600] transition ${
                    currentItem.featured
                      ? "bg-[#e7b84b]/10 border-[#e7b84b] text-[#e7b84b]"
                      : "bg-white/[0.02] border-white/[0.08] text-[#9aa0ad]"
                  }`}
                >
                  {currentItem.featured ? t("★ Featured Enabled", "★ ফিচার্ড সক্রিয়", lang) : t("☆ Standard Project", "☆ সাধারণ প্রজেক্ট", lang)}
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="proj-blurb-en" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Short Description / Blurb (English)", "সংক্ষিপ্ত বিবরণী (ইংরেজি)", lang)}</label>
              <textarea
                id="proj-blurb-en"
                value={currentItem.blurb.en}
                onChange={(e) => setCurrentItem({ ...currentItem, blurb: { ...currentItem.blurb, en: e.target.value } })}
                rows={3}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="proj-blurb-bn" className="text-[12px] text-[#9aa0ad] font-[600]">{t("Short Description / Blurb (Bangla)", "সংক্ষিপ্ত বিবরণী (বাংলা)", lang)}</label>
              <textarea
                id="proj-blurb-bn"
                value={currentItem.blurb.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, blurb: { ...currentItem.blurb, bn: e.target.value } })}
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
          {projects.length === 0 ? (
            <div className="text-center py-6 text-[13.5px] text-[#7e8391]">
              {t("No projects added yet. Click 'Add New' to begin.", "এখনো কোনো প্রজেক্ট যোগ করা হয়নি। শুরু করতে 'নতুন যোগ' এ ক্লিক করুন।", lang)}
            </div>
          ) : (
            projects.map((proj, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-[12px] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition"
              >
                <div className="flex gap-4 items-center">
                  {proj.img ? (
                    <img src={proj.img} alt={proj.title.en} className="w-[60px] h-[45px] object-cover rounded-lg border border-white/10 bg-black/40" />
                  ) : (
                    <div className="w-[60px] h-[45px] rounded-lg border border-white/5 bg-white/5 flex items-center justify-center text-[10px] text-[#7e8391]">No Cover</div>
                  )}
                  <div>
                    <div className="font-[650] text-[14.5px] text-[#e8e9ef]">
                      {proj.title[lang]}
                      {proj.featured && <span className="text-[#e7b84b] text-[12px] ml-2 font-mono">★ Featured</span>}
                    </div>
                    <div className="text-[12px] text-[#7e8391] mt-[3px]">{proj.link || "No Website link"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(idx)}
                    aria-label={`${t("Edit", "এডিট", lang)}: ${proj.title[lang]}`}
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
                    disabled={idx === projects.length - 1}
                    aria-label={t("Move Down", "নিচে সরান", lang)}
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-30 flex items-center justify-center text-[#e8e9ef]"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(idx)}
                    aria-label={`${t("Delete", "মুছুন", lang)}: ${proj.title[lang]}`}
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
