// src/hooks/useAuth.tsx
// Unified Auth Hook — Firebase (primary) বা Demo (fallback) with global context
// Firebase configured থাকলে Firebase Auth, না থাকলে demo auth

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react"
import {
  firebaseLogin,
  firebaseLogout,
  onFirebaseAuthChange,
} from "../lib/firebase"
import { adminSecurity } from "../lib/store"

// Firebase configured কিনা চেক করো
const isFirebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY)

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  provider: "firebase" | "demo"
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isFirebaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isFirebaseConfigured) {
      // Firebase auth state listener
      const unsubscribe = onFirebaseAuthChange((firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            provider: "firebase",
          })
        } else {
          // Firebase এ logged out — demo auth চেক করো
          const demoAuthed = sessionStorage.getItem("rm_admin_authed") === "1"
          if (demoAuthed) {
            setUser({
              uid: "demo-admin",
              email: adminSecurity.EMAIL,
              displayName: "Admin (Demo)",
              photoURL: null,
              provider: "demo",
            })
          } else {
            setUser(null)
          }
        }
        setLoading(false)
      })
      return unsubscribe
    } else {
      // Demo mode — sessionStorage থেকে auth state পড়ো
      const demoAuthed = sessionStorage.getItem("rm_admin_authed") === "1"
      if (demoAuthed) {
        setUser({
          uid: "demo-admin",
          email: adminSecurity.EMAIL,
          displayName: "Admin (Demo)",
          photoURL: null,
          provider: "demo",
        })
      }
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Firebase Auth attempt
    if (isFirebaseConfigured) {
      try {
        await firebaseLogin(email, password)
        return { success: true }
      } catch (err: any) {
        // Firebase login failed — fall through to demo check
      }
    }
    // Demo fallback (always available)
    if (adminSecurity.isLocked()) {
      return { success: false, error: `Account locked. Try again in ${adminSecurity.lockRemainingMin()} min.` }
    }
    if (/['"<>;]|--|\bOR\b|\bUNION\b/i.test(email)) {
      return { success: false, error: "Invalid characters detected." }
    }
    if (email.trim().toLowerCase() === adminSecurity.EMAIL && password === adminSecurity.PASSWORD) {
      adminSecurity.reset()
      sessionStorage.setItem("rm_admin_authed", "1")
      setUser({
        uid: "demo-admin",
        email: adminSecurity.EMAIL,
        displayName: "Admin (Demo)",
        photoURL: null,
        provider: "demo",
      })
      return { success: true }
    } else {
      adminSecurity.registerFail()
      if (adminSecurity.isLocked()) {
        return { success: false, error: "5 failed attempts — account locked for 10 minutes." }
      }
      return { success: false, error: `Invalid credentials. ${adminSecurity.failsLeft()} attempt(s) left.` }
    }
  }, [])

  const logout = useCallback(async () => {
    if (isFirebaseConfigured) {
      await firebaseLogout()
    }
    sessionStorage.removeItem("rm_admin_authed")
    sessionStorage.removeItem("rm_admin_2fa")
    setUser(null)
    window.location.href = "/"
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}

export { isFirebaseConfigured }
