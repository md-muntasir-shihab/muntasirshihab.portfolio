// src/lib/firebase-admin.ts
// Firebase Admin SDK configuration (server-side only)
// Service account credentials — admin operations (Firestore admin, Auth management, etc.)
// ⚠️ এটা server-side এ ব্যবহার করো, client-side এ service role key expose করো না

// Service account config — campusway-education-v1
// NOTE: In a client-side SPA, this file provides the config structure.
// For true admin operations, use a backend API (Cloud Functions, Render, etc.)

export const firebaseAdminConfig = {
  type: "service_account",
  project_id: "campusway-education-v1",
  private_key_id: import.meta.env.FIREBASE_PRIVATE_KEY_ID || "",
  private_key: (import.meta.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  client_email: import.meta.env.FIREBASE_CLIENT_EMAIL || "",
  client_id: import.meta.env.FIREBASE_CLIENT_ID || "",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: import.meta.env.FIREBASE_CLIENT_X509_CERT_URL || "",
  universe_domain: "googleapis.com",
}

export const FIREBASE_PROJECT_ID = "campusway-education-v1"
export const FIREBASE_WEB_APP_URL = import.meta.env.FIREBASE_URL || "https://muntasirshihab.web.app"

/**
 * Firebase server-side admin operations এর জন্য helper
 * Cloud Functions বা backend API তে ব্যবহার করো
 */
export function getFirebaseAdminConfig() {
  const hasPrivateKey = !!import.meta.env.FIREBASE_PRIVATE_KEY
  if (!hasPrivateKey) {
    console.warn("[Firebase Admin] FIREBASE_PRIVATE_KEY not configured — admin operations unavailable")
    return null
  }
  return firebaseAdminConfig
}
