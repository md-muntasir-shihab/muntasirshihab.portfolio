import React, { useState } from "react"
import { useStore } from "../../lib/store"
import { uploadImage } from "../../lib/supabase"
import { type Lang } from "../../lib/data"
import { Globe, Plus, Trash2, ArrowUp, ArrowDown, Upload, Loader } from "lucide-react"

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
  })

  const [socials, setSocials] = useState<any[]>(profile.socials || [])
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const handleSave = async () => {
    await updateProfile({
      name: { en: formData.nameEn, bn: formData.nameBn },
      title: { en: formData.titleEn, bn: formData.titleBn },
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar,
      customLogo: formData.customLogo,
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

  const addSocial = () => {
    setSocials([...socials, { name: "Custom Site", url: "https://", color: "#e7b84b", enabled: true }])
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
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Name (English)", "নাম (ইংরেজি)", lang)}</label>
            <input
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Name (Bangla)", "নাম (বাংলা)", lang)}</label>
            <input
              value={formData.nameBn}
              onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
              className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
            />
          </div>

          {/* Titles */}
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Title (English)", "টাইটেল (ইংরেজি)", lang)}</label>
            <input
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Title (Bangla)", "টাইটেল (বাংলা)", lang)}</label>
            <input
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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Phone Number", "ফোন নম্বর", lang)}</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
            />
          </div>

          {/* Avatar URL with Upload */}
          <div className="space-y-1">
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Avatar Image URL", "অ্যাভাটার ছবি URL", lang)}</label>
            <div className="flex gap-2">
              <input
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="flex-1 px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
              />
              <label className="px-4 h-[44px] rounded-[11px] bg-[#e7b84b]/10 border border-[#e7b84b]/30 hover:bg-[#e7b84b]/20 text-[#e7b84b] flex items-center justify-center gap-2 cursor-pointer transition text-[13.5px] font-[600]">
                {uploadingAvatar ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                {t("Upload", "আপলোড", lang)}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Logo URL with Upload */}
          <div className="space-y-1">
            <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Custom Logo URL (Navbar)", "কাস্টম লোগো URL (ন্যাভবার)", lang)}</label>
            <div className="flex gap-2">
              <input
                value={formData.customLogo}
                onChange={(e) => setFormData({ ...formData, customLogo: e.target.value })}
                className="flex-1 px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"
              />
              <label className="px-4 h-[44px] rounded-[11px] bg-[#e7b84b]/10 border border-[#e7b84b]/30 hover:bg-[#e7b84b]/20 text-[#e7b84b] flex items-center justify-center gap-2 cursor-pointer transition text-[13.5px] font-[600]">
                {uploadingLogo ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                {t("Upload", "আপলোড", lang)}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
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
                  value={soc.color || "#e7b84b"}
                  onChange={(e) => {
                    const next = [...socials]
                    next[idx].color = e.target.value
                    setSocials(next)
                  }}
                  className="w-10 h-[36px] rounded-[8px] bg-black/20 border border-white/[0.1] cursor-pointer"
                />
                <input
                  value={soc.customLogo || ""}
                  onChange={(e) => {
                    const next = [...socials]
                    next[idx].customLogo = e.target.value
                    setSocials(next)
                  }}
                  placeholder="Brand Logo Image URL"
                  className="w-full md:w-[180px] px-3 h-[36px] rounded-[8px] bg-black/20 border border-white/[0.1] text-[13.5px]"
                />
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
                      className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] disabled:opacity-30 flex items-center justify-center text-[#e8e9ef]"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      onClick={() => moveSocial(idx, "down")}
                      disabled={idx === socials.length - 1}
                      className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] disabled:opacity-30 flex items-center justify-center text-[#e8e9ef]"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      onClick={() => deleteSocial(idx)}
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
