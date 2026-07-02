// src/lib/firebase.ts
// Firebase Client SDK configuration
// এই ফাইলে শুধু client-side Firebase কনফিগ আছে (Vite SPA এর জন্য)

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import {
  getAuth,
  type Auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
  type UserCredential,
} from "firebase/auth"
import {
  getFirestore,
  type Firestore,
} from "firebase/firestore"

// Firebase config — শুধু public keys (client-safe)
// campusway-education-v1 project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "campusway-education-v1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "campusway-education-v1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "campusway-education-v1.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
}

// শুধু একবার initialize করবে (SSR safe)
let app: FirebaseApp
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Auth instance
export const auth: Auth = getAuth(app)

// Firestore instance (auxiliary data, not primary DB)
export const db: Firestore = getFirestore(app)

// ========================
// Auth helper functions
// ========================

export async function firebaseLogin(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function firebaseLogout(): Promise<void> {
  await signOut(auth)
}

export function onFirebaseAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

/** Re-authenticate current user with current password (required before update) */
export async function reauthenticateUser(currentPassword: string): Promise<UserCredential> {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error("No authenticated user")
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  return reauthenticateWithCredential(user, credential)
}

/** Update email of the currently signed-in Firebase user */
export async function updateUserEmail(newEmail: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("No authenticated user")
  await firebaseUpdateEmail(user, newEmail)
}

/** Update password of the currently signed-in Firebase user */
export async function updateUserPassword(newPassword: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("No authenticated user")
  await firebaseUpdatePassword(user, newPassword)
}

export default app
