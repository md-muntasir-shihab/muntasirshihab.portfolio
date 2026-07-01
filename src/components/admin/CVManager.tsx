import React, { useState } from "react"
import { useStore } from "../../lib/store"
import { type Lang } from "../../lib/data"
import { uploadPdf } from "../../lib/supabase"
import { FileDown, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

export default function CVManager({ lang }: { lang: Lang }) {
  const { profile, cvCount, updateProfile } = useStore()
  const [uploading, setUploading] = useState<"designed" | "ats" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "designed" | "ats") => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setError(t("Please upload only PDF files.", "অনুগ্রহ করে শুধু PDF ফাইল আপলোড করুন।", lang))
      return
    }

    // 5MB Max size
    if (file.size > 5 * 1024 * 1024) {
      setError(t("Max file size allowed is 5MB.", "সর্বোচ্চ ৫ মেগাবাইট সাইজ অনুমোদিত।", lang))
      return
    }

    try {
      setUploading(type)
      setError(null)
      setSuccess(null)

      const uploaded = await uploadPdf(file)
      
      if (type === "designed") {
        await updateProfile({ cvUrl: uploaded.url })
      } else {
        await updateProfile({ atsCvUrl: uploaded.url })
      }

      setSuccess(
        t(
          `${type === "designed" ? "Designed CV" : "ATS CV"} uploaded and updated successfully!`,
          `${type === "designed" ? "ডিজাইনড সিভি" : "ATS সিভি"} সফলভাবে আপলোড করা হয়েছে!`,
          lang
        )
      )
    } catch (err: any) {
      console.error(err)
      setError(err.message || t("Upload failed. Please check your Supabase Storage policies.", "আপলোড ব্যর্থ হয়েছে। অনুগ্রহ করে স্টোরেজ পলিসি চেক করুন।", lang))
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[26px] font-[720] tracking-[-0.015em]">{t("CV / ATS Resume Manager", "সিভি ও রেজুমে ম্যানেজার", lang)}</div>
        <p className="text-[13.5px] text-[#7e8391] mt-1.5">
          {t(
            "Upload your designed visual CV and ATS-friendly PDF versions. Visitors will download these files.",
            "আপনার ডিজাইনড সিভি এবং ATS-বান্ধব PDF রেজুমে আপলোড করুন। ভিজিটররা এগুলো ডাউনলোড করতে পারবেন।",
            lang
          )}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] flex items-center gap-2 max-w-xl">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] flex items-center gap-2 max-w-xl">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
        {/* Designed CV Card */}
        <div className="glass rounded-[18px] p-5 flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="text-[11px] font-mono text-[#e5c371] tracking-wider uppercase">{t("DESIGNED CV", "ডিজাইনড সিভি", lang)}</div>
            <div className="mt-3 text-[13.4px] text-[#ccd0dc] leading-relaxed">
              {profile.cvUrl ? (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#e7b84b] hover:underline"
                >
                  <FileDown size={14} /> {t("View Current Designed CV", "বর্তমান ডিজাইনড সিভি দেখুন", lang)}
                </a>
              ) : (
                <span className="text-[#7e8391]">{t("No Designed CV uploaded yet.", "কোনো ডিজাইনড সিভি আপলোড করা হয়নি।", lang)}</span>
              )}
            </div>
          </div>
          
          <div className="mt-5">
            <label className="inline-flex items-center justify-center gap-2 px-4 h-10 w-full rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[13px] text-[#ccd0dc] font-[600] cursor-pointer transition">
              {uploading === "designed" ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> {t("Uploading...", "আপলোড হচ্ছে...", lang)}
                </>
              ) : (
                <>
                  <Upload size={15} /> {t("Upload Designed PDF", "ডিজাইনড PDF আপলোড", lang)}
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={uploading !== null}
                onChange={(e) => handleFileUpload(e, "designed")}
              />
            </label>
          </div>
        </div>

        {/* ATS CV Card */}
        <div className="glass rounded-[18px] p-5 flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="text-[11px] font-mono text-[#e5c371] tracking-wider uppercase">{t("ATS-FRIENDLY CV", "ATS সিভি", lang)}</div>
            <div className="mt-3 text-[13.4px] text-[#ccd0dc] leading-relaxed">
              {profile.atsCvUrl ? (
                <a
                  href={profile.atsCvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#e7b84b] hover:underline"
                >
                  <FileDown size={14} /> {t("View Current ATS CV", "বর্তমান ATS সিভি দেখুন", lang)}
                </a>
              ) : (
                <span className="text-[#7e8391]">{t("No ATS CV uploaded yet.", "কোনো ATS সিভি আপলোড করা হয়নি।", lang)}</span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <label className="inline-flex items-center justify-center gap-2 px-4 h-10 w-full rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[13px] text-[#ccd0dc] font-[600] cursor-pointer transition">
              {uploading === "ats" ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> {t("Uploading...", "আপলোড হচ্ছে...", lang)}
                </>
              ) : (
                <>
                  <Upload size={15} /> {t("Upload ATS PDF", "ATS PDF আপলোড", lang)}
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={uploading !== null}
                onChange={(e) => handleFileUpload(e, "ats")}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.08] max-w-3xl flex items-center justify-between text-[13px] text-[#7e8391]">
        <span>{t("Total CV Downloads Counter:", "মোট সিভি ডাউনলোড সংখ্যা:", lang)}</span>
        <strong className="text-[#e7b84b] font-mono text-[14px]">{cvCount}</strong>
      </div>
    </div>
  )
}
