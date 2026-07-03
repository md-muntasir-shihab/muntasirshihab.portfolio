import { motion, AnimatePresence } from "framer-motion"
import { ReactNode, useEffect, useState, useRef, createContext, useContext } from "react"
import { useLocation, Link, NavLink } from "react-router-dom"
import { AnimatedBackground, BGType } from "./backgrounds"
import { type Lang } from "../lib/data"
import { useStore } from "../lib/store"
import {
  Menu, X, Mail, Phone, MapPin, Clock,
  Download, Sun, Moon, Globe, Rocket, MessageCircle
} from "lucide-react"

// Theme context
export const ThemeCtx = createContext<{theme:"dark"|"light", toggle:()=>void}>({theme:"dark",toggle:()=>{}})

export function ThemeProvider({children}:{children:ReactNode}){
  const [theme, setTheme] = useState<"dark"|"light">(()=> (localStorage.getItem("rm_theme") as "dark"|"light") || "dark")
  useEffect(()=>{
    localStorage.setItem("rm_theme", theme)
    document.documentElement.classList.remove("dark","light")
    document.documentElement.classList.add(theme)
    // BUG-004 fix: keep <body> bg in sync so overscroll area matches theme
    document.body.style.background = theme==="light" ? "#f5f3ee" : "#07070b"
    document.body.style.color = theme==="light" ? "#1a1a1f" : "#e8e9ef"
    document.body.style.transition = "background 300ms ease, color 300ms ease"
  },[theme])
  const toggle = ()=> setTheme(p=> p==="dark"?"light":"dark")
  return <ThemeCtx.Provider value={{theme,toggle}}>{children}</ThemeCtx.Provider>
}

// Social brand icons (inline SVG - brand-colored)
// If customLogo URL is provided, use the uploaded image instead.
export function SocialIcon({name, size=20, customLogo}:{name:string, size?:number, customLogo?:string}){
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

export function PageShell({ bg, children, title, subtitle, description }:{
  bg: BGType,
  children: ReactNode,
  lang?: Lang,
  setLang?: (l:Lang)=>void,
  title?: string,
  subtitle?: string,
  description?: string
}){
  const {theme} = useContext(ThemeCtx)
  const loc = useLocation()

  useEffect(() => {
    const defaultTitle = "MD MUNTASIR SHIHAB — Official Portfolio"
    document.title = title ? `${title} | MD MUNTASIR SHIHAB` : defaultTitle

    const metaDesc = document.querySelector('meta[name="description"]')
    const descText = description || "MD Muntasir Shihab - B.Sc. Statistics student at Khulna University, Graphic & Brand Identity Designer, and Web Developer."
    if (metaDesc) {
      metaDesc.setAttribute("content", descText)
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute("content", title ? `${title} | MD MUNTASIR SHIHAB` : defaultTitle)
    }

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) {
      ogDesc.setAttribute("content", descText)
    }

    const canonLink = document.querySelector('link[rel="canonical"]')
    if (canonLink) {
      canonLink.setAttribute("href", `https://muntasirshihab.com${loc.pathname}`)
    }
  }, [title, description, loc.pathname])

  return (
    <div className={`relative min-h-screen ${theme==="light"?"bg-[#f5f3ee] text-[#1a1a1f]":""}`}>
      {theme==="dark" && <AnimatedBackground type={bg} />}
      {theme==="light" && <div className="fixed inset-0 -z-20 bg-[#f5f3ee]"/>}
      <main className="relative z-10 pt-[110px] md:pt-[100px] pb-24">
        {(title || subtitle) && (
          <div className="max-w-6xl mx-auto px-5 md:px-8 pt-10 md:pt-16">
            <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.55}}>
              {subtitle && <div className={`text-[12px] tracking-widest uppercase mb-3 font-mono ${theme==="light"?"text-[#a0782e]":"text-[#e7b84b]"}`}>{subtitle}</div>}
              {title && <h1 className={`text-[34px] md:text-[52px] leading-[0.98] font-[700] tracking-[-0.018em] ${theme==="light"?"text-[#1a1a1f]":""}`}>{title}</h1>}
            </motion.div>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}

export function PageTransition({children}:{children:ReactNode}){
  const loc = useLocation()
  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <motion.div
        key={loc.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: .44, ease: [0.22,1,0.36,1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function Navbar({ lang, setLang }: { lang: Lang, setLang: (l:Lang)=>void }){
  const [open, setOpen] = useState(false)
  const {theme, toggle} = useContext(ThemeCtx)
  const { visibility, profile } = useStore()
  const lt = theme==="light"
  // Nav links auto-hide when the matching section is disabled from the Admin panel
  const nav = [
    { to:"/", label: {en:"Home", bn:"হোম"}, key:null },
    { to:"/about", label: {en:"About", bn:"পরিচিতি"}, key:null },
    { to:"/experience", label: {en:"Experience", bn:"অভিজ্ঞতা"}, key:"experience" as const },
    { to:"/skills", label: {en:"Skills", bn:"দক্ষতা"}, key:"skills" as const },
    { to:"/projects", label: {en:"Projects", bn:"প্রজেক্ট"}, key:"projects" as const },
    { to:"/blog", label: {en:"Blog", bn:"ব্লগ"}, key:"blog" as const },
    { to:"/testimonials", label: {en:"Testimonials", bn:"প্রশংসাপত্র"}, key:"testimonials" as const },
    { to:"/contact", label: {en:"Contact", bn:"যোগাযোগ"}, key:null },
  ].filter(n => n.key===null || (visibility as any)[n.key] !== false)
  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4">
        <div className={`rounded-[18px] px-4 md:px-6 h-[62px] flex items-center justify-between ${lt?"bg-white/95 backdrop-blur-xl border border-[#e5e0d4] shadow-sm":"bg-[#0c0c14]/92 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.4)]"}`}>
          <Link to="/" className="flex items-center gap-3">
            {profile.customLogo ? (
              <img src={profile.customLogo} alt="Logo" className="h-9 max-w-[120px] object-contain rounded-md" />
            ) : (
              <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center text-[13px] font-[700] font-mono ${lt?"bg-[#f0e6cf] text-[#8a6b2b] border border-[#dbc897]":"gold-ring bg-[#14141f] gold-text"}`}>MS</div>
            )}
            <div className="block leading-tight max-w-[180px] sm:max-w-none">
              <div className={`text-[13.5px] sm:text-[14.5px] font-[650] tracking-[-0.01em] truncate ${lt?"text-[#1a1a1f]":""}`}>{profile.name[lang]}</div>
              <div className={`text-[10px] sm:text-[11px] -mt-[1px] truncate ${lt?"text-[#8a7a5c]":"text-[#9aa0ad]"}`}>{t("Statistics Student & Designer","পরিসংখ্যান শিক্ষার্থী ও ডিজাইনার",lang)}</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-[22px] text-[13.6px]">
            {nav.map(n=>(
              <NavLink key={n.to} to={n.to}
                className={({isActive}) => `transition-colors ${lt?"hover:text-[#6b5328]":"hover:text-white"} ${isActive ? (lt?"text-[#8a6b2b] font-[600]":"text-[#f3d07c]") : (lt?"text-[#5a5449]":"text-[#c8cad4]")}`}>
                {n.label[lang]}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button onClick={()=>setLang(lang==='en'?'bn':'en')}
              title={lang==='en'?'Switch to Bangla':'ইংরেজিতে পরিবর্তন করুন'}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-[12.5px] font-[600] transition-colors ${lt?"bg-[#f0e6cf] text-[#6b5328] border border-[#dbc897]":"glass hover:border-yellow-500/30"}`}>
              <Globe size={14}/> {lang==='en'?'BN':'EN'}
            </button>
            <button onClick={toggle}
              title={t("Toggle Theme", "থিম পরিবর্তন করুন", lang)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${lt?"bg-[#f0e6cf] text-[#6b5328] border border-[#dbc897]":"glass hover:border-yellow-500/30"}`}>
              {theme==="dark" ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
            <Link to="/cv" className="hidden md:inline-flex">
              <ShimmerButton>
                <Download size={15}/> CV
              </ShimmerButton>
            </Link>
            <button onClick={()=>setOpen(v=>!v)}
              title={t("Toggle Menu", "মেনু পরিবর্তন করুন", lang)}
              className={`lg:hidden w-9 h-9 rounded-full flex items-center justify-center ${lt?"bg-[#f0e6cf] text-[#6b5328] border border-[#dbc897]":"glass"}`}>
              {open ? <X size={17}/> : <Menu size={17}/>}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
            className={`lg:hidden mx-4 mt-2 rounded-[18px] p-4 ${lt?"bg-white/90 backdrop-blur-xl border border-[#e5e0d4] shadow-lg":"glass-strong"}`}>
            <div className="grid grid-cols-2 gap-2 text-[13.6px]">
              {nav.map(n=>(
                <NavLink key={n.to} to={n.to} onClick={()=>setOpen(false)}
                  className={({isActive})=>`px-3 py-[11px] rounded-[12px] border ${isActive ? (lt?"border-[#dbc897] bg-[#f9f2e2] text-[#8a6b2b]":"border-yellow-500/30 bg-yellow-500/5 text-[#f7cf73]") : (lt?"border-[#e5e0d4] text-[#5a5449]":"border-white/[0.07] hover:border-white/[0.16]")}`}>
                  {n.label[lang]}
                </NavLink>
              ))}
            </div>
            <div className="mt-3">
              <Link to="/cv" onClick={()=>setOpen(false)} className="block w-full">
                <div className="w-full text-center px-3 py-2.5 rounded-xl bg-[#e7b84b] text-[#141010] font-[650] text-[13px]">CV</div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export function Footer({ lang }:{lang:Lang}){
  const {theme} = useContext(ThemeCtx)
  const { profile } = useStore()
  const lt = theme==="light"
  const year = new Date().getFullYear()
  return (
    <footer className={`relative z-10 mt-10 ${lt?"":""}`}>
      {/* Gold accent gradient line */}
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="h-[1px] w-full" style={{background: lt
          ? "linear-gradient(90deg, transparent, rgba(168,127,46,0.35), transparent)"
          : "linear-gradient(90deg, transparent, rgba(231,184,75,0.45), transparent)"}}/>
      </div>

      <div className={`${lt?"bg-white/85 backdrop-blur-xl border-t border-[#e5e0d4]":"bg-[#08080e]/85 backdrop-blur-xl border-t border-white/[0.05]"}`}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-14">

          {/* CTA Banner */}
          <div className={`relative overflow-hidden rounded-[22px] p-7 md:p-9 mb-12 ${lt?"bg-gradient-to-br from-[#fdf9ed] to-[#f5ecd3] border border-[#dbc897]":"bg-gradient-to-br from-[#16161f] to-[#0e0e16] border border-yellow-500/15"}`}>
            <div className="absolute -top-16 -right-16 w-[260px] h-[260px] rounded-full opacity-40 blur-[80px]" style={{background:"radial-gradient(circle, #e7b84b, transparent)"}}/>
            <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className={`text-[12px] font-mono uppercase tracking-[0.18em] mb-2 ${lt?"text-[#a0782e]":"text-[#e7c879]"}`}>{t("LET'S WORK TOGETHER","চলুন একসাথে কাজ করি",lang)}</div>
                <div className={`text-[22px] md:text-[28px] font-[720] tracking-[-0.013em] leading-tight ${lt?"text-[#1a1a1f]":"text-white"}`}>
                  {t("Have a project in mind?","কোনো প্রজেক্ট মাথায় আছে?",lang)}<br className="hidden sm:block"/> <span className="gold-text">{t("Let's bring it to life.","চলুন বাস্তবে রূপ দিই।",lang)}</span>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link to="/contact">
                  <ShimmerButton><Mail size={15}/> {t("Contact Me","যোগাযোগ করুন",lang)}</ShimmerButton>
                </Link>
                <Link to="/cv" className={`inline-flex items-center gap-2 px-5 h-10 rounded-full text-[13.5px] font-[550] ${lt?"bg-white border border-[#dbc897] text-[#8a6b2b] hover:bg-[#f9f2e2]":"border border-yellow-500/28 text-[#f0cf89] hover:bg-yellow-500/8"}`}>
                  <Download size={15}/> CV
                </Link>
              </div>
            </div>
          </div>

          {/* Main grid: Brand | Pages | Availability */}
          <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-10 md:gap-14">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4">
                {profile.customLogo ? (
                  <img src={profile.customLogo} alt="Logo" className="h-11 max-w-[130px] object-contain rounded-md" />
                ) : (
                  <div className={`w-11 h-11 rounded-[13px] flex items-center justify-center text-[14px] font-[700] font-mono ${lt?"bg-[#f0e6cf] text-[#8a6b2b] border border-[#dbc897]":"gold-ring bg-[#14141f] gold-text"}`}>MS</div>
                )}
                <div className="leading-tight">
                  <div className={`text-[16px] font-[700] tracking-[-0.01em] ${lt?"text-[#1a1a1f]":"text-white"}`}>{profile.name[lang]}</div>
                  <div className={`text-[11.5px] mt-[2px] ${lt?"text-[#8a7a5c]":"text-[#9aa0ad]"}`}>{t("Statistics Student & Designer","পরিসংখ্যান শিক্ষার্থী ও ডিজাইনার",lang)}</div>
                </div>
              </Link>
              <p className={`text-[13.5px] leading-relaxed max-w-[400px] ${lt?"text-[#7a7366]":"text-[#9aa0ad]"}`}>
                {t("Crafting clean brand identities, statistical insights, and elegant web experiences from Bangladesh.",
                   "বাংলাদেশ থেকে পরিচ্ছন্ন ব্র্যান্ড আইডেন্টিটি, পরিসংখ্যানগত অন্তর্দৃষ্টি এবং সুন্দর ওয়েব অভিজ্ঞতা তৈরি করছি।", lang)}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-5">
                <div className={`inline-flex items-center gap-2 px-3 py-[7px] rounded-full text-[12px] ${lt?"bg-[#f0e6cf] text-[#8a6b2b] border border-[#dbc897]":"bg-[#0e1e12] text-[#8be0a3] border border-[#5cc776]/30"}`}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#59d07b] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#59d07b]"></span>
                  </span>
                  {t("Available for hire","নিয়োগের জন্য উপলব্ধ",lang)}
                </div>
              </div>
            </div>

            {/* Pages */}
            <div className="hidden md:block">
              <div className={`text-[11.5px] font-mono uppercase tracking-[0.18em] mb-4 ${lt?"text-[#a0782e]":"text-[#e7c879]"}`}>{t("EXPLORE","অন্বেষণ",lang)}</div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 text-[13.5px]">
                {[
                  ["/", t("Home","হোম",lang)],
                  ["/about", t("About","পরিচিতি",lang)],
                  ["/experience", t("Experience","অভিজ্ঞতা",lang)],
                  ["/skills", t("Skills","দক্ষতা",lang)],
                  ["/projects", t("Projects","প্রজেক্ট",lang)],
                  ["/blog", t("Blog","ব্লগ",lang)],
                  ["/testimonials", t("Testimonials","প্রশংসাপত্র",lang)],
                  ["/contact", t("Contact","যোগাযোগ",lang)],
                ].map(([to,label])=>(
                  <Link key={to} to={to} className={`transition-colors ${lt?"text-[#7a7366] hover:text-[#8a6b2b]":"text-[#9aa0ad] hover:text-white"}`}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Reach */}
            <div>
              <div className={`text-[11.5px] font-mono uppercase tracking-[0.18em] mb-4 ${lt?"text-[#a0782e]":"text-[#e7c879]"}`}>{t("REACH","যোগাযোগ",lang)}</div>
              <div className="space-y-3 text-[13.3px]">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className={`flex items-center gap-2 transition-colors ${lt?"text-[#7a7366] hover:text-[#8a6b2b]":"text-[#9aa0ad] hover:text-white"}`}>
                    <Mail size={14}/> <span className="truncate">{profile.email}</span>
                  </a>
                )}
                {profile.phone && profile.phone.trim() && (
                  <a href={`tel:${profile.phone}`} className={`flex items-center gap-2 transition-colors ${lt?"text-[#7a7366] hover:text-[#8a6b2b]":"text-[#9aa0ad] hover:text-white"}`}>
                    <Phone size={14}/> <span className="truncate">{profile.phone}</span>
                  </a>
                )}
                <div className={`flex items-start gap-2 ${lt?"text-[#7a7366]":"text-[#9aa0ad]"}`}>
                  <MapPin size={14} className="mt-[2px]"/> <span>{t("Panchagarh, Bangladesh","পঞ্চগড়, বাংলাদেশ",lang)}</span>
                </div>
                <div className={`flex items-center gap-2 ${lt?"text-[#7a7366]":"text-[#9aa0ad]"}`}>
                  <Clock size={14}/> <span>GMT+6</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className={`border-t ${lt?"border-[#e5e0d4]":"border-white/[0.05]"}`}>
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
            <div className={lt?"text-[#a39d8e]":"text-[#7f8494]"}>
              © {year} <span className={lt?"text-[#5a5449]":"text-[#c8cad4]"}>{profile.name.en}</span>. {t("All rights reserved.","সর্বস্বত্ব সংরক্ষিত।",lang)}
            </div>
            <div className={`flex items-center gap-2 ${lt?"text-[#a39d8e]":"text-[#7f8494]"}`}>
              <span>{lang==='bn'?'নির্মিত':'Crafted with'}</span>
              <span className="text-[#e7b84b]">&#9670;</span>
              <span>{t("in Bangladesh","বাংলাদেশে",lang)}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export function ShimmerButton({children, className="", onClick}:{children:ReactNode, className?:string, onClick?:()=>void}){
  return (
    <button onClick={onClick}
      className={`shimmer-wrap relative px-4 h-10 rounded-full bg-[#e7b84b] text-[#15121a] font-[650] text-[13.5px] flex items-center gap-2 hover:brightness-[1.06] active:scale-[.985] transition ${className}`}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  )
}

export function MagicCard({children, className=""}:{children:ReactNode, className?:string}){
  const {theme} = useContext(ThemeCtx)
  const lt = theme==="light"
  return (
    <div className={`group relative rounded-[20px] p-[20px] transition-all duration-300 hover:-translate-y-[3px] ${lt?"bg-white/80 border border-[#e5e0d4] shadow-sm hover:shadow-md hover:border-[#dbc897]":"glass hover:border-yellow-500/28"} ${className}`}>
      <div className={`absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        style={{background: lt?"radial-gradient(700px 260px at 80% -20%, rgba(200,170,100,0.08), transparent)":"radial-gradient(700px 260px at 80% -20%, rgba(231,184,75,0.10), transparent)"}}/>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function SectionHeading({kicker, title, right}:{kicker?:string, title:string, right?:ReactNode}){
  const {theme} = useContext(ThemeCtx)
  const lt = theme==="light"
  return (
    <div className="flex items-end justify-between gap-6 mb-7">
      <div>
        {kicker && <div className={`text-[11.5px] uppercase tracking-widest font-mono mb-2 ${lt?"text-[#a0782e]":"text-[#e7b84b]"}`}>{kicker}</div>}
        <h2 className={`text-[26px] md:text-[34px] font-[720] tracking-[-0.017em] leading-[1.06] ${lt?"text-[#1a1a1f]":""}`}>{title}</h2>
      </div>
      {right}
    </div>
  )
}

export function ScrollProgress(){
  const [p,setP]=useState(0)
  useEffect(()=>{
    const h=()=> setP(window.scrollY / (document.body.scrollHeight - innerHeight))
    addEventListener('scroll', h, {passive:true}); return ()=>removeEventListener('scroll', h)
  },[])
  return <div className="fixed left-0 top-0 h-[2.5px] bg-[#e7b84b] z-[60]" style={{width: `${p*100}%`, boxShadow:"0 0 16px rgba(231,184,75,.45)"}}/>
}

export function CustomCursor(){
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if (window.matchMedia("(pointer: coarse)").matches) return
    let mx = innerWidth/2, my = innerHeight/2, rx=mx, ry=my
    const move = (e:MouseEvent)=>{ mx=e.clientX; my=e.clientY; if(dot.current){ dot.current.style.transform=`translate(${mx-3}px,${my-3}px)` } }
    const rafLoop=()=>{
      rx += (mx-rx)*0.17; ry += (my-ry)*0.17
      if(ring.current) ring.current.style.transform=`translate(${rx-19}px,${ry-19}px)`
      requestAnimationFrame(rafLoop)
    }
    const id=requestAnimationFrame(rafLoop)
    window.addEventListener('mousemove', move)
    return ()=>{ cancelAnimationFrame(id); window.removeEventListener('mousemove', move)}
  },[])
  return (
    <>
      <div ref={ring} className="max-lg:hidden fixed top-0 left-0 w-[38px] h-[38px] rounded-full pointer-events-none z-[90] border border-[rgba(231,184,75,0.48)]" style={{mixBlendMode:"difference"}}/>
      <div ref={dot} className="max-lg:hidden fixed top-0 left-0 w-[6px] h-[6px] rounded-full bg-[#f7cf6a] pointer-events-none z-[91]" />
    </>
  )
}

export function BackToTop(){
  const [show,setShow]=useState(false)
  const lang = (localStorage.getItem("rm_lang") as Lang) || "en"
  useEffect(()=>{ const f=()=>setShow(scrollY>520); addEventListener('scroll',f); return()=>removeEventListener('scroll',f)},[])
  if(!show) return null
  return (
    <button onClick={()=>scrollTo({top:0,behavior:'smooth'})}
      title={t("Back to Top", "উপরে যান", lang)}
      className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full glass flex items-center justify-center hover:border-yellow-500/30">
      <Rocket size={16} className="text-[#f0c76a]" />
    </button>
  )
}

export function StatTicker({value, label}:{value:number, label:string}){
  const {theme} = useContext(ThemeCtx)
  const lt = theme==="light"
  const [n,setN]=useState(0)
  const ref=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const ob=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){
        const target=value, dur=1300, start=performance.now()
        const step=(now:number)=>{ const p=Math.min((now-start)/dur,1); setN(Math.floor(target*(1-Math.pow(1-p,3)))); if(p<1) requestAnimationFrame(step) }
        requestAnimationFrame(step)
        ob.disconnect()
      }
    }, {threshold:.35})
    if(ref.current) ob.observe(ref.current)
    return ()=>ob.disconnect()
  }, [value])
  return (
    <div ref={ref} className={`rounded-[18px] px-5 py-5 ${lt?"bg-white/80 border border-[#e5e0d4]":"glass"}`}>
      <div className="text-[30px] font-[750] tracking-[-0.017em] gold-text">{n.toLocaleString()}</div>
      <div className={`text-[12.5px] mt-1 ${lt?"text-[#8a8278]":"text-[#a2a6b5]"}`}>{label}</div>
    </div>
  )
}
