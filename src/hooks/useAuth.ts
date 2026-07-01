// src/hooks/useAuth.ts
// Unified Auth Hook — Firebase (primary) বা Demo (fallback)
// Firebase configured থাকলে Firebase Auth, না থাকলে demo auth

import { useState, useEffect, useCallback } from "react"
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

export function useAuth() {
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
    if (isFirebaseConfigured) {
      try {
        await firebaseLogin(email, password)
        return { success: true }
      } catch (err: any) {
        const code = err?.code || ""
        let msg = "Login failed"
        if (code === "auth/invalid-credential") msg = "Invalid email or password"
        else if (code === "auth/too-many-requests") msg = "Too many attempts. Try later."
        else if (code === "auth/user-not-found") msg = "User not found"
        else if (code === "auth/wrong-password") msg = "Wrong password"
        else if (code === "auth/invalid-email") msg = "Invalid email format"
        else msg = err?.message || "Login failed"
        return { success: false, error: msg }
      }
    } else {
      // Demo mode
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

  return { user, loading, login, logout, isFirebaseConfigured }
}

export { isFirebaseConfigured }
