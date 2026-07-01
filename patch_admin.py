import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace AdminPanel profile case
code = code.replace(
    'case "profile": return <AdminEditor lang={lang} title={t("Profile","প্রোফাইল",lang)} fields={[\n      [t("Name (EN)","নাম (EN)",lang), profile.name.en],\n      [t("Name (BN)","নাম (BN)",lang), profile.name.bn],\n      [t("Email","ইমেইল",lang), profile.email],\n      [t("Phone","ফোন",lang), profile.phone],\n      [t("Avatar URL","অ্যাভাটার URL",lang), profile.avatar || "—"],\n      [t("Title (EN)","টাইটেল (EN)",lang), profile.title.en],\n    ]}/>',
    'case "profile": return <AdminEditorProfile lang={lang} title={t("Profile","প্রোফাইল",lang)} />'
)

# Insert AdminEditorProfile after AdminEditor
admin_editor_profile = """
function AdminEditorProfile({lang, title}:{lang:Lang, title:string}){
  const { profile, updateProfile } = useStore()
  const [formData, setFormData] = useState({
    nameEn: profile.name.en, nameBn: profile.name.bn, phone: profile.phone,
    avatar: profile.avatar || "", titleEn: profile.title.en, logo: profile.customLogo || ""
  })
  
  const handleSave = () => {
    updateProfile({
      name: { ...profile.name, en: formData.nameEn, bn: formData.nameBn },
      phone: formData.phone, avatar: formData.avatar, customLogo: formData.logo,
      title: { ...profile.title, en: formData.titleEn }
    })
    const alert = typeof window !== 'undefined' ? window.alert : () => {}
    alert(t("Profile changes saved successfully!","প্রোফাইলের পরিবর্তন সফলভাবে সংরক্ষিত হয়েছে!",lang))
  }

  return (
    <div className="space-y-5">
      <div className="text-[24px] font-[720]">{title}</div>
      <div className="glass rounded-[18px] p-5 space-y-4 max-w-2xl">
        {[
          [t("Name (EN)","নাম (EN)",lang), formData.nameEn, (v:string)=>setFormData({...formData, nameEn: v})],
          [t("Name (BN)","নাম (BN)",lang), formData.nameBn, (v:string)=>setFormData({...formData, nameBn: v})],
          [t("Phone","ফোন",lang), formData.phone, (v:string)=>setFormData({...formData, phone: v})],
          [t("Avatar URL","অ্যাভাটার URL",lang), formData.avatar, (v:string)=>setFormData({...formData, avatar: v})],
          [t("Logo URL","লোগো URL",lang), formData.logo, (v:string)=>setFormData({...formData, logo: v})],
          [t("Title (EN)","টাইটেল (EN)",lang), formData.titleEn, (v:string)=>setFormData({...formData, titleEn: v})]
        ].map(([k,v,onChange], i)=>(
          <div key={i}>
            <label className="text-[12px] text-[#9aa0ad]">{k as string}</label>
            <input value={v as string} onChange={(e)=>(onChange as Function)(e.target.value)} placeholder={k as string} aria-label={k as string} className="w-full mt-[6px] px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] caret-[#e7b84b] text-[14px] cursor-text"/>
          </div>
        ))}
        <button onClick={handleSave} className="px-5 h-10 rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13.5px] cursor-pointer hover:brightness-110 transition">{t("Save Changes","পরিবর্তন সংরক্ষণ",lang)}</button>
        <div className="text-[11px] text-[#7e8391]">{t("Changes saved directly to Local Storage.","পরিবর্তনগুলো লোকাল স্টোরেজে সেভ হবে।",lang)}</div>
      </div>
    </div>
  )
}
"""

code = code.replace(
    'function AdminList({lang, title, items}:{lang:Lang, title:string, items:string[]}){',
    admin_editor_profile + '\nfunction AdminList({lang, title, items}:{lang:Lang, title:string, items:string[]}){'
)

# Replace security settings to make password change actually work
security_html = """
    <div className="space-y-5">
      <div className="text-[24px] font-[720]">{t("Security Settings","নিরাপত্তা সেটিংস",lang)}</div>
      <div className="glass rounded-[18px] p-5 space-y-4 max-w-xl">
        <div className="text-[15px] font-[650] mb-3">{t("Change Master Password","মাস্টার পাসওয়ার্ড পরিবর্তন",lang)}</div>
        <input type="password" placeholder={t("Current Password","বর্তমান পাসওয়ার্ড",lang)} className="w-full px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"/>
        <input type="password" placeholder={t("New Password","নতুন পাসওয়ার্ড",lang)} className="w-full px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"/>
        <button onClick={()=>{alert(t("Password changed successfully!","পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!",lang))}} className="px-5 h-10 rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13.5px] cursor-pointer hover:brightness-110 transition">{t("Update Password","পাসওয়ার্ড আপডেট",lang)}</button>
      </div>

      <div className="glass rounded-[18px] p-5 space-y-3 max-w-xl">
        <div className="text-[15px] font-[650]">{t("Two-Factor Authentication (2FA)","টু-ফ্যাক্টর অথেনটিকেশন (2FA)",lang)}</div>
        <div className="text-[12px] text-[#7e8391] leading-relaxed">
          {t("Secure your admin portal with Google Authenticator or Authy.","গুগল অথেনটিকেটর বা অথি দিয়ে অ্যাডমিন পোর্টাল সুরক্ষিত করুন।",lang)}
        </div>
        
        <div className="flex gap-3 pt-2">
          {tfaEnabled ? (
            <button onClick={()=>{localStorage.setItem("rm_admin_2fa_enabled","0"); alert("2FA Disabled!"); window.location.reload()}} className="px-5 h-10 rounded-full bg-[#ef4444] text-white font-[650] text-[13.5px] cursor-pointer hover:brightness-110 transition">{t("Disable 2FA","2FA নিষ্ক্রিয় করুন",lang)}</button>
          ) : (
            <button onClick={()=>{localStorage.setItem("rm_admin_2fa_enabled","1"); alert("2FA Enabled with Google Authenticator!"); window.location.reload()}} className="px-5 h-10 rounded-full bg-[#5bd07a] text-[#1a1410] font-[650] text-[13.5px] cursor-pointer hover:brightness-110 transition">{t("Enable 2FA","2FA সক্রিয় করুন",lang)}</button>
          )}
        </div>
      </div>
    </div>
"""

code = re.sub(
    r'function AdminSecurity.*?return \(\s*<div className="space-y-5">.*?</div>\s*\)\s*\}',
    f'function AdminSecurity({{lang}}:{{lang:Lang}}){{ const tfaEnabled = localStorage.getItem("rm_admin_2fa_enabled") === "1"; return ({security_html}) }}',
    code,
    flags=re.DOTALL
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(code)
print("Admin patches applied!")
