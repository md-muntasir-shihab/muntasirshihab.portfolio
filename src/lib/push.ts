// src/lib/push.ts
// Firebase Cloud Messaging (FCM) — Web Push Notifications
// ব্যবহারকারীকে push notification পাঠাও (browser notification)

import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging"
import app from "./firebase"

const VAPID_KEY = import.meta.env.FIREBASE_WEB_PUSH_CERT || ""

// ========================
// Types
// ========================

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, string>
  clickUrl?: string
}

// ========================
// Messaging Instance
// ========================

let messagingInstance: Messaging | null = null

async function getMessagingInstance(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance

  try {
    const supported = await isSupported()
    if (!supported) {
      console.warn("[Push] Firebase Cloud Messaging not supported in this browser")
      return null
    }

    messagingInstance = getMessaging(app)
    return messagingInstance
  } catch (err) {
    console.warn("[Push] Failed to initialize messaging:", err)
    return null
  }
}

// ========================
// Notification Permission
// ========================

/**
 * Notification permission status চেক করো
 */
export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) return "denied"
  return Notification.permission
}

/**
 * Notification permission request করো
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("[Push] Notifications not supported in this browser")
    return "denied"
  }

  if (Notification.permission === "granted") return "granted"

  const permission = await Notification.requestPermission()
  return permission
}

// ========================
// FCM Token
// ========================

/**
 * FCM registration token পাও
 * Push notification পাঠাতে এই token লাগবে
 */
export async function getFCMToken(): Promise<string | null> {
  const messaging = await getMessagingInstance()
  if (!messaging || !VAPID_KEY) {
    console.warn("[Push] Messaging not available or VAPID key missing")
    return null
  }

  try {
    const permission = getNotificationPermission()
    if (permission !== "granted") {
      console.warn("[Push] Notification permission not granted")
      return null
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    })

    if (token) {
      console.log("[Push] FCM token obtained:", token.slice(0, 20) + "...")
      // TODO: এই token কে তোমার server এ পাঠাও (Supabase তে save করো)
      // await supabase.from('push_tokens').upsert({ token, user_agent: navigator.userAgent })
    }

    return token
  } catch (err) {
    console.error("[Push] Failed to get FCM token:", err)
    return null
  }
}

/**
 * FCM token delete করো (unsubscribe)
 */
export async function deleteFCMToken(): Promise<boolean> {
  try {
    const { deleteToken, getMessaging } = await import("firebase/messaging")
    const messaging = getMessaging()
    await deleteToken(messaging)
    console.log("[Push] FCM token deleted")
    return true
  } catch (err) {
    console.error("[Push] Failed to delete FCM token:", err)
    return false
  }
}

// ========================
// Foreground Message Handler
// ========================

/**
 * যখন app open আছে (foreground), তখন incoming message handle করো
 * @param callback - message receive হলে call হবে
 */
export async function onForegroundMessage(
  callback: (payload: PushNotificationPayload) => void
): Promise<(() => void) | null> {
  const messaging = await getMessagingInstance()
  if (!messaging) return null

  try {
    return onMessage(messaging, (payload) => {
      const notification: PushNotificationPayload = {
        title: payload.notification?.title || "New Notification",
        body: payload.notification?.body || "",
        icon: payload.notification?.icon,
        data: payload.data as Record<string, string>,
      }
      callback(notification)
    })
  } catch (err) {
    console.error("[Push] Failed to set up foreground message handler:", err)
    return null
  }
}

// ========================
// Local Notification
// ========================

/**
 * Browser notification দেখাও (foreground message এর জন্য)
 */
export function showLocalNotification(payload: PushNotificationPayload): void {
  if (getNotificationPermission() !== "granted") return

  const notification = new Notification(payload.title, {
    body: payload.body,
    icon: payload.icon || "/favicon.svg",
    badge: payload.badge,
    data: payload.data,
  })

  if (payload.clickUrl) {
    notification.onclick = () => {
      window.focus()
      window.open(payload.clickUrl, "_blank")
      notification.close()
    }
  }

  // 5 সেকেন্ড পর automatically close
  setTimeout(() => notification.close(), 5000)
}

// ========================
// Subscribe Helper
// ========================

/**
 * Push notifications এ subscribe করো (permission + token)
 * @returns FCM token বা null
 */
export async function subscribeToPush(): Promise<string | null> {
  const permission = await requestNotificationPermission()
  if (permission !== "granted") {
    console.warn("[Push] Permission denied")
    return null
  }

  return await getFCMToken()
}
