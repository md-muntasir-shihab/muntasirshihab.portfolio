// src/lib/supabase.ts
// Supabase Client — দুটি version: anon (client) এবং admin (service role)
// Client-side এ anon key, admin operations এ service role key ব্যবহৃত

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY")
}

// ========================
// Client-side Supabase (anon key — RLS protected)
// ========================
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
)

// ========================
// Admin Supabase (service role key — bypasses RLS)
// ⚠️ শুধু admin-only operations এ ব্যবহার করো
// এটা client-side ও কাজ করবে, কিন্তু production এ server-side ভালো
// ========================
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin: SupabaseClient | null = serviceRoleKey
  ? createClient(supabaseUrl || "", serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// ========================
// Storage Utility Functions
// ========================
const BUCKET_IMAGES = "images"
const BUCKET_PDFS = "pdfs"

export interface StorageFile {
  id: string
  name: string
  url: string
  size: number
  bucket: string
  createdAt: string
}

/**
 * ছবি Supabase Storage এ upload করো
 * @param file - File object
 * @param folder - ফোল্ডার নাম (যেমন "projects", "testimonials")
 * @returns uploaded file URL
 */
export async function uploadImage(file: File, folder: string = "general"): Promise<StorageFile> {
  if (!supabase) throw new Error("Supabase client not initialized")

  const ext = file.name.split(".").pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from(BUCKET_IMAGES)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) throw new Error(`Image upload failed: ${error.message}`)

  const { data: urlData } = supabase.storage.from(BUCKET_IMAGES).getPublicUrl(data.path)

  return {
    id: data.id,
    name: file.name,
    url: urlData.publicUrl,
    size: file.size,
    bucket: BUCKET_IMAGES,
    createdAt: new Date().toISOString(),
  }
}

/**
 * PDF Supabase Storage এ upload করো
 */
export async function uploadPdf(file: File): Promise<StorageFile> {
  if (!supabase) throw new Error("Supabase client not initialized")

  const fileName = `cv/${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from(BUCKET_PDFS)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true, // CV replace করতে allow
    })

  if (error) throw new Error(`PDF upload failed: ${error.message}`)

  const { data: urlData } = supabase.storage.from(BUCKET_PDFS).getPublicUrl(data.path)

  return {
    id: data.id,
    name: file.name,
    url: urlData.publicUrl,
    size: file.size,
    bucket: BUCKET_PDFS,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Storage থেকে file মুছে ফেলো
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  if (!supabase) throw new Error("Supabase client not initialized")

  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw new Error(`File delete failed: ${error.message}`)
}

/**
 * Bucket এর সব ফাইলের লিস্ট পাও
 */
export async function listFiles(bucket: string, folder: string = ""): Promise<StorageFile[]> {
  if (!supabase) return []

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 100,
    sortBy: { column: "created_at", order: "desc" },
  })

  if (error || !data) return []

  return data.map((item) => {
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(folder ? `${folder}/${item.name}` : item.name)
    return {
      id: item.id || Math.random().toString(36).slice(2),
      name: item.name,
      url: urlData.publicUrl,
      size: item.metadata?.size || 0,
      bucket,
      createdAt: item.created_at || new Date().toISOString(),
    }
  })
}
