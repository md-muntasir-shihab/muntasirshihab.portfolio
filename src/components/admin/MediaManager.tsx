import React, { useState, useEffect } from "react"
import { type Lang } from "../../lib/data"
import { uploadImage, listFiles, deleteFile, type StorageFile } from "../../lib/supabase"
import { Upload, Trash2, Copy, Check, Loader2, Image as ImageIcon } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

export default function MediaManager({ lang }: { lang: Lang }) {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [folder, setFolder] = useState<string>("general")

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const data = await listFiles("images", folder)
      // Filter out folder placeholders if any (usually named '.emptyFolderPlaceholder')
      setFiles(data.filter(f => f.name !== ".emptyFolderPlaceholder"))
    } catch (err) {
      console.error("Failed to list files:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [folder])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      await uploadImage(file, folder)
      await fetchFiles()
    } catch (err: any) {
      alert(err.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (file: StorageFile) => {
    if (!confirm(t("Are you sure you want to delete this image?", "আপনি কি নিশ্চিত যে আপনি এই ছবি ফাইলটি মুছতে চান?", lang))) return
    try {
      // The delete function expects the path to delete, which is folder + file.name
      const path = folder ? `${folder}/${file.name}` : file.name
      await deleteFile("images", path)
      await fetchFiles()
    } catch (err: any) {
      alert(err.message || "Delete failed")
    }
  }

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[26px] font-[720] tracking-[-0.015em]">{t("Media & Assets Manager", "মিডিয়া ও ফাইল গ্যালারি", lang)}</div>
          <p className="text-[13.5px] text-[#7e8391] mt-1.5">
            {t("Upload images/icons here and copy their URLs for use in Projects, Testimonials, or Profile.", "এখানে ছবি আপলোড করে লিঙ্ক কপি করুন এবং প্রোফাইল, প্রজেক্ট বা রিভিউর ইমেজ ফিল্ডে ব্যবহার করুন।", lang)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            title={t("Select Folder", "ফোল্ডার নির্বাচন করুন", lang)}
            className="px-3 h-9 rounded-lg bg-black/25 border border-white/[0.12] text-white text-[13px] outline-none"
          >
            <option value="general">{t("General Assets", "সাধারণ ফাইল", lang)}</option>
            <option value="projects">{t("Project Covers", "প্রজেক্ট স্ক্রিনশট", lang)}</option>
            <option value="testimonials">{t("Client Avatars", "ক্লায়েন্ট ছবি", lang)}</option>
          </select>

          <label className="px-4 h-9 rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13px] flex items-center gap-1.5 cursor-pointer transition hover:brightness-110">
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> {t("Uploading...", "আপলোড হচ্ছে...", lang)}
              </>
            ) : (
              <>
                <Upload size={14} /> {t("Upload Image", "ছবি আপলোড", lang)}
              </>
            )}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleUpload} />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="glass rounded-[18px] p-12 text-center text-[#7e8391] text-[14px]">
          <Loader2 size={24} className="animate-spin mx-auto mb-3" />
          {t("Loading media library...", "মিডিয়া ফাইল লোড হচ্ছে...", lang)}
        </div>
      ) : files.length === 0 ? (
        <div className="glass rounded-[18px] p-12 text-center text-[#7e8391] text-[14px] flex flex-col items-center justify-center">
          <ImageIcon size={32} className="opacity-40 mb-3" />
          {t("No images found in this folder. Upload one to start!", "এই ফোল্ডারে কোনো ছবি পাওয়া যায়নি। শুরু করতে একটি ছবি আপলোড করুন!", lang)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.id} className="glass rounded-[16px] overflow-hidden group flex flex-col justify-between border border-white/[0.05] hover:border-white/[0.1] transition-all">
              <div className="aspect-[4/3] relative overflow-hidden bg-black/40 flex items-center justify-center">
                <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="p-3 space-y-2.5">
                <div className="text-[11.5px] font-[550] text-[#e8e9ef] truncate" title={file.name}>
                  {file.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyLink(file.url, file.id)}
                    className="flex-1 px-2.5 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-[#e8cd8a] font-[600] flex items-center justify-center gap-1 transition"
                  >
                    {copiedId === file.id ? (
                      <>
                        <Check size={11} className="text-emerald-400" /> {t("Copied", "কপি হয়েছে", lang)}
                      </>
                    ) : (
                      <>
                        <Copy size={11} /> {t("Copy Link", "লিঙ্ক কপি", lang)}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"
                    title={t("Delete Image", "ছবি মুছুন", lang)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
