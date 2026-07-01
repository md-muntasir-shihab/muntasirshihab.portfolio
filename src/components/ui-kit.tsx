import { motion, AnimatePresence } from "framer-motion"
import { ReactNode, useEffect, useState, useRef, createContext, useContext } from "react"
import { useLocation, Link, NavLink } from "react-router-dom"
import { AnimatedBackground, BGType } from "./backgrounds"
import { type Lang, profile } from "../lib/data"
import { useStore } from "../lib/store"
import {
  Menu, X, Mail, Phone, MapPin, Clock,
  Download, Sun, Moon, Globe, Rocket
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

const t = (en:string, bn:string, lang:Lang)=> lang==='bn' ? bn : en

export function PageShell({ bg, children, lang, setLang, title, subtitle }:{
  bg: BGType,
  children: ReactNode,
  lang: Lang,
  setLang: (l:Lang)=>void,
  title?: string,
  subtitle?: string
}){
  const {theme} = useContext(ThemeCtx)
  return (
    <div className={`relative min-h-screen ${theme==="light"?"bg-[#f5f3ee] text-[#1a1a1f]":""}`}>
      {theme==="dark" && <AnimatedBackground type={bg} />}
      {theme==="light" && <div className="fixed inset-0 -z-20 bg-[#f5f3ee]"/>}
      <Navbar lang={lang} setLang={setLang} />
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
      <Footer lang={lang} />
      <ScrollProgress />
      {/* CustomCursor disabled — using native cursor */}
      <BackToTop />
    </div>
  )
}

export function PageTransition({children}:{children:ReactNode}){
  const loc = useLocation()
  return (
    <AnimatePresence mode="wait">
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

function Navbar({ lang, setLang }: { lang: Lang, setLang: (l:Lang)=>void }){
  const [open, setOpen] = useState(false)
  const {theme, toggle} = useContext(ThemeCtx)
  const { visibility } = useStore()
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
            <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center text-[13px] font-[700] font-mono ${lt?"bg-[#f0e6cf] text-[#8a6b2b] border border-[#dbc897]":"gold-ring bg-[#14141f] gold-text"}`}>MS</div>
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
              className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-[12.5px] font-[600] transition-colors ${lt?"bg-[#f0e6cf] text-[#6b5328] border border-[#dbc897]":"glass hover:border-yellow-500/30"}`}>
              <Globe size={14}/> {lang==='en'?'BN':'EN'}
            </button>
            <button onClick={toggle}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${lt?"bg-[#f0e6cf] text-[#6b5328] border border-[#dbc897]":"glass hover:border-yellow-500/30"}`}>
              {theme==="dark" ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
            <Link to="/cv" className="hidden md:inline-flex">
              <ShimmerButton>
                <Download size={15}/> CV
              </ShimmerButton>
            </Link>
            <button onClick={()=>setOpen(v=>!v)} className={`lg:hidden w-9 h-9 rounded-full flex items-center justify-center ${lt?"bg-[#f0e6cf] text-[#6b5328] border border-[#dbc897]":"glass"}`}>
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

function Footer({ lang }:{lang:Lang}){
  const {theme} = useContext(ThemeCtx)
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
                <div className={`w-11 h-11 rounded-[13px] flex items-center justify-center text-[14px] font-[700] font-mono ${lt?"bg-[#f0e6cf] text-[#8a6b2b] border border-[#dbc897]":"gold-ring bg-[#14141f] gold-text"}`}>MS</div>
                <div className="leading-tight">
                  <div className={`text-[16px] font-[700] tracking-[-0.01em] ${lt?"text-[#1a1a1f]":"text-white"}`}>{profile.name[lang]}</div>
                  <div className={`text-[11.5px] mt-[2px] ${lt?"text-[#8a7a5c]":"text-[#9aa0ad]"}`}>{t("Statistics Student & Designer","পরিসংখ্যান শিক্ষার্থী ও ডিজাইনার",lang)}</div>
                </div>
              </Link>
              <p className={`text-[13.5px] leading-relaxed max-w-[400px] ${lt?"text-[#7a7366]":"text-[#9aa0ad]"}`}>
                {t("Crafting clean brand identities, statistical insights, and elegant web experiences from Bangladesh.",
                   "বাংলাদেশ থেকে পরিচ্ছন্ন ব্র্যান্ড আইডেন্টিটি, পরিসংখ্যানগত অন্তর্দৃষ্টি এবং সুন্দর ওয়েব অভিজ্ঞতা তৈরি করছি।", lang)}
              </p>
              <div className={`mt-5 inline-flex items-center gap-2 px-3 py-[7px] rounded-full text-[12px] ${lt?"bg-[#f0e6cf] text-[#8a6b2b] border border-[#dbc897]":"bg-[#0e1e12] text-[#8be0a3] border border-[#5cc776]/30"}`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#59d07b] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#59d07b]"></span>
                </span>
                {t("Available for hire","নিয়োগের জন্য উপলব্ধ",lang)}
              </div>
            </div>

            {/* Pages */}
            <div>
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

function ScrollProgress(){
  const [p,setP]=useState(0)
  useEffect(()=>{
    const h=()=> setP(window.scrollY / (document.body.scrollHeight - innerHeight))
    addEventListener('scroll', h, {passive:true}); return ()=>removeEventListener('scroll', h)
  },[])
  return <div className="fixed left-0 top-0 h-[2.5px] bg-[#e7b84b] z-[60]" style={{width: `${p*100}%`, boxShadow:"0 0 16px rgba(231,184,75,.45)"}}/>
}

function CustomCursor(){
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

function BackToTop(){
  const [show,setShow]=useState(false)
  useEffect(()=>{ const f=()=>setShow(scrollY>520); addEventListener('scroll',f); return()=>removeEventListener('scroll',f)},[])
  if(!show) return null
  return (
    <button onClick={()=>scrollTo({top:0,behavior:'smooth'})}
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
