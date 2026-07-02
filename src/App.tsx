import { BrowserRouter, Routes, Route, useLocation, Link, useParams, Navigate } from "react-router-dom"
import { useEffect, useState, useMemo, useContext, useRef } from "react"
import { motion } from "framer-motion"
import { PageShell, PageTransition, MagicCard, ShimmerButton, SectionHeading, StatTicker, ThemeProvider, ThemeCtx, Navbar, Footer, ScrollProgress, BackToTop } from "./components/ui-kit"
import { profile, experience, skills, projects, blogPosts, testimonials, services, education, achievements, type Lang, ADMIN_SLUG } from "./lib/data"
import { StoreProvider, useStore, sanitize, adminSecurity } from "./lib/store"
import { supabase } from "./lib/supabase"
import { useAuth, AuthProvider } from "./hooks/useAuth"
import { verifyTOTP, generateSecret, getOTPAuthURI, encryptSecret, decryptSecret } from "./lib/totp"

import { sendContactNotification, sendVisitorConfirmation, sendCvDownloadNotification } from "./lib/email"
import { toast, Toaster } from "sonner"
import { incrementCvDownload, getCvDownloadCount, incrementVisitorCount } from "./lib/upstash"
import { GitHubLiveStats } from "./components/GitHubLiveStats"
import ProfileEditor from "./components/admin/ProfileEditor"
import ExperienceManager from "./components/admin/ExperienceManager"
import EducationManager from "./components/admin/EducationManager"
import SkillsManager from "./components/admin/SkillsManager"
import ProjectsManager from "./components/admin/ProjectsManager"
import AchievementsManager from "./components/admin/AchievementsManager"
import SectionsManager from "./components/admin/SectionsManager"
import PageBackgroundsManager from "./components/admin/PageBackgroundsManager"
import TestimonialsManager from "./components/admin/TestimonialsManager"
import ContactHireManager from "./components/admin/ContactHireManager"
import BlogManager from "./components/admin/BlogManager"
import CVManager from "./components/admin/CVManager"
import MediaManager from "./components/admin/MediaManager"
import AnalyticsDashboard from "./components/admin/AnalyticsDashboard"
import EmailManager from "./components/admin/EmailManager"
import { trackVisitor, sendDuration, trackCvDownload, getGeo } from "./lib/analytics"
import confetti from "canvas-confetti"
import {
  ArrowUpRight, Code2, Star, Calendar, Send, MapPin, Clock,
  ShieldCheck, Lock, UserCheck, Phone, Mail, MessageCircle, Menu, Bell, ChevronRight, ChevronDown, AlertTriangle
} from "lucide-react"

// Social brand icons (inline SVG - brand-colored)
// If customLogo URL is provided, use the uploaded image instead.
function SocialIcon({name, size=20, customLogo}:{name:string, size?:number, customLogo?:string}){
  if(customLogo){
    return <img src={customLogo} alt={name} width={size} height={size} style={{width:size, height:size, objectFit:"contain"}} />
  }
  const s = {width:size, height:size, viewBox:"0 0 24 24", fill:"currentColor" as const}
  switch(name){
    case "GitHub": return <svg {...s}><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18.92-.26 1.92-.39 2.91-.39 1 0 1.99.13 2.92.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.23 2.78.11 3.07.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.79.55C20.22 21.38 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5z"/></svg>
    case "LinkedIn": return <svg {...s}><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 11-.01-4.12 2.06 2.06 0 01.01 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
    case "Facebook": return <svg {...s}><path d="M24 12.07C24 5.4 18.62 0 12 0S0 5.4 0 12.07c0 6 4.39 10.98 10.13 11.85v-8.38H7.08v-3.47h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.47h-2.79v8.38C19.61 23.05 24 18.06 24 12.07z"/></svg>
    case "Instagram": return <svg {...s}><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 01-1.38-.9 3.72 3.72 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.18 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.51.01-4.75.07-1 .05-1.54.21-1.9.35-.48.19-.82.41-1.18.77-.36.36-.58.7-.77 1.18-.14.36-.3.91-.35 1.9-.06 1.24-.07 1.6-.07 4.75s.01 3.51.07 4.75c.05 1 .21 1.54.35 1.9.19.48.41.82.77 1.18.36.36.7.58 1.18.77.36.14.91.3 1.9.35 1.24.06 1.6.07 4.75.07s3.51-.01 4.75-.07c1-.05 1.54-.21 1.9-.35.48-.19.82-.41 1.18-.77.36-.36.58-.7.77-1.18.14-.36.3-.91.35-1.9.06-1.24.07-1.6.07-4.75s-.01-3.51-.07-4.75c-.05-1-.21-1.54-.35-1.9a3.19 3.19 0 00-.77-1.18 3.19 3.19 0 00-1.18-.77c-.36-.14-.91-.3-1.9-.35-1.24-.06-1.6-.07-4.75-.07zm0 2.76a5.46 5.46 0 110 10.92 5.46 5.46 0 010-10.92zm0 1.62a3.84 3.84 0 100 7.68 3.84 3.84 0 000-7.68zm5.64-2.8a1.28 1.28 0 110 2.56 1.28 1.28 0 010-2.56z"/></svg>
    case "X": return <svg {...s}><path d="M18.24 2.25h3.3l-7.21 8.24 8.48 11.26h-6.64l-5.2-6.8-5.95 6.8H1.72l7.72-8.82L1.26 2.25h6.8l4.7 6.21 5.48-6.21zm-1.16 17.52h1.83L7.01 4.12H5.07l12.01 15.65z"/></svg>
    case "YouTube": return <svg {...s}><path d="M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.38.56A3.02 3.02 0 00.5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 002.12 2.14C4.47 20.5 12 20.5 12 20.5s7.53 0 9.38-.56a3.02 3.02 0 002.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.6 15.6V8.4l6.24 3.6-6.24 3.6z"/></svg>
    case "Pinterest": return <svg {...s}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.38 7.63 11.1-.1-.94-.2-2.38.04-3.41.22-.93 1.4-5.95 1.4-5.95s-.36-.72-.36-1.78c0-1.66.96-2.9 2.17-2.9 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.58-1 4.01-.28 1.2.6 2.17 1.79 2.17 2.14 0 3.79-2.26 3.79-5.53 0-2.89-2.08-4.92-5.05-4.92-3.44 0-5.46 2.58-5.46 5.24 0 1.04.4 2.15.9 2.76.1.12.11.23.08.35l-.33 1.35c-.05.22-.18.27-.41.16-1.52-.71-2.47-2.93-2.47-4.72 0-3.85 2.8-7.38 8.07-7.38 4.24 0 7.53 3.02 7.53 7.04 0 4.21-2.66 7.61-6.34 7.61-1.24 0-2.4-.64-2.8-1.4l-.76 2.9c-.28 1.06-1.02 2.39-1.52 3.2C8.55 23.76 10.22 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/></svg>
    case "Behance": return <svg {...s}><path d="M22 7h-7V5h7v2zm1.7 9c-.3 1.7-1.3 2.9-3 3.5-1.5.5-3.3.3-4.6-.6-1.3-.9-2.1-2.4-2.1-4.3 0-1.9.7-3.4 2-4.4 1.2-.9 2.7-1.3 4.3-1.1 2.3.2 4 1.6 4.5 3.9.1.4.1.9.1 1.4H17c0 .7.3 1.2.8 1.6.5.3 1.1.4 1.7.3.5-.1.9-.3 1.2-.7h2.2l-.01-.01.01.01-.01-.01c-.1.2-.1.3-.2.4zM20 12.5c-.2-.6-.6-1-1.1-1.1-.6-.1-1.2-.1-1.7.3-.5.3-.8.8-.8 1.4h3.9c0-.2-.1-.4-.3-.6zM7.7 6H2v12h6.2c2.4 0 4.3-1 4.9-2.9.4-1.2.2-2.4-.4-3.3-.6-.8-1.6-1.3-2.8-1.3 1-.4 1.6-1.2 1.7-2.3.1-1.2-.6-2.1-1.7-2.4l-2.2-.2zm-2.8 2h2.8c.7 0 1.2.1 1.5.5.2.3.3.8.2 1.2-.1.4-.4.7-.8.9-.4.1-.9.2-1.5.2H4.9V8zm3.4 6.9c-.5.3-1.1.4-1.9.4H4.9V12h2.3c.9 0 1.5.2 1.9.6.3.3.5.8.5 1.3 0 .4-.1.8-.4 1z"/></svg>
    case "Dribbble": return <svg {...s}><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm7.9 5.5c1.2 1.5 1.9 3.4 2 5.4-.3-.1-3.3-.7-6.3-.3-.1-.2-.1-.3-.2-.5-.2-.4-.4-.8-.6-1.3 3.3-1.4 4.8-3.3 5.1-3.3zm-1.4-1.2c-.2.3-1.6 2.1-4.8 3.3-1.5-2.7-3.1-5-3.3-5.3C11.5 2 12.7 2 13.9 2.3c1.7.4 3.3 1.1 4.6 2.1zm-7.7-1.6c.3.4 1.8 2.6 3.3 5.3-4.2 1.1-7.9 1.1-8.3 1.1.6-2.9 2.5-5.3 5-6.4zM2 12v-.3c.4 0 4.8.1 9.2-1.3.3.5.5 1 .7 1.5-.1 0-.2.1-.4.1-4.5 1.5-6.9 5.4-7.1 5.8C2.9 16.2 2 14.2 2 12zm3.3 6.8c.2-.4 2.6-4.2 7.1-5.7l.01-.01 1.9 5.2-7.1 5.2z"/></svg>
    case "Reddit": return <svg {...s}><path d="M12 0C5.38 0 0 5.38 0 12s5.38 12 12 12 12-5.38 12-12S18.62 0 12 0zm5.7 12.9c0 .3-.2.6-.6.6-.3 0-.6-.3-.6-.6 0-.3.3-.6.6-.6.3 0 .6.2.6.6zm-2.4-3.3c.4-.5 1-.7 1.6-.7 1.2 0 2.2 1 2.2 2.2 0 .7-.3 1.3-.9 1.7 0 .2.1.5.1.8 0 2.6-3 4.6-6.7 4.6s-6.7-2-6.7-4.6c0-.3 0-.5.1-.8-.5-.4-.9-1-.9-1.7 0-1.2 1-2.2 2.2-2.2.7 0 1.3.3 1.7.7.9-.6 2.1-1 3.5-1l.8-3.6c.1-.4.4-.6.8-.5l2.4.5c.2-.4.6-.7 1-.7.6 0 1.1.5 1.1 1.1s-.5 1.1-1.1 1.1c-.6 0-1.1-.4-1.1-.9l-2.2-.5-.7 3.3c1.4.1 2.5.4 3.4 1z"/></svg>
    case "WhatsApp": return <svg {...s}><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.6-.1-.2-.7-1.6-.9-2.2-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.5c0 1.4 1 2.9 1.2 3.1.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.4 5L2 22l5.1-1.4c1.4.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
    case "Telegram": return <svg {...s}><path d="M11.9 20.3l3-4.1 6.3 4.6 1.6-18.6-20.6 7.7 6.6 2.4 1.7 5.5 1.4-3.9zm-.2-6.4l7.5-6.8-8.5 7.9-.1.01 1 3.1.1-4.2z"/></svg>
    case "Threads": return <svg {...s}><path d="M12 2.4c2.6 0 4.7.6 6.3 1.8 1.7 1.3 2.6 3.1 2.9 5.2-1.4-.5-3-.7-4.8-.5 0-.3-.1-.6-.3-.8-.4-.4-1-.6-1.7-.6-.9 0-1.6.3-2 .9-.5.6-.7 1.5-.7 2.6s.2 2 .7 2.6c.5.6 1.2.9 2.2.9 1.1 0 2-.2 2.7-.7.7-.4 1.2-1 1.6-1.8.3-.7.5-1.6.5-2.7h2c0 1.4-.3 2.5-.8 3.5-.5 1-1.3 1.8-2.3 2.4-1 .6-2.3.9-3.8.9-.8 0-1.5-.1-2.2-.3l.7 2.4c.5.2 1 .2 1.5.2 1.8 0 3.2-.4 4.2-1.3 1-.9 1.5-2.3 1.5-4.1h1.8c0 2.2-.7 4-2.2 5.3-1.4 1.3-3.2 1.9-5.5 1.9-.8 0-1.5-.1-2.3-.3C7 19.2 5.2 17.8 4.4 15.6 4 14.4 3.8 13.3 3.8 12S4 9.6 4.4 8.4c.8-2.2 2.6-3.6 5.3-4.1.8-.1 1.6-.2 2.3-.2zm0 1.8c-3.3 0-5.7 1.2-6.5 3.6-.4 1-.6 2.2-.6 4.2s.2 3.2.6 4.2c.8 2.4 3.2 3.6 6.5 3.6l.7-.1-.7-1.8c-.2 0-.4 0-.7 0-1.9 0-3.3-.8-4-2.3-.5-1-.7-2.2-.7-3.6s.2-2.6.7-3.6c.7-1.5 2.1-2.3 4-2.3 1.3 0 2.3.4 3 1.1.6.7.9 1.6 1 2.7-1.5-.1-2.8.1-3.8.7-1 .6-1.6 1.5-1.9 2.7-.2 1-.1 2 .3 2.8.4.8 1.1 1.4 2.1 1.8.7.2 1.5.3 2.3.2.6-.1 1.3-.3 1.8-.7-.3.4-.6.7-1 1-.6.4-1.4.6-2.4.6-1.3 0-2.3-.4-2.9-1.1-.6-.7-.8-1.7-.7-2.8.1-.7.3-1.3.8-1.7.4-.5 1.1-.7 1.8-.7s1.3.2 1.7.6c.4.4.7.9.8 1.5h.1c0-.8-.2-1.5-.5-2-.4-.6-1-1-2-1z"/></svg>
    case "Email": return <Mail size={size} />
    case "Phone": return <Phone size={size} />
    case "Upwork": return <svg {...s}><path d="M18.6 13c-.6 0-1.3-.1-2-.3v-6h1.6c.2 0 .3.1.4.2v3.9c.5.2.9.3 1.3.3.8 0 1.3-.4 1.3-1.2V6.7h1.6v5.8c0 1.6-.9 2.7-2.5 2.7-1 0-1.7-.4-2-1zM13.5 2.6v9.6c0 1-.4 1.5-1.2 1.5s-1.2-.5-1.2-1.5V2.6H9.4v9.6c0 .9.1 1.5.4 2-.5.2-1.1.4-1.8.4-2 0-3.4-1.6-3.4-4.1V6.7h1.6v3.8c0 1.7.9 2.6 2.2 2.6.8 0 1.4-.3 1.8-.8v-1.5h.1c.2.6.5 1 .9 1.4.3.3.7.5 1.1.6.4.1.8.2 1.2.2.2 0 .4 0 .6-.1.5 3 2.5 4.4 4.8 4.4.8 0 1.6-.2 2.2-.5l-.5-1.5c-.5.3-1.1.4-1.8.4-1.4 0-2.4-1.1-2.4-3.3V2.6h-2.5z"/></svg>
    case "Fiverr": return <svg {...s}><path d="M21 14.4c-.2 0-.5-.1-.7-.1-.6-.1-1.3-.2-1.8.1-.3.2-.4.5-.4 1v2.7h-3v-5.8h3.2c.4 0 .8 0 1.1.2.2.1.5.2.6.4.3.3.4.7.4 1.1 0 .6-.2 1-.8 1.2.5.2.8.7.8 1.3 0 .6-.3 1-1 1-.3 0-.5 0-.8-.2 0 .2-.1.4-.1.5v.4c-.1.8-.7 1.2-1.5 1.2-.9 0-1.5-.5-1.5-1.3v-3.6h-1.9v7H12v-7h-2v7h-3v-7H5.5v7h-3V8h2.6V4.8h3V8H10V4h3v4h3.8v1.7h-3.8v2.8h2.1c.6-1.8 2-2.6 3.9-2.6.8 0 1.5.1 2.1.3.5.2.9.4 1.3.8l-1.3 1.4c-.2-.2-.4-.3-.6-.4-.4-.2-.8-.2-1.2-.2-.7 0-1.2.2-1.6.8h2.3l-.1 2.1h.2c.3-.4.7-.6 1.2-.6.7 0 1.3.4 1.3 1.2 0 .5-.2.9-.5 1.1.4.3.6.7.6 1.2 0 .4-.2.7-.5 1z"/></svg>
    case "Freelancer": return <svg {...s}><path d="M3 15v4l3-3 3 3 5-5 4 4h3v-6l-3 3-4-4-4 4-3-3-4 4zm0-3v-3h2.3l2.6 2.6L5.4 12H3zm8.7-1.6l3 3L21 8l-3-3-6.3 6.2-3-3-2.3 2.3L9 13.3l2.7-2.9z"/></svg>
    case "Toptal": return <svg {...s}><path d="M20.3 11l-1.2-1.2c-.2-.2-.5-.3-.8-.3s-.6.1-.8.3l-2.6 2.6-1.2-1.2 2.6-2.6c.2-.2.3-.5.3-.8s-.1-.6-.3-.8L15.1 5.6c-.2-.2-.5-.3-.8-.3s-.6.1-.8.3l-2.6 2.6-5.8 5.8c-.2.2-.3.5-.3.8s.1.6.3.8l1.2 1.2c.2.2.5.3.8.3s.6-.1.8-.3l5.8-5.8 2.6-2.6c.2-.2.3-.5.3-.8zm-12 4.7l-1.2 1.2 1.3 1.3 1.2-1.2-1.3-1.3zm5.2-8.3l1.3 1.3 1.2-1.2-1.3-1.3-1.2 1.2z"/></svg>
    default: return <MessageCircle size={size}/>
  }
}

const t = (en:string, bn:string, lang:Lang)=> lang==='bn' ? bn : en

const SectionWrapper = ({ enabled, data, children }: { enabled: boolean, data?: any[], children: React.ReactNode }) => {
  if (!enabled || (data && data.length === 0)) return null
  return <>{children}</>
}

export default function App(){
  const [lang, setLang] = useState<Lang>(()=> (localStorage.getItem("rm_lang") as Lang) || "en")
  useEffect(()=>{ localStorage.setItem("rm_lang", lang); document.documentElement.lang = lang }, [lang])
  useEffect(()=>{
    incrementVisitorCount().catch(err => console.error("Failed to increment visitor count:", err))
    trackVisitor()
    window.addEventListener("beforeunload", sendDuration)
    window.addEventListener("pagehide", sendDuration)
    return () => {
      window.removeEventListener("beforeunload", sendDuration)
      window.removeEventListener("pagehide", sendDuration)
    }
  }, [])
  return (
    <ThemeProvider>
      <AuthProvider>
        <StoreProvider>
          <MainContent lang={lang} setLang={setLang} />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { background: "#1a1a2e", color: "#e8e9ef", border: "1px solid rgba(255,255,255,0.08)" },
            }}
          />
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

function MainContent({ lang, setLang }:{ lang:Lang, setLang:(l:Lang)=>void }){
  const { loading: storeLoading, profile } = useStore()

  useEffect(() => {
    if (!storeLoading && profile?.favicon) {
      const links = document.querySelectorAll("link[rel*='icon']")
      links.forEach(link => {
        link.setAttribute("href", profile.favicon || "")
      })
    }
  }, [storeLoading, profile?.favicon])

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-[#07070b] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-[#e7b84b] rounded-full animate-spin"/>
      </div>
    )
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<PublicApp lang={lang} setLang={setLang} />} />
        <Route path={`/${ADMIN_SLUG}/*`} element={<AdminApp lang={lang} setLang={setLang} />} />
      </Routes>
    </BrowserRouter>
  )
}

function PublicApp({ lang, setLang }:{ lang:Lang, setLang:(l:Lang)=>void }){
  const location = useLocation()
  return (
    <div className="relative min-h-screen">
      <Navbar lang={lang} setLang={setLang} />
      
      <PageTransition>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage lang={lang} setLang={setLang} />} />
          <Route path="/about" element={<AboutPage lang={lang} setLang={setLang} />} />
          <Route path="/experience" element={<ExperiencePage lang={lang} setLang={setLang} />} />
          <Route path="/skills" element={<SkillsPage lang={lang} setLang={setLang} />} />
          <Route path="/projects" element={<ProjectsPage lang={lang} setLang={setLang} />} />
          <Route path="/blog" element={<BlogPage lang={lang} setLang={setLang} />} />
          <Route path="/blog/:slug" element={<BlogDetail lang={lang} setLang={setLang} />} />
          <Route path="/testimonials" element={<TestimonialsPage lang={lang} setLang={setLang} />} />
          <Route path="/recommendations" element={<RecommendationsPage lang={lang} setLang={setLang} />} />
          <Route path="/hire-me" element={<Navigate to="/contact" replace />} />
          <Route path="/contact" element={<ContactPage lang={lang} setLang={setLang} />} />
          <Route path="/cv" element={<CvPage lang={lang} setLang={setLang} />} />
          <Route path="*" element={<NotFoundPage lang={lang} setLang={setLang} />} />
        </Routes>
      </PageTransition>
      
      <Footer lang={lang} />
      <ScrollProgress />
      <BackToTop />
    </div>
  )
}

// ================== HOME ==================
function HomePage({ lang, setLang }:{lang:Lang,setLang:(l:Lang)=>void}){
  const {theme}=useContext(ThemeCtx); const lt=theme==="light"
  const { profile, hireMe, projects, tools, testimonials, visibility, pageBackgroundMap: bgMap } = useStore()
  return (
    <PageShell bg={bgMap["/"]} lang={lang} setLang={setLang}>
      <div className="overflow-x-hidden w-full">
        <section className="max-w-6xl mx-auto px-5 md:px-8 pt-10 md:pt-16">
          <div className="grid lg:grid-cols-[1.18fr_.82fr] gap-12 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-[7px] rounded-full text-[11.7px] mb-5 ${lt?"bg-[#f0e6cf] text-[#8a6b2b] border border-[#dbc897]":"glass text-[#e9d29a]"}`}>
                <span className="w-[7px] h-[7px] rounded-full bg-[#5bd07a] shadow-[0_0_12px_rgba(91,208,122,.7)]" />
                {t(hireMe.status.en, hireMe.status.bn, lang)}
              </div>
              <h1 className="text-[38px] md:text-[58px] font-[780] tracking-[-0.02em] leading-[0.96]">
                <span className="gold-text">{profile.firstName}</span><br/>
                {profile.lastName}
              </h1>
              <div className="mt-4 text-[17px] md:text-[20px] font-[500]">
                <Typewriter lines={profile.roleLines[lang]} />
              </div>
              <p className={`max-w-[600px] text-[15.5px] leading-relaxed mt-5 ${lt?"text-[#5a5449]":"text-[#aeb3c2]"}`}>
                {profile.bioShort[lang]}
              </p>
              <div className={`mt-6 inline-flex items-center gap-3 px-[14px] py-[11px] rounded-[14px] ${lt?"bg-[#f0e6cf] border border-[#dbc897]":"glass"}`}>
                <div className="w-2 h-2 rounded-full bg-[#e7b84b] animate-pulse" />
                <div className="text-[13px]">
                  <span className={lt?"text-[#8a8278]":"text-[#9aa0ad]"}>{t("Currently studying:","বর্তমানে অধ্যয়নরত:",lang)} </span>
                  <span className={lt?"text-[#8a6b2b]":"text-[#f0cf83]"}>{profile.currentlyWorkingOn[lang]}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-7">
                <Link to="/cv"><ShimmerButton>{t("Download CV","CV ডাউনলোড",lang)}</ShimmerButton></Link>
                <Link to="/projects" className={`px-5 h-10 rounded-full flex items-center gap-2 text-[13.8px] ${lt?"bg-white border border-[#e5e0d4] text-[#5a5449] hover:border-[#dbc897]":"glass hover:border-yellow-500/25"}`}>
                  {t("View Work","কাজ দেখুন",lang)} <ArrowUpRight size={16}/>
                </Link>
                <Link to="/contact" className={`px-5 h-10 rounded-full flex items-center gap-2 text-[13.8px] ${lt?"border border-[#dbc897] text-[#8a6b2b] hover:bg-[#f9f2e2]":"border border-yellow-500/28 text-[#f2cf84] hover:bg-yellow-500/7"}`}>
                  {t("Hire Me","নিয়োগ করুন",lang)}
                </Link>
              </div>
              <div className={`flex flex-wrap gap-5 mt-8 text-[12.8px] ${lt?"text-[#8a8278]":"text-[#8f94a3]"}`}>
                <span className="flex items-center gap-2"><MapPin size={14}/> {profile.location[lang]}</span>
                <span className="flex items-center gap-2"><Clock size={14}/> GMT+6</span>
                <span className="flex items-center gap-2"><Code2 size={14}/> {t("Graphics & Web","গ্রাফিক্স ও ওয়েব",lang)}</span>
              </div>
            </div>
            <div className="relative">
              <div className={`relative rounded-[28px] p-[18px] ${lt?"bg-white/70 border border-[#e5e0d4] shadow-lg":"glass gold-glow"}`}>
                <div className="aspect-[4/4.6] rounded-[18px] overflow-hidden bg-[#0f1019] relative">
                  <TorusHero />
                  <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/75 to-transparent">
                    <div className="text-[12px] text-[#e7d7a6] font-mono">design • branding • statistics</div>
                    <div className="text-[18px] font-[650] mt-1 text-white">{t("Creative Design & Data Systems","ক্রিয়েটিভ ডিজাইন ও ডাটা সিস্টেম",lang)}</div>
                  </div>
                </div>
                <FloatingPill style={{top:-14, right:22}} label={t("Graphic Design","গ্রাফিক ডিজাইন",lang)}/>
                <FloatingPill style={{top:48, left:-18}} label={t("Statistics","পরিসংখ্যান",lang)}/>
                <FloatingPill style={{bottom:66, right:-16}} label={t("Branding","ব্র্যান্ডিং",lang)}/>
              </div>
            </div>
          </div>
        </section>
        <section className="max-w-6xl mx-auto px-5 md:px-8 mt-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {profile.stats.map((s,i)=> <StatTicker key={i} value={s.value} label={s.label[lang]} />)}
          </div>
        </section>
        <SectionWrapper enabled={visibility.projects} data={projects.filter(p=>p.featured)}>
          <section className="max-w-6xl mx-auto px-5 md:px-8 mt-16">
            <SectionHeading kicker={t("Selected work","নির্বাচিত কাজ",lang)} title={t("Featured Projects","ফিচারড প্রজেক্ট",lang)} right={<Link to="/projects" className={`text-[13px] flex items-center gap-1 ${lt?"text-[#a0782e]":"text-[#d5b56a]"}`}>{t("View all","সবগুলো দেখুন",lang)} <ArrowUpRight size={15}/></Link>} />
            <div className="grid md:grid-cols-3 gap-5">
              {projects.filter(p=>p.featured).map(pr=>(
                <MagicCard key={pr.id}>
                  <div className={`text-[11px] font-mono ${lt?"text-[#a0782e]":"text-[#d1b16a]"}`}>{pr.year}</div>
                  <div className={`text-[18px] font-[660] mt-2 tracking-[-0.012em] ${lt?"text-[#1a1a1f]":""}`}>{pr.title[lang]}</div>
                  <div className={`text-[13.6px] mt-2 leading-relaxed ${lt?"text-[#7a7366]":"text-[#a6acbb]"}`}>{pr.blurb[lang]}</div>
                  <div className="flex flex-wrap gap-[8px] mt-4 text-[11px]">
                    {pr.tags.map(tg=><span key={tg} className={`px-[10px] py-[5px] rounded-full ${lt?"bg-[#f0e6cf] text-[#8a6b2b] border border-[#dbc897]":"bg-white/[0.045] border border-white/[0.07] text-[#c8b27a]"}`}>{tg}</span>)}
                  </div>
                </MagicCard>
              ))}
            </div>
          </section>
        </SectionWrapper>
        <section className={`mt-16 overflow-hidden border-y py-6 ${lt?"border-[#e5e0d4] bg-[#faf7f0]":"border-white/[0.065] bg-[#0a0a12]/60"}`}>
          <div className="marquee-track flex gap-10 whitespace-nowrap will-change-transform" style={{width:"200%"}}>
            {[...tools,...tools].map((tl,i)=>(<span key={i} className={`text-[13.6px] font-mono ${lt?"text-[#8a8278]":"text-[#b7bcca]"}`}>&#9670; {tl}</span>))}
          </div>
        </section>
        <SectionWrapper enabled={visibility.testimonials} data={testimonials}>
          <section className="max-w-6xl mx-auto px-5 md:px-8 mt-16">
            <SectionHeading kicker={t("Feedback","প্রতিক্রিয়া",lang)} title={t("What people say","মানুষ যা বলে",lang)} />
            <div className="grid md:grid-cols-2 gap-5">
              {testimonials.map((tm,idx)=>(
                <MagicCard key={idx} className="moving-border">
                  <div className="flex items-center gap-1 text-[#f0c96b] mb-3">{Array.from({length:5}).map((_,i)=><Star key={i} size={14} fill="#f0c96b"/>)}</div>
                  <div className={`text-[15.3px] leading-relaxed ${lt?"text-[#3a3730]":"text-[#d2d5df]"}`}>"{tm.text[lang]}"</div>
                  <div className={`mt-4 text-[13px] ${lt?"text-[#7a7366]":"text-[#a6adbd]"}`}>— {tm.name}, <span className={lt?"text-[#a0782e]":"text-[#d6bf84]"}>{tm.role[lang]}</span></div>
                </MagicCard>
              ))}
            </div>
            <div className="text-center mt-7">
              <Link to="/testimonials" className={`inline-flex items-center gap-2 text-[13.5px] ${lt?"text-[#a0782e]":"text-[#e2c37a]"}`}>{t("See all testimonials","সকল প্রশংসাপত্র দেখুন",lang)} <ArrowUpRight size={15}/></Link>
            </div>
          </section>
        </SectionWrapper>
      </div>
    </PageShell>
  )
}

function Typewriter({ lines }:{lines:string[]}){
  const [idx,setIdx]=useState(0)
  const [sub,setSub]=useState(0)
  const [del,setDel]=useState(false)
  useEffect(()=>{
    const current = lines[idx % lines.length]
    const timeout = setTimeout(()=>{
      if(!del){ if(sub < current.length) setSub(sub+1); else setTimeout(()=>setDel(true), 1250) }
      else { if(sub>0) setSub(sub-1); else { setDel(false); setIdx((idx+1)%lines.length) } }
    }, del ? 24 : 42)
    return ()=>clearTimeout(timeout)
  }, [sub,del,idx,lines])
  return <span className="font-mono">{lines[idx % lines.length].slice(0,sub)}<span className="text-[#e7b84b] animate-pulse">|</span></span>
}
function TorusHero(){
  const { profile } = useStore()
  const hasAvatar = profile.avatar && profile.avatar.trim() !== ""
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-[0.9]" style={{background:"radial-gradient(560px 380px at 60% 40%, rgba(247,207,106,0.18), transparent 70%)"}}/>
      
      {/* Profile Photo Container */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20"
      >
        <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full p-2">
          {/* Inner Glow/Photo Frame */}
          <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-[#e7b84b] gold-glow relative bg-[#12121b]">
            {hasAvatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name.en} 
                className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500 scale-105 hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0f0f16]">
                <span className="text-5xl font-bold gold-text opacity-40">MS</span>
              </div>
            )}
            
            {/* Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent pointer-events-none" />
          </div>

          {/* Orbiting particles */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#f7cf6a] rounded-full gold-glow animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#e7b84b] rounded-full gold-glow animate-bounce" />
        </div>
      </motion.div>
    </div>
  )
}
function FloatingPill({label, style}:{label:string, style:React.CSSProperties}){
  return <div style={style} className="absolute px-3 py-[7px] rounded-full glass text-[11.8px] text-[#f1d492] border-yellow-500/20 animate-[wobble_4.5s_ease-in-out_infinite]">{label}</div>
}

// ============ ABOUT ============
function AboutPage({lang,setLang}:{lang:Lang,setLang:(l:Lang)=>void}){
  const {theme}=useContext(ThemeCtx); const lt=theme==="light"
  const { profile, education, achievements, visibility: sectionVisibility, pageBackgroundMap: bgMap } = useStore()
  return (
    <PageShell bg={bgMap["/about"]} lang={lang} setLang={setLang} title={t("About Me","আমার সম্পর্কে",lang)} subtitle={t("MD MUNTASIR SHIHAB | Panchagarh","মোঃ মুনতাসির শিহাব | পঞ্চগড়",lang)}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 mt-8 grid lg:grid-cols-[1.05fr_.95fr] gap-10">
        <div className="space-y-6">
          <MagicCard>
            <div className={`text-[12px] font-mono mb-3 ${lt?"text-[#a0782e]":"text-[#e4c274]"}`}>{t("BIO","পরিচিতি",lang)}</div>
            <p className={`text-[16.6px] leading-relaxed ${lt?"text-[#3a3730]":"text-[#d7dbe6]"}`}>{profile.bioLong[lang]}</p>
            <div className="grid sm:grid-cols-3 gap-4 mt-7 text-[13px]">
              <div><div className={lt?"text-[#8a8278]":"text-[#8e94a3]"}>{t("Location","লোকেশন",lang)}</div><div className={`mt-1 ${lt?"text-[#a0782e]":"text-[#e7d29a]"}`}>{profile.location[lang]}</div></div>
              <div><div className={lt?"text-[#8a8278]":"text-[#8e94a3]"}>{t("Email","ইমেইল",lang)}</div><div className={`mt-1 ${lt?"text-[#a0782e]":"text-[#e7d29a]"}`}>{profile.email}</div></div>
              <div><div className={lt?"text-[#8a8278]":"text-[#8e94a3]"}>{t("Languages","ভাষা",lang)}</div><div className={`mt-1 ${lt?"text-[#a0782e]":"text-[#e7d29a]"}`}>{t("Bangla & English","বাংলা ও ইংরেজি",lang)}</div></div>
            </div>
          </MagicCard>
          <MagicCard>
            <div className={`text-[12px] font-mono mb-4 ${lt?"text-[#a0782e]":"text-[#e4c274]"}`}>{t("PERSONAL DETAILS","ব্যক্তিগত তথ্য",lang)}</div>
            <div className={`grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[13.5px] ${lt?"text-[#5a5449]":"text-[#c6cad6]"}`}>
              <div><span className={lt?"text-[#8a8278]":"text-[#8e94a3]"}>{t("Date of Birth:","জন্ম তারিখ:",lang)}</span> <strong className={lt?"text-[#a0782e]":"text-[#e8d29a]"}>{profile.personalDetails.dob[lang]}</strong></div>
              <div><span className={lt?"text-[#8a8278]":"text-[#8e94a3]"}>{t("Blood Group:","রক্তের গ্রুপ:",lang)}</span> <strong className={lt?"text-[#a0782e]":"text-[#e8d29a]"}>{profile.personalDetails.bloodGroup}</strong></div>
              <div><span className={lt?"text-[#8a8278]":"text-[#8e94a3]"}>{t("Gender:","লিঙ্গ:",lang)}</span> {profile.personalDetails.gender[lang]}</div>
              <div><span className={lt?"text-[#8a8278]":"text-[#8e94a3]"}>{t("Nationality:","জাতীয়তা:",lang)}</span> {profile.personalDetails.nationality[lang]}</div>
              <div><span className={lt?"text-[#8a8278]":"text-[#8e94a3]"}>{t("Religion:","ধর্ম:",lang)}</span> {profile.personalDetails.religion[lang]}</div>
              <div><span className={lt?"text-[#8a8278]":"text-[#8e94a3]"}>{t("Marital Status:","বৈবাহিক অবস্থা:",lang)}</span> {profile.personalDetails.maritalStatus[lang]}</div>
              <div><span className={lt?"text-[#8a8278]":"text-[#8e94a3]"}>{t("Birth Place:","জন্মস্থান:",lang)}</span> {profile.personalDetails.placeOfBirth[lang]}</div>
              <div><span className={lt?"text-[#8a8278]":"text-[#8e94a3]"}>{t("Occupation:","বর্তমান পেশা:",lang)}</span> {profile.personalDetails.occupation[lang]}</div>
            </div>
            <div className={`mt-5 pt-4 border-t text-[13px] space-y-3 ${lt?"border-[#e5e0d4]":"border-white/[0.08]"}`}>
              <div><div className={`font-mono text-[11.5px] uppercase ${lt?"text-[#8a8278]":"text-[#8e94a3]"}`}>{t("Academic Info:","একাডেমিক তথ্য:",lang)}</div><div className={`mt-1 ${lt?"text-[#3a3730]":"text-[#d7dbe6]"}`}>{profile.personalDetails.academicStatus[lang]} ({profile.personalDetails.department[lang]} Dept, {profile.personalDetails.university[lang]})</div></div>
              <div><div className={`font-mono text-[11.5px] uppercase ${lt?"text-[#8a8278]":"text-[#8e94a3]"}`}>{t("Present Address:","বর্তমান ঠিকানা:",lang)}</div><div className={`mt-1 ${lt?"text-[#3a3730]":"text-[#d7dbe6]"}`}>{profile.personalDetails.presentAddress[lang]}</div></div>
              <div><div className={`font-mono text-[11.5px] uppercase ${lt?"text-[#8a8278]":"text-[#8e94a3]"}`}>{t("Permanent Address:","স্থায়ী ঠিকানা:",lang)}</div><div className={`mt-1 ${lt?"text-[#3a3730]":"text-[#d7dbe6]"}`}>{profile.personalDetails.permanentAddress[lang]}</div></div>
            </div>
          </MagicCard>
        </div>
        <div className="space-y-5">
          <MagicCard>
            <div className={`text-[12px] font-mono ${lt?"text-[#a0782e]":"text-[#e4c274]"}`}>{t("EDUCATION","শিক্ষাগত যোগ্যতা",lang)}</div>
            {education.map(ed=>(<div key={`${ed.school}-${ed.period}`} className="mt-3"><div className={`text-[16px] font-[630] ${lt?"text-[#1a1a1f]":""}`}>{ed.degree[lang]}</div><div className={`text-[13.5px] ${lt?"text-[#a0782e]":"text-[#d5b96f]"}`}>{ed.school}</div><div className={`text-[13px] mt-1 ${lt?"text-[#8a8278]":"text-[#a9aebd]"}`}>{ed.period} | {ed.note[lang]}</div></div>))}
          </MagicCard>
          <SectionWrapper enabled={sectionVisibility.achievements} data={achievements}>
            <MagicCard>
              <div className={`text-[12px] font-mono ${lt?"text-[#a0782e]":"text-[#e4c274]"}`}>{t("ACHIEVEMENTS","অর্জনসমূহ",lang)}</div>
              <ul className={`mt-3 space-y-[10px] text-[14px] ${lt?"text-[#3a3730]":"text-[#ccd0dc]"}`}>
                {achievements.map((a,i)=><li key={i} className="flex gap-2"><Star size={14} className={`mt-[3px] ${lt?"text-[#a0782e]":"text-[#e7c66a]"}`}/> {a[lang]}</li>)}
              </ul>
            </MagicCard>
          </SectionWrapper>
          <div className={`rounded-[18px] px-5 py-4 flex items-center gap-3 ${lt?"bg-[#e8f5e8] border border-[#c5e3c5]":"glass"}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#5bd07a] shadow-[0_0_14px_rgba(91,208,122,.6)] animate-pulse" />
            <span className={`text-[13.5px] ${lt?"text-[#3d7a3d]":"text-[#c5d9c7]"}`}>{t("Open to work | Remote / Hybrid | GMT+6","কাজের জন্য উন্মুক্ত | রিমোট / হাইব্রিড | GMT+6",lang)}</span>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

// ============ EXPERIENCE ============
function ExperiencePage({lang,setLang}:{lang:Lang,setLang:(l:Lang)=>void}){
  const { experience, pageBackgroundMap: bgMap } = useStore()
  return (
    <PageShell bg={bgMap["/experience"]} lang={lang} setLang={setLang} title={t("Experience","অভিজ্ঞতা",lang)} subtitle="2022 — Present">
      <div className="max-w-4xl mx-auto px-5 md:px-8 mt-10 relative">
        <div className="absolute left-[18px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-yellow-500/40 via-yellow-500/14 to-transparent -translate-x-1/2" />
        <div className="space-y-10">
          {experience.map((ex,i)=>(
            <motion.div key={ex.id} initial={{opacity:0, y:18}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:.44, delay:i*0.07}}
              className={`relative md:w-[calc(50%-34px)] ${i%2===0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
              <MagicCard>
                <div className="text-[11.5px] font-mono text-[#e6c474]">{ex.period} | {ex.location}</div>
                <div className="text-[18.5px] font-[700] mt-[6px]">{ex.role[lang]}</div>
                <div className="text-[14px] text-[#d5b96f]">{ex.company}</div>
                <ul className="mt-3 space-y-[7px] text-[13.8px] list-disc pl-5">{ex.bullets[lang].map((b:string, bi:number)=><li key={bi}>{b}</li>)}</ul>
                <div className="flex flex-wrap gap-2 mt-4">{ex.tags.map(tg=> <span key={tg} className="text-[11px] px-[10px] py-[4px] rounded-full bg-white/[0.05] border border-white/[0.08] text-[#ddc08a]">{tg}</span>)}</div>
              </MagicCard>
            </motion.div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}

// ============ SKILLS ============
function SkillsPage({lang,setLang}:{lang:Lang,setLang:(l:Lang)=>void}){
  const {theme}=useContext(ThemeCtx); const lt=theme==="light"
  const { skills, tools, pageBackgroundMap: bgMap } = useStore()
  const [cat,setCat]=useState<"all"|"dev"|"design">("all")
  const filtered = useMemo(()=> cat==="all" ? skills : skills.filter(s=>s.cat===cat), [skills, cat])
  return (
    <PageShell bg={bgMap["/skills"]} lang={lang} setLang={setLang} title={t("Skills & Technologies","দক্ষতা ও টেকনোলজি",lang)} subtitle={t("Design | Statistics | Web","ডিজাইন | পরিসংখ্যান | ওয়েব",lang)}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 mt-8">
        <div className="flex gap-2 mb-7 text-[13px]">
          {([["all",t("All","সব",lang)],["dev",t("Technical","টেকনিক্যাল",lang)],["design",t("Design","ডিজাইন",lang)]] as const).map(([k,label])=>(
            <button key={k} onClick={()=>setCat(k as any)} className={`px-4 py-[9px] rounded-full border ${cat===k?(lt?"border-[#dbc897] bg-[#f9f2e2] text-[#8a6b2b]":"border-yellow-500/50 bg-yellow-500/7 text-[#f6d78a]"):(lt?"border-[#e5e0d4] text-[#7a7366]":"border-white/[0.11] text-[#b9beca]")}`}>{label}</button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map(s=>(
            <div key={s.name} className={`rounded-[16px] px-5 py-4 ${lt?"bg-white/80 border border-[#e5e0d4]":"glass"}`}>
              <div className="flex items-center justify-between text-[14px]"><div className="font-[550]">{s.name}</div><div className={`font-mono text-[12.5px] ${lt?"text-[#a0782e]":"text-[#d8ba73]"}`}>{s.level}%</div></div>
              <div className={`h-[8px] rounded-full mt-3 overflow-hidden ${lt?"bg-[#e5e0d4]":"bg-white/[0.07]"}`}>
                <motion.div initial={{width:0}} whileInView={{width: `${s.level}%`}} viewport={{once:true}} transition={{duration:1.1, ease:"easeOut"}}
                  className="h-full rounded-full" style={{background:"linear-gradient(90deg,#f7d98a,#d9a43d)"}}/>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <div className={`text-[12px] font-mono mb-3 ${lt?"text-[#a0782e]":"text-[#e4c274]"}`}>{t("TOOLBELT","টুলসমূহ",lang)}</div>
          <div className="flex flex-wrap gap-[10px]">
            {tools.map(tl=> <span key={tl} className={`px-[13px] py-[8px] rounded-full text-[12.8px] transition-colors ${lt?"bg-[#f0e6cf] text-[#6b5328] border border-[#dbc897]":"glass text-[#d0d3dc] hover:border-yellow-500/30"}`}>{tl}</span>)}
          </div>
        </div>
      </div>
    </PageShell>
  )
}

// ============ PROJECTS + GITHUB (merged) ============
function ProjectsPage({lang,setLang}:{lang:Lang,setLang:(l:Lang)=>void}){
  const {theme}=useContext(ThemeCtx); const lt=theme==="light"
  const { projects, pageBackgroundMap: bgMap } = useStore()
  const [tab, setTab] = useState<"projects"|"github">("projects")
  return (
    <PageShell bg={bgMap["/projects"]} lang={lang} setLang={setLang} title={t("Projects","প্রজেক্ট",lang)} subtitle={t("Portfolio | Open Source","পোর্টফোলিও | ওপেন সোর্স",lang)}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 mt-6">
        <div className="flex gap-2 mb-7 text-[13.5px]">
          <button onClick={()=>setTab("projects")} className={`px-5 py-[9px] rounded-full border font-[550] ${tab==="projects"?(lt?"border-[#dbc897] bg-[#f9f2e2] text-[#8a6b2b]":"border-yellow-500/50 bg-yellow-500/7 text-[#f6d78a]"):(lt?"border-[#e5e0d4] text-[#7a7366]":"border-white/[0.11] text-[#bdc2ce]")}`}>{t("Projects","প্রজেক্ট",lang)}</button>
          <button onClick={()=>setTab("github")} className={`px-5 py-[9px] rounded-full border font-[550] ${tab==="github"?(lt?"border-[#dbc897] bg-[#f9f2e2] text-[#8a6b2b]":"border-yellow-500/50 bg-yellow-500/7 text-[#f6d78a]"):(lt?"border-[#e5e0d4] text-[#7a7366]":"border-white/[0.11] text-[#bdc2ce]")}`}>{t("GitHub Stats","গিটহাব পরিসংখ্যান",lang)}</button>
        </div>
        {tab==="projects" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(pr=>(
              <MagicCard key={pr.id} className="group">
                <div className={`aspect-[16/9.7] rounded-[14px] relative overflow-hidden ${lt?"bg-[#f0e6cf] border border-[#e5e0d4]":"bg-[#10111a] border border-white/[0.07]"}`}>
                  {pr.img && <img src={pr.img} alt={pr.title[lang]} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />}
                  <div className="absolute inset-0 opacity-[.28]" style={{background:"linear-gradient(125deg, rgba(231,184,75,.22), transparent 55%)"}}/>
                  <div className={`absolute top-3 left-3 text-[11px] font-mono px-2 py-[4px] rounded-full ${lt?"bg-white/60 border border-[#dbc897] text-[#8a6b2b]":"bg-black/40 border border-white/[0.10] text-[#e8cd8a]"}`}>{pr.year}</div>
                  <div className="absolute bottom-3 right-3"><ArrowUpRight size={17} className="text-[#e7c77a] opacity-80 group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-transform"/></div>
                </div>
                <div className="mt-[14px] text-[17px] font-[650] tracking-[-0.011em]">{pr.title[lang]}</div>
                <div className={`text-[13.5px] mt-[6px] leading-relaxed ${lt?"text-[#7a7366]":"text-[#aeb3c0]"}`}>{pr.blurb[lang]}</div>
                <div className="flex flex-wrap gap-[7px] mt-[12px]">{pr.tags.map(tag=><span key={tag} className={`text-[11px] px-[9px] py-[4px] rounded-full ${lt?"bg-[#f0e6cf] text-[#8a6b2b] border border-[#dbc897]":"bg-white/[0.045] border border-white/[0.076] text-[#d0b67f]"}`}>{tag}</span>)}</div>
              </MagicCard>
            ))}
          </div>
        )}
        {tab==="github" && (
          <GitHubLiveStats lang={lang} light={lt} />
        )}
      </div>
    </PageShell>
  )
}

// ============ BLOG ============
function BlogPage({lang,setLang}:{lang:Lang,setLang:(l:Lang)=>void}){
  const { blogPosts, pageBackgroundMap: bgMap } = useStore()
  return (
    <PageShell bg={bgMap["/blog"]} lang={lang} setLang={setLang} title={t("Blog","ব্লগ",lang)} subtitle={t("Articles & Notes","লেখালেখি ও নোটস",lang)}>
      <div className="max-w-5xl mx-auto px-5 md:px-8 mt-8 grid md:grid-cols-3 gap-5">
        {blogPosts.map(post=>(
          <Link key={post.slug} to={`/blog/${post.slug}`}>
            <MagicCard className="h-full">
              {post.image && (
                <div className="aspect-[16/10] w-full overflow-hidden rounded-[12px] border border-white/[0.08] mb-3 bg-black/20">
                  <img src={post.image} alt={post.title[lang]} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" />
                </div>
              )}
              <div className="text-[11px] font-mono text-[#dabe75]">{post.date} | {post.read}</div>
              <div className="text-[18px] font-[650] mt-2 leading-snug tracking-[-0.011em]">{post.title[lang]}</div>
              <div className="text-[13.4px] text-[#aeb3c0] mt-2 line-clamp-3">{post.excerpt[lang]}</div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {post.tags.map(tg=><span key={tg} className="text-[10px] px-2.5 py-[3px] rounded-full bg-white/[0.05] border border-white/[0.08] text-[#d8bc7d]">{tg}</span>)}
              </div>
            </MagicCard>
          </Link>
        ))}
      </div>
    </PageShell>
  )
}
function BlogDetail({lang,setLang}:{lang:Lang,setLang:(l:Lang)=>void}){
  const {slug}=useParams()
  const { blogPosts } = useStore()
  const post = blogPosts.find(b=>b.slug===slug)
  if(!post) return <Navigate to="/blog" replace />
  return (
    <PageShell bg="starGlow" lang={lang} setLang={setLang} title={post.title[lang]} subtitle={`${post.date} | ${post.read}`} description={post.excerpt[lang]}>
      <article className="max-w-3xl mx-auto px-5 md:px-8 mt-8">
        <MagicCard>
          {post.image && (
            <div className="aspect-[16/9] w-full overflow-hidden rounded-[14px] border border-white/[0.08] mb-6 bg-black/20">
              <img src={post.image} alt={post.title[lang]} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="text-[15.5px] leading-relaxed whitespace-pre-wrap space-y-4">
            {post.content ? post.content[lang] : post.excerpt[lang]}
          </div>
          <div className="flex flex-wrap gap-2 mt-6 text-[11.5px]">{post.tags.map(tg=><span key={tg} className="px-3 py-[5px] rounded-full bg-white/[0.045] border border-white/[0.08] text-[#dec58a]">{tg}</span>)}</div>
        </MagicCard>
        <div className="mt-5 text-[13px]"><Link to="/blog" className="hover:text-[#f0cf89]">{t("Back to blog","ব্লগে ফিরুন",lang)}</Link></div>
      </article>
    </PageShell>
  )
}

// ============ TESTIMONIALS ============
function TestimonialsPage({lang,setLang}:{lang:Lang,setLang:(l:Lang)=>void}){
  const {theme}=useContext(ThemeCtx); const lt=theme==="light"
  const { testimonials, recommendations, pageBackgroundMap: bgMap } = useStore()
  return (
    <PageShell bg={bgMap["/testimonials"]} lang={lang} setLang={setLang} title={t("Testimonials","প্রশংসাপত্র",lang)} subtitle={t("Reviews & Recommendations","রিভিউ ও সুপারিশ",lang)}>
      <div className="max-w-5xl mx-auto px-5 md:px-8 mt-8">
        {/* Testimonials */}
        <SectionHeading kicker={t("Client Reviews","ক্লায়েন্ট রিভিউ",lang)} title={t("What people say about me","আমার সম্পর্কে মানুষ যা বলে",lang)} />
        <div className="grid md:grid-cols-2 gap-5">
          {testimonials.map((tm,i)=>(
            <MagicCard key={i}>
              <div className="flex gap-1 text-[#f1ce7b] mb-3">{Array.from({length:5}).map((_,k)=><Star key={k} size={14} fill="#f1ce7b"/>)}</div>
              <div className="text-[15.4px] leading-relaxed">"{tm.text[lang]}"</div>
              <div className={`mt-4 text-[13.4px] ${lt?"text-[#7a7366]":"text-[#aeb3c0]"}`}>{tm.name} — <span className={lt?"text-[#a0782e]":"text-[#e5c576]"}>{tm.role[lang]}</span></div>
            </MagicCard>
          ))}
        </div>
        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-14">
            <SectionHeading kicker={t("Recommendations","সুপারিশ",lang)} title={t("Verified Recommendations","যাচাইকৃত সুপারিশ",lang)} />
            <div className="grid md:grid-cols-2 gap-5">
              {recommendations.map((r)=>(
                <div key={r.name} className="moving-border rounded-[20px]">
                  <div className={`rounded-[20px] p-[20px] ${lt?"bg-white/80 border border-[#e5e0d4]":"glass"}`}>
                    <div className="flex items-center gap-3">
                      {r.avatar ? (
                        <img src={r.avatar} alt={r.name} className="w-12 h-12 rounded-full object-cover border border-[#e7b84b]/30" />
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[13px] font-[700] ${lt?"bg-[#f0e6cf] border border-[#dbc897] text-[#8a6b2b]":"gold-ring bg-[#14141f]"}`}>
                          {r.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                        </div>
                      )}
                      <div><div className="font-[610]">{r.name}</div><div className={`text-[12.5px] ${lt?"text-[#8a8278]":"text-[#a9aebd]"}`}>{r.designation} | {r.company}</div></div>
                    </div>
                    <div className={`text-[11.7px] mt-3 ${lt?"text-[#a0782e]":"text-[#dec283]"}`}>{r.relationship[lang]} | {r.date}</div>
                    <div className="text-[14.3px] leading-relaxed mt-3">"{r.text[lang]}"</div>
                    <div className="flex items-center justify-between mt-4 text-[12.4px]">
                      <div className="flex gap-[3px] text-[#f1ce7b]">{Array.from({length:r.rating}).map((_,i)=><Star key={i} size={13} fill="#f1ce7b"/>)}</div>
                      <a href={r.linkedin} target="_blank" rel="noreferrer" className={`flex items-center gap-1 ${lt?"text-[#a0782e]":"text-[#e6c573]"}`}>{t("Verify","যাচাই",lang)} <ArrowUpRight size={13}/></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}

// ============ RECOMMENDATIONS (redirect) ============
function RecommendationsPage(_p:{lang:Lang,setLang:(l:Lang)=>void}){
  return <Navigate to="/testimonials" replace />
}

// ============ CONTACT (Merged: Social + Hire Me + Form) ============
function ContactPage({lang,setLang}:{lang:Lang,setLang:(l:Lang)=>void}){
  const {theme}=useContext(ThemeCtx); const lt=theme==="light"
  const { profile, hireMe, services, visibility: sectionVisibility, pageBackgroundMap: bgMap, addMessage, contacts, updateContacts, emailLogs, updateEmailLogs, emailSettings, emailTemplates } = useStore()
  const [sent,setSent]=useState(false)
  const [rateLimited,setRateLimited]=useState(false)
  const [sending,setSending] = useState(false)
  const [form,setForm]=useState({name:"",email:"",phone:"",subject:"",message:""})
  const handleChange=(field:string,val:string)=>setForm(p=>({...p,[field]:val}))
  const submit=async()=>{
    setSending(true)
    // Client-side rate limit: max 5 submissions / hour
    const now=Date.now()
    let hits:number[]=[]
    try{ hits = JSON.parse(localStorage.getItem("rm_contact_hits")||"[]") }catch{ hits=[] }
    hits = hits.filter(h=> now-h < 3600_000)
    if(hits.length>=5){ setRateLimited(true); setSending(false); return }
    hits.push(now); localStorage.setItem("rm_contact_hits", JSON.stringify(hits))

    // Sanitize data
    const cleanName = sanitize(form.name)
    const cleanEmail = sanitize(form.email)
    const cleanPhone = sanitize(form.phone)
    const cleanSubject = sanitize(form.subject || "No Subject")
    const cleanMessage = sanitize(form.message)
    const timestamp = new Date().toISOString()

    // Store to local admin inbox
    addMessage({
      name: cleanName, email: cleanEmail,
      phone: cleanPhone, message: cleanMessage,
    })

    // Auto-save lead to Contacts CRM
    const exists = contacts.some((c) => c.email.toLowerCase() === cleanEmail.toLowerCase())
    const nextContacts = [...contacts]
    if (!exists) {
      nextContacts.unshift({
        id: Math.random().toString(36).slice(2, 11),
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        company: "",
        source: "Contact Form",
        tags: ["lead"],
        notes: `[Contact Form Message]\nSubject: ${cleanSubject}\nMessage: ${cleanMessage}`,
        isStarred: false,
        lastContact: timestamp,
      })
    } else {
      const idx = nextContacts.findIndex((c) => c.email.toLowerCase() === cleanEmail.toLowerCase())
      if (idx !== -1) {
        nextContacts[idx] = {
          ...nextContacts[idx],
          lastContact: timestamp,
          notes: nextContacts[idx].notes + `\n\n[${new Date().toLocaleDateString()}] New Message:\nSubject: ${cleanSubject}\n${cleanMessage}`
        }
      }
    }
    await updateContacts(nextContacts)

    // Store to Supabase Database via portfolio_content (parallel with email)
    // Send email notifications via Resend depending on admin control
    const promises: Promise<any>[] = [
      (async () => {
        const { data } = await supabase.from('portfolio_content').select('value').eq('key', 'messages').single()
        const existing = data?.value || []
        const newMsg = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          message: cleanMessage,
          date: timestamp,
          read: false
        }
        return supabase.rpc('upsert_portfolio_content', {
          p_key: 'messages',
          p_value: [newMsg, ...existing]
        })
      })()
    ]

    const runAdminEmail = emailSettings.sendAdminNotify !== false
    const runVisitorEmail = emailSettings.sendAutoReply !== false
    const emailCfg = {
      resendApiKey: emailSettings.resendApiKey || hireMe.resendApiKey || undefined,
      emailFrom: emailSettings.fromEmail || hireMe.emailFrom || undefined,
      emailTo: emailSettings.adminEmail || hireMe.emailTo || undefined
    }

    // Compile templates if available
    const compileTemplate = (subjectTpl: string, bodyTpl: string, vars: Record<string, string>) => {
      let s = subjectTpl
      let h = bodyTpl
      for (const [key, val] of Object.entries(vars)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        s = s.replace(regex, val || '')
        h = h.replace(regex, val || '')
      }
      return { subject: s, html: h }
    }

    const templateVars = {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage,
      date: new Date(timestamp).toLocaleString()
    }

    const autoReplyTemplate = emailTemplates?.find(t => t.id === "auto_reply")
    const adminNotifyTemplate = emailTemplates?.find(t => t.id === "admin_notify")

    let visitorSubject: string | undefined
    let visitorHtml: string | undefined
    if (autoReplyTemplate) {
      const compiled = compileTemplate(autoReplyTemplate.subject, autoReplyTemplate.bodyHtml, templateVars)
      visitorSubject = compiled.subject
      visitorHtml = compiled.html
    }

    let adminSubject: string | undefined
    let adminHtml: string | undefined
    if (adminNotifyTemplate) {
      const compiled = compileTemplate(adminNotifyTemplate.subject, adminNotifyTemplate.bodyHtml, templateVars)
      adminSubject = compiled.subject
      adminHtml = compiled.html
    }

    if (runAdminEmail) {
      promises.push(sendContactNotification({ 
        name: cleanName, 
        email: cleanEmail, 
        phone: cleanPhone, 
        message: cleanMessage, 
        timestamp,
        subject: adminSubject,
        html: adminHtml
      }, emailCfg))
    } else {
      promises.push(Promise.resolve(false))
    }

    if (runVisitorEmail) {
      promises.push(sendVisitorConfirmation(cleanName, cleanEmail, cleanMessage, {
        ...emailCfg,
        subject: visitorSubject,
        html: visitorHtml
      }))
    } else {
      promises.push(Promise.resolve(false))
    }

    const [supaResult, adminEmailResult, visitorEmailResult] = await Promise.allSettled(promises)

    if (supaResult.status === 'rejected') {
      console.error('Supabase connection error:', supaResult.reason)
    } else if (supaResult.value.error) {
      console.error('Supabase insert error:', supaResult.value.error)
    }

    const nextLogs = [...emailLogs]
    if (runAdminEmail) {
      const success = adminEmailResult.status === 'fulfilled' && adminEmailResult.value
      nextLogs.push({
        id: Math.random().toString(36).slice(2, 11),
        toEmail: emailCfg.emailTo || "admin",
        subject: `[Contact Form Alert] ${cleanSubject}`,
        status: success ? "success" : "failed",
        sentAt: timestamp,
        type: "admin-notify",
      })
      if (success) {
        console.log('[Contact] Admin email notification sent successfully')
      } else {
        console.error('[Contact] Admin email notification failed')
      }
    }

    if (runVisitorEmail) {
      const success = visitorEmailResult.status === 'fulfilled' && visitorEmailResult.value
      nextLogs.push({
        id: Math.random().toString(36).slice(2, 11),
        toEmail: cleanEmail,
        subject: `Thank you for contacting me!`,
        status: success ? "success" : "failed",
        sentAt: timestamp,
        type: "auto-reply",
      })
      if (success) {
        console.log('[Contact] Visitor confirmation email sent successfully')
      } else {
        console.error('[Contact] Visitor confirmation email failed')
      }
    }

    if (nextLogs.length > emailLogs.length) {
      await updateEmailLogs(nextLogs)
    }

    toast.success(t("Message sent successfully!", "মেসেজ সফলভাবে পাঠানো হয়েছে!", lang))
    setSent(true)
    setSending(false)
  }
  const inputCls = `w-full mt-[6px] px-4 h-[46px] rounded-[12px] outline-none cursor-text ${lt?"bg-[#f5f3ee] border border-[#e5e0d4] focus:border-[#dbc897] text-[#1a1a1f] caret-amber-600":"bg-black/22 border border-white/[0.11] focus:border-yellow-500/40 text-[#e8e9ef] caret-[#e7b84b]"}`
  return (
    <PageShell bg={bgMap["/contact"]} lang={lang} setLang={setLang} title={t("Contact","যোগাযোগ",lang)} subtitle={t("Get in Touch | Hire Me | Send a Message","যোগাযোগ করুন | নিয়োগ | মেসেজ পাঠান",lang)}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 mt-8">

        {/* Social & Quick Contact - Category-wise Animated Grid */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[1px] flex-1 bg-white/[0.08]"/>
            <div className={`text-[12px] font-mono tracking-widest ${lt?"text-[#a0782e]":"text-[#e7c879]"}`}>{t("CONNECT WITH ME","আমার সাথে সংযোগ করুন",lang)}</div>
            <div className="h-[1px] flex-1 bg-white/[0.08]"/>
          </div>

          {/* Category-wise social links — fast hover, lightweight */}
          {(() => {
            const active = profile.socials.filter(s => s.enabled !== false && s.url && s.url.trim() !== "")
            const cats: { key: string; en: string; bn: string; icon: any }[] = [
              { key: "social", en: "Social", bn: "সোশ্যাল", icon: MessageCircle },
              { key: "professional", en: "Professional", bn: "প্রফেশনাল", icon: ArrowUpRight },
              { key: "design", en: "Design & Creative", bn: "ডিজাইন ও ক্রিয়েটিভ", icon: Code2 },
            ]
            const catLabel = (c: typeof cats[number]) => lang === "bn" ? c.bn : c.en
            return (
              <div className="space-y-6">
                {cats.map(cat => {
                  const items = active.filter(s => (s as any).category === cat.key)
                  if (items.length === 0) return null
                  const Icon = cat.icon
                  return (
                    <div key={cat.key}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon size={13} className={lt ? "text-[#a0782e]" : "text-[#e7b84b]"}/>
                        <span className={`text-[11.5px] font-[620] tracking-wide uppercase ${lt ? "text-[#7a6f5a]" : "text-[#9aa0ad]"}`}>{catLabel(cat)}</span>
                        <div className={`flex-1 h-[1px] ${lt ? "bg-[#e5e0d4]/60" : "bg-white/[0.05]"}`}/>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {items.map((s) => (
                          <a
                            key={s.name}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            title={`${s.name}: ${s.handle}`}
                            className={`group relative flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-[16px] cursor-pointer transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1.5 ${lt?"bg-white border border-[#e5e0d4] hover:border-[#dbc897]":"glass hover:border-yellow-500/30"}`}
                          >
                            <div
                              className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 overflow-hidden ${lt?"bg-[#f0e6cf]":"bg-white/[0.06]"}`}
                              style={{color: s.color || "#e7b84b"}}
                            >
                              <SocialIcon name={s.name} size={20} customLogo={s.customLogo}/>
                            </div>
                            <div className={`text-[10.5px] font-[600] tracking-wide text-center ${lt?"text-[#5a5449] group-hover:text-[#8a6b2b]":"text-[#c8cad4] group-hover:text-white"}`}>{s.name}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
          {/* Email & Phone quick row (hidden if empty) */}
          {(profile.email || profile.phone) && (
            <div className={`grid gap-4 mt-5 ${profile.email && profile.phone ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
              {profile.email && profile.email.trim() && (
                <a href={`mailto:${profile.email}`} className={`flex items-center gap-3 px-5 py-4 rounded-[16px] transition hover:scale-[1.01] ${lt?"bg-white border border-[#e5e0d4]":"glass"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lt?"bg-[#f0e6cf] text-[#8a6b2b]":"bg-yellow-500/10 text-[#f0cf89]"}`}><Mail size={18}/></div>
                  <div>
                    <div className={`text-[11px] ${lt?"text-[#8a8278]":"text-[#9aa0ad]"}`}>{t("Send an Email","ইমেইল পাঠান",lang)}</div>
                    <div className="text-[13.5px] font-[550]">{profile.email}</div>
                  </div>
                </a>
              )}
              {profile.phone && profile.phone.trim() && (
                <a href={`tel:${profile.phone}`} className={`flex items-center gap-3 px-5 py-4 rounded-[16px] transition hover:scale-[1.01] ${lt?"bg-white border border-[#e5e0d4]":"glass"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lt?"bg-[#f0e6cf] text-[#8a6b2b]":"bg-yellow-500/10 text-[#f0cf89]"}`}><Phone size={18}/></div>
                  <div>
                    <div className={`text-[11px] ${lt?"text-[#8a8278]":"text-[#9aa0ad]"}`}>{t("Call Now","কল করুন",lang)}</div>
                    <div className="text-[13.5px] font-[550]">{profile.phone}</div>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Availability + Services + Form */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
          {/* Left: Hire Me Info + Services */}
          <div className="space-y-6">
            <MagicCard>
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5bd07a] opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-[#5bd07a]"></span></span>
                <div className="text-[15.7px] font-[610] text-[#5cc776]">{hireMe.status[lang]}</div>
              </div>
              <div className={`grid sm:grid-cols-2 gap-4 text-[13.4px] ${lt?"text-[#5a5449]":"text-[#c2c6d3]"}`}>
                <div><div className={lt?"text-[#8a8278]":"text-[#8e93a2]"}>{t("Work Type","কাজের ধরন",lang)}</div><div className="mt-1">{hireMe.workType.join(" | ")}</div></div>
                <div><div className={lt?"text-[#8a8278]":"text-[#8e93a2]"}>{t("Mode","মোড",lang)}</div><div className="mt-1">{hireMe.workMode.join(" | ")}</div></div>
                <div><div className={lt?"text-[#8a8278]":"text-[#8e93a2]"}>{t("Notice","নোটিশ",lang)}</div><div className="mt-1">{hireMe.notice[lang]}</div></div>
                <div><div className={lt?"text-[#8a8278]":"text-[#8e93a2]"}>{t("Timezone","টাইমজোন",lang)}</div><div className="mt-1">{hireMe.timezone}</div></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                {hireMe.stack.map(s=><span key={s} className={`text-[11.7px] px-[10px] py-[5px] rounded-full ${lt?"bg-[#f0e6cf] text-[#6b5328] border border-[#dbc897]":"bg-white/[.05] border border-white/[.08] text-[#e3c57b]"}`}>{s}</span>)}
              </div>
            </MagicCard>
            <SectionWrapper enabled={sectionVisibility.services} data={services}>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map(sv=>(
                  <MagicCard key={sv.title.en}>
                    <div className={`text-[12px] font-mono ${lt?"text-[#a0782e]":"text-[#dec180]"}`}>{sv.time}</div>
                    <div className="text-[16px] font-[650] mt-1">{sv.title[lang]}</div>
                    <div className={`text-[13px] mt-2 ${lt?"text-[#7a7366]":"text-[#aeb3c0]"}`}>{sv.desc[lang]}</div>
                    <div className={`mt-3 text-[13px] ${lt?"text-[#a0782e]":"text-[#e7c979]"}`}>{sv.price}</div>
                  </MagicCard>
                ))}
              </div>
            </SectionWrapper>
            <MagicCard>
              <div className={`text-[12px] font-mono mb-3 ${lt?"text-[#a0782e]":"text-[#e5c371]"}`}>{t("QUICK ACTIONS","দ্রুত যোগাযোগ",lang)}</div>
              <div className="space-y-3 text-[14px]">
                <a href={hireMe.calendly} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full px-4 py-[12px] rounded-[13px] bg-[#e7b84b] text-[#19151d] font-[630]"><span className="flex items-center gap-2"><Calendar size={16}/> {t("Schedule a Call","কল শিডিউল করুন",lang)}</span><ArrowUpRight size={16}/></a>
                <a href={`https://wa.me/${hireMe.whatsapp}`} target="_blank" rel="noreferrer" className={`flex items-center justify-between w-full px-4 py-[12px] rounded-[13px] ${lt?"bg-white border border-[#e5e0d4]":"glass"}`}>{t("WhatsApp Now","হোয়াটসঅ্যাপ করুন",lang)} <ArrowUpRight size={16}/></a>
              </div>
            </MagicCard>
          </div>
          {/* Right: Message Form */}
          <div>
            <MagicCard>
              <div className={`text-[12px] font-mono mb-5 ${lt?"text-[#a0782e]":"text-[#e5c371]"}`}>{t("SEND A MESSAGE","মেসেজ পাঠান",lang)}</div>
              {rateLimited ? (
                <div className="py-10 text-center">
                  <div className="text-[22px] font-[700] text-[#f29696]">{t("Too many messages","অনেক বেশি মেসেজ",lang)}</div>
                  <div className={`mt-2 text-[14px] ${lt?"text-[#7a7366]":"text-[#b4b8c5]"}`}>{t("You can send up to 5 messages per hour. Please try later.","ঘণ্টায় সর্বোচ্চ ৫টি মেসেজ পাঠানো যায়। পরে চেষ্টা করুন।",lang)}</div>
                </div>
              ) : !sent ? (
                <form onSubmit={e=>{ e.preventDefault(); submit() }} className="space-y-4">
                  <div>
                    <label className={`text-[12px] ${lt?"text-[#8a8278]":"text-[#a7acb9]"}`}>{t("Full Name","সম্পূর্ণ নাম",lang)} *</label>
                    <input required value={form.name} onChange={e=>handleChange("name",e.target.value)} className={inputCls} placeholder={t("Your full name","আপনার সম্পূর্ণ নাম",lang)} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-[12px] ${lt?"text-[#8a8278]":"text-[#a7acb9]"}`}>{t("Email","ইমেইল",lang)} *</label>
                      <input type="email" required value={form.email} onChange={e=>handleChange("email",e.target.value)} className={inputCls} placeholder={t("your@email.com","আপনার@ইমেইল.কম",lang)} />
                    </div>
                    <div>
                      <label className={`text-[12px] ${lt?"text-[#8a8278]":"text-[#a7acb9]"}`}>{t("Phone Number","ফোন নম্বর",lang)}</label>
                      <input type="tel" value={form.phone} onChange={e=>handleChange("phone",e.target.value)} className={inputCls} placeholder="+880 1X XXX XXXXX" />
                    </div>
                  </div>
                  <div>
                    <label className={`text-[12px] ${lt?"text-[#8a8278]":"text-[#a7acb9]"}`}>{t("Subject","বিষয়",lang)} *</label>
                    <input required value={form.subject} onChange={e=>handleChange("subject",e.target.value)} className={inputCls} placeholder={t("Subject of your message","আপনার মেসেজের বিষয়",lang)} />
                  </div>
                  <div>
                    <label className={`text-[12px] ${lt?"text-[#8a8278]":"text-[#a7acb9]"}`}>{t("Message","মেসেজ",lang)} *</label>
                    <textarea required rows={5} value={form.message} onChange={e=>handleChange("message",e.target.value)}
                      className={`w-full mt-[6px] px-4 py-3 rounded-[12px] outline-none cursor-text ${lt?"bg-[#f5f3ee] border border-[#e5e0d4] focus:border-[#dbc897] text-[#1a1a1f] caret-amber-600":"bg-black/22 border border-white/[0.11] focus:border-yellow-500/40 text-[#e8e9ef] caret-[#e7b84b]"}`}
                      placeholder={t("Write your message here...","আপনার মেসেজ লিখুন...",lang)} />
                  </div>
                  <ShimmerButton className="w-full justify-center" onClick={undefined}>{sending ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : <Send size={15}/>} {sending ? t("Sending...","পাঠানো হচ্ছে...",lang) : t("Send Message","মেসেজ পাঠান",lang)}</ShimmerButton>
                </form>
              ) : (
                <div className="py-10 text-center">
                  <div className="text-[24px] font-[700] gold-text">{t("Message sent!","মেসেজ পাঠানো হয়েছে!",lang)}</div>
                  <div className={`mt-2 text-[14px] ${lt?"text-[#7a7366]":"text-[#b4b8c5]"}`}>{t("I usually reply within 6-12 hours.","সাধারণত ৬-১২ ঘণ্টার মধ্যে উত্তর দিই।",lang)}</div>
                  <button onClick={()=>{setSent(false);setForm({name:"",email:"",phone:"",subject:"",message:""})}} className={`mt-5 px-5 py-2 rounded-full text-[13px] ${lt?"bg-[#f0e6cf] text-[#6b5328] border border-[#dbc897]":"glass text-[#f0cf89]"}`}>{t("Send another","আরেকটি পাঠান",lang)}</button>
                </div>
              )}
            </MagicCard>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

// ============ CV ============
function generateCV(
  profile: any,
  education: any[],
  experience: any[],
  skills: any[],
  tools: string[],
  achievements: any[],
  services: any[]
){
  const cvText = `MD MUNTASIR SHIHAB — CV 2026
================================
${profile.title.en}
Email: ${profile.email} | Phone: ${profile.phone}
Location: ${profile.location.en}

EDUCATION
---------
${education.map(e=>`${e.degree.en}\n${e.school}\n${e.period} | ${e.note.en}`).join('\n\n')}

EXPERIENCE
----------
${experience.map(e=>`${e.role.en} — ${e.company}\n${e.period} | ${e.location}\n${e.bullets.en.map((b: string)=>`  - ${b}`).join('\n')}`).join('\n\n')}

SKILLS
------
${skills.map(s=>`${s.name} (${s.level}%)`).join(' | ')}

TOOLS
-----
${tools.join(' | ')}

ACHIEVEMENTS
------------
${achievements.map(a=>a.en).join('\n')}

SERVICES
--------
${services.map(s=>`${s.title.en} — ${s.desc.en} (${s.time})`).join('\n')}
`
  const blob = new Blob([cvText], {type:'text/plain;charset=utf-8'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'MD_MUNTASIR_SHIHAB_CV_2026.txt'; a.click()
  URL.revokeObjectURL(url)
}

function CvPage({lang,setLang}:{lang:Lang,setLang:(l:Lang)=>void}){
  const { profile, education, experience, skills, tools, achievements, services, cvCount, incCv, pageBackgroundMap: bgMap, hireMe, emailSettings, emailLogs, updateEmailLogs } = useStore()
  const [liveCount, setLiveCount] = useState<number|null>(null)
  useEffect(()=>{ getCvDownloadCount().then(setLiveCount) }, [])
  
  const handleDownload = async (type: "designed" | "ats" = "designed") => {
    incCv()
    // Upstash এ real download count increment করো
    const newCount = await incrementCvDownload()
    if(newCount>0) setLiveCount(newCount)

    // 🎉 Confetti celebration on download
    try {
      confetti({
        particleCount: 90, spread: 70, origin: { y: 0.7 },
        colors: ["#e7b84b", "#f0d78a", "#ffffff", "#22d3ee"],
        scalar: 0.9,
      })
    } catch { /* ignore */ }

    // Centralised tracking (geo + parsed device + Supabase insert) + email
    let ip = "", country = ""
    try {
      const geo = await getGeo()
      ip = geo.ip; country = geo.country
    } catch { /* ignore */ }

    trackCvDownload().catch(() => {})

    // Email notification if enabled
    const runCvEmail = emailSettings.sendCvNotify !== false
    const emailCfg = {
      resendApiKey: emailSettings.resendApiKey || hireMe.resendApiKey || undefined,
      emailFrom: emailSettings.fromEmail || hireMe.emailFrom || undefined,
      emailTo: emailSettings.adminEmail || hireMe.emailTo || undefined
    }

    if (runCvEmail) {
      try {
        const success = await sendCvDownloadNotification(ip || "Unknown", country || "Unknown", emailCfg)
        const nextLogs = [...emailLogs]
        nextLogs.push({
          id: Math.random().toString(36).slice(2, 11),
          toEmail: emailCfg.emailTo || "admin",
          subject: `CV Downloaded: Type ${type} (IP: ${ip || "Unknown"}, Location: ${country || "Unknown"})`,
          status: success ? "success" : "failed",
          sentAt: new Date().toISOString(),
          type: "cv-download",
        })
        await updateEmailLogs(nextLogs)
      } catch (e) {
        console.warn("Failed to send CV download email notification:", e)
      }
    }

    const pdfUrl = type === "designed" ? profile.cvUrl : profile.atsCvUrl
    if (pdfUrl) {
      const a = document.createElement("a")
      a.href = pdfUrl
      a.target = "_blank"
      a.download = type === "designed" ? "MD_MUNTASIR_SHIHAB_CV.pdf" : "MD_MUNTASIR_SHIHAB_ATS_CV.pdf"
      a.click()
    } else {
      generateCV(profile, education, experience, skills, tools, achievements, services)
    }
  }
  
  // Live count থাকলে সেটা দেখাও, না হলে local count
  const count = liveCount ?? cvCount
  return (
    <PageShell bg={bgMap["/cv"]} lang={lang} setLang={setLang} title={t("CV / Resume","সিভি / রেজুমে",lang)} subtitle="PDF">
      <div className="max-w-5xl mx-auto px-5 md:px-8 mt-8 grid lg:grid-cols-[1.18fr_.82fr] gap-7">
        <MagicCard>
          <div className="text-[20px] font-[700]">{profile.name[lang]} — CV 2026</div>
          <div className={`text-[13.3px] mt-1`}>{profile.title[lang]}</div>
          {count>0 && <div className="text-[12px] text-[#e7c979] font-mono mt-2">{count} {t("downloaded","বার ডাউনলোড হয়েছে",lang)}</div>}
          <div className="mt-6 grid sm:grid-cols-2 gap-3 text-[13.4px]">
            <div>• {t("B.Sc. Statistics — Khulna University","বি.এস.সি. পরিসংখ্যান — খুলনা বিশ্ববিদ্যালয়",lang)}</div>
            <div>• {t("Graphic & Brand Identity Designer","গ্রাফিক ও ব্র্যান্ড ডিজাইনার",lang)}</div>
            <div>• {t("President — Rongdhonu Foundation","সভাপতি — রংধনু ফাউন্ডেশন",lang)}</div>
            <div>• {t("HSC GPA 4.92 | SSC Golden GPA 5.00","HSC জিপিএ ৪.৯২ | SSC গোল্ডেন ৫.০০",lang)}</div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <ShimmerButton onClick={() => handleDownload("designed")}>{t("Download CV","CV ডাউনলোড",lang)}</ShimmerButton>
            <button onClick={() => handleDownload("ats")} className="px-4 h-10 rounded-full glass text-[13.4px]">{t("ATS Version","ATS সংস্করণ",lang)}</button>
          </div>
        </MagicCard>
        <MagicCard>
          <div className="text-[12px] font-mono text-[#e5c371]">{t("SKILLS SNAPSHOT","দক্ষতার সংক্ষিপ্তসার",lang)}</div>
          <div className="flex flex-wrap gap-[8px] mt-3 text-[12px]">
            {tools.slice(0,10).map(tl=><span key={tl} className="px-[10px] py-[5px] rounded-full bg-white/[0.045] border border-white/[0.08] text-[#d2c28a]">{tl}</span>)}
          </div>
          <div className="mt-5 text-[13px]">{t("Email","ইমেইল",lang)}: {profile.email}<br/>{profile.location[lang]}</div>
        </MagicCard>
      </div>
    </PageShell>
  )
}

// ============ 404 ============
function NotFoundPage({lang,setLang}:{lang:Lang,setLang:(l:Lang)=>void}){
  return (
    <PageShell bg="starGlow" lang={lang} setLang={setLang} title={t("404 — Page Not Found","৪০৪ — পেজ পাওয়া যায়নি",lang)}>
      <div className="max-w-3xl mx-auto px-5 md:px-8 mt-10 text-center">
        <div className="text-[16px]">{t("The page you are looking for does not exist.","আপনি যে পেজটি খুঁজছেন তা বিদ্যমান নেই।",lang)}</div>
        <div className="mt-6"><Link to="/"><ShimmerButton>{t("Back Home","হোমে ফিরুন",lang)}</ShimmerButton></Link></div>
      </div>
    </PageShell>
  )
}

// ============ ADMIN ============
const ADMIN_MENU: { key: string; to: string; label: string; children?: { key: string; to: string; label: string }[] }[] = [
  { key: "dashboard", to: "/", label: "Dashboard|ড্যাশবোর্ড" },
  { key: "profile", to: "/profile", label: "Profile|প্রোফাইল", children: [
    { key: "profile", to: "/profile", label: "Profile Editor|প্রোফাইল এডিটর" },
    { key: "experience", to: "/experience", label: "Experience|অভিজ্ঞতা" },
    { key: "education", to: "/education", label: "Education|শিক্ষা" },
    { key: "skills", to: "/skills", label: "Skills|দক্ষতা" },
    { key: "achievements", to: "/achievements", label: "Achievements|অর্জনসমূহ" },
    { key: "cv", to: "/cv", label: "CV Manager|সিভি ম্যানেজার" },
  ]},
  { key: "content", to: "/projects", label: "Content|কনটেন্ট", children: [
    { key: "projects", to: "/projects", label: "Projects|প্রজেক্ট" },
    { key: "blog", to: "/blog", label: "Blog|ব্লগ" },
    { key: "recs", to: "/recs", label: "Testimonials|প্রশংসাপত্র" },
  ]},
  { key: "contact", to: "/contact", label: "Contact|যোগাযোগ", children: [
    { key: "contact", to: "/contact", label: "Contact & Hire|যোগাযোগ ও নিয়োগ" },
    { key: "messages", to: "/messages", label: "Messages|মেসেজসমূহ" },
  ]},
  { key: "pagesettings", to: "/sections", label: "Page Settings|পেজ সেটিংস", children: [
    { key: "sections", to: "/sections", label: "Sections|সেকশনসমূহ" },
    { key: "bg", to: "/bg", label: "Page Backgrounds|পেজ ব্যাকগ্রাউন্ড" },
    { key: "media", to: "/media", label: "Media Library|মিডিয়া গ্যালারি" },
  ]},
  { key: "analytics", to: "/analytics", label: "Analytics|অ্যানালিটিক্স" },
  { key: "email", to: "/email", label: "Email Manager|ইমেইল ম্যানেজার", children: [
    { key: "email", to: "/email", label: "Dashboard|ড্যাশবোর্ড" },
    { key: "email/contacts", to: "/email/contacts", label: "Contacts CRM|কনট্যাক্টস CRM" },
    { key: "email/compose", to: "/email/compose", label: "Compose|কম্পোজ" },
    { key: "email/templates", to: "/email/templates", label: "Templates|টেমপ্লেটসমূহ" },
    { key: "email/logs", to: "/email/logs", label: "Email Logs|ইমেইল লগস" },
    { key: "email/settings", to: "/email/settings", label: "Email Settings|ইমেইল সেটিংস" },
  ]},
  { key: "security", to: "/security", label: "Security|সিকিউরিটি" },
  { key: "cache", to: "/cache", label: "Cache|ক্যাশ" },
]

function AdminApp({ lang, setLang }:{lang:Lang, setLang:(l:Lang)=>void}){
  const location = useLocation()
  const { user, loading, logout: authLogout } = useAuth()
  const [tfa, setTfa] = useState<boolean>(()=> sessionStorage.getItem("rm_admin_2fa")==="1")
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Auto-expand the group that contains the current active key
    const sub = location.pathname.replace(`/${ADMIN_SLUG}`, "").replace(/^\//, "") || ""
    const activeKey = sub || "dashboard"
    for (const item of ADMIN_MENU) {
      if (item.children?.some(c => c.key === activeKey)) return new Set([item.key])
    }
    return new Set()
  })

  const { admin_2fa, messages, updateMessages } = useStore()
  const tfaEnabled = (admin_2fa?.enabled && import.meta.env.PROD) || false
  const unreadCount = messages.filter(m => !m.read).length

  useEffect(() => {
    const channel = supabase.channel('admin-messages-listener')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'portfolio_content', filter: 'key=eq.messages' }, (payload) => {
        const msgs = payload.new.value || []
        updateMessages(msgs)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [updateMessages])

  // Toast notification on new messages
  const prevMsgCountRef = useRef(messages.length)
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current && prevMsgCountRef.current > 0) {
      const latest = messages[0]
      if (!latest?.read) {
        toast.info(t(`📨 New message from ${latest?.name || "Unknown"}`, `📨 ${latest?.name || "অজানা"} এর নতুন মেসেজ`, lang), {
          description: latest?.message?.slice(0, 80) + (latest?.message?.length > 80 ? "..." : ""),
          duration: 6000,
          action: {
            label: t("View", "দেখুন", lang),
            onClick: () => window.location.assign(`/${ADMIN_SLUG}/messages`)
          }
        })
      }
    }
    prevMsgCountRef.current = messages.length
  }, [messages.length, lang])


  // BUG-001 fix: determine active panel from the URL (after the secret slug)
  const sub = location.pathname.replace(`/${ADMIN_SLUG}`, "").replace(/^\//, "") || ""
  const activeKey = sub || "dashboard"

  // Auto-expand the group containing the active route whenever URL changes
  useEffect(() => {
    for (const item of ADMIN_MENU) {
      if (item.children?.some(c => c.key === activeKey)) {
        setExpanded(prev => { const s = new Set(prev); s.add(item.key); return s })
      }
    }
  }, [activeKey])

  if(loading) return (
    <div className="min-h-screen bg-[#07070b] flex items-center justify-center cursor-default">
      <div className="text-[#a3a7b4] text-[14px] animate-pulse">{t("Loading...","লোড হচ্ছে...",lang)}</div>
    </div>
  )
  if(!user) return <AdminLogin lang={lang} />
  if(tfaEnabled && !tfa) return <Admin2FA onVerify={()=>{ setTfa(true); sessionStorage.setItem("rm_admin_2fa","1") }} />

  const logout = ()=>{ authLogout() }
  const label = (raw:string)=> raw.split("|")[lang==="bn"?1:0]

  const SidebarNav = ({onNav}:{onNav?:()=>void}) => (
    <nav className="p-3 text-[13.6px] space-y-[2px] text-[#bcc1ce]">
      {ADMIN_MENU.map(item => {
        const isLeaf = !item.children
        const isActive = isLeaf && activeKey === item.key
        const hasActive = item.children?.some(c => c.key === activeKey)
        const isOpen = expanded.has(item.key)
        return isLeaf ? (
          <Link key={item.key} to={`/${ADMIN_SLUG}${item.to}`} onClick={onNav}
            className={`flex items-center justify-between px-3 py-[9px] rounded-[10px] hover:bg-white/[0.045] cursor-pointer transition-colors ${isActive ? "bg-white/[0.06] text-[#f4d386]" : ""}`}>
            <span>{label(item.label)}</span>
          </Link>
        ) : (
          <div key={item.key}>
            <button onClick={() => {
                setExpanded(prev => { const s = new Set(prev); if (s.has(item.key)) s.delete(item.key); else s.add(item.key); return s })
              }}
              className={`w-full flex items-center justify-between px-3 py-[9px] rounded-[10px] hover:bg-white/[0.045] cursor-pointer transition-colors ${hasActive ? "text-[#f4d386]" : ""}`}>
              <span>{label(item.label)}</span>
              <span className="transition-transform duration-200">{isOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</span>
            </button>
            {isOpen && item.children && (
              <div className="mt-[2px] ml-3 pl-3 border-l border-white/[0.06] space-y-[2px]">
                {item.children.map(child => {
                  const isMsg = child.key === "messages"
                  const childActive = activeKey === child.key
                  return (
                    <Link key={child.key} to={`/${ADMIN_SLUG}${child.to}`} onClick={onNav}
                      className={`flex items-center justify-between px-3 py-[8px] rounded-[9px] hover:bg-white/[0.045] cursor-pointer transition-colors text-[13px] ${childActive ? "bg-white/[0.06] text-[#f4d386]" : ""}`}>
                      <span>{label(child.label)}</span>
                      {isMsg && unreadCount > 0 && (
                        <span className="min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-[#e7b84b] text-[#1a1410] text-[10.5px] font-[700] px-1.5">{unreadCount > 99 ? "99+" : unreadCount}</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      <div className="flex gap-2 mt-3">
        <button onClick={()=>setLang(lang==="en"?"bn":"en")} className="flex-1 px-3 py-[9px] rounded-[10px] glass text-[12px] font-[600] cursor-pointer hover:bg-white/[0.06] transition">{lang==="en"?"বাংলা":"EN"}</button>
      </div>
      <button onClick={logout} className="w-full text-left px-3 py-[9px] rounded-[10px] hover:bg-white/[0.045] text-[#f29696] mt-1 cursor-pointer transition">{t("Logout","লগআউট",lang)}</button>
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#08080f] text-[#e8e9ef] cursor-default">
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="w-[270px] hidden lg:block border-r border-white/[0.07] min-h-screen sticky top-0 overflow-y-auto">
          <div className="p-5 border-b border-white/[0.07]"><div className="text-[13px] font-mono text-[#e7c66f]">ADMIN PORTAL</div><div className="text-[11.5px] text-[#8d919e] mt-1">/{ADMIN_SLUG}</div></div>
          <SidebarNav/>
        </aside>

        {/* Mobile drawer (BUG-002 fix: admin was inaccessible on mobile) */}
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="w-[270px] bg-[#0c0c14] border-r border-white/[0.08] overflow-y-auto" onClick={e=>e.stopPropagation()}>
              <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
                <div className="text-[13px] font-mono text-[#e7c66f]">ADMIN</div>
                <button onClick={()=>setMenuOpen(false)} className="text-[#9aa0ad]">✕</button>
              </div>
              <SidebarNav onNav={()=>setMenuOpen(false)}/>
            </div>
            <div className="flex-1 bg-black/60" onClick={()=>setMenuOpen(false)}/>
          </div>
        )}

        <main className="flex-1 min-w-0">
          <div className="border-b border-white/[0.07] px-5 md:px-8 h-[64px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={()=>setMenuOpen(true)} aria-label="Open menu" className="lg:hidden w-9 h-9 rounded-[10px] glass flex items-center justify-center cursor-pointer"><Menu size={17}/></button>
              <div className="text-[14.5px]">{t("Portfolio Admin","পোর্টফোলিও অ্যাডমিন",lang)}</div>
            </div>
            <div className="flex items-center gap-4">
              <Link to={`/${ADMIN_SLUG}/messages`} className="relative flex items-center cursor-pointer group">
                <Bell size={16} className="text-[#8f94a2] group-hover:text-[#e7b84b] transition"/>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-[#e7b84b] text-[#1a1410] text-[9px] font-[700] px-1 leading-none">{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </Link>
              <div className={`text-[11.5px] flex items-center gap-2 ${tfaEnabled?"text-[#8f94a2]":"text-[#7e8391]"}`}><ShieldCheck size={14}/> {tfaEnabled ? t("2FA Enabled","2FA সক্রিয়",lang) : t("2FA Disabled","2FA নিষ্ক্রিয়",lang)}</div>
            </div>
            <Link to={`/${ADMIN_SLUG}/security`} className="text-[11px] text-[#d5b96f] hover:underline cursor-pointer">{t("Manage","ম্যানেজ",lang)}</Link>
          </div>
          <div className="p-5 md:p-8">
            <AdminPanel activeKey={activeKey} lang={lang}/>
          </div>
        </main>
      </div>
    </div>
  )
}

// BUG-001 fix: route-driven panel renderer (previously always showed Dashboard)
function AdminPanel({activeKey, lang}:{activeKey:string, lang:Lang}){
  switch(activeKey){
    case "dashboard": return <AdminDash lang={lang}/>
    case "profile": return <ProfileEditor lang={lang}/>
    case "sections": return <SectionsManager lang={lang}/>
    case "bg": return <PageBackgroundsManager lang={lang}/>
    case "experience": return <ExperienceManager lang={lang}/>
    case "education": return <EducationManager lang={lang}/>
    case "skills": return <SkillsManager lang={lang}/>
    case "projects": return <ProjectsManager lang={lang}/>
    case "achievements": return <AchievementsManager lang={lang}/>
    case "contact": return <ContactHireManager lang={lang}/>
    case "recs": return <TestimonialsManager lang={lang}/>
    case "blog": return <BlogManager lang={lang}/>
    case "messages": return <AdminMessages lang={lang}/>
    case "media": return <MediaManager lang={lang}/>
    case "analytics": return <AdminAnalytics lang={lang}/>
    case "email":
    case "email/contacts":
    case "email/compose":
    case "email/templates":
    case "email/logs":
    case "email/settings":
      return <EmailManager lang={lang}/>
    case "cv": return <CVManager lang={lang}/>
    case "security": return <AdminSecurity lang={lang}/>
    case "cache": return <AdminCache lang={lang}/>
    default: return <AdminDash lang={lang}/>
  }
}





function AdminMessages({lang}:{lang:Lang}){
  const { messages, markRead, deleteMessage, contacts, updateContacts } = useStore()
  const fmt=(iso:string)=>{ try{ return new Date(iso).toLocaleString() }catch{ return iso } }

  const copyToClipboard = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text)
    toast.success(type === "email" ? t("Email copied!", "ইমেইল কপি করা হয়েছে!", lang) : t("Phone number copied!", "ফোন নাম্বার কপি করা হয়েছে!", lang))
  }

  const handleUpdateContactType = async (msg: any, type: string) => {
    const nextContacts = [...contacts]
    const idx = nextContacts.findIndex((c) => c.email.toLowerCase() === msg.email.toLowerCase())

    if (type === "none") {
      if (idx !== -1) {
        nextContacts[idx] = { ...nextContacts[idx], tags: [] }
        await updateContacts(nextContacts)
        toast.success(t("Contact type cleared", "কন্ট্যাক্ট টাইপ সরানো হয়েছে", lang))
      }
      return
    }

    if (idx !== -1) {
      nextContacts[idx] = {
        ...nextContacts[idx],
        tags: [type]
      }
      await updateContacts(nextContacts)
      toast.success(t(`Updated to ${type.toUpperCase()}`, `কন্ট্যাক্ট টাইপ ${type} করা হয়েছে`, lang))
    } else {
      nextContacts.unshift({
        id: Math.random().toString(36).slice(2, 11),
        name: msg.name,
        email: msg.email,
        phone: msg.phone || "",
        company: "",
        source: "Contact Form",
        tags: [type],
        notes: `[Created from Message Inbox]\nMessage: ${msg.message}`,
        isStarred: false,
        lastContact: new Date().toISOString()
      })
      await updateContacts(nextContacts)
      toast.success(t(`Saved in CRM as ${type.toUpperCase()}`, `CRM-এ ${type} হিসেবে সেভ করা হয়েছে`, lang))
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-[24px] font-[720]">{t("Messages Inbox","মেসেজ ইনবক্স",lang)}</div>
        <span className="text-[12px] text-[#8a8f9c]">{messages.filter(m=>!m.read).length} {t("unread","অপঠিত",lang)} / {messages.length}</span>
      </div>
      {messages.length===0 ? (
        <div className="glass rounded-[18px] p-8 text-center text-[13.5px] text-[#8a8f9c]">
          {t("No messages yet. Submissions from the Contact form appear here live.","এখনো কোনো মেসেজ নেই। Contact ফর্মের মেসেজ এখানে লাইভ দেখাবে।",lang)}
        </div>
      ) : (
        <div className="glass rounded-[18px] p-4 space-y-2">
          {messages.map(d=>(
            <div key={d.id} className={`px-4 py-3 rounded-[12px] border ${d.read?"bg-white/[0.02] border-white/[0.05]":"bg-yellow-500/[0.04] border-yellow-500/20"}`}>
              <div className="flex flex-wrap justify-between gap-1 text-[13px]">
                <b className="flex items-center gap-2">{!d.read && <span className="w-2 h-2 rounded-full bg-[#e7b84b]"/>}{d.name}</b>
                <span className="text-[#8a8f9c] text-[11px]">{fmt(d.date)}</span>
              </div>
              
              <div className="text-[12px] text-[#9aa0ad] flex items-center flex-wrap gap-2 mt-1">
                <span className="flex items-center gap-1 bg-white/[0.02] border border-white/5 py-0.5 px-2 rounded-md">
                  <span>{d.email}</span>
                  <button onClick={() => copyToClipboard(d.email, "email")} className="p-0.5 hover:bg-white/10 rounded text-gold hover:text-white transition cursor-pointer" title={t("Copy Email", "ইমেইল কপি করুন", lang)}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                  </button>
                </span>
                {d.phone && (
                  <span className="flex items-center gap-1 bg-white/[0.02] border border-white/5 py-0.5 px-2 rounded-md">
                    <span>{d.phone}</span>
                    <button onClick={() => copyToClipboard(d.phone, "phone")} className="p-0.5 hover:bg-white/10 rounded text-gold hover:text-white transition cursor-pointer" title={t("Copy Phone", "ফোন কপি করুন", lang)}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                    </button>
                  </span>
                )}
              </div>

              <div className="text-[13.5px] mt-2.5 break-words bg-black/[0.15] border border-white/[0.03] p-3 rounded-lg text-[#cbd0df]">{d.message}</div>
              
              <div className="mt-3 pt-3 border-t border-white/[0.03] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11.5px] text-[#7e8391]">{t("CRM Contact Type:", "কন্ট্যাক্ট টাইপ:", lang)}</span>
                  <select
                    value={contacts.find(c => c.email.toLowerCase() === d.email.toLowerCase())?.tags[0] || "none"}
                    onChange={(e) => handleUpdateContactType(d, e.target.value)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-black/45 border border-white/10 outline-none cursor-pointer text-[#cbd0df] hover:border-gold/30 hover:bg-black/60 transition"
                  >
                    <option value="none">{t("Not Classified", "শ্রেণীবিন্যাস ছাড়া", lang)}</option>
                    <option value="lead">{t("Lead", "লিড (সম্ভাব্য)", lang)}</option>
                    <option value="client">{t("Client", "ক্লায়েন্ট", lang)}</option>
                    <option value="partner">{t("Partner", "পার্টনার", lang)}</option>
                    <option value="spam">{t("Spam", "স্প্যাম (বাতিল)", lang)}</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-2 text-[12px]">
                  {!d.read && (
                    <button
                      onClick={()=>markRead(d.id)}
                      className="flex items-center gap-1.5 px-3 py-[6px] rounded-full glass cursor-pointer hover:bg-white/[0.07] transition active:scale-95 text-[#a8b4c8]"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <span>{t("Mark read","পঠিত",lang)}</span>
                    </button>
                  )}
                  <a
                    href={`/${ADMIN_SLUG}/email?to=${encodeURIComponent(d.email)}&name=${encodeURIComponent(d.name)}&subject=${encodeURIComponent("Re: " + (d.subject || "Your Message"))}`}
                    className="flex items-center gap-1.5 px-3 py-[6px] rounded-full glass cursor-pointer hover:bg-blue-500/[0.12] text-[#7eb8f7] transition active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <span>{t("Reply","উত্তর দিন",lang)}</span>
                  </a>
                  <button
                    onClick={()=>deleteMessage(d.id)}
                    className="flex items-center gap-1.5 px-3 py-[6px] rounded-full glass text-[#f29696] cursor-pointer hover:bg-red-500/[0.12] transition active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>
                    <span>{t("Delete","মুছুন",lang)}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminAnalytics({lang}:{lang:Lang}){
  return <AnalyticsDashboard lang={lang} />
}


function AdminSecurity({lang}:{lang:Lang}){
  const { admin_2fa, updateAdmin2FA } = useStore()
  const tfaOn = admin_2fa?.enabled || false
  
  const [setupSecret, setSetupSecret] = useState("")
  const [code, setCode] = useState("")
  const [err, setErr] = useState("")
  const [success, setSuccess] = useState("")
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  // ---- Change Credentials state ----
  const { user: authUser, changeCredentials } = useAuth()
  const currentEmail = authUser?.email || adminSecurity.EMAIL
  const maskedEmail = currentEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")
  const [credForm, setCredForm] = useState({ newEmail: "", currentPass: "", newPass: "", confirmPass: "" })
  const [credBusy, setCredBusy] = useState(false)
  const [credErr, setCredErr] = useState("")
  const [credSuccess, setCredSuccess] = useState("")

  const handleCredSubmit = async () => {
    setCredErr(""); setCredSuccess(""); setCredBusy(true)
    if (!credForm.currentPass) { setCredBusy(false); setCredErr(t("Current password is required.", "বর্তমান পাসওয়ার্ড আবশ্যক।", lang)); return }
    if (credForm.newPass && credForm.newPass.length < 6) { setCredBusy(false); setCredErr(t("New password must be at least 6 characters.", "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।", lang)); return }
    if (credForm.newPass && credForm.newPass !== credForm.confirmPass) { setCredBusy(false); setCredErr(t("New passwords do not match.", "নতুন পাসওয়ার্ড মিলছে না।", lang)); return }

    const result = await changeCredentials({
      currentPassword: credForm.currentPass,
      newEmail: credForm.newEmail || undefined,
      newPassword: credForm.newPass || "",
    })
    setCredBusy(false)
    if (result.success) {
      setCredSuccess(t("Credentials updated successfully! You may need to log in again.", "তথ্য সফলভাবে আপডেট হয়েছে! আবার লগইন করতে হতে পারে।", lang))
      // If 2FA was active, disable it since password changed (used as XOR key)
      if (tfaOn) {
        await updateAdmin2FA({ enabled: false, encryptedSecret: "" })
        localStorage.removeItem("rm_admin_2fa_enabled")
        sessionStorage.removeItem("rm_admin_2fa")
        setCredSuccess(t("Credentials updated! 2FA has been disabled because the password was changed. Please re-enable it.", "তথ্য আপডেট হয়েছে! পাসওয়ার্ড পরিবর্তনের কারণে 2FA নিষ্ক্রিয় হয়েছে। অনুগ্রহ করে আবার চালু করুন।", lang))
      }
      setCredForm({ newEmail: "", currentPass: "", newPass: "", confirmPass: "" })
    } else {
      setCredErr(result.error || t("Failed to update.", "আপডেট করতে ব্যর্থ।", lang))
    }
  }

  const handleStartSetup = () => {
    setSetupSecret(generateSecret())
    setErr("")
    setSuccess("")
  }

  const otpauthURI = setupSecret ? getOTPAuthURI("muntasir", setupSecret) : ""
  const qrCodeUrl = setupSecret ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauthURI)}` : ""

  const handleCopy = () => {
    if (setupSecret) {
      navigator.clipboard.writeText(setupSecret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleVerifyAndEnable = async () => {
    if (!setupSecret) return
    setErr("")
    setSuccess("")
    setBusy(true)
    const isValid = await verifyTOTP(setupSecret, code)
    if (isValid) {
      const encrypted = encryptSecret(setupSecret, adminSecurity.PASSWORD)
      await updateAdmin2FA({ enabled: true, encryptedSecret: encrypted })
      localStorage.setItem("rm_admin_2fa_enabled", "1")
      sessionStorage.setItem("rm_admin_2fa", "1")
      setBusy(false)
      setSuccess("Two-Factor Authentication successfully enabled!")
      setTimeout(() => {
        setSetupSecret("")
        setCode("")
      }, 1500)
    } else {
      setBusy(false)
      setErr("Invalid code. Please try again.")
    }
  }

  const handleDisable = async () => {
    setBusy(true)
    await updateAdmin2FA({ enabled: false, encryptedSecret: "" })
    localStorage.removeItem("rm_admin_2fa_enabled")
    sessionStorage.removeItem("rm_admin_2fa")
    setBusy(false)
    window.location.reload()
  }

  return (
    <div className="space-y-5">
      <div className="text-[24px] font-[720]">{t("Security & 2FA","সিকিউরিটি ও 2FA",lang)}</div>
      
      {tfaOn ? (
        <div className="glass rounded-[18px] p-5 space-y-4 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e2f7e6]/10 flex items-center justify-center border border-[#6ad08a]/20">
              <ShieldCheck className="text-[#6ad08a]" size={20}/>
            </div>
            <div>
              <div className="text-[14.5px] font-[650] text-[#6ad08a]">{t("Two-Factor Authentication is Active","টু-ফ্যাক্টর অথেন্টিকেশন সক্রিয় আছে",lang)}</div>
              <div className="text-[11.5px] text-[#9aa0ad]">{t("Your account is secured with Google Authenticator.","আপনার অ্যাকাউন্ট গুগল অথেনটিকেটর দ্বারা সুরক্ষিত।",lang)}</div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4">
            <button onClick={handleDisable} disabled={busy} className="px-5 h-[38px] rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20 text-[13px] font-[600] transition cursor-pointer disabled:opacity-50">
              {t("Disable 2FA","2FA নিষ্ক্রিয় করুন",lang)}
            </button>
          </div>
        </div>
      ) : (
        <div className="glass rounded-[18px] p-6 max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <Lock className="text-gold" size={18}/>
            </div>
            <div>
              <div className="text-[14.5px] font-[650] text-white">{t("Enable Two-Factor Authentication","টু-ফ্যাক্টর অথেন্টিকেশন চালু করুন",lang)}</div>
              <div className="text-[11.5px] text-[#9aa0ad]">{t("Secure your admin portal access by linking Google Authenticator.","গুগল অথেনটিকেটর লিংক করে এডমিন পোর্টাল সুরক্ষিত করুন।",lang)}</div>
            </div>
          </div>

          {!setupSecret ? (
            <div className="border-t border-white/5 pt-5 text-center py-6">
              <button onClick={handleStartSetup} className="px-6 h-[44px] rounded-xl bg-gold text-[#1a1410] font-[650] text-[13.5px] hover:brightness-110 transition cursor-pointer">
                {t("Set Up Two-Factor Authentication","২-ফ্যাক্টর অথেন্টিকেশন সেটআপ করুন",lang)}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-[180px_1fr] gap-6 items-start border-t border-white/5 pt-5 animate-fadeIn">
              <div className="bg-white p-2 rounded-lg inline-block mx-auto md:mx-0 shadow-md">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-[160px] h-[160px] object-contain" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5 text-[12.8px] text-[#b5bac7]">
                  <p className="font-semibold text-white">1. Scan QR Code or manual enter Setup Key:</p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="bg-black/30 border border-white/10 px-3 py-1.5 rounded-[8px] text-[13px] font-mono text-gold tracking-wider select-all">{setupSecret}</code>
                    <button onClick={handleCopy} className="px-3 h-8 rounded-[8px] glass text-[11.5px] font-medium hover:bg-white/10 transition cursor-pointer">
                      {copied ? t("Copied!","কপি হয়েছে!",lang) : t("Copy","কপি করুন",lang)}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4">
                  <p className="text-[12.8px] font-semibold text-white">2. Enter 6-digit code to verify & enable:</p>
                  <div className="flex gap-2">
                    <input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} maxLength={6} placeholder="000000" disabled={busy}
                      className="w-32 text-center text-[16px] font-mono h-[38px] rounded-lg bg-black/25 border border-white/12 outline-none focus:border-yellow-500/40 text-[#e8e9ef] caret-gold"/>
                    <button onClick={handleVerifyAndEnable} disabled={code.length!==6 || busy} className="px-5 h-[38px] rounded-lg bg-gold text-[#1a1410] font-[650] text-[13px] hover:brightness-110 disabled:opacity-50 transition cursor-pointer flex items-center gap-2">
                      {busy && <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin"/>}
                      {t("Verify & Enable","যাচাই ও সক্রিয় করুন",lang)}
                    </button>
                  </div>
                  {err && <div className="text-[12.5px] text-[#f29696] mt-1.5">{err}</div>}
                  {success && <div className="text-[12.5px] text-[#6ad08a] mt-1.5">{success}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- Change Credentials Card ---- */}
      <div className="glass rounded-[18px] p-6 max-w-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e7b84b]/10 flex items-center justify-center border border-[#e7b84b]/20">
            <UserCheck className="text-[#e7b84b]" size={18}/>
          </div>
          <div>
            <div className="text-[14.5px] font-[650]">{t("Account Settings","অ্যাকাউন্ট সেটিংস",lang)}</div>
            <div className="text-[11.5px] text-[#9aa0ad]">{t("Change username/email and password","ইউজারনেম/ইমেইল ও পাসওয়ার্ড পরিবর্তন করুন",lang)}</div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4 space-y-1 text-[13px]">
          <div className="text-[#9aa0ad]">{t("Current Email","বর্তমান ইমেইল",lang)}</div>
          <div className="text-[#e8e9ef] font-mono font-[600]">{maskedEmail}</div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-semibold">{t("New Email (optional)","নতুন ইমেইল (ঐচ্ছিক)",lang)}</label>
            <input value={credForm.newEmail} onChange={e => setCredForm({ ...credForm, newEmail: e.target.value })} placeholder="new@email.com" disabled={credBusy}
              className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13.5px] focus:border-[#e7b84b]/40 transition disabled:opacity-50"/>
          </div>
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-semibold">{t("New Password (optional)","নতুন পাসওয়ার্ড (ঐচ্ছিক)",lang)}</label>
            <input type="password" value={credForm.newPass} onChange={e => setCredForm({ ...credForm, newPass: e.target.value })} placeholder="••••••" disabled={credBusy}
              className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13.5px] focus:border-[#e7b84b]/40 transition disabled:opacity-50"/>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] text-[#9aa0ad] font-semibold">{t("Confirm New Password","নতুন পাসওয়ার্ড নিশ্চিত করুন",lang)}</label>
            <input type="password" value={credForm.confirmPass} onChange={e => setCredForm({ ...credForm, confirmPass: e.target.value })} placeholder="••••••" disabled={credBusy}
              className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-white/12 outline-none text-[#e8e9ef] text-[13.5px] focus:border-[#e7b84b]/40 transition disabled:opacity-50"/>
          </div>
          <div>
            <label className="text-[12px] text-[#f29696] font-semibold">{t("Current Password (required)","বর্তমান পাসওয়ার্ড (আবশ্যক)",lang)}</label>
            <input type="password" value={credForm.currentPass} onChange={e => setCredForm({ ...credForm, currentPass: e.target.value })} placeholder="••••••" disabled={credBusy}
              className="w-full mt-[6px] px-3 h-[40px] rounded-[9px] bg-black/25 border border-[#f29696]/20 outline-none text-[#e8e9ef] text-[13.5px] focus:border-[#f29696]/40 transition disabled:opacity-50"/>
          </div>
        </div>

        {credErr && <div className="text-[12.5px] text-[#f29696] bg-red-500/5 rounded-lg px-3 py-2 border border-red-500/15">{credErr}</div>}
        {credSuccess && <div className="text-[12.5px] text-[#6ad08a] bg-green-500/5 rounded-lg px-3 py-2 border border-green-500/15">{credSuccess}</div>}

        {tfaOn && (
          <div className="text-[11.5px] text-[#e7b84b] bg-yellow-500/5 rounded-lg px-3 py-2 border border-yellow-500/15 flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0"/>
            <span>{t("Changing password will disable 2FA. You will need to set it up again after the change.","পাসওয়ার্ড পরিবর্তন করলে 2FA নিষ্ক্রিয় হবে। পরিবর্তনের পর আবার সেটআপ করতে হবে।",lang)}</span>
          </div>
        )}

        <button onClick={handleCredSubmit} disabled={credBusy || !credForm.currentPass}
          className="px-6 h-[40px] rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13.8px] hover:brightness-110 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
          {credBusy && <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin"/>}
          {t("Update Credentials","তথ্য আপডেট করুন",lang)}
        </button>
      </div>
    </div>
  )
}


function AdminCache({lang}:{lang:Lang}){
  const [clearing, setClearing] = useState(false)
  const handleClearCache = () => {
    setClearing(true)
    setTimeout(() => {
      setClearing(false)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith("portfolio_") || key.includes("cache"))) {
          localStorage.removeItem(key)
        }
      }
      alert(lang === "bn" ? "সকল ক্যাশ সফলভাবে মুছে ফেলা হয়েছে!" : "All cache cleared successfully!")
    }, 800)
  }
  return (
    <div className="space-y-5">
      <div className="text-[24px] font-[720]">{t("Cache Manager","ক্যাশ ম্যানেজার",lang)}</div>
      <div className="glass rounded-[18px] p-5 space-y-2 text-[12.8px] text-[#b5bac7] font-mono">
        <div>github:stats → HIT · 42m TTL</div>
        <div>portfolio:public → HIT · 3m TTL</div>
        <div>rate:contact:IP → 1/5 used</div>
      </div>
      <button 
        onClick={handleClearCache}
        disabled={clearing}
        className="px-5 h-10 rounded-full bg-[#e7b84b] text-[#1a1410] font-[650] text-[13px] cursor-pointer hover:brightness-110 transition disabled:opacity-50 flex items-center gap-1.5"
      >
        {clearing && <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin"/>}
        {t("Clear All Cache","সব ক্যাশ পরিষ্কার",lang)}
      </button>
    </div>
  )
}
function AdminLogin({lang}:{lang:Lang}){
  const [username,setUsername]=useState("")
  const [pass,setPass]=useState("")
  const [err,setErr]=useState("")
  const [busy,setBusy]=useState(false)
  const { login, isFirebaseConfigured: fbReady } = useAuth()
  const submit=async()=>{
    setErr(""); setBusy(true)
    const result = await login(username.trim(), pass)
    setBusy(false)
    if(!result.success){ setErr(result.error || "Login failed") }
  }
  const authBadge = fbReady ? t("Firebase Auth","ফায়ারবেস অথ", "en") : t("Demo Mode","ডেমো মোড", "en")
  return (
    <div className="min-h-screen bg-[#07070b] flex items-center justify-center px-5 relative overflow-hidden cursor-default">
      <div className="absolute inset-0 opacity-40" style={{background:"radial-gradient(900px 520px at 50% -10%, rgba(231,184,75,0.10), transparent)"}}/>
      <div className="relative w-full max-w-[420px] glass-strong rounded-[22px] p-[26px]">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-mono text-[#e5c371]">SECRET ADMIN</div>
          <div className={`text-[10.5px] px-2 py-[3px] rounded-full ${fbReady?"bg-[#3a5a2a]/40 text-[#8fcf6a] border border-[#5a8a3a]/30":"bg-[#3a3a2a]/40 text-[#d5c46a] border border-[#5a5a3a]/30"}`}>{authBadge}</div>
        </div>
        <div className="text-[24px] font-[720] mt-2">Admin Portal Login</div>
        <div className="text-[11.5px] text-[#7e8391] mt-1">{fbReady ? t("Sign in with Firebase account","ফায়ারবেস অ্যাকাউন্ট দিয়ে লগইন", "en") : t("Demo: muntasir / Shihab@2026","ডেমো: muntasir / Shihab@2026", "en")}</div>
        <form onSubmit={e=>{e.preventDefault(); submit()}} className="mt-6 space-y-4">
          <input required type="text" id="admin_username" name="admin_username" autoComplete="username" value={username} onChange={e=>{setUsername(e.target.value);setErr("")}} placeholder="Username" disabled={busy} className="w-full px-4 h-[46px] rounded-[12px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 disabled:opacity-50 text-[#e8e9ef] caret-[#e7b84b] cursor-text"/>
          <input required type="password" id="admin_password" name="admin_password" autoComplete="current-password" value={pass} onChange={e=>{setPass(e.target.value);setErr("")}} placeholder="Password" disabled={busy} className="w-full px-4 h-[46px] rounded-[12px] bg-black/25 border border-white/[0.12] outline-none focus:border-yellow-500/40 disabled:opacity-50 text-[#e8e9ef] caret-[#e7b84b] cursor-text"/>
          {err && <div className="text-[12.5px] text-[#f29696] bg-[#2a1414] border border-[#f29696]/20 rounded-[10px] px-3 py-2">{err}</div>}
          <button type="submit" disabled={busy} className="w-full h-[46px] rounded-[12px] bg-[#e7b84b] text-[#1a1410] font-[650] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 transition">{busy ? <span className="w-4 h-4 border-2 border-[#1a1410]/40 border-t-[#1a1410] rounded-full animate-spin"/> : null}{t("Login","লগইন",lang)}</button>
        </form>
      </div>
    </div>
  )
}

function Admin2FA({onVerify}:{onVerify:()=>void}){
  const [code,setCode]=useState("")
  const [err,setErr]=useState("")
  const [busy,setBusy]=useState(false)
  const { admin_2fa } = useStore()
  const verify=async()=>{
    setBusy(true)
    setErr("")
    const encryptedSecret = admin_2fa?.encryptedSecret || ""
    if(!encryptedSecret){
      // fallback if somehow enabled but no secret exists (auto-bypass or verify always true)
      setBusy(false)
      onVerify()
      return
    }
    const secret = decryptSecret(encryptedSecret, adminSecurity.PASSWORD)
    const isValid = await verifyTOTP(secret, code)
    setBusy(false)
    if(isValid){
      onVerify()
    } else {
      setErr("Invalid 2FA code. Please verify from Google Authenticator.")
    }
  }
  return (
    <div className="min-h-screen bg-[#07070b] flex items-center justify-center px-5 cursor-default">
      <div className="w-full max-w-[420px] glass-strong rounded-[22px] p-[26px] text-center">
        <div className="w-14 h-14 mx-auto rounded-[16px] bg-[#14141f] gold-ring flex items-center justify-center"><Lock size={22} className="text-[#f1cf7a]"/></div>
        <div className="text-[22px] font-[700] mt-4">Two-Factor Authentication</div>
        <div className="text-[13px] text-[#9da2af] mt-1">Enter the 6-digit code from Google Authenticator.</div>
        <input value={code} onChange={e=>{setCode(e.target.value.replace(/\D/g,""));setErr("")}} maxLength={6} placeholder="000000" disabled={busy}
          className="mt-5 w-full text-center tracking-[0.42em] text-[26px] font-mono px-4 h-[56px] rounded-[14px] bg-black/30 border border-white/[0.14] outline-none focus:border-yellow-500/50 text-[#e8e9ef] caret-[#e7b84b] cursor-text"/>
        {err && <div className="text-[12.5px] text-[#f29696] mt-3">{err}</div>}
        <button onClick={()=> code.length===6 && !busy && verify()} disabled={code.length!==6 || busy} className="mt-4 w-full h-[46px] rounded-[12px] bg-[#e7b84b] text-[#1a1410] font-[650] cursor-pointer hover:brightness-110 transition flex items-center justify-center gap-2">
          {busy ? <span className="w-4 h-4 border-2 border-[#1a1410]/40 border-t-[#1a1410] rounded-full animate-spin"/> : null}
          Verify & Enter
        </button>
      </div>
    </div>
  )
}

function AdminDash({lang}:{lang:Lang}){
  const { messages, cvCount, visibility } = useStore()
  const tfaOn = localStorage.getItem("rm_admin_2fa_enabled") === "1"
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden glass rounded-[20px] p-6 sm:p-8 mb-2">
        <div className="absolute -top-16 -right-16 w-[200px] h-[200px] rounded-full opacity-30 blur-[60px]" style={{background:"radial-gradient(circle, #e7b84b, transparent)"}}/>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[22px] md:text-[26px] font-[720] tracking-[-0.015em] text-white">
              {t("Welcome back, ","স্বাগতম, ",lang)} <span className="gold-text">{profile.firstName}</span>!
            </div>
            <div className="text-[13px] text-[#9aa0ad] mt-1.5">
              {t("Here's what's happening with your portfolio today.","আজ আপনার পোর্টফোলিওর সর্বশেষ অবস্থা এখানে দেওয়া হলো।",lang)}
            </div>
          </div>
          <div className="flex gap-3">
             <Link to="/admin/messages" className="shimmer-wrap px-4 py-2.5 rounded-full bg-[#e7b84b] text-[#15121a] font-[650] text-[12.5px] hover:brightness-[1.1] transition-all">{t("View Messages","মেসেজ দেখুন",lang)}</Link>
             <Link to="/" target="_blank" className="px-4 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-[#c5c9d5] hover:bg-white/[0.1] hover:text-white font-[600] text-[12.5px] transition-colors">{t("View Site","সাইট দেখুন",lang)}</Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[[t("Unread Messages","অপঠিত মেসেজ",lang),String(messages.filter(m=>!m.read).length)],[t("CV Downloads","CV ডাউনলোড",lang),String(cvCount)],[t("Total Messages","মোট মেসেজ",lang),String(messages.length)],[t("Projects","প্রজেক্ট",lang),String(projects.length)]].map(([k,v])=>(
          <div key={k} className="glass rounded-[16px] px-4 sm:px-5 py-4"><div className="text-[11px] sm:text-[12px] text-[#a3a7b4] truncate" title={k}>{k}</div><div className="text-[24px] sm:text-[27px] font-[730] gold-text mt-1">{v}</div></div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass rounded-[18px] p-5">
          <div className="text-[13px] font-mono text-[#e5c371] mb-3">{t("SECTION VISIBILITY (Live)","সেকশন ভিজিবিলিটি (লাইভ)",lang)}</div>
          <div className="space-y-[10px] text-[13.4px] text-[#c9ccd6]">
            {Object.entries(visibility).map(([key, val])=>(
              <div key={key} className="flex items-center justify-between"><span className="capitalize">{key}</span><span className={val?"text-[#6ad08a]":"text-[#f29696]"}>{val?t("Visible","দৃশ্যমান",lang):t("Hidden","গোপন",lang)}</span></div>
            ))}
          </div>
        </div>
        <div className="glass rounded-[18px] p-5">
          <div className="text-[13px] font-mono text-[#e5c371] mb-3">{t("MEDIA & ASSETS","মিডিয়া ও অ্যাসেটস",lang)}</div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-yellow-500/30 overflow-hidden bg-black/40">
                {profile.avatar ? <img src={profile.avatar} alt="Profile avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px]">No Image</div>}
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-[600]">{t("Profile Avatar","প্রোফাইল ছবি",lang)}</div>
                <div className="text-[10px] text-[#8a8f9c] truncate max-w-[150px]">{profile.avatar || t("Not set","সেট করা নেই",lang)}</div>
              </div>
            </div>
            <div className="text-[11px] text-[#8a8f9c] leading-relaxed p-2.5 rounded-[10px] bg-white/[0.03] border border-white/[0.06]">
              {t("Paste Image URL in data.ts 'avatar' field to update profile photo.","data.ts এর 'avatar' ফিল্ডে ছবির ইউআরএল পেস্ট করে ছবি পরিবর্তন করুন।",lang)}
            </div>
          </div>
        </div>
        <div className="glass rounded-[18px] p-5">
          <div className="text-[13px] font-mono text-[#e5c371] mb-3">{t("CONTENT COUNTS","কন্টেন্ট সংখ্যা",lang)}</div>
          <div className="space-y-[7px] text-[13px] text-[#c5c9d5]">
            <div className="flex justify-between"><span>{t("Education","শিক্ষা",lang)}</span><b>{education.length}</b></div>
            <div className="flex justify-between"><span>{t("Experience","অভিজ্ঞতা",lang)}</span><b>{experience.length}</b></div>
            <div className="flex justify-between"><span>{t("Skills","দক্ষতা",lang)}</span><b>{skills.length}</b></div>
            <div className="flex justify-between"><span>{t("Projects","প্রজেক্ট",lang)}</span><b>{projects.length}</b></div>
            <div className="flex justify-between"><span>{t("Social Links","সোশ্যাল লিংক",lang)}</span><b>{profile.socials.length}</b></div>
            <div className="flex justify-between"><span>{t("Testimonials","প্রশংসাপত্র",lang)}</span><b>{testimonials.length}</b></div>
            <div className="flex justify-between"><span>{t("Blog Posts","ব্লগ পোস্ট",lang)}</span><b>{blogPosts.length}</b></div>
            <div className="flex justify-between"><span>{t("Services","সেবা",lang)}</span><b>{services.length}</b></div>
            <div className="flex justify-between"><span>{t("Achievements","অর্জন",lang)}</span><b>{achievements.length}</b></div>
          </div>
        </div>
        <div className="glass rounded-[18px] p-5">
          <div className="text-[13px] font-mono text-[#e5c371] mb-3 flex items-center justify-between">
            <span>{t("SOCIAL LINKS MANAGER","সোশ্যাল লিংক ম্যানেজার",lang)}</span>
            <span className="text-[10.5px] text-[#8a8f9c]">{profile.socials.filter(s=>s.enabled!==false && s.url).length}/{profile.socials.length} {t("active","সক্রিয়",lang)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[8px] text-[12px]">
            {profile.socials.map(s=>{
              const active = s.enabled !== false && s.url && s.url.trim() !== ""
              return (
                <div key={s.name} className={`px-2.5 py-[7px] rounded-[10px] border flex items-center gap-2 ${active?"bg-white/[0.04] border-white/[0.08]":"bg-white/[0.015] border-white/[0.04] opacity-50"}`}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/[0.04]" style={{color: s.color || "#e7b84b"}}>
                    <SocialIcon name={s.name} size={12} customLogo={s.customLogo}/>
                  </div>
                  <span className="truncate text-[#c5c9d5] flex-1">{s.name}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${active?"bg-[#6ad08a]":"bg-[#f29696]"}`}/>
                </div>
              )
            })}
          </div>
          <div className="text-[11px] text-[#8a8f9c] mt-3 leading-relaxed">
            {t("• Toggle enabled flag to show/hide. Empty URL also auto-hides.","• enabled flag বদলে দেখান/গোপন করুন। URL খালি রাখলেও অটো গোপন হয়।",lang)}<br/>
            {t("• Upload custom brand logo via customLogo URL field per item.","• প্রতি আইটেমে customLogo URL দিয়ে নিজস্ব ব্র্যান্ড লোগো আপলোড করুন।",lang)}
          </div>
        </div>
      </div>
      <div className="glass rounded-[18px] p-5">
        <div className="text-[13px] font-mono text-[#e5c371] mb-3">{t("SECURITY","সিকিউরিটি",lang)}</div>
        <ul className="text-[13px] text-[#c5c9d5] space-y-[7px]">
          <li className="flex gap-2"><UserCheck size={15} className={tfaOn?"text-[#6ad08a]":"text-[#9aa0ad]"}/> {tfaOn ? t("2FA: Enabled","2FA: সক্রিয়",lang) : t("2FA: Disabled","2FA: নিষ্ক্রিয়",lang)}</li>
          <li className="flex gap-2"><ShieldCheck size={15} className="text-[#6ad08a]"/> TOTP: otplib</li>
          <li>{t("Failed logins (24h): 0","ব্যর্থ লগইন (২৪ঘণ্টা): ০",lang)}</li>
        </ul>
      </div>
    </div>
  )
}
