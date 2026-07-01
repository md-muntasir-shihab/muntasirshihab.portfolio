/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly SUPABASE_SERVICE_ROLE_KEY: string
  readonly SUPABASE_DB_PASSWORD: string

  // Firebase
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly FIREBASE_WEB_PUSH_CERT: string
  readonly FIREBASE_URL: string
  // Firebase Admin SDK (server-side)
  readonly FIREBASE_PRIVATE_KEY_ID: string
  readonly FIREBASE_PRIVATE_KEY: string
  readonly FIREBASE_CLIENT_EMAIL: string
  readonly FIREBASE_CLIENT_ID: string
  readonly FIREBASE_CLIENT_X509_CERT_URL: string

  // Upstash Redis
  readonly UPSTASH_REDIS_REST_URL: string
  readonly UPSTASH_REDIS_REST_TOKEN: string

  // Resend Email
  readonly RESEND_API_KEY: string
  readonly EMAIL_FROM: string
  readonly EMAIL_TO: string

  // GitHub
  readonly VITE_GITHUB_USERNAME: string
  readonly GITHUB_TOKEN: string

  // Render
  readonly RENDER_API_KEY: string

  // Site
  readonly VITE_SITE_URL: string
  readonly VITE_SITE_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
