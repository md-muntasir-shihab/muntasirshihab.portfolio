import { useEffect, useRef } from "react";

// Universal animated background engine
// Each variant corresponds to spec page map

type BGType =
  | "beamsGold"
  | "floatingSpot"
  | "dnaHelix"
  | "geoBoxes"
  | "galaxyBeams"
  | "quantumAurora"
  | "starGlow"
  | "cosmicNoise"
  | "neonSpot"
  | "neuralWavy"
  | "particleGrid"

export function AnimatedBackground({ type }: { type: BGType }) {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden bg-[#07070b]">
      <BackgroundLayer type={type} />
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_70%_-10%,rgba(231,184,75,0.05),transparent),radial-gradient(900px_600px_at_0%_100%,rgba(120,88,255,0.034),transparent)]" />
      <div className="absolute inset-0 opacity-[0.045] noise-overlay pointer-events-none" />
    </div>
  )
}

function BackgroundLayer({ type }: { type: BGType }) {
  switch(type){
    case "beamsGold": return <BeamsGold />
    case "floatingSpot": return <FloatingSpot />
    case "dnaHelix": return <DnaHelix />
    case "geoBoxes": return <GeoBoxes />
    case "galaxyBeams": return <GalaxyBeams />
    case "quantumAurora": return <QuantumAurora />
    case "starGlow": return <StarGlow />
    case "cosmicNoise": return <CosmicNoise />
    case "neonSpot": return <NeonSpot />
    case "neuralWavy": return <NeuralWavy />
    case "particleGrid": return <ParticleGrid />
    default: return null
  }
}

// ---- individual backgrounds ----

function BeamsGold(){
  return (
    <div className="absolute inset-0">
      <ParticleNetwork color="#e7b84b" density={58} linkDist={140} speed={0.45} />
      {/* Aceternity style beams */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `repeating-linear-gradient(105deg, transparent 0px, transparent 78px, rgba(231,184,75,0.11) 80px, transparent 82px), repeating-linear-gradient(-105deg, transparent 0px, transparent 115px, rgba(247,207,106,0.065) 117px, transparent 119px)`
      }}/>
      <div className="absolute -top-28 -left-24 w-[560px] h-[560px] rounded-full blur-[140px] opacity-[0.17]" style={{background:"radial-gradient(circle, #f7cf6a 0%, #e7b84b 40%, transparent 70%)"}} />
    </div>
  )
}

function FloatingSpot(){
  return (
    <div className="absolute inset-0">
      <div className="absolute top-[12%] left-[56%] w-[420px] h-[420px] rounded-full blur-[120px] opacity-[0.16]" style={{background:"radial-gradient(circle,#f9d776,#d8a53a 55%, transparent 70%)"}} />
      <FloatingBubbles />
    </div>
  )
}

function DnaHelix(){
  return (
    <div className="absolute inset-0">
      <HelixCanvas />
      <div className="absolute inset-0 opacity-[0.10]" style={{
        background: "linear-gradient(180deg, rgba(120,110,255,0.16), transparent 30%, transparent 70%, rgba(231,184,75,0.09))"
      }} />
    </div>
  )
}

function GeoBoxes(){
  return (
    <div className="absolute inset-0 retro-grid opacity-[0.24]">
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(0deg, rgba(231,184,75,0.045) 1px, transparent 1px)",
        backgroundSize: "100% 36px"
      }}/>
      <MovingSquares />
    </div>
  )
}

function GalaxyBeams(){
  return (
    <div className="absolute inset-0">
      <SpiralCanvas />
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(1200px 600px at 50% -10%, rgba(231,184,75,0.055), transparent)"
      }}/>
    </div>
  )
}

function QuantumAurora(){
  return <AuroraCanvas />
}

function StarGlow(){
  return (
    <div className="absolute inset-0">
      <StarFieldCanvas />
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({length:14}).map((_,i)=>(
          <div key={i}
            className="absolute w-1 h-1 rounded-full bg-[#f7cf6a]"
            style={{
              left: `${(i*73)%100}%`,
              top: `${(i*53)%100}%`,
              boxShadow:"0 0 16px #f7cf6a",
              opacity: .7,
              animation: `twinkle ${3+i%4}s ease-in-out infinite`
            }}/>
        ))}
      </div>
      <style>{`@keyframes twinkle { 0%,100%{opacity:.18; transform:scale(.8);} 50%{opacity:1; transform:scale(1.35);} }`}</style>
    </div>
  )
}

function CosmicNoise(){
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 opacity-[0.23]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='420'%3E%3Cfilter id='f'%3E%3CfeTurbulence baseFrequency='.95'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='.17'/%3E%3C/svg%3E")`
      }}/>
      <ParticleNetwork color="#bda66a" density={34} linkDist={125} speed={0.28} />
    </div>
  )
}

function NeonSpot(){
  return (
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] rounded-full blur-[140px] opacity-[0.12]" style={{background:"conic-gradient(from 10deg, #ffd46d, #ff9f5a, #9b6bff, #ffd46d)"}}/>
      <div className="absolute inset-0" style={{background:"radial-gradient(680px 380px at 50% 32%, rgba(247,207,106,0.14), transparent 68%)"}}/>
    </div>
  )
}

function NeuralWavy(){
  return (
    <div className="absolute inset-0">
      <NeuralCanvas />
      <WavyBottom />
    </div>
  )
}

function ParticleGrid(){
  return (
    <div className="absolute inset-0 retro-grid opacity-[0.27]">
      <ParticleNetwork color="#e1b75d" density={46} linkDist={120} speed={0.33} />
    </div>
  )
}

/* ---- canvas utilities ---- */

function ParticleNetwork(_: {color?:string, density?:number, linkDist?:number, speed?:number}){
  return null
}

function StarFieldCanvas(){
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const c = ref.current!; const ctx=c.getContext('2d')!
    let w=c.width=innerWidth, h=c.height=innerHeight
    const onR=()=>{ w=c.width=innerWidth; h=c.height=innerHeight }
    addEventListener('resize', onR)
    const isMobile = window.innerWidth < 768
    const numStars = isMobile ? 65 : 210
    const stars = Array.from({length:numStars}).map(()=>({
      x: Math.random()*w, y: Math.random()*h,
      r: Math.random()*1.35+.25,
      s: Math.random()*0.45+0.15,
      o: Math.random()
    }))
    let raf=0; const tick=()=>{
      ctx.clearRect(0,0,w,h)
      for(const st of stars){
        st.o += st.s*0.018
        const a = 0.38 + Math.sin(st.o)*0.30
        ctx.beginPath(); ctx.fillStyle=`rgba(247,211,120,${a})`; ctx.arc(st.x, st.y, st.r, 0, Math.PI*2); ctx.fill()
      }
      raf=requestAnimationFrame(tick)
    }; tick()
    return ()=>{ cancelAnimationFrame(raf); removeEventListener('resize', onR) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-95" />
}

function SpiralCanvas(){
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const c=ref.current!; const ctx=c.getContext('2d')!
    let w=c.width=innerWidth, h=c.height=innerHeight
    const onR=()=>{ w=c.width=innerWidth; h=c.height=innerHeight }
    addEventListener('resize', onR)
    let t=0, raf=0
    const isMobile = window.innerWidth < 768
    const numPoints = isMobile ? 120 : 310
    const numArms = isMobile ? 2 : 3
    const draw=()=>{
      t+=0.011
      ctx.clearRect(0,0,w,h)
      ctx.save(); ctx.translate(w/2, h/2)
      for(let arm=0; arm<numArms; arm++){
        const armOffset = (Math.PI*2/numArms)*arm
        ctx.beginPath()
        for(let i=0;i<numPoints;i++){
          const a = i*0.14 + armOffset + t*0.45
          const r = 10 + i*1.72
          const x = Math.cos(a)*r
          const y = Math.sin(a)*r * 0.72
          if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y)
        }
        ctx.strokeStyle = "rgba(231,184,75,0.19)"
        ctx.lineWidth = 1.2
        ctx.stroke()
      }
      ctx.restore()
      raf=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{ cancelAnimationFrame(raf); removeEventListener('resize', onR) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-[0.95]" />
}

function HelixCanvas(){
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const c=ref.current!; const ctx=c.getContext('2d')!
    let w=c.width=innerWidth, h=c.height=innerHeight
    const onR=()=>{ w=c.width=innerWidth; h=c.height=innerHeight }
    addEventListener('resize', onR)
    let t=0, raf=0
    const isMobile = window.innerWidth < 768
    const stepY = isMobile ? 16 : 6
    const rungStepY = isMobile ? 48 : 28
    const draw=()=>{
      t+=0.019
      ctx.clearRect(0,0,w,h)
      const cx=w*0.72, cy=h/2
      ctx.lineWidth=1.25
      for(let strand=0; strand<2; strand++){
        ctx.beginPath()
        for(let y=-h/2; y<h/2; y+=stepY){
          const phase = y*0.017 + t + strand*Math.PI
          const x = Math.sin(phase)*78
          const px = cx + x
          const py = cy + y
          if(y===-Math.floor(h/2)) ctx.moveTo(px,py); else ctx.lineTo(px,py)
        }
        ctx.strokeStyle = strand ? "rgba(231,184,75,0.42)" : "rgba(170,133,255,0.36)"
        ctx.stroke()
      }
      // rungs
      for(let y=-h/2; y<h/2; y+=rungStepY){
        const phase = y*0.017 + t
        const x1 = Math.sin(phase)*78
        const x2 = Math.sin(phase+Math.PI)*78
        ctx.beginPath()
        ctx.moveTo(cx+x1, cy+y)
        ctx.lineTo(cx+x2, cy+y)
        ctx.strokeStyle="rgba(231,184,75,0.13)"
        ctx.lineWidth=1
        ctx.stroke()
      }
      raf=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{ cancelAnimationFrame(raf); removeEventListener('resize', onR) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />
}

function AuroraCanvas(){
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const c=ref.current!; const ctx=c.getContext('2d')!
    let w=c.width=innerWidth, h=c.height=innerHeight
    const onR=()=>{ w=c.width=innerWidth; h=c.height=innerHeight }
    addEventListener('resize', onR)
    let t=0, raf=0
    const draw=()=>{
      t+=0.012
      ctx.clearRect(0,0,w,h)
      for(let i=0;i<3;i++){
        const grad = ctx.createLinearGradient(0,0,w,0)
        grad.addColorStop(0, `hsla(${40+i*35}, 78%, 61%, 0.05)`)
        grad.addColorStop(.5, `hsla(${275+i*16}, 64%, 58%, 0.07)`)
        grad.addColorStop(1, `hsla(${45+i*10}, 82%, 60%, 0.045)`)
        ctx.fillStyle=grad
        const isMobile = window.innerWidth < 768
        const stepX = isMobile ? 64 : 26
        ctx.beginPath()
        const base = h*0.32 + i*90
        ctx.moveTo(0, base)
        for(let x=0;x<=w;x+=stepX){
          const y = Math.sin((x*0.004)+t+i)+Math.sin((x*0.007)-t*1.4+i*0.7)
          ctx.lineTo(x, base + y*37)
        }
        ctx.lineTo(w, h); ctx.lineTo(0,h); ctx.closePath(); ctx.fill()
      }
      raf=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{ cancelAnimationFrame(raf); removeEventListener('resize', onR) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-90" />
}

function NeuralCanvas(){
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const c=ref.current!; const ctx=c.getContext('2d')!
    let w=c.width=innerWidth, h=c.height=innerHeight
    const onR=()=>{ w=c.width=innerWidth; h=c.height=innerHeight }
    addEventListener('resize', onR)
    const isMobile = window.innerWidth < 768
    const numNodes = isMobile ? 12 : 28
    const nodes = Array.from({length:numNodes}).map(()=>({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-.5)*0.28, vy:(Math.random()-.5)*0.28
    }))
    let raf=0
    const draw=()=>{
      ctx.clearRect(0,0,w,h)
      nodes.forEach(n=>{ n.x+=n.vx; n.y+=n.vy; if(n.x<0||n.x>w) n.vx*=-1; if(n.y<0||n.y>h) n.vy*=-1 })
      // edges
      ctx.lineWidth = 0.8
      for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j]
        const dx=a.x-b.x, dy=a.y-b.y
        const d=Math.sqrt(dx*dx+dy*dy)
        if(d<195){ ctx.strokeStyle=`rgba(231,184,75,${0.16*(1-d/195)})`; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke() }
      }
      nodes.forEach(n=>{
        ctx.beginPath(); ctx.arc(n.x,n.y,2.1,0,Math.PI*2); ctx.fillStyle="rgba(247,207,106,0.9)"; ctx.fill()
      })
      raf=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{ cancelAnimationFrame(raf); removeEventListener('resize', onR) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />
}

/* small css helpers */
function FloatingBubbles(){
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({length:14}).map((_,i)=>(
        <span key={i}
          className="absolute rounded-full"
          style={{
            width: 24 + (i%5)*26,
            height: 24 + (i%5)*26,
            left: `${(i*71)%100}%`,
            top: `${100 + (i*13)%20}%`,
            background: "radial-gradient(circle at 32% 30%, rgba(255,236,180,0.24), rgba(231,184,75,0.07))",
            border: "1px solid rgba(231,184,75,0.16)",
            filter: "blur(.25px)",
            animation: `floatUp ${16 + i%9}s linear ${i* -2.7}s infinite`
          }}
        />
      ))}
      <style>{`@keyframes floatUp{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-135vh) scale(1.06)}}`}</style>
    </div>
  )
}
function MovingSquares(){
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
      {Array.from({length:9}).map((_,i)=>(
        <div key={i} className="absolute border border-[rgba(231,184,75,0.19)] rounded-[10px]"
          style={{
            width: 64+ i*18, height: 64+i*18,
            left: `${8+i*10}%`, top: `${12+i*7}%`,
            transform: `rotate(${i*13}deg)`,
            animation: `wobble ${6+i}s ease-in-out infinite`
          }}
        />
      ))}
    </div>
  )
}
function WavyBottom(){
  return (
    <svg className="absolute bottom-0 left-0 w-full h-[180px] opacity-[0.15]" viewBox="0 0 1440 320" preserveAspectRatio="none">
      <path fill="rgba(231,184,75,0.45)" d="M0,192L48,186.7C96,181,192,171,288,176C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,160C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </svg>
  )
}

export function hexA(hex:string, a:number){
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}

export type { BGType }
