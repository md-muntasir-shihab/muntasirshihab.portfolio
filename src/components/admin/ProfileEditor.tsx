import { useState } from "react"
import { useStore } from "../../lib/store"
import { uploadImage } from "../../lib/supabase"
import { type Lang } from "../../lib/data"
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Loader } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

export default function ProfileEditor({ lang }: { lang: Lang }) {
  const { profile, updateProfile } = useStore()
  const [formData, setFormData] = useState({
    nameEn: profile.name.en,
    nameBn: profile.name.bn,
    titleEn: profile.title.en,
    titleBn: profile.title.bn,
    email: profile.email || "",
    phone: profile.phone || "",
    avatar: profile.avatar || "",
    customLogo: profile.customLogo || "",
    favicon: profile.favicon || "",
  })

  const [socials, setSocials] = useState<any[]>(profile.socials || [])
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  const handleSave = async () => {
    await updateProfile({
      name: { en: formData.nameEn, bn: formData.nameBn },
      title: { en: formData.titleEn, bn: formData.titleBn },
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar,
      customLogo: formData.customLogo,
      favicon: formData.favicon,
      socials,
    })
    alert(t("Profile updated successfully!", "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!", lang))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const result = await uploadImage(file, "avatars")
      setFormData((prev) => ({ ...prev, avatar: result.url }))
    } catch (err: any) {
      alert(t("Upload failed: ", "আপলোড ব্যর্থ হয়েছে: ", lang) + err.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const result = await uploadImage(file, "brand")
      setFormData((prev) => ({ ...prev, customLogo: result.url }))
    } catch (err: any) {
      alert(t("Upload failed: ", "আপলোড ব্যর্থ হয়েছে: ", lang) + err.message)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFavicon(true)
    try {
      const result = await uploadImage(file, "brand")
      setFormData((prev) => ({ ...prev, favicon: result.url }))
    } catch (err: any) {
      alert(t("Upload failed: ", "আপলোড ব্যর্থ হয়েছে: ", lang) + err.message)
    } finally {
      setUploadingFavicon(false)
    }
  }

  const addSocial = () => {
    setSocials([...socials, { name: "Custom Site", url: "https://", color: "#e7b84b", enabled: true, category: "social" }])
  }

  const deleteSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index))
  }

  const moveSocial = (index: number, direction: "up" | "down") => {
    const nextSocials = [...socials]
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= socials.length) return
    const temp = nextSocials[index]
    nextSocials[index] = nextSocials[target]
    nextSocials[target] = temp
    setSocials(nextSocials)
  }

  return (
    <div className="space-y-6">
      <div className="text-[26px] font-[720] tracking-[-0.015em]">
        {t("Profile Settings", "প্রোফাইল সেটিংস", lang)}
      </div>

      <div className="glass rounded-[18px] p-6 space-y-6 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Names */}
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Name (EN)", "নাম (EN)", lang)}</label>
            <input
              title={t("Name (EN)", "নাম (EN)", lang)}
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Name (BN)", "নাম (BN)", lang)}</label>
            <input
              title={t("Name (BN)", "নাম (BN)", lang)}
              value={formData.nameBn}
              onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
              className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
            />
          </div>

          {/* Titles */}
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Title (EN)", "টাইটেল (EN)", lang)}</label>
            <input
              title={t("Title (EN)", "টাইটেল (EN)", lang)}
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Title (BN)", "টাইটেল (BN)", lang)}</label>
            <input
              title={t("Title (BN)", "টাইটেল (BN)", lang)}
              value={formData.titleBn}
              onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
              className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
            />
          </div>

          {/* Email / Phone */}
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Email Address", "ইমেইল ঠিকানা", lang)}</label>
            <input
              type="email"
              title={t("Email Address", "ইমেইল ঠিকানা", lang)}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Phone Number", "ফোন নম্বর", lang)}</label>
            <input
              title={t("Phone Number", "ফোন নম্বর", lang)}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
            />
          </div>

          {/* Avatar Image Upload Box */}
          <div className="space-y-2">
            <label className="text-[12.5px] text-[#9aa0ad] font-[600]">{t("Avatar Image", "অ্যাভাটার ছবি", lang)}</label>
            <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-[14px] bg-white/[0.02] border border-white/[0.08]">
              {formData.avatar ? (
                <div className="relative group w-20 h-20 rounded-full overflow-hidden border border-white/10 bg-black/40">
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: "" })}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition"
                    title={t("Remove Image", "ছবি সরান", lang)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full border border-dashed border-white/20 bg-black/20 flex flex-col items-center justify-center text-[#7e8391]">
                  <span className="text-[10px] font-mono mt-1">NO IMAGE</span>
                </div>
              )}
              
              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <label className="inline-flex px-4 h-9 rounded-lg bg-[#e7b84b]/10 border border-[#e7b84b]/30 hover:bg-[#e7b84b]/20 text-[#e7b84b] items-center justify-center gap-2 cursor-pointer transition text-[12.5px] font-[600]">
                  {uploadingAvatar ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                  {t("Upload Avatar", "অ্যাভাটার আপলোড", lang)}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
                <p className="text-[11.5px] text-mute">{t("Square format recommended (JPEG/PNG/WebP, max 2MB)", "বর্গাকার ছবি সাজেস্টেড (JPEG/PNG/WebP, সর্বোচ্চ ২MB)", lang)}</p>
              </div>
            </div>
          </div>

          {/* Custom Logo Upload Box */}
          <div className="space-y-2">
            <label className="text-[12.5px] text-[#9aa0ad] font-[600]">{t("Custom Navbar Logo", "কাস্টম ন্যাভবার লোগো", lang)}</label>
            <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-[14px] bg-white/[0.02] border border-white/[0.08]">
              {formData.customLogo ? (
                <div className="relative group px-4 py-2 rounded-lg border border-white/10 bg-black/40 min-h-[60px] flex items-center justify-center">
                  <img src={formData.customLogo} alt="Custom Logo" className="max-h-[44px] object-contain" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, customLogo: "" })}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition rounded-lg"
                    title={t("Remove Image", "ছবি সরান", lang)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="px-4 py-2 w-32 h-[60px] rounded-lg border border-dashed border-white/20 bg-black/20 flex flex-col items-center justify-center text-[#7e8391]">
                  <span className="text-[10px] font-mono">NO LOGO</span>
                </div>
              )}

              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <label className="inline-flex px-4 h-9 rounded-lg bg-[#e7b84b]/10 border border-[#e7b84b]/30 hover:bg-[#e7b84b]/20 text-[#e7b84b] items-center justify-center gap-2 cursor-pointer transition text-[12.5px] font-[600]">
                  {uploadingLogo ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                  {t("Upload Logo", "লোগো আপলোড", lang)}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                <p className="text-[11.5px] text-mute">{t("Horizontal aspect ratio, transparent background recommended", "হরাইজন্টাল এবং ট্রান্সপারেন্ট ব্যাকগ্রাউন্ড সাজেস্টেড", lang)}</p>
              </div>
            </div>
          </div>

          {/* Site Favicon Upload Box */}
          <div className="space-y-2">
            <label className="text-[12.5px] text-[#9aa0ad] font-[600]">{t("Site Favicon", "সাইট ফেভিকন", lang)}</label>
            <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-[14px] bg-white/[0.02] border border-white/[0.08]">
              {formData.favicon ? (
                <div className="relative group w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                  <img src={formData.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, favicon: "" })}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition"
                    title={t("Remove Image", "ছবি সরান", lang)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg border border-dashed border-white/20 bg-black/20 flex flex-col items-center justify-center text-[#7e8391]">
                  <span className="text-[9px] font-mono">ICO/PNG</span>
                </div>
              )}

              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <label className="inline-flex px-4 h-9 rounded-lg bg-[#e7b84b]/10 border border-[#e7b84b]/30 hover:bg-[#e7b84b]/20 text-[#e7b84b] items-center justify-center gap-2 cursor-pointer transition text-[12.5px] font-[600]">
                  {uploadingFavicon ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                  {t("Upload Favicon", "ফেভিকন আপলোড", lang)}
                  <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                </label>
                <p className="text-[11.5px] text-mute">{t("Square PNG/ICO recommended, transparent background (max 1MB)", "বর্গাকার PNG/ICO এবং ট্রান্সপারেন্ট ব্যাকগ্রাউন্ড সাজেস্টেড (সর্বোচ্চ ১MB)", lang)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links Sub-Editor */}
        <div className="border-t border-white/[0.08] pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[16px] font-[700] text-[#e8e9ef]">
              {t("Social Media Links", "সোশ্যাল মিডিয়া লিংকসমূহ", lang)}
            </div>
            <button
              onClick={addSocial}
              className="px-3 h-8 rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[12px] flex items-center gap-1 cursor-pointer transition hover:brightness-110"
            >
              <Plus size={14} /> {t("Add New", "নতুন যোগ", lang)}
            </button>
          </div>

          <div className="space-y-3">
            {socials.map((soc, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row gap-3 p-3 rounded-[12px] bg-white/[0.02] border border-white/[0.05] items-start md:items-center"
              >
                <input
                  title={t("Social Media Platform Name", "সোশ্যাল মিডিয়া প্ল্যাটফর্ম নাম", lang)}
                  value={soc.name}
                  onChange={(e) => {
                    const next = [...socials]
                    next[idx].name = e.target.value
                    setSocials(next)
                  }}
                  placeholder="Platform Name"
                  className="w-full md:w-[150px] px-3 h-[36px] rounded-[8px] bg-black/20 border border-white/[0.1] text-[13.5px]"
                />
                <input
                  title={t("Social Media Platform URL", "সোশ্যাল মিডিয়া প্ল্যাটফর্ম URL", lang)}
                  value={soc.url}
                  onChange={(e) => {
                    const next = [...socials]
                    next[idx].url = e.target.value
                    setSocials(next)
                  }}
                  placeholder="URL (e.g. https://...)"
                  className="flex-1 w-full px-3 h-[36px] rounded-[8px] bg-black/20 border border-white/[0.1] text-[13.5px]"
                />
                <input
                  type="color"
                  title={t("Social Media Accent Color", "সোশ্যাল মিডিয়া অ্যাকসেন্ট কালার", lang)}
                  value={soc.color || "#e7b84b"}
                  onChange={(e) => {
                    const next = [...socials]
                    next[idx].color = e.target.value
                    setSocials(next)
                  }}
                  className="w-10 h-[36px] rounded-[8px] bg-black/20 border border-white/[0.1] cursor-pointer"
                />
                <input
                  title={t("Social Media Custom Logo URL", "সোশ্যাল মিডিয়া কাস্টম লোগো URL", lang)}
                  value={soc.customLogo || ""}
                  onChange={(e) => {
                    const next = [...socials]
                    next[idx].customLogo = e.target.value
                    setSocials(next)
                  }}
                  placeholder="Brand Logo Image URL"
                  className="w-full md:w-[180px] px-3 h-[36px] rounded-[8px] bg-black/20 border border-white/[0.1] text-[13.5px]"
                />
                <select
                  title={t("Social Media Category", "সোশ্যাল মিডিয়া ক্যাটাগরি", lang)}
                  value={soc.category || "social"}
                  onChange={(e) => {
                    const next = [...socials]
                    next[idx].category = e.target.value
                    setSocials(next)
                  }}
                  className="w-full md:w-[130px] px-2 h-[36px] rounded-[8px] bg-black/20 border border-white/[0.1] text-[13.5px] text-[#e8e9ef] outline-none"
                >
                  <option value="social" className="bg-[#12121b]">{t("Social", "সোশ্যাল", lang)}</option>
                  <option value="professional" className="bg-[#12121b]">{t("Professional", "প্রফেশনাল", lang)}</option>
                  <option value="design" className="bg-[#12121b]">{t("Design & Creative", "ডিজাইন ও ক্রিয়েটিভ", lang)}</option>
                </select>
                <div className="flex items-center gap-2 max-md:w-full max-md:justify-between">
                  <button
                    onClick={() => {
                      const next = [...socials]
                      next[idx].enabled = !next[idx].enabled
                      setSocials(next)
                    }}
                    className={`px-3.5 h-[36px] rounded-[8px] border text-[12.5px] font-[600] transition ${
                      soc.enabled
                        ? "bg-[#5bd07a]/10 border-[#5bd07a]/30 text-[#6ad08a]"
                        : "bg-white/[0.02] border-white/[0.1] text-[#9aa0ad]"
                    }`}
                  >
                    {soc.enabled ? t("Active", "সক্রিয়", lang) : t("Inactive", "নিষ্ক্রিয়", lang)}
                  </button>

                  <div className="flex gap-1">
                    <button
                      onClick={() => moveSocial(idx, "up")}
                      disabled={idx === 0}
                      title={t("Move Up", "উপরে সরান", lang)}
                      className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] disabled:opacity-30 flex items-center justify-center text-[#e8e9ef]"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      onClick={() => moveSocial(idx, "down")}
                      disabled={idx === socials.length - 1}
                      title={t("Move Down", "নিচে সরান", lang)}
                      className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] disabled:opacity-30 flex items-center justify-center text-[#e8e9ef]"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      onClick={() => deleteSocial(idx)}
                      title={t("Delete Social Media Connection", "সোশ্যাল মিডিয়া সংযোগ মুছুন", lang)}
                      className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 flex items-center justify-center text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={handleSave}
            className="px-6 h-[44px] rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[14.5px] hover:brightness-110 transition cursor-pointer"
          >
            {t("Save Changes", "পরিবর্তন সংরক্ষণ", lang)}
          </button>
          <div className="text-[11.5px] text-[#7e8391]">
            {t("Direct sync with Supabase active.", "Supabase এর সাথে সরাসরি সিঙ্ক সক্রিয়।", lang)}
          </div>
        </div>
      </div>
    </div>
  )
}
