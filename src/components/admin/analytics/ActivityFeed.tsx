// src/components/admin/analytics/ActivityFeed.tsx
// Real-time activity feed powered by Supabase Realtime.
// Listens to INSERT events on visitors / cv_downloads / messages.
// Falls back to polling get_recent_activity every 30s if Realtime is
// not enabled (publication not set up) — so it always shows something.

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { supabase } from "../../../lib/supabase"
import { type Lang } from "../../../lib/data"
import {
  countryFlag, relTime, toActivityEvent, type ActivityEvent,
} from "../../../lib/analytics"
import { Activity, Loader2 } from "lucide-react"

const t = (en: string, bn: string, lang: Lang) => (lang === "bn" ? bn : en)

const COLOR: Record<ActivityEvent["type"], string> = {
  visitor: "#5bd07a",
  cv: "#e7b84b",
  message: "#6366f1",
}
const ICON: Record<ActivityEvent["type"], string> = {
  visitor: "🟢",
  cv: "📄",
  message: "💬",
}

interface ActivityFeedProps {
  lang: Lang
  title: string
}

export default function ActivityFeed({ lang, title }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  // Use a ref to dedupe by id when realtime + poll overlap
  const seen = useRef<Set<string>>(new Set())
  const push = (evs: ActivityEvent[]) => {
    setEvents(prev => {
      const incoming: ActivityEvent[] = []
      for (const e of evs) {
        if (!seen.current.has(e.id)) {
          seen.current.add(e.id)
          incoming.push(e)
        }
      }
      if (!incoming.length) return prev
      const merged = [...incoming, ...prev].slice(0, 25)
      return merged
    })
  }

  // Seed initial activity (works even without realtime)
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const { data, error } = await supabase.rpc("get_recent_activity", { p_limit: 25 })
        if (!active) return
        if (error) {
          // RPC not deployed — just hide the loader
          setLoading(false)
          return
        }
        const evs = (data || [])
          .map((r: any) => toActivityEvent(r.type, r))
          .filter(Boolean) as ActivityEvent[]
        push(evs)
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  // Subscribe to realtime INSERTs
  useEffect(() => {
    const channel = supabase
      .channel("analytics-activity-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitors" },
        (payload) => {
          const ev = toActivityEvent("visitor", payload.new)
          if (ev) push([ev])
        })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "cv_downloads" },
        (payload) => {
          const ev = toActivityEvent("cv", payload.new)
          if (ev) push([ev])
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "portfolio_content", filter: "key=eq.messages" },
        (payload) => {
          // payload.new.value is the array of messages
          const msgs = payload.new.value || []
          if (msgs.length > 0) {
            // we assume the first one is the newest
            const latest = msgs[0]
            const ev = toActivityEvent("message", { id: latest.id, name: latest.name, country: "", city: "", device: "", created_at: latest.date })
            if (ev) push([ev])
          }
        })
      .subscribe((status) => {
        // "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED"
        setConnected(status === "SUBSCRIBED")
        setLoading(false)
      })

    // Polling fallback — refresh the seed every 30s so the feed stays alive
    // even when realtime publication isn't configured.
    const poll = setInterval(async () => {
      try {
        const { data } = await supabase.rpc("get_recent_activity", { p_limit: 15 })
        const evs = (data || [])
          .map((r: any) => toActivityEvent(r.type, r))
          .filter(Boolean) as ActivityEvent[]
        push(evs)
      } catch { /* ignore */ }
    }, 30000)

    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const feedText = (e: ActivityEvent): string => {
    const place = e.city || e.country || (lang === "bn" ? "অজানা স্থান" : "Unknown")
    if (e.type === "cv") {
      return t(`CV downloaded from ${place}`, `${place} থেকে সিভি ডাউনলোড হয়েছে`, lang)
    }
    if (e.type === "message") {
      return t(`New message received`, `নতুন মেসেজ এসেছে`, lang)
    }
    return t(`Visited from ${place}`, `${place} থেকে ভিজিট`, lang)
  }

  return (
    <div className="glass rounded-[18px] p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[16px] font-[680] text-[#ccd0dc]">
          <Activity size={18} className="text-[#e7b84b]" /> {title}
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: connected ? "#5bd07a" : "#7e8391",
              boxShadow: connected ? "0 0 10px #5bd07a" : "none",
            }}
          />
          <span className={connected ? "text-[#5bd07a]" : "text-[#7e8391]"}>
            {connected ? t("Live", "লাইভ", lang) : t("Polling", "পোলিং", lang)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-1.5" style={{ maxHeight: 420 }}>
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-[13px] text-[#7e8391]">
            <Loader2 size={16} className="animate-spin" />
            {t("Loading activity...", "অ্যাক্টিভিটি লোড হচ্ছে...", lang)}
          </div>
        ) : events.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[#7e8391]">
            {t("No activity yet. Visitor & download events will appear here in real time.",
               "এখনো কোনো অ্যাক্টিভিটি নেই। ভিজিটর ও ডাউনলোড ইভেন্ট রিয়েল-টাইমে এখানে দেখা যাবে।", lang)}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((e) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.02] border text-[12.5px]"
                style={{ borderColor: `${COLOR[e.type]}22` }}
              >
                <span className="text-[15px] shrink-0">{ICON[e.type]}</span>
                <span className="text-[16px] shrink-0">{countryFlag(e.country)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[#e8e9ef] truncate font-[530]">{feedText(e)}</div>
                  <div className="text-[10.5px] text-[#7e8391]">
                    {e.type === "message" && e.label ? t("Message", "মেসেজ", lang) : (e.city || e.country || "")}
                  </div>
                </div>
                <span className="text-[11px] text-[#7e8391] shrink-0 font-mono">{relTime(e.createdAt)}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
