import React, { useState } from "react"
import { useStore } from "../../lib/store"
import { type Lang } from "../../lib/data"
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

interface BlogPost {
  slug: string
  date: string
  read: string
  title: { en: string; bn: string }
  excerpt: { en: string; bn: string }
  content?: { en: string; bn: string }
  tags: string[]
}

export default function BlogManager({ lang }: { lang: Lang }) {
  const { blogPosts, updateBlogPosts } = useStore()
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [currentItem, setCurrentItem] = useState<BlogPost>({
    slug: "",
    date: new Date().toISOString().split("T")[0],
    read: "5 min read",
    title: { en: "", bn: "" },
    excerpt: { en: "", bn: "" },
    content: { en: "", bn: "" },
    tags: [],
  })

  const [newTag, setNewTag] = useState("")

  const handleStartEdit = (index: number) => {
    setEditingIdx(index)
    setIsNew(false)
    const base = blogPosts[index]
    setCurrentItem({
      slug: base.slug || "",
      date: base.date || "",
      read: base.read || "",
      title: base.title ? { ...base.title } : { en: "", bn: "" },
      excerpt: base.excerpt ? { ...base.excerpt } : { en: "", bn: "" },
      content: base.content ? { ...base.content } : { en: "", bn: "" },
      tags: base.tags ? [...base.tags] : [],
    })
  }

  const handleStartAdd = () => {
    setEditingIdx(-1)
    setIsNew(true)
    setCurrentItem({
      slug: "",
      date: new Date().toISOString().split("T")[0],
      read: "5 min read",
      title: { en: "", bn: "" },
      excerpt: { en: "", bn: "" },
      content: { en: "", bn: "" },
      tags: [],
    })
  }

  const handleSaveItem = async () => {
    if (!currentItem.title.en.trim() || !currentItem.slug.trim()) {
      alert(t("Title and Slug are required!", "শিরোনাম এবং স্ল্যাগ পূরণ করা আবশ্যক!", lang))
      return
    }

    // Slug formatting: lowercase, dash separated
    const formattedSlug = currentItem.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")

    const itemToSave = { ...currentItem, slug: formattedSlug }

    let updatedList = [...blogPosts]
    if (isNew) {
      // Check for duplicate slugs
      if (updatedList.some((b) => b.slug === formattedSlug)) {
        alert(t("Slug already exists! Please use a unique slug.", "স্ল্যাগ ইতিমধ্যে রয়েছে! অনুগ্রহ করে একটি ইউনিক স্ল্যাগ ব্যবহার করুন।", lang))
        return
      }
      updatedList.push(itemToSave)
    } else if (editingIdx !== null && editingIdx >= 0) {
      if (updatedList.some((b, idx) => b.slug === formattedSlug && idx !== editingIdx)) {
        alert(t("Slug already exists! Please use a unique slug.", "স্ল্যাগ ইতিমধ্যে রয়েছে! অনুগ্রহ করে একটি ইউনিক স্ল্যাগ ব্যবহার করুন।", lang))
        return
      }
      updatedList[editingIdx] = itemToSave
    }

    await updateBlogPosts(updatedList)
    setEditingIdx(null)
    setIsNew(false)
  }

  const handleDeleteItem = async (index: number) => {
    if (!confirm(t("Are you sure you want to delete this blog post?", "আপনি কি নিশ্চিত যে আপনি এই ব্লগটি মুছতে চান?", lang))) return
    const updatedList = blogPosts.filter((_, i) => i !== index)
    await updateBlogPosts(updatedList)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const updatedList = [...blogPosts]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= blogPosts.length) return
    const temp = updatedList[index]
    updatedList[index] = updatedList[target]
    updatedList[target] = temp
    await updateBlogPosts(updatedList)
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
        <div className="text-[26px] font-[720] tracking-[-0.015em]">{t("Blog Posts Creator", "ব্লগ ও পোস্টসমূহ", lang)}</div>
        {editingIdx === null && (
          <button
            onClick={handleStartAdd}
            className="px-4 h-9 rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13px] flex items-center gap-1 cursor-pointer transition hover:brightness-110"
          >
            <Plus size={15} /> {t("Create New", "নতুন ব্লগ তৈরি করুন", lang)}
          </button>
        )}
      </div>

      {editingIdx !== null ? (
        // Editor Panel
        <div className="glass rounded-[18px] p-6 space-y-5 max-w-3xl">
          <div className="text-[17px] font-[700] text-[#e7b84b]">
            {isNew ? t("Create New Blog Post", "নতুন ব্লগ পোস্ট লিখুন", lang) : t("Edit Blog Post", "ব্লগ পোস্ট সংশোধন করুন", lang)}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Blog Title (English)", "ব্লগ টাইটেল (ইংরেজি)", lang)}</label>
              <input
                value={currentItem.title.en}
                onChange={(e) => setCurrentItem({ ...currentItem, title: { ...currentItem.title, en: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Blog Title (Bangla)", "ব্লগ টাইটেল (বাংলা)", lang)}</label>
              <input
                value={currentItem.title.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, title: { ...currentItem.title, bn: e.target.value } })}
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Slug (URL Path)", "স্ল্যাগ (URL পাথ)", lang)}</label>
              <input
                value={currentItem.slug}
                onChange={(e) => setCurrentItem({ ...currentItem, slug: e.target.value })}
                placeholder="e.g. my-first-blog"
                className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px] font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Publish Date", "প্রকাশের তারিখ", lang)}</label>
                <input
                  type="date"
                  value={currentItem.date}
                  onChange={(e) => setCurrentItem({ ...currentItem, date: e.target.value })}
                  className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-[#1a1a24] border border-white/[0.12] outline-none text-[#e8e9ef] text-[13px]"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Read Time", "পড়ার সময়কাল", lang)}</label>
                <input
                  value={currentItem.read}
                  onChange={(e) => setCurrentItem({ ...currentItem, read: e.target.value })}
                  className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Tags", "ট্যাগসমূহ", lang)}</label>
              <div className="flex gap-2 mt-[6px]">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. Design"
                  className="flex-1 px-3 h-[36px] rounded-[8px] bg-black/20 border border-white/[0.1] text-[13.5px]"
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

            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Excerpt / Summary (English)", "সংক্ষিপ্ত সারমর্ম (ইংরেজি)", lang)}</label>
              <textarea
                value={currentItem.excerpt.en}
                onChange={(e) => setCurrentItem({ ...currentItem, excerpt: { ...currentItem.excerpt, en: e.target.value } })}
                rows={2}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Excerpt / Summary (Bangla)", "সংক্ষিপ্ত সারমর্ম (বাংলা)", lang)}</label>
              <textarea
                value={currentItem.excerpt.bn}
                onChange={(e) => setCurrentItem({ ...currentItem, excerpt: { ...currentItem.excerpt, bn: e.target.value } })}
                rows={2}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Full Article Content (English - Markdown/Text)", "মূল লেখা (ইংরেজি)", lang)}</label>
              <textarea
                value={currentItem.content?.en || ""}
                onChange={(e) => setCurrentItem({ ...currentItem, content: { ...currentItem.content!, en: e.target.value } })}
                rows={6}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px] font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Full Article Content (Bangla - Markdown/Text)", "মূল লেখা (বাংলা)", lang)}</label>
              <textarea
                value={currentItem.content?.bn || ""}
                onChange={(e) => setCurrentItem({ ...currentItem, content: { ...currentItem.content!, bn: e.target.value } })}
                rows={6}
                className="w-full mt-[6px] p-3 rounded-[9px] bg-black/25 border border-white/[0.12] outline-none text-[#e8e9ef] text-[13.5px] font-mono"
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
          {blogPosts.length === 0 ? (
            <div className="text-center py-6 text-[13.5px] text-[#7e8391]">
              {t("No blog posts created yet. Click 'Create New' to begin.", "এখনো কোনো ব্লগ পোস্ট তৈরি করা হয়নি। শুরু করতে 'নতুন ব্লগ তৈরি করুন' এ ক্লিক করুন।", lang)}
            </div>
          ) : (
            blogPosts.map((post, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-[12px] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition"
              >
                <div>
                  <div className="font-[650] text-[14.5px] text-[#e8e9ef]">
                    {post.title[lang]}
                  </div>
                  <div className="text-[12px] text-[#7e8391] mt-[3px]">/{post.slug} | {post.date} | {post.read}</div>
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
                    disabled={idx === blogPosts.length - 1}
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
