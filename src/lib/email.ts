// src/lib/email.ts
// Resend Email Utility — Contact form notification + manual custom email
// নতুন contact message আসলে admin কে email পাঠাবে

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || import.meta.env.RESEND_API_KEY
const EMAIL_FROM = import.meta.env.VITE_EMAIL_FROM || import.meta.env.EMAIL_FROM || "onboarding@resend.dev"
const EMAIL_TO = import.meta.env.VITE_EMAIL_TO || import.meta.env.EMAIL_TO || "mm.xihab@gmail.com"
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://muntasirshihab.web.app"
const SITE_NAME = import.meta.env.VITE_SITE_NAME || "MD Muntasir Shihab Portfolio"

// CORS proxies — primary + fallbacks (Resend API requires server-side; proxies bridge the gap from the browser)
const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://proxy.cors.sh/",
  "https://api.allorigins.win/raw?url=",
]

/** Try sending via multiple CORS proxies with automatic fallback */
async function fetchWithCorsProxy(apiKey: string, payload: object): Promise<Response> {
  let lastError: Error | null = null
  for (const proxy of CORS_PROXIES) {
    try {
      const url = `${proxy}https://api.resend.com/emails`
      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      }
      if (proxy.includes("cors.sh")) {
        headers["x-cors-gratis"] = "true"
      }
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })
      // Any HTTP response means the proxy worked — return it
      return response
    } catch (err) {
      console.warn(`[Email] Proxy ${proxy} failed:`, err)
      lastError = err as Error
    }
  }
  throw lastError || new Error("All CORS proxies failed")
}

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
 */
export async function sendContactNotification(data: ContactEmailData, config?: EmailConfig): Promise<boolean> {
  const { apiKey, from, to } = resolveConfig(config)

  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not configured")
    return false
  }

  try {
    const response = await fetchWithCorsProxy(apiKey, {
      from,
      to: [to],
      subject: data.subject || `portfolio থেকে নতুন মেসেজ — ${data.name}`,
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
    const response = await fetchWithCorsProxy(apiKey, {
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
    })

    return response.ok
  } catch {
    return false
  }
}

/**
 * Send confirmation email to the visitor who submitted the contact form
 */
export async function sendVisitorConfirmation(
  name: string,
  toEmail: string,
  originalMessage: string,
  config?: EmailConfig & { subject?: string; html?: string }
): Promise<boolean> {
  const { apiKey, from } = resolveConfig(config)

  if (!apiKey) return false

  try {
    const response = await fetchWithCorsProxy(apiKey, {
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
    body: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
  <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 30px; text-align: center;">
    <h1 style="color: #e7b84b; font-size: 26px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">Message Received</h1>
    <p style="color: #94a3b8; font-size: 15px; margin: 10px 0 0 0;">Thank you for getting in touch, {{name}}!</p>
  </div>
  <div style="padding: 40px 30px; background-color: #ffffff; color: #334155; line-height: 1.7; font-size: 15px;">
    <p style="margin-top: 0;">I have successfully received your message. I deeply appreciate your interest and will review your inquiry shortly. You can expect a response from me within 24-48 hours.</p>
    <div style="margin: 30px 0; padding: 25px; border-radius: 8px; background-color: #f8fafc; border-left: 4px solid #e7b84b;">
      <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; display: block; margin-bottom: 8px;">Your Message</span>
      <p style="margin: 0; font-style: italic; color: #475569; white-space: pre-wrap;">"{{message}}"</p>
    </div>
    <p style="margin-bottom: 0;">If you have any additional information to share, feel free to reply directly to this email.</p>
  </div>
  <div style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">MD Muntasir Shihab</p>
    <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b;">Software Engineer & Web Developer</p>
    <a href="${SITE_URL}" style="display: inline-block; margin-top: 15px; color: #0f172a; text-decoration: none; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e7b84b; padding-bottom: 2px;">Visit Portfolio</a>
  </div>
</div>`
  },
  {
    id: "admin_notify",
    name: "Admin Notification",
    nameBn: "এডমিন নোটিফিকেশন",
    subject: "📨 New Message from {{name}}",
    body: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 12px; overflow: hidden; border: 1px solid #eaeaea;">
  <div style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 4px solid #e7b84b;">
    <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 600;">📨 New Portfolio Message</h1>
  </div>
  <div style="padding: 30px; background-color: #ffffff; color: #334155; font-size: 14px;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
      <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 80px;">Name</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">{{name}}</td></tr>
      <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Email</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:{{email}}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">{{email}}</a></td></tr>
      <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Phone</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">{{phone}}</td></tr>
      <tr><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Date</td><td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">{{date}}</td></tr>
    </table>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
      <span style="font-size: 12px; font-weight: 600; color: #94a3b8; display: block; margin-bottom: 8px; text-transform: uppercase;">Message Content</span>
      <p style="margin: 0; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">{{message}}</p>
    </div>
  </div>
</div>`
  },
  {
    id: "thankyou",
    name: "Thank You",
    nameBn: "ধন্যবাদ",
    subject: "Thank you for connecting — MD Muntasir Shihab",
    body: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 12px; overflow: hidden; border: 1px solid #eaeaea;">
  <div style="background: linear-gradient(to right, #e7b84b, #d4a338); padding: 40px 30px; text-align: center;">
    <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">Thank You!</h1>
  </div>
  <div style="padding: 40px 30px; background-color: #ffffff; color: #334155; line-height: 1.7; font-size: 16px;">
    <p style="margin-top: 0;">Hi <strong>{{name}}</strong>,</p>
    <div style="margin: 20px 0; color: #475569;">
      {{message}}
    </div>
    <p style="margin-bottom: 0;">I truly appreciate your time and look forward to our continued connection.</p>
  </div>
  <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0; font-size: 14px; color: #64748b;">Best regards,</p>
    <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 600; color: #0f172a;">MD Muntasir Shihab</p>
    <a href="${SITE_URL}" style="display: inline-block; margin-top: 15px; color: #3b82f6; text-decoration: none; font-size: 13px; font-weight: 500;">Visit my website</a>
  </div>
</div>`,
  },
  {
    id: "followup",
    name: "Follow Up",
    nameBn: "ফলো আপ",
    subject: "Following up on our conversation",
    body: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 12px; overflow: hidden; border: 1px solid #eaeaea;">
  <div style="background-color: #f1f5f9; padding: 30px; border-bottom: 1px solid #e2e8f0;">
    <h1 style="color: #0f172a; font-size: 22px; margin: 0; font-weight: 600; text-align: center;">Following Up</h1>
  </div>
  <div style="padding: 40px 30px; background-color: #ffffff; color: #334155; line-height: 1.7; font-size: 15px;">
    <p style="margin-top: 0;">Hello <strong>{{name}}</strong>,</p>
    <p>I hope this email finds you well. I am reaching out to follow up on our previous conversation.</p>
    <div style="margin: 25px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; color: #475569;">
      {{message}}
    </div>
    <p style="margin-bottom: 0;">Please let me know if you need any further information or if there are any next steps I should be aware of. I look forward to hearing from you soon.</p>
  </div>
  <div style="padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">MD Muntasir Shihab</p>
    <a href="${SITE_URL}" style="display: inline-block; margin-top: 10px; color: #64748b; text-decoration: none; font-size: 12px;">${SITE_URL}</a>
  </div>
</div>`,
  },
  {
    id: "project_update",
    name: "Project Update",
    nameBn: "প্রজেক্ট আপডেট",
    subject: "Important update regarding our project",
    body: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 12px; overflow: hidden; border: 1px solid #eaeaea; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
  <div style="background-color: #0f172a; padding: 35px 30px; text-align: center;">
    <div style="background-color: #3b82f6; color: white; text-transform: uppercase; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 15px; letter-spacing: 1px;">Status Update</div>
    <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 600;">Project Update</h1>
  </div>
  <div style="padding: 40px 30px; background-color: #ffffff; color: #334155; line-height: 1.7; font-size: 15px;">
    <p style="margin-top: 0;">Hi <strong>{{name}}</strong>,</p>
    <p>I am writing to share the latest updates on our ongoing project.</p>
    <div style="margin: 25px 0; color: #1e293b; background-color: #f8fafc; padding: 25px; border-radius: 8px; border-left: 4px solid #3b82f6;">
      {{message}}
    </div>
    <p style="margin-bottom: 0;">If you have any questions or require modifications, please do not hesitate to reply to this email.</p>
  </div>
  <div style="background-color: #f1f5f9; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0; font-size: 14px; color: #64748b;">Best regards,</p>
    <p style="margin: 5px 0 0 0; font-size: 15px; font-weight: 600; color: #0f172a;">MD Muntasir Shihab</p>
  </div>
</div>`,
  },
  {
    id: "newsletter",
    name: "Newsletter",
    nameBn: "নিউজলেটার",
    subject: "Latest updates & news",
    body: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 12px; overflow: hidden; border: 1px solid #eaeaea;">
  <div style="background: linear-gradient(135deg, #e7b84b 0%, #f59e0b 100%); padding: 40px 30px; text-align: center;">
    <h1 style="color: #ffffff; font-size: 26px; margin: 0; font-weight: 700;">Newsletter</h1>
    <p style="color: rgba(255,255,255,0.9); font-size: 15px; margin: 10px 0 0 0;">The latest updates from MD Muntasir Shihab</p>
  </div>
  <div style="padding: 40px 30px; background-color: #ffffff; color: #334155; line-height: 1.8; font-size: 15px;">
    <p style="margin-top: 0;">Hello <strong>{{name}}</strong>,</p>
    <div style="margin: 25px 0; color: #475569;">
      {{message}}
    </div>
    <div style="text-align: center; margin-top: 35px;">
      <a href="${SITE_URL}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; transition: background-color 0.2s;">View Portfolio</a>
    </div>
  </div>
  <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0; font-size: 12px; color: #94a3b8;">You are receiving this email because you subscribed to our newsletter or previously contacted us.</p>
  </div>
</div>`,
  },
  {
    id: "custom",
    name: "Custom Template",
    nameBn: "কাস্টম টেমপ্লেট",
    subject: "{{subject}}",
    body: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #eaeaea; color: #334155; line-height: 1.7; font-size: 15px;">
  {{message}}
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px;">
    <p style="margin: 0; font-weight: 600; color: #0f172a;">MD Muntasir Shihab</p>
    <a href="${SITE_URL}" style="color: #3b82f6; text-decoration: none;">${SITE_URL}</a>
  </div>
</div>`,
  },
]

/**
 * Send a custom/manual email with a chosen template.
 * Returns { success, error? } so callers can display detailed failure messages.
 */
export async function sendCustomEmail(opts: {
  to: string
  recipientName: string
  subject: string
  message: string
  templateId: string
  config?: EmailConfig
}): Promise<{ success: boolean; error?: string }> {
  const { apiKey, from } = resolveConfig(opts.config)
  if (!apiKey) {
    const msg = "RESEND_API_KEY not configured for custom email"
    console.warn("[Email]", msg)
    return { success: false, error: msg }
  }

  // Resolve placeholders
  const subject = opts.subject
    .replace(/\{\{name\}\}/g, opts.recipientName)
    .replace(/\{\{subject\}\}/g, opts.subject)

  let html = ""
  const trimmed = opts.message.trim()
  const isHtml =
    trimmed.startsWith("<") ||
    trimmed.includes("<div") ||
    trimmed.includes("<table") ||
    trimmed.includes("<html") ||
    trimmed.includes("<p")

  if (isHtml) {
    // Already pre-formatted HTML (e.g. from Unlayer visual builder) — use directly
    html = opts.message
      .replace(/\{\{name\}\}/g, opts.recipientName)
      .replace(/\{\{subject\}\}/g, opts.subject)
  } else {
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === opts.templateId) || EMAIL_TEMPLATES[EMAIL_TEMPLATES.length - 1]
    html = tpl.body
      .replace(/\{\{name\}\}/g, opts.recipientName)
      .replace(/\{\{message\}\}/g, opts.message)
      .replace(/\{\{subject\}\}/g, opts.subject)
  }

  try {
    const response = await fetchWithCorsProxy(apiKey, { from, to: [opts.to], subject, html })

    if (!response.ok) {
      let errText = ""
      try {
        const errJson = await response.json()
        errText = errJson?.message || errJson?.name || JSON.stringify(errJson)
      } catch {
        errText = await response.text()
      }
      console.error("[Email] sendCustomEmail error:", errText)
      return { success: false, error: errText }
    }
    const result = await response.json()
    console.log("[Email] Custom email sent, ID:", result.id)
    return { success: true }
  } catch (err: any) {
    const errMsg = err?.message || String(err)
    console.error("[Email] sendCustomEmail failed:", errMsg)
    return { success: false, error: errMsg }
  }
}
