import { useState, useEffect, useRef, useMemo } from "react"
import { useStore, type Contact, type EmailTemplate, type EmailLog } from "../../lib/store"
import { type Lang } from "../../lib/data"
import {
  Mail, Users, Settings, Plus, Trash2, Edit, Send, History,
  Sparkles, Code, Layout, Download, Upload, Star, Search,
  X, Info
} from "lucide-react"
import { toast } from "sonner"
import Papa from "papaparse"
import Editor from "@monaco-editor/react"
import EmailEditor from "react-email-editor"
import { sendCustomEmail } from "../../lib/email"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

export default function EmailManager({ lang }: { lang: Lang }) {
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [prefilledRecipient, setPrefilledRecipient] = useState<{ to: string; name: string; subject: string } | null>(null)

  // Read URL params — if ?to= is present, auto-switch to compose
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const to = params.get("to")
    if (to) {
      setPrefilledRecipient({
        to,
        name: params.get("name") || "",
        subject: params.get("subject") || "",
      })
      setActiveTab("compose")
    }
  }, [])

  const tabs = [
    { id: "dashboard", label: t("Dashboard", "ড্যাশবোর্ড", lang), icon: Layout },
    { id: "contacts", label: t("Contacts CRM", "কনট্যাক্টস CRM", lang), icon: Users },
    { id: "compose", label: t("Compose", "কম্পোজ", lang), icon: Send },
    { id: "templates", label: t("Templates", "টেমপ্লেটসমূহ", lang), icon: Sparkles },
    { id: "logs", label: t("Logs & History", "ইমেইল লগস", lang), icon: History },
    { id: "settings", label: t("Settings", "সেটিংস", lang), icon: Settings },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-[720] tracking-[-0.015em] flex items-center gap-2">
            <Mail className="text-gold" size={28} />
            {t("Email Management System", "ইমেইল ম্যানেজমেন্ট সিস্টেম", lang)}
          </h2>
          <p className="text-[13px] text-[#7e8391] mt-0.5">
            {t("Manage your newsletter contacts, visual campaigns, templates, logs, and follow-ups", "আপনার নিউজলেটার কন্ট্যাক্টস, ক্যাম্পেইন, টেমপ্লেট ও সেটিংস নিয়ন্ত্রণ করুন", lang)}
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/7.000000000000001 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13.5px] font-[550] transition cursor-pointer ${
                active
                  ? "bg-gold/10 border border-gold/20 text-gold"
                  : "hover:bg-white/4 text-[#a3a7b4] hover:text-white"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Panel rendering */}
      <div className="animate-fadeIn">
        {activeTab === "dashboard" && <EmailDashboard lang={lang} onCompose={() => setActiveTab("compose")} />}
        {activeTab === "contacts" && <EmailContacts lang={lang} />}
        {activeTab === "compose" && <EmailCompose lang={lang} initialTo={prefilledRecipient?.to} initialName={prefilledRecipient?.name} initialSubject={prefilledRecipient?.subject} />}
        {activeTab === "templates" && <EmailTemplates lang={lang} />}
        {activeTab === "logs" && <EmailLogs lang={lang} />}
        {activeTab === "settings" && <EmailSettingsManager lang={lang} />}
      </div>
    </div>
  )
}

/* ==========================================================================
   1. Dashboard Component
   ========================================================================== */
function EmailDashboard({ lang, onCompose }: { lang: Lang; onCompose: () => void }) {
  const { contacts, emailLogs, followUps } = useStore()

  const stats = useMemo(() => {
    const totalContacts = contacts.length
    const totalSent = emailLogs.length
    const successSent = emailLogs.filter((l) => l.status === "success").length
    const pendingFollowUps = followUps.filter((f) => f.status === "pending").length
    const successRate = totalSent > 0 ? Math.round((successSent / totalSent) * 100) : 100

    return { totalContacts, totalSent, pendingFollowUps, successRate }
  }, [contacts, emailLogs, followUps])

  const recentLogs = useMemo(() => {
    return [...emailLogs].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()).slice(0, 5)
  }, [emailLogs])

  return (
    <div className="space-y-6">
      {/* Mini Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-[16px] px-5 py-4">
          <div className="text-[12px] text-[#a3a7b4]">{t("Total Contacts", "মোট কন্ট্যাক্ট", lang)}</div>
          <div className="text-[28px] font-[730] text-gold mt-1">{stats.totalContacts}</div>
        </div>
        <div className="glass rounded-[16px] px-5 py-4">
          <div className="text-[12px] text-[#a3a7b4]">{t("Emails Sent", "পাঠানো ইমেইল", lang)}</div>
          <div className="text-[28px] font-[730] text-[#6366f1] mt-1">{stats.totalSent}</div>
        </div>
        <div className="glass rounded-[16px] px-5 py-4">
          <div className="text-[12px] text-[#a3a7b4]">{t("Success Rate", "সফলতার হার", lang)}</div>
          <div className="text-[28px] font-[730] text-[#22d3ee] mt-1">{stats.successRate}%</div>
        </div>
        <div className="glass rounded-[16px] px-5 py-4">
          <div className="text-[12px] text-[#a3a7b4]">{t("Pending Follow-ups", "বাকি থাকা ফলো-আপ", lang)}</div>
          <div className="text-[28px] font-[730] text-[#f97316] mt-1">{stats.pendingFollowUps}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions & Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-[18px] p-5 space-y-4">
            <h3 className="text-[15px] font-[650] text-[#e8e9ef] flex items-center gap-2">
              <Sparkles size={16} className="text-gold" />
              {t("Quick Actions", "দ্রুত কাজসমূহ", lang)}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={onCompose}
                className="flex items-center justify-between p-4 rounded-xl bg-linear-to-r from-gold/10 to-[#f0cf89]/5 border border-gold/15 hover:border-gold/30 hover:scale-[1.01] transition text-left cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-gold text-[14px]">{t("Compose Email Campaign", "ইমেইল ক্যাম্পেইন লিখুন", lang)}</div>
                  <div className="text-[11.5px] text-[#8d919e] mt-1">{t("Send manual, template or bulk email broadcast", "ম্যানুয়াল, টেমপ্লেট অথবা বাল্ক ব্রডকাস্ট করুন", lang)}</div>
                </div>
                <Send size={18} className="text-gold transition-transform group-hover:translate-x-1" />
              </button>

              <div className="p-4 rounded-xl bg-white/2 border border-white/6 flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-[#e8e9ef] text-[14px]">{t("Manual Follow-up Trigger", "ম্যানুয়াল ফলো-আপ রান", lang)}</div>
                  <div className="text-[11.5px] text-[#8d919e] mt-1">{t("Scan & run pending follow-up schedules immediately", "বাকি থাকা ফলো-আপ শিডিউলগুলো পরীক্ষা করে রান করুন", lang)}</div>
                </div>
                <button
                  onClick={() => toast.success(t("Follow-up scanner executed successfully!", "ফলো-আপ স্ক্যানার সফলভাবে সম্পন্ন হয়েছে!", lang))}
                  className="mt-3 w-full py-1.5 rounded-lg bg-white/4 hover:bg-gold hover:text-[#1a1410] border border-white/8 text-[12.5px] font-semibold transition cursor-pointer"
                >
                  {t("Scan Scheduler Now", "শিডিউলার এখনই স্ক্যান করুন", lang)}
                </button>
              </div>
            </div>
          </div>

          {/* System status check */}
          <div className="glass rounded-[18px] p-5 space-y-3">
            <h3 className="text-[15px] font-[650] text-[#e8e9ef]">{t("Trigger Flow Status Map", "ট্রিগার ফ্লো স্ট্যাটাস ম্যাপ", lang)}</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-[12.5px]">
              {[
                { label: "Contact Form Auto-Reply", key: "contact-auto-reply", desc: t("Auto-reply template to users", "ইউজারকে ধন্যবাদ ইমেইল পাঠানো", lang) },
                { label: "New Message Admin Alert", key: "new-message-admin", desc: t("Alert admin on new message", "নতুন মেসেজে এডমিনকে এলার্ট দেওয়া", lang) },
                { label: "CV Download Notification", key: "cv-download-notify", desc: t("Alert admin when CV downloaded", "সিভি ডাউনলোডে এডমিনকে ইমেইল দেওয়া", lang) },
                { label: "Visitor Logger Notification", key: "new-visitor-notify", desc: t("Alert admin when new visitor lands", "নতুন ভিজিটর আসলে এডমিনকে ইমেইল", lang) },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/1.5 border border-white/4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#e8e9ef]">{item.label}</div>
                    <div className="text-[10.5px] text-[#7e8391] mt-0.5">{item.desc}</div>
                  </div>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5bd07a] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5bd07a]"></span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Logs Feed */}
        <div className="glass rounded-[18px] p-5 space-y-4">
          <h3 className="text-[15px] font-[650] text-[#e8e9ef] flex items-center gap-2">
            <History size={16} className="text-[#6366f1]" />
            {t("Recent Activity Feed", "সাম্প্রতিক কার্যক্রম", lang)}
          </h3>
          {recentLogs.length === 0 ? (
            <div className="text-[12.5px] text-[#7e8391] py-8 text-center">{t("No emails sent yet.", "এখনো কোনো ইমেইল পাঠানো হয়নি।", lang)}</div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-white/2 border border-white/5 text-[12px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#e8e9ef] font-semibold truncate max-w-[120px]">{log.toEmail}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      log.status === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="text-[#a3a7b4] truncate">{log.subject}</div>
                  <div className="text-[10px] text-[#7e8391] flex justify-between">
                    <span className="capitalize">{log.type}</span>
                    <span>{new Date(log.sentAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   2. Contacts CRM Component
   ========================================================================== */
function EmailContacts({ lang }: { lang: Lang }) {
  const { contacts, updateContacts } = useStore()
  const [search, setSearch] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [filterStarred, setFilterStarred] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetails, setShowDetails] = useState<Contact | null>(null)
  
  // CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add Contact Form State
  const [newContact, setNewContact] = useState<Omit<Contact, "id" | "lastContact">>({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    tags: [],
    notes: "",
    isStarred: false,
  })

  // List of tags extracted from all contacts
  const allTags = useMemo(() => {
    const set = new Set<string>()
    contacts.forEach((c) => c.tags?.forEach((t) => set.add(t)))
    return Array.from(set)
  }, [contacts])

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase())
      const matchesTag = filterTag ? c.tags?.includes(filterTag) : true
      const matchesStarred = filterStarred ? c.isStarred : true
      return matchesSearch && matchesTag && matchesStarred
    })
  }, [contacts, search, filterTag, filterStarred])

  // Star toggle
  const toggleStar = async (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = contacts.map((c) => (c.id === contactId ? { ...c, isStarred: !c.isStarred } : c))
    await updateContacts(next)
    toast.success(t("Contact status updated", "কন্ট্যাক্ট স্ট্যাটাস আপডেট হয়েছে", lang))
  }

  // Delete contact
  const handleDelete = async (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(t("Are you sure you want to delete this contact?", "আপনি কি নিশ্চিত যে এই কন্ট্যাক্টটি মুছতে চান?", lang))) return
    const next = contacts.filter((c) => c.id !== contactId)
    await updateContacts(next)
    if (showDetails?.id === contactId) setShowDetails(null)
    toast.success(t("Contact deleted", "কন্ট্যাক্ট মুছে ফেলা হয়েছে", lang))
  }

  // Add contact submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContact.name || !newContact.email) {
      toast.error(t("Name and Email are required", "নাম ও ইমেইল আবশ্যক", lang))
      return
    }

    const created: Contact = {
      ...newContact,
      id: Math.random().toString(36).slice(2, 11),
      lastContact: new Date().toISOString(),
    }

    await updateContacts([created, ...contacts])
    setShowAddModal(false)
    setNewContact({ name: "", email: "", phone: "", company: "", source: "", tags: [], notes: "", isStarred: false })
    toast.success(t("Contact added successfully", "কন্ট্যাক্ট সফলভাবে যুক্ত হয়েছে", lang))
  }

  // Import CSV handler
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsed = results.data as any[]
        const validContacts: Contact[] = []
        let duplicates = 0

        parsed.forEach((row) => {
          const email = row.Email || row.email || row["Email Address"]
          const name = row.Name || row.name || row["Full Name"]
          if (!email || !name) return

          // check if email already exists in contacts
          if (contacts.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
            duplicates++
            return
          }

          const tags = row.Tags || row.tags ? (row.Tags || row.tags).split(",").map((t: string) => t.trim()) : []
          validContacts.push({
            id: Math.random().toString(36).slice(2, 11),
            name: name.trim(),
            email: email.trim(),
            phone: (row.Phone || row.phone || "").trim(),
            company: (row.Company || row.company || "").trim(),
            source: (row.Source || row.source || "CSV Import").trim(),
            tags,
            notes: (row.Notes || row.notes || "").trim(),
            isStarred: row.Starred || row.starred === "true" || row.starred === "1",
            lastContact: new Date().toISOString(),
          })
        })

        if (validContacts.length > 0) {
          await updateContacts([...validContacts, ...contacts])
          toast.success(t(`Imported ${validContacts.length} contacts successfully.${duplicates ? ` Skipped ${duplicates} duplicates.` : ""}`, `সফলভাবে ${validContacts.length} কন্ট্যাক্ট ইম্পোর্ট হয়েছে।${duplicates ? ` ${duplicates} ডুপ্লিকেট বাদ দেওয়া হয়েছে।` : ""}`, lang))
        } else {
          toast.error(t("No new or valid contacts found in the CSV file.", "সিএসভি ফাইলে কোনো নতুন বা সঠিক কন্ট্যাক্ট পাওয়া যায়নি।", lang))
        }
      },
      error: (err) => {
        toast.error(t(`CSV Parse Error: ${err.message}`, `সিএসভি পার্স এরর: ${err.message}`, lang))
      }
    })
  }

  // Export CSV handler
  const handleCsvExport = () => {
    if (contacts.length === 0) {
      toast.error(t("No contacts to export.", "এক্সপোর্ট করার জন্য কোনো কন্ট্যাক্ট নেই।", lang))
      return
    }
    const csv = Papa.unparse(
      contacts.map((c) => ({
        Name: c.name,
        Email: c.email,
        Phone: c.phone,
        Company: c.company,
        Source: c.source,
        Tags: c.tags.join(","),
        Notes: c.notes,
        Starred: c.isStarred,
        LastContact: c.lastContact,
      }))
    )
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `contacts_export_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-5">
      {/* Controls: Search, Filter, Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 text-[#7e8391]" size={16} />
            <input
              type="text"
              placeholder={t("Search contacts by name, email, company...", "নাম, ইমেইল বা কোম্পানি দিয়ে খুঁজুন...", lang)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-[38px] rounded-lg bg-black/25 border border-white/12 outline-none focus:border-gold/40 text-[13px]"
            />
          </div>

          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            title={t("Filter by Tag", "ট্যাগ ফিল্টার", lang)}
            className="px-3 h-[38px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] outline-none cursor-pointer"
          >
            <option value="">{t("All Tags", "সব ট্যাগ", lang)}</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <button
            onClick={() => setFilterStarred(!filterStarred)}
            className={`flex items-center gap-1.5 px-3 h-[38px] rounded-lg border text-[13px] transition cursor-pointer ${
              filterStarred
                ? "bg-yellow-500/10 border-yellow-500/30 text-gold"
                : "border-white/12 text-[#a3a7b4] hover:bg-white/3"
            }`}
          >
            <Star size={14} fill={filterStarred ? "#e7b84b" : "none"} />
            {t("Starred Only", "স্টার করা", lang)}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 h-[38px] rounded-lg bg-white/4 border border-white/8 hover:bg-white/8 text-[#e8e9ef] text-[13px] font-semibold transition cursor-pointer"
          >
            <Upload size={14} />
            {t("Import", "ইম্পোর্ট", lang)}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCsvImport}
            accept=".csv"
            title={t("Import CSV File", "সিএসভি ফাইল ইম্পোর্ট", lang)}
            className="hidden"
          />

          <button
            onClick={handleCsvExport}
            className="flex items-center gap-1.5 px-4 h-[38px] rounded-lg bg-white/4 border border-white/8 hover:bg-white/8 text-[#e8e9ef] text-[13px] font-semibold transition cursor-pointer"
          >
            <Download size={14} />
            {t("Export", "এক্সপোর্ট", lang)}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 h-[38px] rounded-lg bg-gold text-[#1a1410] text-[13px] font-[650] hover:brightness-110 transition cursor-pointer"
          >
            <Plus size={14} />
            {t("Add Contact", "কন্ট্যাক্ট যোগ করুন", lang)}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass rounded-[18px] overflow-hidden border border-white/7.000000000000001">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-white/2 border-b border-white/6 text-[#7e8391] uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">{t("Name", "নাম", lang)}</th>
                <th className="py-3 px-4">{t("Email", "ইমেইল", lang)}</th>
                <th className="py-3 px-4">{t("Company & Source", "কোম্পানি ও সোর্স", lang)}</th>
                <th className="py-3 px-4">{t("Tags", "ট্যাগসমূহ", lang)}</th>
                <th className="py-3 px-4">{t("Last Contact", "শেষ যোগাযোগ", lang)}</th>
                <th className="py-3 px-4 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7e8391]">
                    {t("No contacts found. Use the buttons above to add or import.", "কোনো কন্ট্যাক্ট পাওয়া যায়নি। যোগ করতে উপরে ক্লিক করুন।", lang)}
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={() => setShowDetails(contact)}
                    className="hover:bg-white/1.5 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4">
                      <button
                        onClick={(e) => toggleStar(contact.id, e)}
                        title={t("Toggle Star", "স্টার পরিবর্তন", lang)}
                        className="text-[#7e8391] hover:text-gold transition"
                      >
                        <Star size={15} fill={contact.isStarred ? "#e7b84b" : "none"} className={contact.isStarred ? "text-gold" : ""} />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#e8e9ef]">{contact.name}</td>
                    <td className="py-3.5 px-4 text-[#a3a7b4]">{contact.email}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#a3a7b4]">{contact.company || "—"}</div>
                      <div className="text-[10px] text-[#7e8391] mt-0.5">{contact.source}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/4 border border-white/8 text-gold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#7e8391]">
                      {contact.lastContact ? new Date(contact.lastContact).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDelete(contact.id, e)}
                        title={t("Delete Contact", "কন্ট্যাক্ট মুছুন", lang)}
                        className="p-1 text-[#f29696]/70 hover:text-red-400 transition hover:bg-red-500/10 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f18] border border-white/10 rounded-[20px] max-w-lg w-full overflow-hidden shadow-2xl animate-scaleUp">
            <div className="px-5 py-4 border-b border-white/7.000000000000001 flex justify-between items-center bg-white/1">
              <h3 className="font-bold text-[16px] text-white">{t("Add New Contact", "নতুন কন্ট্যাক্ট যোগ করুন", lang)}</h3>
              <button onClick={() => setShowAddModal(false)} title={t("Close Modal", "বন্ধ করুন", lang)} className="text-[#8a8f9c] hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="add-contact-name" className="text-[11.5px] text-mute font-semibold">{t("Full Name", "সম্পূর্ণ নাম", lang)} *</label>
                  <input
                    id="add-contact-name"
                    required
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full mt-1.5 px-3 h-[38px] rounded-lg bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13px] focus:border-gold/40"
                  />
                </div>
                <div>
                  <label htmlFor="add-contact-email" className="text-[11.5px] text-mute font-semibold">{t("Email Address", "ইমেইল ঠিকানা", lang)} *</label>
                  <input
                    id="add-contact-email"
                    required
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full mt-1.5 px-3 h-[38px] rounded-lg bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13px] focus:border-gold/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="add-contact-phone" className="text-[11.5px] text-mute font-semibold">{t("Phone Number", "ফোন নম্বর", lang)}</label>
                  <input
                    id="add-contact-phone"
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full mt-1.5 px-3 h-[38px] rounded-lg bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13px]"
                  />
                </div>
                <div>
                  <label htmlFor="add-contact-company" className="text-[11.5px] text-mute font-semibold">{t("Company Name", "কোম্পানির নাম", lang)}</label>
                  <input
                    id="add-contact-company"
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    className="w-full mt-1.5 px-3 h-[38px] rounded-lg bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="add-contact-tags" className="text-[11.5px] text-mute font-semibold">
                  {t("Tags (comma separated)", "ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)", lang)}
                </label>
                <input
                  id="add-contact-tags"
                  type="text"
                  placeholder="e.g. client, newsletter, priority"
                  onChange={(e) => {
                    const parsed = e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                    setNewContact({ ...newContact, tags: parsed })
                  }}
                  className="w-full mt-1.5 px-3 h-[38px] rounded-lg bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13px] focus:border-gold/40"
                />
              </div>

              <div>
                <label htmlFor="add-contact-notes" className="text-[11.5px] text-mute font-semibold">{t("Private Notes", "ব্যক্তিগত নোট", lang)}</label>
                <textarea
                  id="add-contact-notes"
                  rows={3}
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  className="w-full mt-1.5 p-3 rounded-lg bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13px] focus:border-gold/40"
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-white/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 h-[38px] rounded-lg border border-white/10 hover:bg-white/4 text-[13px] transition cursor-pointer"
                >
                  {t("Cancel", "বাতিল", lang)}
                </button>
                <button
                  type="submit"
                  className="px-5 h-[38px] rounded-lg bg-gold text-[#1a1410] text-[13px] font-[650] hover:brightness-110 transition cursor-pointer"
                >
                  {t("Add Contact", "কন্ট্যাক্ট যোগ করুন", lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Details Slide-over / Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-[#0b0b12] border-l border-white/10 w-full max-w-lg h-full overflow-y-auto flex flex-col shadow-2xl animate-slideLeft">
            <div className="px-5 py-4 border-b border-white/7.000000000000001 flex justify-between items-center bg-white/1">
              <h3 className="font-bold text-[16px] text-white flex items-center gap-2">
                <Star size={16} fill={showDetails.isStarred ? "#e7b84b" : "none"} className={showDetails.isStarred ? "text-gold" : "text-[#7e8391]"} />
                {t("Contact CRM Details", "কন্ট্যাক্ট প্রোফাইল", lang)}
              </h3>
              <button title="Close Details" aria-label="Close Details"  onClick={() => setShowDetails(null)} className="text-[#8a8f9c] hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex-1 space-y-6">
              {/* Profile Block */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/2 border border-white/5">
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-bold text-gold text-[20px]">
                  {showDetails.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-[17px] text-[#e8e9ef]">{showDetails.name}</div>
                  <div className="text-[12.5px] text-[#8a8f9c] mt-0.5">{showDetails.email}</div>
                </div>
              </div>

              {/* Data Lists */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <div className="text-[#7e8391]">{t("Phone Number", "ফোন নম্বর", lang)}</div>
                    <div className="text-[#e8e9ef] font-mono mt-1">{showDetails.phone || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[#7e8391]">{t("Company", "কোম্পানি", lang)}</div>
                    <div className="text-[#e8e9ef] mt-1">{showDetails.company || "—"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <div className="text-[#7e8391]">{t("Lead Source", "লিড সোর্স", lang)}</div>
                    <div className="text-[#e8e9ef] mt-1">{showDetails.source || "Unknown"}</div>
                  </div>
                  <div>
                    <div className="text-[#7e8391]">{t("Last Contacted", "সর্বশেষ যোগাযোগ", lang)}</div>
                    <div className="text-[#e8e9ef] mt-1">
                      {showDetails.lastContact ? new Date(showDetails.lastContact).toLocaleString() : "Never"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[13px] text-[#7e8391] mb-1.5">{t("Tags", "ট্যাগসমূহ", lang)}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {showDetails.tags?.length === 0 ? (
                      <span className="text-[12px] text-[#555]">{t("No tags", "কোনো ট্যাগ নেই", lang)}</span>
                    ) : (
                      showDetails.tags?.map((t) => (
                        <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-white/4 border border-white/7.000000000000001 text-gold">
                          {t}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <div className="text-[13px] text-[#7e8391] font-semibold mb-1.5">{t("Private Notes", "ব্যক্তিগত নোট", lang)}</div>
                  <div className="bg-[#12121c] p-3 rounded-lg text-[13px] text-[#a3a7b4] border border-white/4 whitespace-pre-wrap">
                    {showDetails.notes || t("No notes added for this contact.", "কোনো ব্যক্তিগত মন্তব্য যোগ করা হয়নি।", lang)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/7.000000000000001 bg-white/1 flex justify-end gap-2">
              <button
                onClick={(e) => handleDelete(showDetails.id, e)}
                className="px-4 h-[36px] rounded-lg border border-red-500/20 hover:bg-red-500/10 text-[#f29696] text-[13px] font-semibold cursor-pointer"
              >
                {t("Delete", "মুছুন", lang)}
              </button>
              <button
                onClick={() => setShowDetails(null)}
                className="px-4 h-[36px] rounded-lg bg-white/5 hover:bg-white/8 text-[#e8e9ef] text-[13px] font-semibold cursor-pointer"
              >
                {t("Close", "বন্ধ করুন", lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ==========================================================================
   3. Compose Component
   ========================================================================== */
function EmailCompose({ lang, initialTo, initialName, initialSubject }: { lang: Lang; initialTo?: string; initialName?: string; initialSubject?: string }) {
  const { contacts, emailTemplates, emailLogs, updateEmailLogs, emailSettings } = useStore()

  // Form State
  const [recipientType, setRecipientType] = useState<"individual" | "tag" | "all" | "direct">(initialTo ? "direct" : "individual")
  const [selectedContact, setSelectedContact] = useState("")
  const [manualEmail, setManualEmail] = useState(initialTo || "")
  const [manualName, setManualName] = useState(initialName || "")
  const [selectedTag, setSelectedTag] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("custom")
  const [subject, setSubject] = useState(initialSubject || "")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  // Follow-up Schedule state
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")

  const allTags = useMemo(() => {
    const set = new Set<string>()
    contacts.forEach((c) => c.tags?.forEach((t) => set.add(t)))
    return Array.from(set)
  }, [contacts])

  // Get active recipients
  const recipients = useMemo(() => {
    if (recipientType === "direct") {
      if (!manualEmail) return []
      return [{ id: "direct", name: manualName || manualEmail, email: manualEmail, phone: "", company: "", source: "reply", tags: [], notes: "", isStarred: false, lastContact: "" }]
    }
    if (recipientType === "individual") {
      const c = contacts.find((x) => x.id === selectedContact)
      return c ? [c] : []
    }
    if (recipientType === "tag") {
      return contacts.filter((c) => c.tags?.includes(selectedTag))
    }
    return contacts
  }, [contacts, recipientType, selectedContact, selectedTag, manualEmail, manualName])

  // Template select side-effect
  useEffect(() => {
    if (selectedTemplate === "custom") {
      setSubject("")
      setMessage("")
      return
    }
    const tpl = emailTemplates.find((t) => t.id === selectedTemplate)
    if (tpl) {
      setSubject(tpl.subject)
      setMessage(tpl.bodyHtml || tpl.bodyText)
    }
  }, [selectedTemplate, emailTemplates])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (recipients.length === 0) {
      toast.error(t("No recipients selected.", "কোনো প্রাপক নির্বাচন করা হয়নি।", lang))
      return
    }
    if (!subject || !message) {
      toast.error(t("Subject and message body are required.", "ইমেইলের বিষয় ও বক্তব্য খালি রাখা যাবে না।", lang))
      return
    }

    setSending(true)
    setProgress({ current: 0, total: recipients.length })

    const activeLogs = [...emailLogs]
    let successCount = 0
    let failCount = 0

    // Sequential bulk sending helper with 100ms rate-limiting delay
    for (let i = 0; i < recipients.length; i++) {
      const rec = recipients[i]
      setProgress({ current: i + 1, total: recipients.length })

      // Call Resend Utility
      const result = await sendCustomEmail({
        to: rec.email,
        recipientName: rec.name,
        subject,
        message,
        templateId: "custom", // uses plain body override
        config: {
          resendApiKey: emailSettings.resendApiKey || undefined,
          emailFrom: emailSettings.fromEmail || undefined,
        },
      })

      const newLog: EmailLog = {
        id: Math.random().toString(36).slice(2, 11),
        templateId: selectedTemplate !== "custom" ? selectedTemplate : undefined,
        contactId: rec.id,
        toEmail: rec.email,
        subject,
        status: result ? "success" : "failed",
        sentAt: new Date().toISOString(),
        type: recipients.length > 1 ? "bulk-send" : "manual",
      }

      activeLogs.push(newLog)

      if (result) successCount++
      else failCount++

      // 100ms rate limit delay
      await new Promise((r) => setTimeout(r, 100))
    }

    await updateEmailLogs(activeLogs)
    setSending(false)

    if (failCount === 0) {
      toast.success(t(`Successfully sent to all ${successCount} recipients.`, `সফলভাবে সব ${successCount} জন প্রাপককে ইমেইল পাঠানো হয়েছে।`, lang))
    } else {
      toast.info(t(`Campaign finished: ${successCount} Sent, ${failCount} Failed.`, `ক্যাম্পেইন সম্পন্ন: ${successCount} প্রেরিত, ${failCount} ব্যর্থ।`, lang))
    }

    // Reset Form
    setSelectedContact("")
    setSelectedTag("")
    setSubject("")
    setMessage("")
    setSelectedTemplate("custom")
  }

  return (
    <div className="max-w-3xl mx-auto glass rounded-[20px] p-6 border border-white/7.000000000000001">
      <h3 className="text-[17px] font-bold text-white flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
        <Send size={18} className="text-gold" />
        {t("Compose New Message", "নতুন ইমেইল তৈরি করুন", lang)}
      </h3>

      <form onSubmit={handleSend} className="space-y-5">
        {/* Recipient Mode Selection — hide in direct reply mode */}
        {recipientType !== "direct" ? (
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: "individual", label: t("Individual Contact", "একজনকে পাঠান", lang) },
            { id: "tag", label: t("Filter by Tag", "ট্যাগ দিয়ে পাঠান", lang) },
            { id: "all", label: t("All CRM Contacts", "সব কন্ট্যাক্টকে পাঠান", lang) },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setRecipientType(mode.id as any)}
              className={`py-2 px-3 rounded-lg border text-[12.5px] font-semibold transition cursor-pointer text-center ${recipientType === mode.id ? "bg-gold/10 border-gold/35 text-gold" : "border-white/10 hover:bg-white/3 text-[#a3a7b4]"}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <svg className="w-5 h-5 text-[#7eb8f7] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-[#7eb8f7] font-semibold">{t("Direct Reply to", "সরাসরি উত্তর", lang)}</div>
              <div className="text-[13px] text-white truncate">{manualName ? `${manualName} — ` : ""}{manualEmail}</div>
            </div>
            <button type="button" onClick={() => { setRecipientType("individual"); setManualEmail(""); setManualName("") }} className="text-[#7e8391] hover:text-white transition text-[11px] cursor-pointer">
              {t("Switch to CRM", "CRM-এ যান", lang)}
            </button>
          </div>
        )}

        {/* Dynamic Recipient Controls */}
        <div className="grid sm:grid-cols-2 gap-4">
          {recipientType === "individual" && (
            <div className="sm:col-span-2">
              <label className="text-[11.5px] text-mute font-semibold">{t("Select Contact Recipient", "প্রাপক নির্বাচন করুন", lang)}</label>
              <select title="Filter Status" aria-label="Filter Status" 
                required
                value={selectedContact}
                onChange={(e) => setSelectedContact(e.target.value)}
                className="w-full mt-1.5 px-3 h-[40px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] outline-none"
              >
                <option value="">-- {t("Select Contact", "কন্ট্যাক্ট সিলেক্ট করুন", lang)} --</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {recipientType === "tag" && (
            <div className="sm:col-span-2">
              <label className="text-[11.5px] text-mute font-semibold">{t("Filter Contacts by Tag", "ট্যাগ নির্বাচন করুন", lang)}</label>
              <select title="Bulk Action" aria-label="Bulk Action" 
                required
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full mt-1.5 px-3 h-[40px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] outline-none"
              >
                <option value="">-- {t("Select Tag", "ট্যাগ সিলেক্ট করুন", lang)} --</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}

          {recipientType === "all" && (
            <div className="sm:col-span-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/15 text-[12px] text-gold flex items-start gap-2">
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>
                {t(`Broadcasting message to all ${contacts.length} registered contacts in your CRM list.`, `আপনার CRM লিস্টের সব ${contacts.length} জন রেজিষ্টার্ড কন্ট্যাক্টকে ব্রডকাস্ট পাঠানো হবে।`, lang)}
              </span>
            </div>
          )}
        </div>

        {/* Template Select & Subject */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11.5px] text-mute font-semibold">{t("Template Layout", "টেমপ্লেট লেআউট", lang)}</label>
            <select title="Choose Template" aria-label="Choose Template" 
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full mt-1.5 px-3 h-[40px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] outline-none"
            >
              <option value="custom">{t("Custom Blank", "কাস্টম ব্ল্যাংক", lang)}</option>
              {emailTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11.5px] text-mute font-semibold">{t("Email Subject", "ইমেইলের বিষয়", lang)}</label>
            <input title="Email Subject" placeholder="Email Subject" aria-label="Email Subject" 
              required
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full mt-1.5 px-3 h-[40px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] focus:border-gold/40 outline-none"
            />
          </div>
        </div>

        {/* HTML / Text editor Body */}
        <div>
          <label className="text-[11.5px] text-mute font-semibold">{t("Message Body (HTML support)", "ইমেইলের বক্তব্য (HTML সাপোর্ট)", lang)}</label>
          <div className="border border-white/12 rounded-lg overflow-hidden mt-1.5">
            <Editor
              height="260px"
              defaultLanguage="html"
              theme="vs-dark"
              value={message}
              onChange={(val) => setMessage(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: "on",
              }}
            />
          </div>
        </div>

        {/* Schedule Follow up Option */}
        <div className="border-t border-white/5 pt-4 space-y-4">
          <label className="flex items-center gap-2 text-[12.5px] text-[#a3a7b4] cursor-pointer">
            <input
              type="checkbox"
              checked={scheduleFollowUp}
              onChange={(e) => setScheduleFollowUp(e.target.checked)}
              className="rounded bg-black/30 border-white/15 text-gold focus:ring-0 outline-none"
            />
            {t("Schedule follow-up later", "ভবিষ্যতের জন্য ফলো-আপ শিডিউল করুন", lang)}
          </label>

          {scheduleFollowUp && (
            <div className="p-4 rounded-xl bg-white/2 border border-white/5 grid sm:grid-cols-2 gap-4 animate-fadeIn">
              <div>
                <label className="text-[11.5px] text-mute font-semibold">{t("Scheduled Date & Time", "শিডিউল সময় নির্ধারণ", lang)}</label>
                <input title="Schedule Date" placeholder="Schedule Date" aria-label="Schedule Date" 
                  required={scheduleFollowUp}
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full mt-1.5 px-3 h-[38px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] outline-none"
                />
              </div>
              <div className="text-[11px] text-[#7e8391] flex items-center justify-center p-3">
                {t("Scheduled follow-ups are safely kept in queue and will auto-send on client active sync sessions.", "শিডিউলকৃত ইমেইলগুলো কিউতে জমা থাকবে এবং আপনার পোর্টফোলিও রান সেশনে অটো-সেন্ড সম্পন্ন হবে।", lang)}
              </div>
            </div>
          )}
        </div>

        {/* Bulk Send Progress Tracking */}
        {sending && (
          <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2.5 animate-fadeIn">
            <div className="flex justify-between text-[12px] text-[#a3a7b4]">
              <span>{t("Sending campaign emails...", "ক্যাম্পেইন ইমেইল পাঠানো হচ্ছে...", lang)}</span>
              <span>
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-gold to-[#f0cf89] transition-all duration-100"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full h-[44px] rounded-xl bg-gold text-[#1a1410] font-[650] text-[13.8px] hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {sending ? (
            <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
          ) : (
            <Send size={15} />
          )}
          {sending ? t("Sending Campaign...", "ব্রডকাস্ট হচ্ছে...", lang) : t("Send Email Campaign", "ইমেইল ক্যাম্পেইন পাঠান", lang)}
        </button>
      </form>
    </div>
  )
}

/* ==========================================================================
   4. Templates Component
   ========================================================================== */
function EmailTemplates({ lang }: { lang: Lang }) {
  const { emailTemplates, updateEmailTemplates } = useStore()
  const [editorMode, setEditorMode] = useState<"list" | "edit" | "create">("list")
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  
  // Builder tab: Visual Editor vs Code (Monaco) Editor
  const [builderTab, setBuilderTab] = useState<"visual" | "code">("visual")

  // Refs for Drag & Drop Editor
  const emailEditorRef = useRef<any>(null)

  // Local Form state
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [htmlBody, setHtmlBody] = useState("")
  const [category, setCategory] = useState("Marketing")

  // Create list triggers
  const startCreate = () => {
    setName("")
    setSubject("")
    setHtmlBody("")
    setCategory("Marketing")
    setEditingTemplate(null)
    setEditorMode("create")
    setBuilderTab("visual")
  }

  const startEdit = (tpl: EmailTemplate) => {
    setEditingTemplate(tpl)
    setName(tpl.name)
    setSubject(tpl.subject)
    setHtmlBody(tpl.bodyHtml)
    setCategory(tpl.category || "Marketing")
    setEditorMode("edit")
    setBuilderTab(tpl.bodyHtml.includes("unlayer") || !tpl.bodyHtml ? "visual" : "code")
  }

  // Load design template to visual builder when loaded
  const onVisualEditorLoad = () => {
    if (editingTemplate?.bodyHtml && editingTemplate.bodyHtml.startsWith("{")) {
      try {
        const jsonDesign = JSON.parse(editingTemplate.bodyHtml)
        emailEditorRef.current?.editor?.loadDesign(jsonDesign)
      } catch (err) {
        console.warn("Could not parse visual layout json:", err)
      }
    }
  }

  // Save template action
  const handleSave = () => {
    if (!name || !subject) {
      toast.error(t("Name and Subject are required.", "নাম ও বিষয় খালি রাখা যাবে না।", lang))
      return
    }

    const saveWithHtml = (htmlContent: string, jsonDesignStr?: string) => {
      const activeTemplates = [...emailTemplates]
      
      if (editorMode === "create") {
        const newTpl: EmailTemplate = {
          id: Math.random().toString(36).slice(2, 11),
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          subject,
          bodyHtml: jsonDesignStr || htmlContent,
          bodyText: htmlContent.replace(/<[^>]*>/g, ""),
          variables: ["name", "email", "message"],
          category,
          isActive: true,
          isDefault: false,
        }
        activeTemplates.push(newTpl)
        toast.success(t("Template created successfully", "টেমপ্লেট সফলভাবে তৈরি হয়েছে", lang))
      } else if (editorMode === "edit" && editingTemplate) {
        const updated = activeTemplates.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                name,
                subject,
                bodyHtml: jsonDesignStr || htmlContent,
                bodyText: htmlContent.replace(/<[^>]*>/g, ""),
                category,
              }
            : t
        )
        updateEmailTemplates(updated)
        toast.success(t("Template updated successfully", "টেমপ্লেট সফলভাবে আপডেট হয়েছে", lang))
      }

      if (editorMode === "create") {
        updateEmailTemplates(activeTemplates)
      }

      setEditorMode("list")
      setEditingTemplate(null)
    }

    if (builderTab === "visual") {
      emailEditorRef.current?.editor?.exportHtml((data: any) => {
        const { design, html } = data
        // We save the JSON string to bodyHtml to preserve visual editing
        saveWithHtml(html, JSON.stringify(design))
      })
    } else {
      saveWithHtml(htmlBody)
    }
  }

  // Delete Template
  const handleDelete = async (tplId: string) => {
    if (!confirm(t("Delete this template?", "এই টেমপ্লেটটি মুছে ফেলতে চান?", lang))) return
    const next = emailTemplates.filter((t) => t.id !== tplId)
    await updateEmailTemplates(next)
    toast.success(t("Template deleted", "টেমপ্লেট মুছে ফেলা হয়েছে", lang))
  }

  if (editorMode === "list") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[16px] font-[650] text-[#e8e9ef]">{t("Templates Library", "টেমপ্লেট লাইব্রেরি", lang)}</h3>
          <button
            onClick={startCreate}
            className="flex items-center gap-1.5 px-4 h-[36px] rounded-lg bg-gold text-[#1a1410] text-[12.5px] font-[650] hover:brightness-110 transition cursor-pointer"
          >
            <Plus size={14} />
            {t("Create Template", "টেমপ্লেট তৈরি করুন", lang)}
          </button>
        </div>

        {emailTemplates.length === 0 ? (
          <div className="glass rounded-[18px] p-8 text-center text-[#7e8391] text-[13px]">
            {t("No custom templates found. Create one now using visual drag-drop or HTML editor.", "কোনো কাস্টম টেমপ্লেট পাওয়া যায়নি। এখনই নতুন টেমপ্লেট তৈরি করুন।", lang)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {emailTemplates.map((tpl) => (
              <div key={tpl.id} className="glass rounded-[16px] p-5 flex flex-col justify-between border border-white/5 hover:border-gold/20 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/4 border border-white/8 text-gold font-semibold uppercase">
                      {tpl.category}
                    </span>
                    <div className="flex gap-1.5">
                      <button title="Clear Search" aria-label="Clear Search" 
                        onClick={() => startEdit(tpl)}
                        className="p-1 hover:bg-white/5 rounded text-[#a3a7b4] hover:text-white transition"
                      >
                        <Edit size={14} />
                      </button>
                      <button title="Search Logs" aria-label="Search Logs" 
                        onClick={() => handleDelete(tpl.id)}
                        className="p-1 hover:bg-red-500/10 rounded text-[#f29696]/70 hover:text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-[15px] font-bold text-white mt-2.5">{tpl.name}</h4>
                  <p className="text-[12.5px] text-[#7e8391] mt-1 truncate">Subject: {tpl.subject}</p>
                </div>
                <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[11px] text-[#7e8391]">
                  <span>Variables: {tpl.variables?.join(", ") || "name, message"}</span>
                  <span className="text-gold cursor-pointer hover:underline" onClick={() => startEdit(tpl)}>
                    Edit layout &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditorMode("list")}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-[12.5px] text-[#a3a7b4] hover:bg-white/3 transition cursor-pointer"
          >
            &larr; {t("Back to list", "তালিকায় ফিরুন", lang)}
          </button>
          <h3 className="text-[16px] font-[650] text-[#e8e9ef]">
            {editorMode === "create" ? t("Create Template", "টেমপ্লেট তৈরি করুন", lang) : t("Edit Template", "টেমপ্লেট সম্পাদনা", lang)}
          </h3>
        </div>

        {/* Builder Tab Switcher */}
        <div className="flex border border-white/10 rounded-lg overflow-hidden text-[12px] font-semibold">
          <button
            onClick={() => setBuilderTab("visual")}
            className={`px-3 py-1.5 transition flex items-center gap-1 cursor-pointer ${
              builderTab === "visual" ? "bg-gold/15 text-gold" : "bg-black/30 text-[#a3a7b4]"
            }`}
          >
            <Layout size={13} />
            {t("Visual Drag-Drop", "ভিজ্যুয়াল এডিটর", lang)}
          </button>
          <button
            onClick={() => setBuilderTab("code")}
            className={`px-3 py-1.5 transition flex items-center gap-1 cursor-pointer ${
              builderTab === "code" ? "bg-gold/15 text-gold" : "bg-black/30 text-[#a3a7b4]"
            }`}
          >
            <Code size={13} />
            {t("HTML Editor", "কোড এডিটর", lang)}
          </button>
        </div>
      </div>

      {/* Meta Input Fields */}
      <div className="grid sm:grid-cols-3 gap-4 glass p-4 rounded-xl border border-white/6">
        <div>
          <label className="text-[11.5px] text-mute font-semibold">{t("Template Name", "টেমপ্লেট নাম", lang)}</label>
          <input title="Contact Name" placeholder="Contact Name" aria-label="Contact Name" 
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1.5 px-3 h-[38px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] outline-none"
          />
        </div>
        <div>
          <label className="text-[11.5px] text-mute font-semibold">{t("Default Subject", "ডিফল্ট বিষয়", lang)}</label>
          <input title="Contact Email" placeholder="Contact Email" aria-label="Contact Email" 
            required
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full mt-1.5 px-3 h-[38px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] outline-none"
          />
        </div>
        <div>
          <label className="text-[11.5px] text-mute font-semibold">{t("Template Category", "ক্যাটাগরি", lang)}</label>
          <select title="Status" aria-label="Status" 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1.5 px-3 h-[38px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] outline-none"
          >
            <option value="Marketing">Marketing</option>
            <option value="Transactional">Transactional</option>
            <option value="Auto-Reply">Auto-Reply</option>
            <option value="Alert">Alert</option>
          </select>
        </div>
      </div>

      {/* Workspace Editors */}
      <div className="border border-white/10 rounded-xl overflow-hidden min-h-[500px] bg-black/25 flex flex-col justify-stretch">
        {builderTab === "visual" ? (
          <div className="flex-1 flex flex-col min-h-[500px]">
            <EmailEditor
              ref={emailEditorRef}
              onLoad={onVisualEditorLoad}
              minHeight="550px"
              style={{ flex: 1 }}
            />
          </div>
        ) : (
          <div className="flex-1 min-h-[500px] flex flex-col">
            <Editor
              height="500px"
              defaultLanguage="html"
              theme="vs-dark"
              value={htmlBody}
              onChange={(val) => setHtmlBody(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: "on",
              }}
            />
          </div>
        )}
      </div>

      {/* Submit Trigger */}
      <div className="flex justify-end gap-2.5 border-t border-white/5 pt-3">
        <button
          onClick={() => {
            setEditorMode("list")
            setEditingTemplate(null)
          }}
          className="px-4 h-[38px] rounded-lg border border-white/10 hover:bg-white/4 text-[13px] transition cursor-pointer"
        >
          {t("Cancel", "বাতিল", lang)}
        </button>
        <button
          onClick={handleSave}
          className="px-6 h-[38px] rounded-lg bg-gold text-[#1a1410] text-[13px] font-[650] hover:brightness-110 transition cursor-pointer"
        >
          {t("Save Template", "টেমপ্লেট সংরক্ষণ", lang)}
        </button>
      </div>
    </div>
  )
}

/* ==========================================================================
   5. Email Logs Component
   ========================================================================== */
function EmailLogs({ lang }: { lang: Lang }) {
  const { emailLogs, updateEmailLogs } = useStore()
  const [filterType, setFilterType] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  // Filter logs list
  const filteredLogs = useMemo(() => {
    return [...emailLogs]
      .filter((l) => {
        const matchType = filterType ? l.type === filterType : true
        const matchStatus = filterStatus ? l.status === filterStatus : true
        return matchType && matchStatus
      })
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
  }, [emailLogs, filterType, filterStatus])

  // Clear logs completely
  const handleClearLogs = async () => {
    if (!confirm(t("Clear all logs permanently?", "সব ইমেইল লগস মুছে ফেলতে চান?", lang))) return
    await updateEmailLogs([])
    toast.success(t("Logs cleared successfully", "লগস মুছে ফেলা হয়েছে", lang))
  }

  return (
    <div className="space-y-4">
      {/* Filters and clear buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select title="Filter Logs" aria-label="Filter Logs" 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 h-[36px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[12.5px] outline-none"
          >
            <option value="">{t("All Log Types", "সব ধরণের লগ", lang)}</option>
            <option value="auto-reply">Auto-Reply</option>
            <option value="admin-notify">Admin Notify</option>
            <option value="cv-download">CV Download</option>
            <option value="bulk-send">Bulk Broadcast</option>
            <option value="manual">Manual Compose</option>
          </select>

          <select title="Log Actions" aria-label="Log Actions" 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 h-[36px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[12.5px] outline-none"
          >
            <option value="">{t("All Statuses", "সব স্ট্যাটাস", lang)}</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {emailLogs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="px-4 h-[36px] rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-[#f29696] text-[12.5px] font-semibold cursor-pointer transition"
          >
            {t("Clear Log History", "সব লগস মুছুন", lang)}
          </button>
        )}
      </div>

      {/* Main logs list */}
      <div className="glass rounded-[18px] border border-white/7.000000000000001 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-white/2 border-b border-white/6 text-[#7e8391] uppercase text-[10.5px] tracking-wider">
              <tr>
                <th className="py-3 px-4">{t("Recipient", "প্রাপক", lang)}</th>
                <th className="py-3 px-4">{t("Subject", "বিষয়", lang)}</th>
                <th className="py-3 px-4">{t("Type", "ধরণ", lang)}</th>
                <th className="py-3 px-4">{t("Status", "স্ট্যাটাস", lang)}</th>
                <th className="py-3 px-4">{t("Sent At", "সময়", lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#7e8391]">
                    {t("No log history matches the current filters.", "ফিল্টার অনুযায়ী কোনো ইমেইল লগস পাওয়া যায়নি।", lang)}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/1 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#e8e9ef]">{log.toEmail}</td>
                    <td className="py-3.5 px-4 text-[#a3a7b4] truncate max-w-[200px]">{log.subject}</td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded text-[11px] bg-white/3 border border-white/7.000000000000001 text-[#a3a7b4]">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                        log.status === "success"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#7e8391]">
                      {new Date(log.sentAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   6. Settings Component
   ========================================================================== */
function EmailSettingsManager({ lang }: { lang: Lang }) {
  const { emailSettings, updateEmailSettings, hireMe } = useStore()
  const [busy, setBusy] = useState(false)

  // Local Form state (pulling fields from DB settings context or fallback configuration)
  const [fromName, setFromName] = useState(emailSettings.fromName || "MD Muntasir Shihab")
  const [fromEmail, setFromEmail] = useState(emailSettings.fromEmail || "onboarding@resend.dev")
  const [replyTo, setReplyTo] = useState(emailSettings.replyTo || "muntasir.shihab@gmail.com")
  const [adminEmail, setAdminEmail] = useState(emailSettings.adminEmail || "muntasir.shihab@gmail.com")
  const [sendAutoReply, setSendAutoReply] = useState(emailSettings.sendAutoReply !== false)
  const [sendAdminNotify, setSendAdminNotify] = useState(emailSettings.sendAdminNotify !== false)
  const [sendCvNotify, setSendCvNotify] = useState(emailSettings.sendCvNotify !== false)
  const [sendVisitorNotify, setSendVisitorNotify] = useState(emailSettings.sendVisitorNotify === true)
  const [footerText, setFooterText] = useState(emailSettings.footerText || "© 2026 MD Muntasir Shihab. All rights reserved.")
  const [signatureHtml, setSignatureHtml] = useState(emailSettings.signatureHtml || "")
  
  // Resend API key setup
  const [resendApiKey, setResendApiKey] = useState((emailSettings as any).resendApiKey || hireMe.resendApiKey || "")

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)

    const nextSettings = {
      fromName,
      fromEmail,
      replyTo,
      adminEmail,
      sendAutoReply,
      sendAdminNotify,
      sendCvNotify,
      sendVisitorNotify,
      footerText,
      signatureHtml,
      resendApiKey,
    }

    try {
      await updateEmailSettings(nextSettings as any)
      toast.success(t("Email settings saved successfully!", "ইমেইল সেটিংস সফলভাবে সংরক্ষিত হয়েছে!", lang))
    } catch (err) {
      toast.error(t("Failed to save settings.", "সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে।", lang))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto glass rounded-[20px] p-6 border border-white/7.000000000000001 space-y-6">
      <h3 className="text-[17px] font-bold text-white flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
        <Settings size={18} className="text-gold" />
        {t("Global Email Settings", "গ্লোবাল ইমেইল সেটিংস", lang)}
      </h3>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* API Credentials */}
        <div className="space-y-4">
          <h4 className="text-[13.5px] font-[650] text-gold uppercase tracking-wider">{t("1. Resend API Credentials", "১. Resend API ক্রেডেনশিয়াল", lang)}</h4>
          <div>
            <label className="text-[12px] text-mute font-semibold">{t("Resend API Key", "Resend API কী", lang)}</label>
            <input
              type="password"
              placeholder="re_xxxxxxxxxxxxxx"
              value={resendApiKey}
              onChange={(e) => setResendApiKey(e.target.value)}
              className="w-full mt-1.5 px-3 h-[40px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13.5px] focus:border-gold/40 outline-none font-mono"
            />
            <p className="text-[11px] text-[#7e8391] mt-1">
              {t("Store your API token securely to send emails. Default test key is used if left blank.", "ইমেইল পাঠাতে আপনার API টোকেন নিরাপদভাবে সেভ রাখুন। খালি রাখলে ডিফল্ট কী ব্যবহার হবে।", lang)}
            </p>
          </div>
        </div>

        {/* Sender Profile */}
        <div className="space-y-4 border-t border-white/5 pt-4">
          <h4 className="text-[13.5px] font-[650] text-gold uppercase tracking-wider">{t("2. Sender Profiles", "২. প্রেরকের প্রোফাইল", lang)}</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-mute font-semibold">{t("From Display Name", "প্রেরকের নাম", lang)}</label>
              <input title="Auto Reply Subject" placeholder="Auto Reply Subject" aria-label="Auto Reply Subject" 
                required
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full mt-1.5 px-3 h-[40px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] focus:border-gold/40 outline-none"
              />
            </div>
            <div>
              <label className="text-[12px] text-mute font-semibold">{t("From Email (verified domain)", "প্রেরকের ইমেইল (ভেরীফাইড ডোমেইন)", lang)}</label>
              <input title="Auto Reply To" placeholder="Auto Reply To" aria-label="Auto Reply To" 
                required
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="w-full mt-1.5 px-3 h-[40px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] focus:border-gold/40 outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-mute font-semibold">{t("Reply-To Email Address", "রিপ্লাই-টু ইমেইল", lang)}</label>
              <input title="CC Addresses" placeholder="CC Addresses" aria-label="CC Addresses" 
                required
                type="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                className="w-full mt-1.5 px-3 h-[40px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] focus:border-gold/40 outline-none"
              />
            </div>
            <div>
              <label className="text-[12px] text-mute font-semibold">{t("Admin Notifications Email", "এডমিন নোটিফিকেশন ইমেইল", lang)}</label>
              <input title="BCC Addresses" placeholder="BCC Addresses" aria-label="BCC Addresses" 
                required
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full mt-1.5 px-3 h-[40px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] focus:border-gold/40 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Triggers configuration */}
        <div className="space-y-4 border-t border-white/5 pt-4">
          <h4 className="text-[13.5px] font-[650] text-gold uppercase tracking-wider">{t("3. Trigger Flows Config Map", "৩. ট্রিগার ফ্লো কনফিগ", lang)}</h4>
          <div className="space-y-3">
            {[
              {
                id: "sendAutoReply",
                checked: sendAutoReply,
                onChange: setSendAutoReply,
                label: t("Send Auto-Reply to Visitors", "ভিজিটরকে অটো-থ্যাংকস ইমেইল পাঠান", lang),
                desc: t("Automatically auto-replies to users on contact form submission", "কন্ট্যাক্ট ফর্ম পূরণ করলে ভিজিটরকে সাথে সাথে ধন্যবাদ জানিয়ে ইমেইল পাঠাবে", lang)
              },
              {
                id: "sendAdminNotify",
                checked: sendAdminNotify,
                onChange: setSendAdminNotify,
                label: t("Send Notification to Admin", "এডমিনকে মেইল নোটিফিকেশন পাঠান", lang),
                desc: t("Notify admin email instantly on a new contact form message", "নতুন মেসেজ জমা পড়লে এডমিনকে তাৎক্ষণিক ইমেইল করবে", lang)
              },
              {
                id: "sendCvNotify",
                checked: sendCvNotify,
                onChange: setSendCvNotify,
                label: t("Send CV Download Alert", "সিভি ডাউনলোডে এডমিনকে ইমেইল পাঠান", lang),
                desc: t("Alert admin with visitor geo-location whenever CV is downloaded", "সিভি ডাউনলোড হলে ভিজিটরের লোকেশনসহ এডমিনকে ইমেইল পাঠাবে", lang)
              },
              {
                id: "sendVisitorNotify",
                checked: sendVisitorNotify,
                onChange: setSendVisitorNotify,
                label: t("Send Visitor Entry Alert", "নতুন ভিজিটর প্রবেশে এডমিনকে ইমেইল পাঠান", lang),
                desc: t("Alert admin whenever a new visitor visits the site landing (optional)", "নতুন কোনো ব্যক্তি সাইটে প্রবেশ করলে এডমিনকে মেইল করবে (ঐচ্ছিক)", lang)
              }
            ].map((trigger) => (
              <label key={trigger.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/1.5 border border-white/4 cursor-pointer hover:bg-white/3 transition">
                <input
                  type="checkbox"
                  checked={trigger.checked}
                  onChange={(e) => trigger.onChange(e.target.checked)}
                  className="mt-1 rounded bg-black/30 border-white/15 text-gold focus:ring-0 outline-none"
                />
                <div>
                  <div className="text-[13px] font-semibold text-[#e8e9ef]">{trigger.label}</div>
                  <div className="text-[11.5px] text-[#7e8391] mt-0.5">{trigger.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="space-y-4 border-t border-white/5 pt-4">
          <h4 className="text-[13.5px] font-[650] text-gold uppercase tracking-wider">{t("4. Footer & Signatures", "৪. ফুটার ও সিগনেচার", lang)}</h4>
          <div>
            <label className="text-[12px] text-mute font-semibold">{t("Email Template Footer Text", "টেমপ্লেট ফুটার টেক্সট", lang)}</label>
            <input title="Search Settings" placeholder="Search Settings" aria-label="Search Settings" 
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full mt-1.5 px-3 h-[38px] rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] outline-none"
            />
          </div>

          <div>
            <label className="text-[12px] text-mute font-semibold">{t("Signature Layout (HTML supported)", "সিগনেচার লেআউট (HTML)", lang)}</label>
            <textarea
              rows={3}
              value={signatureHtml}
              onChange={(e) => setSignatureHtml(e.target.value)}
              className="w-full mt-1.5 p-3 rounded-lg bg-black/25 border border-white/12 text-[#e8e9ef] text-[13px] focus:border-gold/40 outline-none font-mono"
              placeholder="e.g. <p>Best regards,<br/><strong>Muntasir Shihab</strong></p>"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-2.5 border-t border-white/5 pt-4">
          <button
            type="submit"
            disabled={busy}
            className="px-6 h-[40px] rounded-xl bg-gold text-[#1a1410] font-[650] text-[13.5px] hover:brightness-110 transition cursor-pointer flex items-center gap-1.5"
          >
            {busy && <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />}
            {t("Save Settings", "সেটিংস সংরক্ষণ", lang)}
          </button>
        </div>
      </form>
    </div>
  )
}
