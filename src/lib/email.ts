// src/lib/email.ts
// Resend Email Utility — Contact form notification + manual custom email
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
  subject?: string
  html?: string
}

export interface EmailConfig {
  resendApiKey?: string
  emailFrom?: string
  emailTo?: string
}

/** Resolve active config — dynamic overrides from admin DB take priority */
function resolveConfig(config?: EmailConfig) {
  return {
    apiKey: config?.resendApiKey || RESEND_API_KEY,
    from: config?.emailFrom || EMAIL_FROM,
    to: config?.emailTo || EMAIL_TO,
  }
}

/**
 * Contact form message থেকে admin কে email পাঠাও
 * Resend API ব্যবহার করে (client-side fetch, কোনো server লাগে না)
 */
export async function sendContactNotification(data: ContactEmailData, config?: EmailConfig): Promise<boolean> {
  const { apiKey, from, to } = resolveConfig(config)

  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not configured")
    return false
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: data.subject || ` portfolio থেকে নতুন মেসেজ — ${data.name}`,
        html: data.html || `
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
export async function sendCvDownloadNotification(ip: string, country: string = "", config?: EmailConfig): Promise<boolean> {
  const { apiKey, from, to } = resolveConfig(config)

  if (!apiKey) return false

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
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

/**
 * Send confirmation email to the visitor who submitted the contact form
 */
export async function sendVisitorConfirmation(name: string, toEmail: string, originalMessage: string, config?: EmailConfig & { subject?: string; html?: string }): Promise<boolean> {
  const { apiKey, from } = resolveConfig(config)

  if (!apiKey) return false

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [toEmail],
        subject: config?.subject || `Thank you for contacting ${SITE_NAME}`,
        html: config?.html || `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0f0f18; color: #e0e0e0; padding: 32px; border-radius: 16px; border: 1px solid rgba(231,184,75,0.2);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #e7b84b; font-size: 22px; margin: 0;">Thank You for Reaching Out!</h1>
              <p style="color: #888; font-size: 13px; margin-top: 6px;">Hi ${name}, I have received your message.</p>
            </div>
            
            <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin-bottom: 20px; line-height: 1.6;">
              <p style="margin-top: 0;">Thanks for visiting my portfolio. I will review your message and get back to you as soon as possible.</p>
              
              <div style="margin-top: 20px; border-top: 1px solid #2a2a3e; padding-top: 15px;">
                <span style="color: #888; font-size: 12px; display: block; margin-bottom: 6px;">Your submitted message:</span>
                <p style="background: #12121b; padding: 12px; border-radius: 8px; font-size: 13px; margin: 0; white-space: pre-wrap;">${originalMessage}</p>
              </div>
            </div>

            <div style="text-align: center; font-size: 13px; color: #888;">
              Best regards,<br/>
              <strong style="color: #e7b84b;">MD Muntasir Shihab</strong><br/>
              <a href="${SITE_URL}" style="color: #888; text-decoration: underline; font-size: 11px;">${SITE_URL}</a>
            </div>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.warn("[Email] sendVisitorConfirmation failed:", errText)
      return false
    }
    return true
  } catch (err) {
    console.error("[Email] sendVisitorConfirmation error:", err)
    return false
  }
}

// ============================================================
// ---- Custom / Manual Email ----
// ============================================================

/** Pre-built template IDs */
export type EmailTemplateId = "thankyou" | "followup" | "project_update" | "newsletter" | "custom" | "auto_reply" | "admin_notify"

export interface EmailTemplate {
  id: EmailTemplateId
  name: string
  nameBn: string
  subject: string
  body: string // HTML body with {{name}} placeholder
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "auto_reply",
    name: "Auto Reply (Visitor)",
    nameBn: "অটো রিপ্লাই (ভিজিটর)",
    subject: "Thank you for contacting MD Muntasir Shihab",
    body: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0f0f18; color: #e0e0e0; padding: 32px; border-radius: 16px; border: 1px solid rgba(231,184,75,0.2);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #e7b84b; font-size: 22px; margin: 0;">Thank You for Reaching Out!</h1>
        <p style="color: #888; font-size: 13px; margin-top: 6px;">Hi {{name}}, I have received your message.</p>
      </div>
      
      <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin-bottom: 20px; line-height: 1.6;">
        <p style="margin-top: 0;">Thanks for visiting my portfolio. I will review your message and get back to you as soon as possible.</p>
        
        <div style="margin-top: 20px; border-top: 1px solid #2a2a3e; padding-top: 15px;">
          <span style="color: #888; font-size: 12px; display: block; margin-bottom: 6px;">Your submitted message:</span>
          <p style="background: #12121b; padding: 12px; border-radius: 8px; font-size: 13px; margin: 0; white-space: pre-wrap;">{{message}}</p>
        </div>
      </div>

      <div style="text-align: center; font-size: 13px; color: #888;">
        Best regards,<br/>
        <strong style="color: #e7b84b;">MD Muntasir Shihab</strong><br/>
        <a href="${SITE_URL}" style="color: #888; text-decoration: underline; font-size: 11px;">${SITE_URL}</a>
      </div>
    </div>`
  },
  {
    id: "admin_notify",
    name: "Admin Notification",
    nameBn: "এডমিন নোটিফিকেশন",
    subject: "📨 portfolio থেকে নতুন মেসেজ — {{name}}",
    body: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0f0f18; color: #e0e0e0; padding: 32px; border-radius: 16px; border: 1px solid rgba(231,184,75,0.2);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #e7b84b; font-size: 22px; margin: 0;">📨 নতুন মেসেজ এসেছে</h1>
        <p style="color: #888; font-size: 13px; margin-top: 6px;">${SITE_NAME} Portfolio</p>
      </div>

      <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a3e;">
          <span style="color: #888; font-size: 13px;">নাম</span>
          <span style="font-weight: 600;">{{name}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a3e;">
          <span style="color: #888; font-size: 13px;">ইমেইল</span>
          <a href="mailto:{{email}}" style="color: #e7b84b; text-decoration: none;">{{email}}</a>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a3e;">
          <span style="color: #888; font-size: 13px;">ফোন</span>
          <a href="tel:{{phone}}" style="color: #e7b84b; text-decoration: none;">{{phone}}</a>
        </div>
        <div style="padding: 8px 0;">
          <span style="color: #888; font-size: 13px; display: block; margin-bottom: 6px;">মেসেজ</span>
          <p style="background: #12121b; padding: 12px; border-radius: 8px; line-height: 1.6; margin: 0;">{{message}}</p>
        </div>
      </div>

      <div style="text-align: center; font-size: 11px; color: #555; margin-top: 16px;">
        {{date}} • ${SITE_URL}
      </div>
    </div>`
  },
  {
    id: "thankyou",
    name: "Thank You",
    nameBn: "ধন্যবাদ",
    subject: "Thank you for connecting — {{name}}",
    body: `<div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#0f0f18;color:#e0e0e0;padding:32px;border-radius:16px;border:1px solid rgba(231,184,75,0.2);">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#e7b84b;font-size:22px;margin:0;">🙏 Thank You!</h1>
        <p style="color:#888;font-size:13px;margin-top:6px;">${SITE_NAME}</p>
      </div>
      <div style="background:#1a1a2e;border-radius:12px;padding:20px;line-height:1.7;">
        <p style="margin:0;">Hi <strong>{{name}}</strong>,</p>
        <p>{{message}}</p>
      </div>
      <div style="text-align:center;font-size:12px;color:#555;margin-top:20px;">
        Best regards — <a href="${SITE_URL}" style="color:#e7b84b;text-decoration:none;">MD Muntasir Shihab</a>
      </div>
    </div>`,
  },
  {
    id: "followup",
    name: "Follow Up",
    nameBn: "ফলো আপ",
    subject: "Following up — {{name}}",
    body: `<div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#0f0f18;color:#e0e0e0;padding:32px;border-radius:16px;border:1px solid rgba(231,184,75,0.2);">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#e7b84b;font-size:22px;margin:0;">📌 Follow Up</h1>
        <p style="color:#888;font-size:13px;margin-top:6px;">${SITE_NAME}</p>
      </div>
      <div style="background:#1a1a2e;border-radius:12px;padding:20px;line-height:1.7;">
        <p style="margin:0;">Hi <strong>{{name}}</strong>,</p>
        <p>I wanted to follow up on our previous conversation.</p>
        <p>{{message}}</p>
      </div>
      <div style="text-align:center;font-size:12px;color:#555;margin-top:20px;">
        Best regards — <a href="${SITE_URL}" style="color:#e7b84b;text-decoration:none;">MD Muntasir Shihab</a>
      </div>
    </div>`,
  },
  {
    id: "project_update",
    name: "Project Update",
    nameBn: "প্রজেক্ট আপডেট",
    subject: "Project Update — {{name}}",
    body: `<div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#0f0f18;color:#e0e0e0;padding:32px;border-radius:16px;border:1px solid rgba(231,184,75,0.2);">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#e7b84b;font-size:22px;margin:0;">🚀 Project Update</h1>
        <p style="color:#888;font-size:13px;margin-top:6px;">${SITE_NAME}</p>
      </div>
      <div style="background:#1a1a2e;border-radius:12px;padding:20px;line-height:1.7;">
        <p style="margin:0;">Hi <strong>{{name}}</strong>,</p>
        <p>Here's an update on the project:</p>
        <p>{{message}}</p>
      </div>
      <div style="text-align:center;font-size:12px;color:#555;margin-top:20px;">
        Best regards — <a href="${SITE_URL}" style="color:#e7b84b;text-decoration:none;">MD Muntasir Shihab</a>
      </div>
    </div>`,
  },
  {
    id: "newsletter",
    name: "Newsletter",
    nameBn: "নিউজলেটার",
    subject: "Latest updates from {{name}}",
    body: `<div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#0f0f18;color:#e0e0e0;padding:32px;border-radius:16px;border:1px solid rgba(231,184,75,0.2);">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#e7b84b;font-size:22px;margin:0;">📰 Newsletter</h1>
        <p style="color:#888;font-size:13px;margin-top:6px;">${SITE_NAME}</p>
      </div>
      <div style="background:#1a1a2e;border-radius:12px;padding:20px;line-height:1.7;">
        <p style="margin:0;">Hello <strong>{{name}}</strong>,</p>
        <p>{{message}}</p>
      </div>
      <div style="text-align:center;font-size:12px;color:#555;margin-top:20px;">
        <a href="${SITE_URL}" style="color:#e7b84b;text-decoration:none;">Visit Portfolio</a>
      </div>
    </div>`,
  },
  {
    id: "custom",
    name: "Custom Template",
    nameBn: "কাস্টম টেমপ্লেট",
    subject: "{{subject}}",
    body: `<div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#0f0f18;color:#e0e0e0;padding:32px;border-radius:16px;border:1px solid rgba(231,184,75,0.2);">
      {{message}}
      <div style="text-align:center;font-size:12px;color:#555;margin-top:20px;">
        — <a href="${SITE_URL}" style="color:#e7b84b;text-decoration:none;">MD Muntasir Shihab</a>
      </div>
    </div>`,
  },
]

/**
 * Send a custom/manual email with a chosen template
 */
export async function sendCustomEmail(opts: {
  to: string
  recipientName: string
  subject: string
  message: string
  templateId: EmailTemplateId
  config?: EmailConfig
}): Promise<boolean> {
  const { apiKey, from } = resolveConfig(opts.config)
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not configured for custom email")
    return false
  }

  const tpl = EMAIL_TEMPLATES.find((t) => t.id === opts.templateId) || EMAIL_TEMPLATES[EMAIL_TEMPLATES.length - 1]

  // Resolve placeholders
  const subject = opts.subject
    .replace(/\{\{name\}\}/g, opts.recipientName)
    .replace(/\{\{subject\}\}/g, opts.subject)

  const html = tpl.body
    .replace(/\{\{name\}\}/g, opts.recipientName)
    .replace(/\{\{message\}\}/g, opts.message)
    .replace(/\{\{subject\}\}/g, opts.subject)

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [opts.to], subject, html }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("[Email] sendCustomEmail error:", err)
      return false
    }
    const result = await response.json()
    console.log("[Email] Custom email sent, ID:", result.id)
    return true
  } catch (err) {
    console.error("[Email] sendCustomEmail failed:", err)
    return false
  }
}
