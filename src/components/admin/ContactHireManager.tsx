import { useState } from "react"
import { useStore } from "../../lib/store"
import { type Lang } from "../../lib/data"
import { sendCustomEmail, type EmailConfig } from "../../lib/email"
import { Check, Send, Mail, Key, AtSign, Loader2, ChevronDown, FileText, X } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

export default function ContactHireManager({ lang }: { lang: Lang }) {
  const { hireMe, updateHireMe, messages, emailTemplates } = useStore()
  const [formData, setFormData] = useState({
    statusEn: hireMe.status.en,
    statusBn: hireMe.status.bn,
    whatsapp: hireMe.whatsapp || "",
    calendly: hireMe.calendly || "",
    noticeEn: hireMe.notice.en,
    noticeBn: hireMe.notice.bn,
    visitorEmailEnabled: hireMe.visitorEmailEnabled !== false,
    adminEmailEnabled: hireMe.adminEmailEnabled !== false,
    cvEmailEnabled: hireMe.cvEmailEnabled !== false,
    resendApiKey: hireMe.resendApiKey || "",
    emailFrom: hireMe.emailFrom || "",
    emailTo: hireMe.emailTo || "",
  })

  // Manual email composer state
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeTo, setComposeTo] = useState("")
  const [composeName, setComposeName] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeMessage, setComposeMessage] = useState("")
  const [composeTemplate, setComposeTemplate] = useState<string>("thankyou")
  const [composeSending, setComposeSending] = useState(false)
  const [composeSent, setComposeSent] = useState(false)
  const [composeError, setComposeError] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const handleSave = async () => {
    await updateHireMe({
      ...hireMe,
      status: { en: formData.statusEn, bn: formData.statusBn },
      whatsapp: formData.whatsapp,
      calendly: formData.calendly,
      notice: { en: formData.noticeEn, bn: formData.noticeBn },
      visitorEmailEnabled: formData.visitorEmailEnabled,
      adminEmailEnabled: formData.adminEmailEnabled,
      cvEmailEnabled: formData.cvEmailEnabled,
      resendApiKey: formData.resendApiKey,
      emailFrom: formData.emailFrom,
      emailTo: formData.emailTo,
    })
    alert(t("Hiring settings updated successfully!", "নিয়োগ সেটিংস সফলভাবে আপডেট করা হয়েছে!", lang))
  }

  const emailConfig: EmailConfig = {
    resendApiKey: formData.resendApiKey || undefined,
    emailFrom: formData.emailFrom || undefined,
    emailTo: formData.emailTo || undefined,
  }

  const handleComposeSend = async () => {
    if (!composeTo || !composeSubject) {
      setComposeError(t("Recipient and subject are required", "প্রাপক এবং বিষয় আবশ্যক", lang))
      return
    }
    setComposeSending(true)
    setComposeError("")
    try {
      const result = await sendCustomEmail({
        to: composeTo,
        recipientName: composeName || composeTo.split("@")[0],
        subject: composeSubject,
        message: composeMessage,
        templateId: "custom", // uses dynamic HTML override directly
        config: emailConfig,
      })
      if (result.success) {
        setComposeSent(true)
        setTimeout(() => { setComposeSent(false); setComposeOpen(false); resetComposer() }, 2500)
      } else {
        setComposeError(result.error || t("Failed to send. Check your Resend API key.", "পাঠাতে ব্যর্থ। Resend API কী চেক করুন।", lang))
      }
    } catch {
      setComposeError(t("Network error", "নেটওয়ার্ক ত্রুটি", lang))
    }
    setComposeSending(false)
  }

  const resetComposer = () => {
    setComposeTo("")
    setComposeName("")
    setComposeSubject("")
    setComposeMessage("")
    setComposeTemplate("thankyou")
    setComposeError("")
    setReplyTo(null)
  }

  const openReplyComposer = (email: string, name: string) => {
    setComposeTo(email)
    setComposeName(name)
    setReplyTo(email)
    setComposeOpen(true)
    
    const tpl = emailTemplates.find(t => t.id === "followup")
    if (tpl) {
      setComposeTemplate("followup")
      setComposeSubject(tpl.subject.replace(/\{\{name\}\}/g, name))
      setComposeMessage(tpl.bodyHtml || tpl.bodyText || "")
    } else {
      setComposeTemplate("custom")
      setComposeSubject(`Re: Your message — ${name}`)
      setComposeMessage("")
    }
  }

  const inputClass = "w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13.5px] focus:border-[#e7b84b]/40 transition"
  const labelClass = "text-[12px] text-[#9aa0ad] font-semibold"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[26px] font-[720] tracking-[-0.015em]">{t("Contact & Hire Settings", "যোগাযোগ ও নিয়োগ সেটিংস", lang)}</h2>
        <p className="text-[13.5px] text-[#7e8391] mt-1.5">
          {t(
            "Manage your availability status, email config, scheduling links, and compose manual emails.",
            "আপনার প্রাপ্যতা স্ট্যাটাস, ইমেইল কনফিগ, শিডিউলিং লিংক ও ম্যানুয়াল ইমেইল কম্পোজ পরিচালনা করুন।",
            lang
          )}
        </p>
      </div>

      {/* Hire Settings */}
      <div className="glass rounded-[18px] p-6 space-y-5 max-w-2xl">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status-en" className={labelClass}>{t("Availability Status (English)", "প্রাপ্যতা স্ট্যাটাস (ইংরেজি)", lang)}</label>
            <input id="status-en" value={formData.statusEn} onChange={(e) => setFormData({ ...formData, statusEn: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="status-bn" className={labelClass}>{t("Availability Status (Bangla)", "প্রাপ্যতা স্ট্যাটাস (বাংলা)", lang)}</label>
            <input id="status-bn" value={formData.statusBn} onChange={(e) => setFormData({ ...formData, statusBn: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="whatsapp" className={labelClass}>{t("WhatsApp Number", "হোয়াটসঅ্যাপ নম্বর", lang)}</label>
            <input id="whatsapp" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="calendly" className={labelClass}>{t("Calendly URL", "ক্যালেন্ডলি URL", lang)}</label>
            <input id="calendly" value={formData.calendly} onChange={(e) => setFormData({ ...formData, calendly: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="notice-en" className={labelClass}>{t("Notice Period (English)", "নোটিশ পিরিয়ড (ইংরেজি)", lang)}</label>
            <input id="notice-en" value={formData.noticeEn} onChange={(e) => setFormData({ ...formData, noticeEn: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="notice-bn" className={labelClass}>{t("Notice Period (Bangla)", "নোটিশ পিরিয়ড (বাংলা)", lang)}</label>
            <input id="notice-bn" value={formData.noticeBn} onChange={(e) => setFormData({ ...formData, noticeBn: e.target.value })} className={inputClass} />
          </div>
        </div>

        {/* Resend Configuration */}
        <div className="pt-4 border-t border-white/8 space-y-4">
          <h3 className="text-[14px] font-[650] text-[#e7b84b] flex items-center gap-2"><Key size={15} /> {t("Resend Email Configuration", "Resend ইমেইল কনফিগারেশন", lang)}</h3>
          <p className="text-[12px] text-[#7e8391]">{t("Override default .env values. Leave blank to use .env defaults.", "ডিফল্ট .env মান ওভাররাইড করুন। খালি রাখলে .env ডিফল্ট ব্যবহৃত হবে।", lang)}</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="resend-key" className={labelClass}><Key size={11} className="inline mr-1" />{t("Resend API Key", "Resend API কী", lang)}</label>
              <input id="resend-key" type="password" placeholder="re_xxxx..." value={formData.resendApiKey} onChange={(e) => setFormData({ ...formData, resendApiKey: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email-from" className={labelClass}><AtSign size={11} className="inline mr-1" />{t("Sender Email (From)", "প্রেরক ইমেইল (From)", lang)}</label>
              <input id="email-from" type="email" placeholder="onboarding@resend.dev" value={formData.emailFrom} onChange={(e) => setFormData({ ...formData, emailFrom: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email-to" className={labelClass}><Mail size={11} className="inline mr-1" />{t("Admin Email (To)", "অ্যাডমিন ইমেইল (To)", lang)}</label>
              <input id="email-to" type="email" placeholder="you@gmail.com" value={formData.emailTo} onChange={(e) => setFormData({ ...formData, emailTo: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Notification Toggles */}
        <div className="pt-4 border-t border-white/8 space-y-4">
          <h3 className="text-[14px] font-[650] text-[#e7b84b] flex items-center gap-2"><Mail size={15} /> {t("Email Notifications Control", "ইমেইল নোটিফিকেশন নিয়ন্ত্রণ", lang)}</h3>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: "visitorEmailEnabled" as const, en: "Email to Visitor", bn: "ভিজিটরকে ইমেইল পাঠান" },
              { key: "adminEmailEnabled" as const, en: "Email to Admin", bn: "অ্যাডমিনকে ইমেইল পাঠান" },
              { key: "cvEmailEnabled" as const, en: "Email on CV Download", bn: "সিভি ডাউনলোডে ইমেইল পাঠান" },
            ].map(({ key, en, bn }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                  className="w-4 h-4 rounded bg-black/20 border-white/15 text-[#e7b84b] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[13px] text-[#e8e9ef]">{t(en, bn, lang)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="pt-4 border-t border-white/8 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-6 h-[40px] rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13.8px] hover:brightness-110 transition cursor-pointer flex items-center gap-1.5"
          >
            <Check size={16} /> {t("Save Settings", "সেটিংস সংরক্ষণ করুন", lang)}
          </button>
          <button
            onClick={() => { resetComposer(); setComposeOpen(!composeOpen) }}
            className="px-5 h-[40px] rounded-full glass text-[#e8e9ef] font-[600] text-[13.5px] hover:bg-white/6 transition cursor-pointer flex items-center gap-1.5 border border-white/10"
          >
            <Send size={14} /> {t("Compose Email", "ইমেইল কম্পোজ করুন", lang)}
          </button>
        </div>
      </div>

      {/* Email Composer Modal */}
      {composeOpen && (
        <div className="glass rounded-[18px] p-6 max-w-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-[680] flex items-center gap-2"><Send size={17} className="text-[#e7b84b]" /> {t("Compose Email", "ইমেইল কম্পোজ", lang)}</h3>
            <button onClick={() => setComposeOpen(false)} className="w-8 h-8 rounded-lg glass flex items-center justify-center cursor-pointer hover:bg-white/6 transition">
              <X size={14} className="text-[#9aa0ad]" />
            </button>
          </div>

          {/* Template Selector */}
          <div>
            <label className={labelClass}><FileText size={11} className="inline mr-1" />{t("Template", "টেমপ্লেট", lang)}</label>
            <div className="relative mt-[6px]">
              <select
                value={composeTemplate}
                onChange={(e) => {
                  const tplId = e.target.value
                  setComposeTemplate(tplId)
                  if (tplId === "custom") {
                    setComposeSubject("")
                    setComposeMessage("")
                    return
                  }
                  const tpl = emailTemplates.find(t => t.id === tplId)
                  if (tpl) {
                    setComposeSubject(tpl.subject.replace(/\{\{name\}\}/g, composeName || ""))
                    setComposeMessage(tpl.bodyHtml || tpl.bodyText || "")
                  }
                }}
                className="w-full px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13.5px] appearance-none cursor-pointer focus:border-[#e7b84b]/40 transition pr-9"
              >
                <option value="custom">{t("Custom / Plain Text", "কাস্টম / সাধারণ টেক্সট", lang)}</option>
                {emailTemplates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa0ad] pointer-events-none" />
            </div>
          </div>

          {/* Quick Reply from inbox */}
          {messages.length > 0 && (
            <div>
              <label className={labelClass}>{t("Quick Reply To", "দ্রুত উত্তর দিন", lang)}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {messages.filter(m => !m.read).slice(0, 5).map(m => (
                  <button key={m.id} onClick={() => openReplyComposer(m.email, m.name)}
                    className={`px-3 py-1.5 rounded-full text-[12px] cursor-pointer transition border ${replyTo === m.email ? "bg-[#e7b84b]/15 border-[#e7b84b]/40 text-[#e7b84b]" : "glass border-white/8 text-[#ccd0dc] hover:bg-white/5"}`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("Recipient Email", "প্রাপকের ইমেইল", lang)}</label>
              <input value={composeTo} onChange={e => setComposeTo(e.target.value)} placeholder="visitor@email.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("Recipient Name", "প্রাপকের নাম", lang)}</label>
              <input value={composeName} onChange={e => setComposeName(e.target.value)} placeholder="John" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("Subject", "বিষয়", lang)}</label>
            <input value={composeSubject} onChange={e => setComposeSubject(e.target.value)} placeholder="Email subject..." className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{t("Message Body", "মেসেজ বডি", lang)}</label>
            <textarea
              value={composeMessage}
              onChange={e => setComposeMessage(e.target.value)}
              rows={5}
              placeholder={t("Write your message here... You can use HTML.", "আপনার মেসেজ এখানে লিখুন... HTML ব্যবহার করা যাবে।", lang)}
              className="w-full mt-[6px] px-3 py-2.5 rounded-[9px] bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13.5px] resize-none focus:border-[#e7b84b]/40 transition"
            />
          </div>

          {composeError && (
            <div className="text-[12px] text-[#f29696] bg-red-500/5 rounded-lg px-3 py-2 border border-red-500/15">{composeError}</div>
          )}

          {composeSent && (
            <div className="text-[12px] text-[#6dd977] bg-green-500/5 rounded-lg px-3 py-2 border border-green-500/15 flex items-center gap-1.5">
              <Check size={13} /> {t("Email sent successfully!", "ইমেইল সফলভাবে পাঠানো হয়েছে!", lang)}
            </div>
          )}

          <button
            onClick={handleComposeSend}
            disabled={composeSending}
            className="px-6 h-[40px] rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13.8px] hover:brightness-110 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {composeSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
            {composeSending ? t("Sending...", "পাঠানো হচ্ছে...", lang) : t("Send Email", "ইমেইল পাঠান", lang)}
          </button>
        </div>
      )}
    </div>
  )
}
