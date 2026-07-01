// src/lib/email.ts
// Resend Email Utility — Contact form notification
// নতুন contact message আসলে admin কে email পাঠাবে

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY
const EMAIL_FROM = import.meta.env.EMAIL_FROM || "onboarding@resend.dev"
const EMAIL_TO = import.meta.env.EMAIL_TO || "muntasir.shihab@gmail.com"
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://muntasirshihab.web.app"
const SITE_NAME = import.meta.env.VITE_SITE_NAME || "MD Muntasir Shihab Portfolio"

interface ContactEmailData {
  name: string
  email: string
  phone: string
  message: string
  timestamp: string
}

/**
 * Contact form message থেকে admin কে email পাঠাও
 * Resend API ব্যবহার করে (client-side fetch, কোনো server লাগে না)
 * Note: Resend API key শুধু server-side এ ব্যবহার করা উচিত
 * Production এ একটি API route ব্যবহার করো
 */
export async function sendContactNotification(data: ContactEmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured")
    return false
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [EMAIL_TO],
        subject: ` portfolio থেকে নতুন মেসেজ — ${data.name}`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0f0f18; color: #e0e0e0; padding: 32px; border-radius: 16px; border: 1px solid rgba(231,184,75,0.2);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #e7b84b; font-size: 22px; margin: 0;">📨 নতুন মেসেজ এসেছে</h1>
              <p style="color: #888; font-size: 13px; margin-top: 6px;">${SITE_NAME} Portfolio</p>
            </div>

            <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a3e;">
                <span style="color: #888; font-size: 13px;">নাম</span>
                <span style="font-weight: 600;">${data.name}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a3e;">
                <span style="color: #888; font-size: 13px;">ইমেইল</span>
                <a href="mailto:${data.email}" style="color: #e7b84b; text-decoration: none;">${data.email}</a>
              </div>
              ${data.phone ? `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a3e;">
                <span style="color: #888; font-size: 13px;">ফোন</span>
                <a href="tel:${data.phone}" style="color: #e7b84b; text-decoration: none;">${data.phone}</a>
              </div>` : ""}
              <div style="padding: 8px 0;">
                <span style="color: #888; font-size: 13px; display: block; margin-bottom: 6px;">মেসেজ</span>
                <p style="background: #12121b; padding: 12px; border-radius: 8px; line-height: 1.6; margin: 0;">${data.message}</p>
              </div>
            </div>

            <div style="text-align: center; font-size: 11px; color: #555; margin-top: 16px;">
              ${data.timestamp} • ${SITE_URL}
            </div>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("[Email] Resend error:", err)
      return false
    }

    const result = await response.json()
    console.log("[Email] Sent successfully, ID:", result.id)
    return true
  } catch (err) {
    console.error("[Email] Failed to send:", err)
    return false
  }
}

/**
 * CV Download notification email
 */
export async function sendCvDownloadNotification(ip: string, country: string = ""): Promise<boolean> {
  if (!RESEND_API_KEY) return false

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [EMAIL_TO],
        subject: `📄 CV Download — ${country || "Unknown"} (${ip})`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #0f0f18; color: #e0e0e0; padding: 24px; border-radius: 12px; border: 1px solid rgba(231,184,75,0.2);">
            <h2 style="color: #e7b84b; font-size: 18px;">📄 CV Downloaded</h2>
            <p style="margin-top: 12px;">Someone just downloaded your CV.</p>
            <div style="background: #1a1a2e; padding: 12px; border-radius: 8px; margin-top: 12px; font-size: 14px;">
              <div>IP: ${ip}</div>
              <div>Country: ${country || "Unknown"}</div>
              <div>Time: ${new Date().toISOString()}</div>
            </div>
          </div>
        `,
      }),
    })

    return response.ok
  } catch {
    return false
  }
}
