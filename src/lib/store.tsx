import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import {
  profile as defProfile, experience as defExp, skills as defSkills,
  projects as defProjects, testimonials as defTesti, recommendations as defRecs,
  blogPosts as defBlog, services as defServices, sectionVisibility as defVis,
  tools as defTools, hireMe as defHireMe, education as defEdu, achievements as defAchieve,
  pageBackgroundMap as defBgMap
} from "./data"
import { supabase, supabaseAdmin } from "./supabase"

// ---------- Types ----------
export interface ContactMessage {
  id: string; name: string; email: string; phone: string; message: string; date: string; read: boolean
}

interface StoreShape {
  profile: typeof defProfile & { customLogo?: string }
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
  pageBackgroundMap: typeof defBgMap
  messages: ContactMessage[]
  cvCount: number
}

interface StoreCtxType extends StoreShape {
  loading: boolean
  setVisibility: (k: keyof typeof defVis, v: boolean) => Promise<void>
  addMessage: (m: Omit<ContactMessage, "id" | "date" | "read">) => Promise<void>
  markRead: (id: string) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  incCv: () => Promise<number>
  updateProfile: (patch: Partial<typeof defProfile & { customLogo?: string }>) => Promise<void>
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
  updatePageBackgroundMap: (val: typeof defBgMap) => Promise<void>
  resetAll: () => Promise<void>
}

// Global helper to save to Supabase portfolio_content table using RPC or direct upsert
async function saveToDb(key: string, value: any) {
  if (!supabaseAdmin) {
    console.warn(`[Store] supabaseAdmin not initialized. Cannot save key "${key}".`);
    return;
  }
  try {
    const { error } = await supabaseAdmin.rpc('upsert_portfolio_content', {
      p_key: key,
      p_value: value
    });
    if (error) {
      // Fallback if RPC is missing/failed
      const { error: upsertErr } = await supabaseAdmin
        .from('portfolio_content')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (upsertErr) throw upsertErr;
    }
  } catch (err) {
    console.error(`[Store] Failed to save key "${key}" to DB:`, err);
  }
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
    pageBackgroundMap: defBgMap,
    messages: [],
    cvCount: 0,
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

        // Fetch messages
        const { data: dbMessages, error: msgError } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: false })

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
          messages: dbMessages
            ? dbMessages.map((m: any) => ({
                id: m.id,
                name: m.name,
                email: m.email,
                phone: m.phone || "",
                message: m.message,
                date: m.created_at || m.date,
                read: m.is_read || false,
              }))
            : [],
          cvCount: cvDownloadsCount !== null && !cvError ? cvDownloadsCount : 0,
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
    setState(s => {
      const nextVis = { ...s.visibility, [k]: v };
      saveToDb("visibility", nextVis);
      return { ...s, visibility: nextVis };
    });
  }, [])

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
    setState(s => ({ ...s, messages: s.messages.map(m => m.id === id ? { ...m, read: true } : m) }))
    if (supabaseAdmin) {
      await supabaseAdmin.from('messages').update({ is_read: true }).eq('id', id)
    }
  }, [])

  const deleteMessage = useCallback(async (id: string) => {
    setState(s => ({ ...s, messages: s.messages.filter(m => m.id !== id) }))
    if (supabaseAdmin) {
      await supabaseAdmin.from('messages').delete().eq('id', id)
    }
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

  const updateProfile = useCallback(async (patch: Partial<typeof defProfile & { customLogo?: string }>) => {
    setState(s => {
      const nextProfile = { ...s.profile, ...patch };
      saveToDb("profile", nextProfile);
      return { ...s, profile: nextProfile };
    });
  }, [])

  const updateExperience = useCallback(async (val: typeof defExp) => {
    setState(s => {
      saveToDb("experience", val);
      return { ...s, experience: val };
    });
  }, [])

  const updateEducation = useCallback(async (val: typeof defEdu) => {
    setState(s => {
      saveToDb("education", val);
      return { ...s, education: val };
    });
  }, [])

  const updateSkills = useCallback(async (val: typeof defSkills) => {
    setState(s => {
      saveToDb("skills", val);
      return { ...s, skills: val };
    });
  }, [])

  const updateProjects = useCallback(async (val: typeof defProjects) => {
    setState(s => {
      saveToDb("projects", val);
      return { ...s, projects: val };
    });
  }, [])

  const updateTestimonials = useCallback(async (val: typeof defTesti) => {
    setState(s => {
      saveToDb("testimonials", val);
      return { ...s, testimonials: val };
    });
  }, [])

  const updateRecommendations = useCallback(async (val: typeof defRecs) => {
    setState(s => {
      saveToDb("recommendations", val);
      return { ...s, recommendations: val };
    });
  }, [])

  const updateBlogPosts = useCallback(async (val: typeof defBlog) => {
    setState(s => {
      saveToDb("blogPosts", val);
      return { ...s, blogPosts: val };
    });
  }, [])

  const updateServices = useCallback(async (val: typeof defServices) => {
    setState(s => {
      saveToDb("services", val);
      return { ...s, services: val };
    });
  }, [])

  const updateTools = useCallback(async (val: typeof defTools) => {
    setState(s => {
      saveToDb("tools", val);
      return { ...s, tools: val };
    });
  }, [])

  const updateHireMe = useCallback(async (val: typeof defHireMe) => {
    setState(s => {
      saveToDb("hireMe", val);
      return { ...s, hireMe: val };
    });
  }, [])

  const updateAchievements = useCallback(async (val: typeof defAchieve) => {
    setState(s => {
      saveToDb("achievements", val);
      return { ...s, achievements: val };
    });
  }, [])

  const updatePageBackgroundMap = useCallback(async (val: typeof defBgMap) => {
    setState(s => {
      saveToDb("pageBackgroundMap", val);
      return { ...s, pageBackgroundMap: val };
    });
  }, [])

  const resetAll = useCallback(async () => {
    if (supabaseAdmin) {
      await supabaseAdmin.from("portfolio_content").delete().neq("key", "")
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
      pageBackgroundMap: defBgMap,
      messages: [],
      cvCount: 0,
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
