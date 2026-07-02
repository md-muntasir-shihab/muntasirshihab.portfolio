// src/hooks/useAuth.tsx
// Unified Auth Hook — Firebase (primary) বা Demo (fallback) with global context
// Firebase configured থাকলে Firebase Auth, না থাকলে demo auth

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react"
import {
  firebaseLogin,
  firebaseLogout,
  onFirebaseAuthChange,
  reauthenticateUser,
  updateUserEmail,
  updateUserPassword,
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
  changeCredentials: (opts: { currentPassword: string; newEmail?: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>
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

  const login = useCallback(async (usernameOrEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
    let resolvedEmail = usernameOrEmail.trim().toLowerCase()
    if (resolvedEmail === "muntasir" || resolvedEmail === "admin") {
      resolvedEmail = adminSecurity.EMAIL.toLowerCase()
    }

    // Firebase Auth attempt
    if (isFirebaseConfigured) {
      try {
        await firebaseLogin(resolvedEmail, password)
        return { success: true }
      } catch (err: any) {
        // Firebase login failed — fall through to demo check
      }
    }
    // Demo fallback (always available)
    if (adminSecurity.isLocked()) {
      return { success: false, error: `Account locked. Try again in ${adminSecurity.lockRemainingMin()} min.` }
    }
    if (/['"<>;]|--|\bOR\b|\bUNION\b/i.test(resolvedEmail)) {
      return { success: false, error: "Invalid characters detected." }
    }
    if (resolvedEmail === adminSecurity.EMAIL.toLowerCase() && password === adminSecurity.PASSWORD) {
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

  const changeCredentials = useCallback(async (opts: { currentPassword: string; newEmail?: string; newPassword: string }): Promise<{ success: boolean; error?: string }> => {
    // Firebase mode: reauthenticate then update
    if (isFirebaseConfigured && user?.provider === "firebase") {
      try {
        await reauthenticateUser(opts.currentPassword)
        if (opts.newEmail) {
          await updateUserEmail(opts.newEmail)
        }
        if (opts.newPassword) {
          await updateUserPassword(opts.newPassword)
        }
        return { success: true }
      } catch (err: any) {
        const msg = err?.message || String(err)
        if (msg.includes("auth/email-already-in-use")) return { success: false, error: "Email already in use." }
        if (msg.includes("auth/wrong-password") || msg.includes("auth/invalid-credential")) return { success: false, error: "Current password is incorrect." }
        if (msg.includes("auth/weak-password")) return { success: false, error: "New password is too weak (min 6 chars)." }
        if (msg.includes("auth/too-many-requests")) return { success: false, error: "Too many attempts. Try again later." }
        return { success: false, error: `Firebase error: ${msg.slice(0, 80)}` }
      }
    }
    // Demo mode: verify current password then update localStorage
    if (opts.currentPassword !== adminSecurity.PASSWORD) {
      return { success: false, error: "Current password is incorrect." }
    }
    if (opts.newEmail) {
      adminSecurity.updateCreds(opts.newEmail, opts.newPassword || adminSecurity.PASSWORD)
    }
    if (opts.newPassword) {
      adminSecurity.updateCreds(opts.newEmail || adminSecurity.EMAIL, opts.newPassword)
    }
    setUser(prev => prev ? { ...prev, email: opts.newEmail || prev.email } : prev)
    return { success: true }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, changeCredentials, isFirebaseConfigured }}>
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
