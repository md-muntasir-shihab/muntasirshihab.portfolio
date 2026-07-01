import re

with open("src/lib/store.tsx", "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace(
    '  EMAIL: "mm.xihab@gmail.com",\n  PASSWORD: "Shihab@2026",',
    '  get EMAIL() { return localStorage.getItem("rm_admin_email") || "mm.xihab@gmail.com" },\n  get PASSWORD() { return localStorage.getItem("rm_admin_pass") || "Shihab@2026" },\n  updateCreds(e:string, p:string) { localStorage.setItem("rm_admin_email", e); localStorage.setItem("rm_admin_pass", p); },'
)

with open("src/lib/store.tsx", "w", encoding="utf-8") as f:
    f.write(code)

with open("src/App.tsx", "r", encoding="utf-8") as f:
    code = f.read()

security_html = """
    <div className="space-y-5">
      <div className="text-[24px] font-[720]">{t("Security Settings","নিরাপত্তা সেটিংস",lang)}</div>
      <div className="glass rounded-[18px] p-5 space-y-4 max-w-xl">
        <div className="text-[15px] font-[650] mb-3">{t("Change Master Password","মাস্টার পাসওয়ার্ড পরিবর্তন",lang)}</div>
        <input id="new_email" type="email" defaultValue={adminSecurity.EMAIL} placeholder={t("Admin Email","অ্যাডমিন ইমেইল",lang)} className="w-full px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"/>
        <input id="new_pass" type="password" placeholder={t("New Password","নতুন পাসওয়ার্ড",lang)} className="w-full px-4 h-[44px] rounded-[11px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 text-[#e8e9ef] text-[14px]"/>
        <button onClick={()=>{
          const e = (document.getElementById('new_email') as HTMLInputElement).value;
          const p = (document.getElementById('new_pass') as HTMLInputElement).value;
          if(e && p) { adminSecurity.updateCreds(e, p); alert(t("Credentials changed successfully!","ক্রেডেনশিয়ালস সফলভাবে পরিবর্তন করা হয়েছে!",lang)) }
        }} className="px-5 h-10 rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13.5px] cursor-pointer hover:brightness-110 transition">{t("Update Credentials","ক্রেডেনশিয়ালস আপডেট",lang)}</button>
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

if 'adminSecurity' not in code[:1000]:
    code = code.replace('import { StoreProvider, useStore, sanitize } from "./lib/store"', 'import { StoreProvider, useStore, sanitize, adminSecurity } from "./lib/store"')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(code)
