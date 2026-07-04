import { useState } from "react"
import { useStore } from "../../lib/store"
import { uploadImage } from "../../lib/supabase"
import { type Lang } from "../../lib/data"
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Loader, User, Info, BookOpen, Share2 } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

export default function ProfileEditor({ lang }: { lang: Lang }) {
  const { profile, updateProfile } = useStore()
  const [activeSubTab, setActiveSubTab] = useState<"basic" | "about" | "personal" | "academic" | "socials">("basic")

  const [formData, setFormData] = useState({
    nameEn: profile?.name?.en || "",
    nameBn: profile?.name?.bn || "",
    titleEn: profile?.title?.en || "",
    titleBn: profile?.title?.bn || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    avatar: profile?.avatar || "",
    customLogo: profile?.customLogo || "",
    favicon: profile?.favicon || "",
    
    // Bio & Location
    bioShortEn: profile?.bioShort?.en || "",
    bioShortBn: profile?.bioShort?.bn || "",
    bioLongEn: profile?.bioLong?.en || "",
    bioLongBn: profile?.bioLong?.bn || "",
    locationEn: profile?.location?.en || "",
    locationBn: profile?.location?.bn || "",

    // Personal Details
    dobEn: profile?.personalDetails?.dob?.en || "",
    dobBn: profile?.personalDetails?.dob?.bn || "",
    bloodGroup: profile?.personalDetails?.bloodGroup || "",
    genderEn: profile?.personalDetails?.gender?.en || "",
    genderBn: profile?.personalDetails?.gender?.bn || "",
    nationalityEn: profile?.personalDetails?.nationality?.en || "",
    nationalityBn: profile?.personalDetails?.nationality?.bn || "",
    religionEn: profile?.personalDetails?.religion?.en || "",
    religionBn: profile?.personalDetails?.religion?.bn || "",
    maritalStatusEn: profile?.personalDetails?.maritalStatus?.en || "",
    maritalStatusBn: profile?.personalDetails?.maritalStatus?.bn || "",
    placeOfBirthEn: profile?.personalDetails?.placeOfBirth?.en || "",
    placeOfBirthBn: profile?.personalDetails?.placeOfBirth?.bn || "",
    occupationEn: profile?.personalDetails?.occupation?.en || "",
    occupationBn: profile?.personalDetails?.occupation?.bn || "",

    // Academic & Address
    universityEn: profile?.personalDetails?.university?.en || "",
    universityBn: profile?.personalDetails?.university?.bn || "",
    departmentEn: profile?.personalDetails?.department?.en || "",
    departmentBn: profile?.personalDetails?.department?.bn || "",
    degreeEn: profile?.personalDetails?.degree?.en || "",
    degreeBn: profile?.personalDetails?.degree?.bn || "",
    academicStatusEn: profile?.personalDetails?.academicStatus?.en || "",
    academicStatusBn: profile?.personalDetails?.academicStatus?.bn || "",
    presentAddressEn: profile?.personalDetails?.presentAddress?.en || "",
    presentAddressBn: profile?.personalDetails?.presentAddress?.bn || "",
    permanentAddressEn: profile?.personalDetails?.permanentAddress?.en || "",
    permanentAddressBn: profile?.personalDetails?.permanentAddress?.bn || "",
  })

  const [socials, setSocials] = useState<any[]>(profile?.socials || [])
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
      bioShort: { en: formData.bioShortEn, bn: formData.bioShortBn },
      bioLong: { en: formData.bioLongEn, bn: formData.bioLongBn },
      location: { en: formData.locationEn, bn: formData.locationBn },
      personalDetails: {
        dob: { en: formData.dobEn, bn: formData.dobBn },
        bloodGroup: formData.bloodGroup,
        gender: { en: formData.genderEn, bn: formData.genderBn },
        nationality: { en: formData.nationalityEn, bn: formData.nationalityBn },
        religion: { en: formData.religionEn, bn: formData.religionBn },
        maritalStatus: { en: formData.maritalStatusEn, bn: formData.maritalStatusBn },
        placeOfBirth: { en: formData.placeOfBirthEn, bn: formData.placeOfBirthBn },
        occupation: { en: formData.occupationEn, bn: formData.occupationBn },
        university: { en: formData.universityEn, bn: formData.universityBn },
        department: { en: formData.departmentEn, bn: formData.departmentBn },
        degree: { en: formData.degreeEn, bn: formData.degreeBn },
        academicStatus: { en: formData.academicStatusEn, bn: formData.academicStatusBn },
        presentAddress: { en: formData.presentAddressEn, bn: formData.presentAddressBn },
        permanentAddress: { en: formData.permanentAddressEn, bn: formData.permanentAddressBn },
      },
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

      {/* Sub tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-black/45 backdrop-blur-md rounded-[14px] border border-white/[0.08] max-w-4xl">
        <button
          onClick={() => setActiveSubTab("basic")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-[600] transition cursor-pointer ${
            activeSubTab === "basic"
              ? "bg-[#e7b84b] text-[#1a1410] shadow-[0_4px_12px_rgba(231,184,75,0.25)]"
              : "text-[#9aa0ad] hover:text-[#e8e9ef] hover:bg-white/[0.04]"
          }`}
        >
          <User size={15} />
          {t("Basic Info", "বেসিক তথ্য", lang)}
        </button>
        <button
          onClick={() => setActiveSubTab("about")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-[600] transition cursor-pointer ${
            activeSubTab === "about"
              ? "bg-[#e7b84b] text-[#1a1410] shadow-[0_4px_12px_rgba(231,184,75,0.25)]"
              : "text-[#9aa0ad] hover:text-[#e8e9ef] hover:bg-white/[0.04]"
          }`}
        >
          <Info size={15} />
          {t("Bio & Story", "বায়ো ও স্টোরি", lang)}
        </button>
        <button
          onClick={() => setActiveSubTab("personal")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-[600] transition cursor-pointer ${
            activeSubTab === "personal"
              ? "bg-[#e7b84b] text-[#1a1410] shadow-[0_4px_12px_rgba(231,184,75,0.25)]"
              : "text-[#9aa0ad] hover:text-[#e8e9ef] hover:bg-white/[0.04]"
          }`}
        >
          <User size={15} />
          {t("Personal Details", "ব্যক্তিগত বিবরণ", lang)}
        </button>
        <button
          onClick={() => setActiveSubTab("academic")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-[600] transition cursor-pointer ${
            activeSubTab === "academic"
              ? "bg-[#e7b84b] text-[#1a1410] shadow-[0_4px_12px_rgba(231,184,75,0.25)]"
              : "text-[#9aa0ad] hover:text-[#e8e9ef] hover:bg-white/[0.04]"
          }`}
        >
          <BookOpen size={15} />
          {t("Academic & Address", "একাডেমিক ও ঠিকানা", lang)}
        </button>
        <button
          onClick={() => setActiveSubTab("socials")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-[600] transition cursor-pointer ${
            activeSubTab === "socials"
              ? "bg-[#e7b84b] text-[#1a1410] shadow-[0_4px_12px_rgba(231,184,75,0.25)]"
              : "text-[#9aa0ad] hover:text-[#e8e9ef] hover:bg-white/[0.04]"
          }`}
        >
          <Share2 size={15} />
          {t("Social Connections", "সোশ্যাল লিংকসমূহ", lang)}
        </button>
      </div>

      <div className="glass rounded-[18px] p-6 space-y-6 max-w-4xl">
        
        {/* SUB TAB: Basic Info */}
        {activeSubTab === "basic" && (
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Name (EN)", "নাম (EN)", lang)}</label>
              <input
                title={t("Name (EN)", "নাম (EN)", lang)}
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Name (BN)", "নাম (BN)", lang)}</label>
              <input
                title={t("Name (BN)", "নাম (BN)", lang)}
                value={formData.nameBn}
                onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Title (EN)", "টাইটেল (EN)", lang)}</label>
              <input
                title={t("Title (EN)", "টাইটেল (EN)", lang)}
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Title (BN)", "টাইটেল (BN)", lang)}</label>
              <input
                title={t("Title (BN)", "টাইটেল (BN)", lang)}
                value={formData.titleBn}
                onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Email Address", "ইমেইল ঠিকানা", lang)}</label>
              <input
                type="email"
                title={t("Email Address", "ইমেইল ঠিকানা", lang)}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Phone Number", "ফোন নম্বর", lang)}</label>
              <input
                title={t("Phone Number", "ফোন নম্বর", lang)}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>

            {/* Upload fields */}
            <div className="space-y-2 col-span-2">
              <label className="text-[12.5px] text-[#9aa0ad] font-[600]">{t("Avatar Image", "অ্যাভাটার ছবি", lang)}</label>
              <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-[14px] bg-white/[0.02] border border-white/[0.08]">
                {formData.avatar ? (
                  <div className="relative group w-20 h-20 rounded-full overflow-hidden border border-white/10 bg-black/40 flex-shrink-0">
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
                  <div className="w-20 h-20 rounded-full border border-dashed border-white/20 bg-black/20 flex flex-col items-center justify-center text-[#7e8391] flex-shrink-0">
                    <span className="text-[10px] font-mono">NO IMAGE</span>
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

            <div className="space-y-2 col-span-2">
              <label className="text-[12.5px] text-[#9aa0ad] font-[600]">{t("Custom Navbar Logo", "কাস্টম ন্যাভবার লোগো", lang)}</label>
              <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-[14px] bg-white/[0.02] border border-white/[0.08]">
                {formData.customLogo ? (
                  <div className="relative group px-4 py-2 rounded-lg border border-white/10 bg-black/40 min-h-[60px] flex items-center justify-center flex-shrink-0">
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
                  <div className="px-4 py-2 w-32 h-[60px] rounded-lg border border-dashed border-white/20 bg-black/20 flex flex-col items-center justify-center text-[#7e8391] flex-shrink-0">
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

            <div className="space-y-2 col-span-2">
              <label className="text-[12.5px] text-[#9aa0ad] font-[600]">{t("Site Favicon", "সাইট ফেভিকন", lang)}</label>
              <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-[14px] bg-white/[0.02] border border-white/[0.08]">
                {formData.favicon ? (
                  <div className="relative group w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center flex-shrink-0">
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
                  <div className="w-12 h-12 rounded-lg border border-dashed border-white/20 bg-black/20 flex flex-col items-center justify-center text-[#7e8391] flex-shrink-0">
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
        )}

        {/* SUB TAB: Bio & Story */}
        {activeSubTab === "about" && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Location (EN)", "অবস্থান (EN)", lang)}</label>
                <input
                  title={t("Location (EN)", "অবস্থান (EN)", lang)}
                  value={formData.locationEn}
                  onChange={(e) => setFormData({ ...formData, locationEn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                  placeholder="e.g. Panchagarh, Bangladesh"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Location (BN)", "অবস্থান (BN)", lang)}</label>
                <input
                  title={t("Location (BN)", "অবস্থান (BN)", lang)}
                  value={formData.locationBn}
                  onChange={(e) => setFormData({ ...formData, locationBn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                  placeholder="উদাঃ পঞ্চগড়, বাংলাদেশ"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Short Bio (EN)", "সংক্ষিপ্ত বায়ো (EN)", lang)}</label>
              <textarea
                title={t("Short Bio (EN)", "সংক্ষিপ্ত বায়ো (EN)", lang)}
                value={formData.bioShortEn}
                onChange={(e) => setFormData({ ...formData, bioShortEn: e.target.value })}
                className="w-full mt-[6px] p-4 min-h-[90px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px] resize-y"
                placeholder="A brief intro..."
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Short Bio (BN)", "সংক্ষিপ্ত বায়ো (BN)", lang)}</label>
              <textarea
                title={t("Short Bio (BN)", "সংক্ষিপ্ত বায়ো (BN)", lang)}
                value={formData.bioShortBn}
                onChange={(e) => setFormData({ ...formData, bioShortBn: e.target.value })}
                className="w-full mt-[6px] p-4 min-h-[90px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px] resize-y"
                placeholder="একটি সংক্ষিপ্ত পরিচয়..."
              />
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Long Bio / About Story (EN)", "বিস্তারিত বায়ো / গল্প (EN)", lang)}</label>
              <textarea
                title={t("Long Bio / About Story (EN)", "বিস্তারিত বায়ো / গল্প (EN)", lang)}
                value={formData.bioLongEn}
                onChange={(e) => setFormData({ ...formData, bioLongEn: e.target.value })}
                className="w-full mt-[6px] p-4 min-h-[160px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px] resize-y"
                placeholder="Detailed story about you..."
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Long Bio / About Story (BN)", "বিস্তারিত বায়ো / গল্প (BN)", lang)}</label>
              <textarea
                title={t("Long Bio / About Story (BN)", "বিস্তারিত বায়ো / গল্প (BN)", lang)}
                value={formData.bioLongBn}
                onChange={(e) => setFormData({ ...formData, bioLongBn: e.target.value })}
                className="w-full mt-[6px] p-4 min-h-[160px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px] resize-y"
                placeholder="আপনার সম্পর্কিত বিস্তারিত বিবরণ..."
              />
            </div>
          </div>
        )}

        {/* SUB TAB: Personal Details */}
        {activeSubTab === "personal" && (
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Date of Birth (EN)", "জন্ম তারিখ (EN)", lang)}</label>
              <input
                title={t("Date of Birth (EN)", "জন্ম তারিখ (EN)", lang)}
                value={formData.dobEn}
                onChange={(e) => setFormData({ ...formData, dobEn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                placeholder="e.g. 12 October 2005"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Date of Birth (BN)", "জন্ম তারিখ (BN)", lang)}</label>
              <input
                title={t("Date of Birth (BN)", "জন্ম তারিখ (BN)", lang)}
                value={formData.dobBn}
                onChange={(e) => setFormData({ ...formData, dobBn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                placeholder="উদাঃ ১২ অক্টোবর ২০০৫"
              />
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Blood Group", "রক্তের গ্রুপ", lang)}</label>
              <input
                title={t("Blood Group", "রক্তের গ্রুপ", lang)}
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                placeholder="e.g. A+"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Occupation (EN)", "পেশা (EN)", lang)}</label>
              <input
                title={t("Occupation (EN)", "পেশা (EN)", lang)}
                value={formData.occupationEn}
                onChange={(e) => setFormData({ ...formData, occupationEn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                placeholder="e.g. Student / Designer"
              />
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Gender (EN)", "লিঙ্গ (EN)", lang)}</label>
              <input
                title={t("Gender (EN)", "লিঙ্গ (EN)", lang)}
                value={formData.genderEn}
                onChange={(e) => setFormData({ ...formData, genderEn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                placeholder="e.g. Male"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Gender (BN)", "লিঙ্গ (BN)", lang)}</label>
              <input
                title={t("Gender (BN)", "লিঙ্গ (BN)", lang)}
                value={formData.genderBn}
                onChange={(e) => setFormData({ ...formData, genderBn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                placeholder="উদাঃ পুরুষ / মহিলা"
              />
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Nationality (EN)", "জাতীয়তা (EN)", lang)}</label>
              <input
                title={t("Nationality (EN)", "জাতীয়তা (EN)", lang)}
                value={formData.nationalityEn}
                onChange={(e) => setFormData({ ...formData, nationalityEn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Nationality (BN)", "জাতীয়তা (BN)", lang)}</label>
              <input
                title={t("Nationality (BN)", "জাতীয়তা (BN)", lang)}
                value={formData.nationalityBn}
                onChange={(e) => setFormData({ ...formData, nationalityBn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Religion (EN)", "ধর্ম (EN)", lang)}</label>
              <input
                title={t("Religion (EN)", "ধর্ম (EN)", lang)}
                value={formData.religionEn}
                onChange={(e) => setFormData({ ...formData, religionEn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Religion (BN)", "ধর্ম (BN)", lang)}</label>
              <input
                title={t("Religion (BN)", "ধর্ম (BN)", lang)}
                value={formData.religionBn}
                onChange={(e) => setFormData({ ...formData, religionBn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Marital Status (EN)", "বৈবাহিক অবস্থা (EN)", lang)}</label>
              <input
                title={t("Marital Status (EN)", "বৈবাহিক অবস্থা (EN)", lang)}
                value={formData.maritalStatusEn}
                onChange={(e) => setFormData({ ...formData, maritalStatusEn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Marital Status (BN)", "বৈবাহিক অবস্থা (BN)", lang)}</label>
              <input
                title={t("Marital Status (BN)", "বৈবাহিক অবস্থা (BN)", lang)}
                value={formData.maritalStatusBn}
                onChange={(e) => setFormData({ ...formData, maritalStatusBn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>

            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Place of Birth (EN)", "জন্মস্থান (EN)", lang)}</label>
              <input
                title={t("Place of Birth (EN)", "জন্মস্থান (EN)", lang)}
                value={formData.placeOfBirthEn}
                onChange={(e) => setFormData({ ...formData, placeOfBirthEn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Place of Birth (BN)", "জন্মস্থান (BN)", lang)}</label>
              <input
                title={t("Place of Birth (BN)", "জন্মস্থান (BN)", lang)}
                value={formData.placeOfBirthBn}
                onChange={(e) => setFormData({ ...formData, placeOfBirthBn: e.target.value })}
                className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
              />
            </div>
          </div>
        )}

        {/* SUB TAB: Academic & Address */}
        {activeSubTab === "academic" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("University (EN)", "বিশ্ববিদ্যালয় (EN)", lang)}</label>
                <input
                  title={t("University (EN)", "বিশ্ববিদ্যালয় (EN)", lang)}
                  value={formData.universityEn}
                  onChange={(e) => setFormData({ ...formData, universityEn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("University (BN)", "বিশ্ববিদ্যালয় (BN)", lang)}</label>
                <input
                  title={t("University (BN)", "বিশ্ববিদ্যালয় (BN)", lang)}
                  value={formData.universityBn}
                  onChange={(e) => setFormData({ ...formData, universityBn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>

              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Department (EN)", "বিভাগ (EN)", lang)}</label>
                <input
                  title={t("Department (EN)", "বিভাগ (EN)", lang)}
                  value={formData.departmentEn}
                  onChange={(e) => setFormData({ ...formData, departmentEn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Department (BN)", "বিভাগ (BN)", lang)}</label>
                <input
                  title={t("Department (BN)", "বিভাগ (BN)", lang)}
                  value={formData.departmentBn}
                  onChange={(e) => setFormData({ ...formData, departmentBn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>

              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Degree (EN)", "ডিগ্রী (EN)", lang)}</label>
                <input
                  title={t("Degree (EN)", "ডিগ্রী (EN)", lang)}
                  value={formData.degreeEn}
                  onChange={(e) => setFormData({ ...formData, degreeEn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Degree (BN)", "ডিগ্রী (BN)", lang)}</label>
                <input
                  title={t("Degree (BN)", "ডিগ্রী (BN)", lang)}
                  value={formData.degreeBn}
                  onChange={(e) => setFormData({ ...formData, degreeBn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>

              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Academic Status (EN)", "একাডেমিক অবস্থা (EN)", lang)}</label>
                <input
                  title={t("Academic Status (EN)", "একাডেমিক অবস্থা (EN)", lang)}
                  value={formData.academicStatusEn}
                  onChange={(e) => setFormData({ ...formData, academicStatusEn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Academic Status (BN)", "একাডেমিক অবস্থা (BN)", lang)}</label>
                <input
                  title={t("Academic Status (BN)", "একাডেমিক অবস্থা (BN)", lang)}
                  value={formData.academicStatusBn}
                  onChange={(e) => setFormData({ ...formData, academicStatusBn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>
            </div>

            <div className="border-t border-white/[0.08] pt-5 space-y-4">
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Present Address (EN)", "বর্তমান ঠিকানা (EN)", lang)}</label>
                <input
                  title={t("Present Address (EN)", "বর্তমান ঠিকানা (EN)", lang)}
                  value={formData.presentAddressEn}
                  onChange={(e) => setFormData({ ...formData, presentAddressEn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Present Address (BN)", "বর্তমান ঠিকানা (BN)", lang)}</label>
                <input
                  title={t("Present Address (BN)", "বর্তমান ঠিকানা (BN)", lang)}
                  value={formData.presentAddressBn}
                  onChange={(e) => setFormData({ ...formData, presentAddressBn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>

              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Permanent Address (EN)", "স্থায়ী ঠিকানা (EN)", lang)}</label>
                <input
                  title={t("Permanent Address (EN)", "স্থায়ী ঠিকানা (EN)", lang)}
                  value={formData.permanentAddressEn}
                  onChange={(e) => setFormData({ ...formData, permanentAddressEn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>
              <div>
                <label className="text-[12px] text-[#9aa0ad] font-[600]">{t("Permanent Address (BN)", "স্থায়ী ঠিকানা (BN)", lang)}</label>
                <input
                  title={t("Permanent Address (BN)", "স্থায়ী ঠিকানা (BN)", lang)}
                  value={formData.permanentAddressBn}
                  onChange={(e) => setFormData({ ...formData, permanentAddressBn: e.target.value })}
                  className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-[#e7b84b]/40 text-[#e8e9ef] text-[14px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUB TAB: Socials */}
        {activeSubTab === "socials" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
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
        )}

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
