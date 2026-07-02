import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import {
  profile as defProfile, experience as defExp, skills as defSkills,
  projects as defProjects, testimonials as defTesti, recommendations as defRecs,
  blogPosts as defBlog, services as defServices, sectionVisibility as defVis,
  tools as defTools, hireMe as defHireMe, education as defEdu, achievements as defAchieve,
  pageBackgroundMap as defBgMap
} from "./data"
import { supabase } from "./supabase"
import { EMAIL_TEMPLATES } from "./email"
import type { BGType } from "../components/backgrounds"

// ---------- Types ----------
export interface ContactMessage {
  id: string; contactId?: string; subject?: string; name: string; email: string; phone: string; message: string; date: string; read: boolean; replied?: boolean;
}

export interface Contact {
  id: string; name: string; email: string; phone: string; company: string; source: string; tags: string[]; notes: string; isStarred: boolean; lastContact: string;
}

export interface EmailTemplate {
  id: string; name: string; slug: string; subject: string; bodyHtml: string; bodyText: string; variables: string[]; category: string; isActive: boolean; isDefault: boolean; designJson?: string;
}

export interface EmailLog {
  id: string; templateId?: string; contactId?: string; toEmail: string; subject: string; status: string; sentAt: string; type: string;
}

export interface FollowUp {
  id: string; contactId: string; subject: string; bodyHtml: string; scheduledAt: string; status: string; note: string;
}

export interface EmailSettings {
  resendApiKey: string; fromName: string; fromEmail: string; replyTo: string; adminEmail: string; sendAutoReply: boolean; sendAdminNotify: boolean; sendCvNotify: boolean; sendVisitorNotify: boolean; footerText: string; signatureHtml: string;
}

interface StoreShape {
  profile: typeof defProfile & { customLogo?: string; favicon?: string }
  experience: typeof defExp
  skills: typeof defSkills
  projects: typeof defProjects
  testimonials: typeof defTesti
  recommendations: typeof defRecs
  blogPosts: typeof defBlog
  services: typeof defServices
  tools: typeof defTools
  hireMe: typeof defHireMe
  education: typeof defEdu
  achievements: typeof defAchieve
  visibility: typeof defVis
  pageBackgroundMap: Record<string, BGType>
  messages: ContactMessage[]
  contacts: Contact[]
  emailTemplates: EmailTemplate[]
  emailLogs: EmailLog[]
  followUps: FollowUp[]
  emailSettings: EmailSettings
  cvCount: number
  admin_2fa: { enabled: boolean; encryptedSecret: string }
}


interface StoreCtxType extends StoreShape {
  loading: boolean
  setVisibility: (k: keyof typeof defVis, v: boolean) => Promise<void>
  addMessage: (m: Omit<ContactMessage, "id" | "date" | "read">) => Promise<void>
  markRead: (id: string) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  incCv: () => Promise<number>
  updateProfile: (patch: Partial<typeof defProfile & { customLogo?: string; favicon?: string }>) => Promise<void>
  updateExperience: (val: typeof defExp) => Promise<void>
  updateEducation: (val: typeof defEdu) => Promise<void>
  updateSkills: (val: typeof defSkills) => Promise<void>
  updateProjects: (val: typeof defProjects) => Promise<void>
  updateTestimonials: (val: typeof defTesti) => Promise<void>
  updateRecommendations: (val: typeof defRecs) => Promise<void>
  updateBlogPosts: (val: typeof defBlog) => Promise<void>
  updateServices: (val: typeof defServices) => Promise<void>
  updateTools: (val: typeof defTools) => Promise<void>
  updateHireMe: (val: typeof defHireMe) => Promise<void>
  updateAchievements: (val: typeof defAchieve) => Promise<void>
  updatePageBackgroundMap: (val: Record<string, BGType>) => Promise<void>
  updateAdmin2FA: (val: { enabled: boolean; encryptedSecret: string }) => Promise<void>
  
  // Email CRM updates
  updateContacts: (val: Contact[]) => Promise<void>
  updateEmailTemplates: (val: EmailTemplate[]) => Promise<void>
  updateEmailLogs: (val: EmailLog[]) => Promise<void>
  updateFollowUps: (val: FollowUp[]) => Promise<void>
  updateEmailSettings: (val: EmailSettings) => Promise<void>
  updateMessages: (msgs: ContactMessage[]) => void

  resetAll: () => Promise<void>
}


// Global helper to save to Supabase portfolio_content table using security definer RPC
// Uses anon client — the RPC runs with definer privileges so it bypasses RLS
async function saveToDb(key: string, value: any) {
  try {
    const { error } = await supabase.rpc('upsert_portfolio_content', {
      p_key: key,
      p_value: value
    });
    if (error) {
      console.error(`[Store] Failed to save key "${key}" to DB:`, error);
    } else {
      console.log(`[Store] Saved key "${key}" to DB`);
    }
  } catch (err) {
    console.error(`[Store] Failed to save key "${key}" to DB:`, err);
  }
}


function getDefaultTemplates() {
  return EMAIL_TEMPLATES.map(tpl => ({
    id: tpl.id,
    name: tpl.name,
    slug: tpl.id,
    subject: tpl.subject,
    bodyHtml: tpl.body,
    bodyText: tpl.body.replace(/<[^>]*>/g, ""),
    variables: ["name", "email", "message", "phone", "date"],
    category: tpl.id === "auto_reply" || tpl.id === "admin_notify" ? "System" : "Marketing",
    isActive: true,
    isDefault: true
  }))
}

const StoreCtx = createContext<StoreCtxType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState<StoreShape>(() => ({
    profile: defProfile,
    experience: defExp,
    skills: defSkills,
    projects: defProjects,
    testimonials: defTesti,
    recommendations: defRecs,
    blogPosts: defBlog,
    services: defServices,
    tools: defTools,
    hireMe: defHireMe,
    education: defEdu,
    achievements: defAchieve,
    visibility: defVis,
    pageBackgroundMap: defBgMap as Record<string, BGType>,
    messages: [],
    contacts: [],
    emailTemplates: getDefaultTemplates(),
    emailLogs: [],
    followUps: [],
    emailSettings: { resendApiKey: "", fromName: "", fromEmail: "", replyTo: "", adminEmail: "", sendAutoReply: true, sendAdminNotify: true, sendCvNotify: true, sendVisitorNotify: false, footerText: "", signatureHtml: "" },
    cvCount: 0,
    admin_2fa: { enabled: false, encryptedSecret: "" },
  }))


  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await supabase.from("portfolio_content").select("*")
        if (error) throw error

        let dbState: Partial<StoreShape> = {}
        if (data) {
          data.forEach((row: any) => {
            dbState[row.key as keyof StoreShape] = row.value
          })
        }

        // Fetch cv downloads
        const { count: cvDownloadsCount, error: cvError } = await supabase
          .from("cv_downloads")
          .select("*", { count: "exact", head: true })

        setState((s) => ({
          ...s,
          profile: dbState.profile ? { ...s.profile, ...dbState.profile } : s.profile,
          experience: dbState.experience || s.experience,
          education: dbState.education || s.education,
          skills: dbState.skills || s.skills,
          projects: dbState.projects || s.projects,
          testimonials: dbState.testimonials || s.testimonials,
          recommendations: dbState.recommendations || s.recommendations,
          blogPosts: dbState.blogPosts || s.blogPosts,
          services: dbState.services || s.services,
          tools: dbState.tools || s.tools,
          hireMe: dbState.hireMe || s.hireMe,
          achievements: dbState.achievements || s.achievements,
          visibility: dbState.visibility ? { ...s.visibility, ...dbState.visibility } : s.visibility,
          pageBackgroundMap: dbState.pageBackgroundMap ? { ...s.pageBackgroundMap, ...dbState.pageBackgroundMap } : s.pageBackgroundMap,
          messages: dbState.messages || [],
          contacts: dbState.contacts || [],
          emailTemplates: (dbState.emailTemplates && dbState.emailTemplates.length > 0) ? dbState.emailTemplates : getDefaultTemplates(),
          emailLogs: dbState.emailLogs || [],
          followUps: dbState.followUps || [],
          emailSettings: dbState.emailSettings || { resendApiKey: "", fromName: "", fromEmail: "", replyTo: "", adminEmail: "", sendAutoReply: true, sendAdminNotify: true, sendCvNotify: true, sendVisitorNotify: false, footerText: "", signatureHtml: "" },
          cvCount: cvDownloadsCount !== null && !cvError ? cvDownloadsCount : 0,
          admin_2fa: dbState.admin_2fa || { enabled: false, encryptedSecret: "" },
        }))

      } catch (err) {
        console.warn("[Store] Failed to load data from Supabase, using defaults:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const setVisibility = useCallback(async (k: keyof typeof defVis, v: boolean) => {
    const nextVis = { ...state.visibility, [k]: v };
    await saveToDb("visibility", nextVis);
    setState(s => ({ ...s, visibility: nextVis }));
  }, [state.visibility])

  const addMessage = useCallback(async (m: Omit<ContactMessage, "id" | "date" | "read">) => {
    const msg: ContactMessage = {
      ...m,
      id: Math.random().toString(36).slice(2),
      date: new Date().toISOString(),
      read: false,
    }
    setState(s => ({ ...s, messages: [msg, ...s.messages] }))
  }, [])

  const markRead = useCallback(async (id: string) => {
    setState(s => {
      const newMessages = s.messages.map(m => m.id === id ? { ...m, read: true } : m)
      saveToDb('messages', newMessages)
      return { ...s, messages: newMessages }
    })
  }, [])

  const deleteMessage = useCallback(async (id: string) => {
    setState(s => {
      const newMessages = s.messages.filter(m => m.id !== id)
      saveToDb('messages', newMessages)
      return { ...s, messages: newMessages }
    })
  }, [])

  const incCv = useCallback(async () => {
    let next = state.cvCount + 1
    try {
      const { incrementCvDownload } = await import("./upstash")
      const count = await incrementCvDownload()
      if (count > 0) next = count
    } catch (e) {
      console.warn("Failed to increment CV count in Redis:", e)
    }
    setState(s => ({ ...s, cvCount: next }))
    return next
  }, [state.cvCount])

  const updateProfile = useCallback(async (patch: Partial<typeof defProfile & { customLogo?: string; favicon?: string }>) => {
    const nextProfile = { ...state.profile, ...patch };
    await saveToDb("profile", nextProfile);
    setState(s => ({ ...s, profile: nextProfile }));
  }, [state.profile])

  const updateExperience = useCallback(async (val: typeof defExp) => {
    await saveToDb("experience", val);
    setState(s => ({ ...s, experience: val }));
  }, [])

  const updateEducation = useCallback(async (val: typeof defEdu) => {
    await saveToDb("education", val);
    setState(s => ({ ...s, education: val }));
  }, [])

  const updateSkills = useCallback(async (val: typeof defSkills) => {
    await saveToDb("skills", val);
    setState(s => ({ ...s, skills: val }));
  }, [])

  const updateProjects = useCallback(async (val: typeof defProjects) => {
    await saveToDb("projects", val);
    setState(s => ({ ...s, projects: val }));
  }, [])

  const updateTestimonials = useCallback(async (val: typeof defTesti) => {
    await saveToDb("testimonials", val);
    setState(s => ({ ...s, testimonials: val }));
  }, [])

  const updateRecommendations = useCallback(async (val: typeof defRecs) => {
    await saveToDb("recommendations", val);
    setState(s => ({ ...s, recommendations: val }));
  }, [])

  const updateBlogPosts = useCallback(async (val: typeof defBlog) => {
    await saveToDb("blogPosts", val);
    setState(s => ({ ...s, blogPosts: val }));
  }, [])

  const updateServices = useCallback(async (val: typeof defServices) => {
    await saveToDb("services", val);
    setState(s => ({ ...s, services: val }));
  }, [])

  const updateTools = useCallback(async (val: typeof defTools) => {
    await saveToDb("tools", val);
    setState(s => ({ ...s, tools: val }));
  }, [])

  const updateHireMe = useCallback(async (val: typeof defHireMe) => {
    await saveToDb("hireMe", val);
    setState(s => ({ ...s, hireMe: val }));
  }, [])

  const updateAchievements = useCallback(async (val: typeof defAchieve) => {
    await saveToDb("achievements", val);
    setState(s => ({ ...s, achievements: val }));
  }, [])

  const updatePageBackgroundMap = useCallback(async (val: Record<string, BGType>) => {
    await saveToDb("pageBackgroundMap", val);
    setState(s => ({ ...s, pageBackgroundMap: val }));
  }, [])

  const updateMessages = useCallback((msgs: ContactMessage[]) => {
    setState(s => ({ ...s, messages: msgs }))
  }, [])

  const updateContacts = useCallback(async (val: Contact[]) => {
    await saveToDb("contacts", val);
    setState(s => ({ ...s, contacts: val }));
  }, [])
  const updateEmailTemplates = useCallback(async (val: EmailTemplate[]) => {
    await saveToDb("emailTemplates", val);
    setState(s => ({ ...s, emailTemplates: val }));
  }, [])
  const updateEmailLogs = useCallback(async (val: EmailLog[]) => {
    await saveToDb("emailLogs", val);
    setState(s => ({ ...s, emailLogs: val }));
  }, [])
  const updateFollowUps = useCallback(async (val: FollowUp[]) => {
    await saveToDb("followUps", val);
    setState(s => ({ ...s, followUps: val }));
  }, [])
  const updateEmailSettings = useCallback(async (val: EmailSettings) => {
    await saveToDb("emailSettings", val);
    setState(s => ({ ...s, emailSettings: val }));
  }, [])

  const resetAll = useCallback(async () => {
    try {
      const { error } = await supabase.rpc('reset_portfolio_content')
      if (error) console.warn('[Store] resetAll RPC failed:', error.message)
    } catch (err) {
      console.warn('[Store] resetAll failed:', err)
    }
    setState({
      profile: defProfile,
      experience: defExp,
      skills: defSkills,
      projects: defProjects,
      testimonials: defTesti,
      recommendations: defRecs,
      blogPosts: defBlog,
      services: defServices,
      tools: defTools,
      hireMe: defHireMe,
      education: defEdu,
      achievements: defAchieve,
      visibility: defVis,
      pageBackgroundMap: defBgMap as Record<string, BGType>,
      messages: [],
      contacts: [],
      emailTemplates: getDefaultTemplates(),
      emailLogs: [],
      followUps: [],
      emailSettings: { resendApiKey: "", fromName: "", fromEmail: "", replyTo: "", adminEmail: "", sendAutoReply: true, sendAdminNotify: true, sendCvNotify: true, sendVisitorNotify: false, footerText: "", signatureHtml: "" },
      cvCount: 0,
      admin_2fa: { enabled: false, encryptedSecret: "" },
    })
  }, [])

  return (
    <StoreCtx.Provider value={{
      ...state,
      loading,
      setVisibility,
      addMessage,
      markRead,
      deleteMessage,
      incCv,
      updateProfile,
      updateExperience,
      updateEducation,
      updateSkills,
      updateProjects,
      updateTestimonials,
      updateRecommendations,
      updateBlogPosts,
      updateServices,
      updateTools,
      updateHireMe,
      updateAchievements,
      updatePageBackgroundMap,
      updateMessages,
      updateContacts,
      updateEmailTemplates,
      updateEmailLogs,
      updateFollowUps,
      updateEmailSettings,
      updateAdmin2FA: useCallback(async (val: { enabled: boolean; encryptedSecret: string }) => {
        await saveToDb("admin_2fa", val);
        setState(s => ({ ...s, admin_2fa: val }));
      }, []),
      resetAll
    }}>
      {children}
    </StoreCtx.Provider>
  )
}


export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error("useStore must be used inside StoreProvider")
  return ctx
}

// ---------- Security helpers (client-side, demo-grade) ----------
const SEC_KEY = "rm_admin_security_v1"
interface SecState { fails: number; lockedUntil: number }
function loadSec(): SecState {
  try { return JSON.parse(localStorage.getItem(SEC_KEY) || "") } catch { return { fails: 0, lockedUntil: 0 } }
}
function saveSec(s: SecState) { localStorage.setItem(SEC_KEY, JSON.stringify(s)) }

export const adminSecurity = {
  get EMAIL() { return localStorage.getItem("rm_admin_email") || "mm.xihab@gmail.com" },
  get PASSWORD() { return localStorage.getItem("rm_admin_pass") || "Shihab@2026" },
  updateCreds(e:string, p:string) { localStorage.setItem("rm_admin_email", e); localStorage.setItem("rm_admin_pass", p); },
  getState: loadSec,
  isLocked() { const s = loadSec(); return s.lockedUntil > Date.now() },
  lockRemainingMin() { const s = loadSec(); return Math.max(0, Math.ceil((s.lockedUntil - Date.now()) / 60000)) },
  registerFail() {
    const s = loadSec(); s.fails += 1
    if (s.fails >= 5) { s.lockedUntil = Date.now() + 10 * 60 * 1000; s.fails = 0 }
    saveSec(s); return s
  },
  reset() { saveSec({ fails: 0, lockedUntil: 0 }) },
  failsLeft() { const s = loadSec(); return Math.max(0, 5 - s.fails) },
}

export function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/javascript:/gi, "").replace(/on\w+=/gi, "")
    .trim()
}
