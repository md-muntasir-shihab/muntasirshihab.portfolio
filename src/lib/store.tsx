import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import {
  profile as defProfile, experience as defExp, skills as defSkills,
  projects as defProjects, testimonials as defTesti, recommendations as defRecs,
  blogPosts as defBlog, services as defServices, sectionVisibility as defVis,
} from "./data"

// ---------- Types ----------
export interface ContactMessage {
  id: string; name: string; email: string; phone: string; message: string; date: string; read: boolean
}

interface StoreShape {
  profile: typeof defProfile
  experience: typeof defExp
  skills: typeof defSkills
  projects: typeof defProjects
  testimonials: typeof defTesti
  recommendations: typeof defRecs
  blogPosts: typeof defBlog
  services: typeof defServices
  visibility: typeof defVis
  messages: ContactMessage[]
  cvCount: number
}

interface StoreCtxType extends StoreShape {
  setVisibility: (k: keyof typeof defVis, v: boolean) => void
  addMessage: (m: Omit<ContactMessage, "id" | "date" | "read">) => void
  markRead: (id: string) => void
  deleteMessage: (id: string) => void
  incCv: () => number
  updateProfile: (patch: Partial<typeof defProfile>) => void
  resetAll: () => void
}

const KEY = "rm_store_v1"

function loadInitial(): StoreShape {
  const base: StoreShape = {
    profile: defProfile, experience: defExp, skills: defSkills, projects: defProjects,
    testimonials: defTesti, recommendations: defRecs, blogPosts: defBlog,
    services: defServices, visibility: { ...defVis }, messages: [], cvCount: 0,
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      // only persist the mutable pieces; static content always from latest defaults
      return {
        ...base,
        visibility: { ...base.visibility, ...(saved.visibility || {}) },
        messages: Array.isArray(saved.messages) ? saved.messages : [],
        cvCount: typeof saved.cvCount === "number" ? saved.cvCount : 0,
        profile: { ...base.profile, ...(saved.profilePatch || {}) },
      }
    }
  } catch { /* ignore corrupt storage */ }
  return base
}

const StoreCtx = createContext<StoreCtxType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreShape>(loadInitial)
  const [profilePatch, setProfilePatch] = useState<Partial<typeof defProfile>>({})

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        visibility: state.visibility,
        messages: state.messages,
        cvCount: state.cvCount,
        profilePatch,
      }))
    } catch { /* storage full / blocked */ }
  }, [state.visibility, state.messages, state.cvCount, profilePatch])

  const setVisibility = useCallback((k: keyof typeof defVis, v: boolean) => {
    setState(s => ({ ...s, visibility: { ...s.visibility, [k]: v } }))
  }, [])

  const addMessage = useCallback((m: Omit<ContactMessage, "id" | "date" | "read">) => {
    const msg: ContactMessage = {
      ...m, id: Math.random().toString(36).slice(2), date: new Date().toISOString(), read: false,
    }
    setState(s => ({ ...s, messages: [msg, ...s.messages] }))
  }, [])

  const markRead = useCallback((id: string) => {
    setState(s => ({ ...s, messages: s.messages.map(m => m.id === id ? { ...m, read: true } : m) }))
  }, [])

  const deleteMessage = useCallback((id: string) => {
    setState(s => ({ ...s, messages: s.messages.filter(m => m.id !== id) }))
  }, [])

  const incCv = useCallback(() => {
    let next = 0
    setState(s => { next = s.cvCount + 1; return { ...s, cvCount: next } })
    return next
  }, [])

  const updateProfile = useCallback((patch: Partial<typeof defProfile>) => {
    setProfilePatch(p => ({ ...p, ...patch }))
    setState(s => ({ ...s, profile: { ...s.profile, ...patch } }))
  }, [])

  const resetAll = useCallback(() => {
    localStorage.removeItem(KEY)
    setProfilePatch({})
    setState(loadInitial())
  }, [])

  return (
    <StoreCtx.Provider value={{ ...state, setVisibility, addMessage, markRead, deleteMessage, incCv, updateProfile, resetAll }}>
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
  // Demo credentials – replace with Firebase Auth when connected
  EMAIL: "admin@muntasir.dev",
  PASSWORD: "Shihab@2026",
  getState: loadSec,
  isLocked() { const s = loadSec(); return s.lockedUntil > Date.now() },
  lockRemainingMin() { const s = loadSec(); return Math.max(0, Math.ceil((s.lockedUntil - Date.now()) / 60000)) },
  registerFail() {
    const s = loadSec(); s.fails += 1
    if (s.fails >= 5) { s.lockedUntil = Date.now() + 10 * 60 * 1000; s.fails = 0 } // lock 10 min after 5 fails
    saveSec(s); return s
  },
  reset() { saveSec({ fails: 0, lockedUntil: 0 }) },
  failsLeft() { const s = loadSec(); return Math.max(0, 5 - s.fails) },
}

// Basic XSS sanitizer for user-submitted text
export function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/javascript:/gi, "").replace(/on\w+=/gi, "")
    .trim()
}
