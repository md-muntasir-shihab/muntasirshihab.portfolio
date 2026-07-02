// Portfolio Data – bilingual BN/EN
// MD MUNTASIR SHIHAB — Panchagarh & Khulna University, Bangladesh

export type Lang = 'bn' | 'en'

export interface Project {
  id: string
  title: { en: string; bn: string }
  blurb: { en: string; bn: string }
  desc?: { en: string; bn: string }
  year: string
  tags: string[]
  img?: string
  link?: string
  github?: string
  featured: boolean
}

export interface BlogPost {
  slug: string
  title: { en: string; bn: string }
  excerpt: { en: string; bn: string }
  content?: { en: string; bn: string }
  date: string
  read: string
  tags: string[]
  image?: string
}

export interface Recommendation {
  name: string
  designation: string
  company: string
  relationship: { en: string; bn: string }
  text: { en: string; bn: string }
  date: string
  category: string
  rating: number
  linkedin: string
  avatar?: string
}

export const profile = {
  name: { en: "MD MUNTASIR SHIHAB", bn: "মোঃ মুনতাসির শিহাব" },
  firstName: "MD MUNTASIR",
  lastName: "SHIHAB",
  avatar: "", // Paste Image URL from Admin to show profile photo
  title: { 
    en: "Student • Graphic Designer • Creative Learner",
    bn: "শিক্ষার্থী • গ্রাফিক ডিজাইনার • সৃজনশীল শিক্ষার্থী"
  },
  roleLines: {
    en: [
      "Student @ Khulna University",
      "Graphic & Brand Identity Designer",
      "Creative Learner",
      "Former President @ Rongdhonu Foundation"
    ],
    bn: [
      "খুলনা বিশ্ববিদ্যালয়ের শিক্ষার্থী",
      "গ্রাফিক ও ব্র্যান্ড ডিজাইনার",
      "সৃজনশীল শিক্ষার্থী",
      "প্রাক্তন সভাপতি @ রংधনু ফাউন্ডেশন"
    ]
  },
  bioShort: {
    en: "B.Sc. Statistics student at Khulna University. Passionate Graphic Designer, Brand specialist, and former President of Rongdhonu Foundation Sadar Branch.",
    bn: "খুলনা বিশ্ববিদ্যালয়ে পরিসংখ্যানের স্নাতক শিক্ষার্থী। গ্রাফিক ডিজাইনার, ব্র্যান্ডিং স্পেশালিস্ট এবং রংधনু ফাউন্ডেশন সদর শাখার প্রাক্তন সভাপতি।"
  },
  bioLong: {
    en: "I am MD Muntasir Shihab, currently pursuing my B.Sc. in Statistics at Khulna University. I am an aspiring Graphic & Brand Identity Designer, a Creative Learner, and a committed social organizer. I served as the President of Rongdhonu Foundation Sadar Branch (2023–2024), leading volunteer teams and organizing educational and social welfare initiatives across Panchagarh.",
    bn: "আমি মোঃ মুনতাসির শিহাব, খুলনা বিশ্ববিদ্যালয়ের পরিসংখ্যান বিভাগে বি.এস.সি. (স্নাতক) পর্যায়ে অধ্যয়নরত। আমি একজন গ্রাফিক ও ব্র্যান্ড ডিজাইনার, সৃজনশীল শিক্ষার্থী এবং সমাজকর্মী। আমি সফলভাবে রংধনু ফাউন্ডেশন সদর শাখার সভাপতি (২০২৩–২০২৪) হিসেবে দায়িত্ব পালন করেছি, যেখানে আমি পঞ্চগড়ে শিক্ষামূলক ও সমাজকল্যাণমূলক বিভিন্ন স্বেচ্ছাসেবী কার্যক্রমে নেতৃত্ব দিয়েছি।"
  },
  location: { en: "Panchagarh • Khulna, Bangladesh", bn: "পঞ্চগড় • খুলনা, বাংলাদেশ" },
  email: "",
  phone: "+880 1317 138570",
  availability: true,
  currentlyWorkingOn: {
    en: "B.Sc. Statistics @ Khulna University & Creative Graphic Designs",
    bn: "খুলনা বিশ্ববিদ্যালয়ে বি.এস.সি. পরিসংখ্যান অধ্যয়ন ও গ্রাফিক ডিজাইন"
  },
  currentlyWorkingUrl: "",
  cvUrl: "",
  atsCvUrl: "",
  personalDetails: {
    gender: { en: "Male", bn: "পুরুষ" },
    bloodGroup: "A+",
    dob: { en: "12 October 2005", bn: "১২ অক্টোবর ২০০৫" },
    nationality: { en: "Bangladeshi", bn: "বাংলাদেশী" },
    religion: { en: "Islam", bn: "ইসলাম" },
    maritalStatus: { en: "Unmarried", bn: "অবিবাহিত" },
    placeOfBirth: { en: "Panchagarh, Bangladesh", bn: "পঞ্চগড়, বাংলাদেশ" },
    occupation: { en: "Student", bn: "শিক্ষার্থী" },
    university: { en: "Khulna University", bn: "খুলনা বিশ্ববিদ্যালয়" },
    department: { en: "Statistics", bn: "পরিসংখ্যান" },
    degree: { en: "B.Sc. (Undergraduate)", bn: "বি.এস.সি. (স্নাতক)" },
    academicStatus: { en: "Undergraduate Student", bn: "স্নাতক পর্যায়ের শিক্ষার্থী" },
    presentAddress: {
      en: "Old Panchagarh, Panchagarh Sadar, Panchagarh, Bangladesh",
      bn: "পুরাতন পঞ্চগড়, পঞ্চগড় সদর, পঞ্চগড়, বাংলাদেশ"
    },
    permanentAddress: {
      en: "Dangabari, Gorinabari, Panchagarh Sadar, Panchagarh, Bangladesh",
      bn: "ডাঙ্গাবাড়ী, গরিনাবাড়ী, পঞ্চগড় সদর, পঞ্চগড়, বাংলাদেশ"
    }
  },
  stats: [
    { label: { en: "Design Projects", bn: "ডিজাইন প্রজেক্ট" }, value: 20 },
    { label: { en: "Leadership Roles", bn: "নেতৃত্বের ভূমিকা" }, value: 1 },
    { label: { en: "Academic Years", bn: "একাডেমিক বছর" }, value: 2 },
    { label: { en: "Volunteers Managed", bn: "স্বেচ্ছাসেবক পরিচালনা" }, value: 50 },
  ],
  socials: [
    // ---- Social ----
    { name: "WhatsApp", handle: "WhatsApp", url: "https://wa.me/8801317138570", color: "#25d366", enabled: true, customLogo: "", category: "social" },
    { name: "Telegram", handle: "@muntasir", url: "https://t.me/muntasir", color: "#26A5E4", enabled: true, customLogo: "", category: "social" },
    { name: "Facebook", handle: "muntasir.shihab", url: "https://facebook.com", color: "#1877F2", enabled: true, customLogo: "", category: "social" },
    { name: "Instagram", handle: "@muntasir.shihab", url: "https://instagram.com", color: "#E4405F", enabled: true, customLogo: "", category: "social" },
    { name: "X", handle: "@muntasir", url: "https://x.com", color: "#ffffff", enabled: true, customLogo: "", category: "social" },
    { name: "Threads", handle: "@muntasir", url: "https://threads.net", color: "#ffffff", enabled: true, customLogo: "", category: "social" },
    { name: "YouTube", handle: "YouTube", url: "https://youtube.com", color: "#FF0000", enabled: true, customLogo: "", category: "social" },
    { name: "Reddit", handle: "Reddit", url: "https://reddit.com", color: "#FF4500", enabled: true, customLogo: "", category: "social" },
    // ---- Professional ----
    { name: "LinkedIn", handle: "muntasir-shihab", url: "https://linkedin.com", color: "#0A66C2", enabled: true, customLogo: "", category: "professional" },
    { name: "GitHub", handle: "@muntasir-shihab", url: "https://github.com", color: "#ffffff", enabled: true, customLogo: "", category: "professional" },
    { name: "Upwork", handle: "Upwork", url: "https://upwork.com", color: "#14A800", enabled: true, customLogo: "", category: "professional" },
    { name: "Fiverr", handle: "Fiverr", url: "https://fiverr.com", color: "#1DBF73", enabled: true, customLogo: "", category: "professional" },
    { name: "Freelancer", handle: "Freelancer", url: "https://freelancer.com", color: "#29B2FE", enabled: true, customLogo: "", category: "professional" },
    { name: "Toptal", handle: "Toptal", url: "https://toptal.com", color: "#3863A0", enabled: true, customLogo: "", category: "professional" },
    // ---- Design / Creative ----
    { name: "Pinterest", handle: "Pinterest", url: "https://pinterest.com", color: "#E60023", enabled: true, customLogo: "", category: "design" },
    { name: "Behance", handle: "Behance", url: "https://behance.net", color: "#1769FF", enabled: true, customLogo: "", category: "design" },
    { name: "Dribbble", handle: "Dribbble", url: "https://dribbble.com", color: "#EA4C89", enabled: true, customLogo: "", category: "design" },
  ]
}

export const experience = [
  {
    id: "e1",
    company: "Rongdhonu Foundation",
    role: { en: "President, Sadar Branch", bn: "সভাপতি, সদর শাখা" },
    period: "2023 — 2024",
    location: "Panchagarh Sadar, Panchagarh • On-site",
    bullets: {
      en: [
        "Led voluntary youth community welfare initiatives across Panchagarh Sadar.",
        "Organized educational support, public health campaigns, and leadership programs.",
        "Managed branch administration, team collaboration, and volunteer coordination."
      ],
      bn: [
        "পঞ্চগড় সদর জুড়ে স্বেচ্ছাসেবী যুব সমাজকল্যাণমূলক কার্যক্রমে সফল নেতৃত্ব প্রদান।",
        "শিক্ষামূলক সহায়তা, জনস্বাস্থ্য সচেতনতা এবং যুব লিডারশিপ কর্মসূচি আয়োজন।",
        "শাখা প্রশাসন পরিচালনা, টিম কোলাবোরেশন এবং স্বেচ্ছাসেবক সমন্বয়।"
      ]
    },
    tags: ["Leadership", "Community Work", "Management", "Public Relation"]
  }
]

export const education = [
  {
    school: "Khulna University (খুলনা বিশ্ববিদ্যালয়)",
    degree: { en: "B.Sc. in Statistics (Undergraduate)", bn: "পরিসংখ্যান বিভাগে বি.এস.সি. (স্নাতক)" },
    period: "2026 – Present",
    note: { en: "Department of Statistics • Undergraduate Student", bn: "পরিসংখ্যান বিভাগ • স্নাতক পর্যায়ের শিক্ষার্থী" }
  },
  {
    school: "Makbular Rahman Government College (মকবুলার রহমান সরকারি কলেজ)",
    degree: { en: "Higher Secondary Certificate (HSC) — Science", bn: "উচ্চ মাধ্যমিক (HSC) — বিজ্ঞান বিভাগ" },
    period: "2024",
    note: { en: "GPA 4.92 / 5.00", bn: "জিপিএ ৪.৯২ / ৫.০০" }
  },
  {
    school: "Amena-Baki Residential Model School & College (ABRMS)",
    degree: { en: "Secondary School Certificate (SSC) — Science", bn: "মাধ্যমিক (SSC) — বিজ্ঞান বিভাগ" },
    period: "2022",
    note: { en: "GPA 5.00 (Golden GPA 5)", bn: "জিপিএ ৫.০০ (গোল্ডেন এ+)" }
  },
  {
    school: "Amena-Baki Residential Model School & College (ABRMS)",
    degree: { en: "Junior School Certificate (JSC)", bn: "জুনিয়র স্কুল সার্টিফিকেট (JSC)" },
    period: "2019",
    note: { en: "GPA 5.00 (Golden GPA 5)", bn: "জিপিএ ৫.০০ (গোল্ডেন এ+)" }
  },
  {
    school: "Amena-Baki Residential Model School & College (ABRMS)",
    degree: { en: "Primary School Certificate (PSC)", bn: "প্রাইমারি স্কুল সার্টিফিকেট (PSC)" },
    period: "2016",
    note: { en: "GPA 5.00 (Golden GPA 5)", bn: "জিপিএ ৫.০০ (গোল্ডেন এ+)" }
  }
]

export const skills = [
  { name: "Graphic Design", level: 95, cat: "design" },
  { name: "Brand Identity", level: 92, cat: "design" },
  { name: "Logo Design", level: 94, cat: "design" },
  { name: "Adobe Photoshop", level: 90, cat: "design" },
  { name: "Adobe Illustrator", level: 93, cat: "design" },
  { name: "Canva", level: 95, cat: "design" },
  { name: "Figma", level: 85, cat: "design" },
  { name: "Basic HTML", level: 80, cat: "dev" },
  { name: "Basic CSS", level: 80, cat: "dev" },
  { name: "Basic Web Development", level: 75, cat: "dev" },
  { name: "Digital Marketing", level: 85, cat: "design" },
  { name: "AI Tools", level: 90, cat: "dev" },
  { name: "Microsoft Office", level: 95, cat: "dev" },
  { name: "Google Workspace", level: 95, cat: "dev" },
  { name: "Problem Solving", level: 88, cat: "dev" },
  { name: "Communication", level: 95, cat: "dev" },
  { name: "Teamwork", level: 95, cat: "dev" },
  { name: "Learning Ability", level: 98, cat: "dev" },
]

export const tools = [
  "Adobe Illustrator", "Adobe Photoshop", "Canva", "Figma", "HTML5", "CSS3", "Microsoft Office", "Google Workspace", "Digital Marketing", "AI Tools"
]

export const projects: Project[] = []

export const githubStats = {
  contributions: 120,
  streak: 5,
  repos: 4,
  followers: 12,
  stars: 15,
  langs: [
    { name: "HTML/CSS", pct: 70 },
    { name: "JavaScript", pct: 20 },
    { name: "Other", pct: 10 },
  ]
}

export const blogPosts: BlogPost[] = []

export const testimonials = [
  {
    name: "General Secretary",
    role: { en: "Rongdhonu Foundation", bn: "রংধনু ফাউন্ডেশন" },
    text: { 
      en: "Muntasir Shihab demonstrated exceptional leadership as President of our Sadar Branch. Energetic, dedicated, and highly creative.",
      bn: "মুনতাসির শিহাব আমাদের সদর শাখার সভাপতি হিসেবে অসাধারণ নেতৃত্ব প্রদর্শন করেছেন। উদ্যোমী, দায়িত্বশীল ও অত্যন্ত সৃজনশীল।"
    },
    company: "Rongdhonu Foundation"
  }
]

export const recommendations: Recommendation[] = [
  {
    name: "Executive Committee",
    designation: "Central Board",
    company: "Rongdhonu Foundation BD",
    relationship: { en: "Organization Leadership", bn: "সংগঠন নেতৃত্ব" },
    text: {
      en: "Under MD Muntasir Shihab's leadership in 2023–2024, the Sadar Branch achieved milestone youth participation and welfare execution.",
      bn: "২০২৩–২০২৪ সালে মোঃ মুনতাসির শিহাবের নেতৃত্বে সদর শাখা যুব স্বেচ্ছাসেবী কার্যক্রমে অভূতপূর্ব সাফল্য অর্জন করে।"
    },
    date: "2024-12-10",
    category: "colleague",
    rating: 5,
    linkedin: "https://linkedin.com"
  }
]

export const services = [
  {
    icon: "sparkles",
    title: { en: "Brand Identity & Logo Design", bn: "ব্র্যান্ড আইডেন্টিটি ও লোগো ডিজাইন" },
    desc: { en: "Custom modern logos, color palettes, typography, and full corporate branding kits.", bn: "কাস্টম লোগো, কালার প্যালেট, টাইপোগ্রাফি এবং কর্পোরেট ব্র্যান্ডিং কিট।" },
    time: "3–7 days",
    price: "Custom Quote"
  },
  {
    icon: "layers",
    title: { en: "Frontend Web Layout (HTML/CSS)", bn: "ফ্রন্টএন্ড ওয়েব লেআউট (HTML/CSS)" },
    desc: { en: "Clean, responsive HTML5 & CSS3 landing pages and personal portfolio templates.", bn: "পরিচ্ছন্ন ও রেসপনসিভ HTML5/CSS3 ল্যান্ডিং পেজ এবং পোর্টফোলিও ডিজাইন।" },
    time: "4–10 days",
    price: "Custom Quote"
  }
]

export const hireMe = {
  available: true,
  status: { en: "Available for Graphic Design & Web Projects", bn: "গ্রাফিক ডিজাইন ও ওয়েব প্রজেক্টের জন্য প্রস্তুত" },
  workType: ["freelance","part-time","contract"],
  workMode: ["remote","hybrid"],
  notice: { en: "Immediate", bn: "তাত্ক্ষণিক" },
  timezone: "GMT+6 • Bangladesh",
  hours: "Flexible • GMT+6",
  stack: ["Graphic Design","Branding","HTML/CSS","Statistics","AI Tools"],
  calendly: "",
  whatsapp: "+8801317138570",
  salary: { show: false, range: "Negotiable" },
  visitorEmailEnabled: true,
  adminEmailEnabled: true,
  cvEmailEnabled: true,
  resendApiKey: "",
  emailFrom: "",
  emailTo: "",
}

export const achievements = [
  { en: "President, Rongdhonu Foundation Sadar Branch (2023–2024)", bn: "সভাপতি, রংধনু ফাউন্ডেশন সদর শাখা (২০২৩–২০২৪)" },
  { en: "Golden GPA 5.00 in SSC & JSC (ABRMS)", bn: "এসএসসি ও জেএসসিতে গোল্ডেন জিপিএ ৫.০০ (ABRMS)" },
  { en: "HSC GPA 4.92 — Science (Makbular Rahman Govt College)", bn: "এইচএসসি জিপিএ ৪.৯২ — বিজ্ঞান (মকবুলার রহমান সরকারি কলেজ)" },
]

export const pageBackgroundMap: Record<string, string> = {
  "/": "beamsGold",
  "/about": "floatingSpot",
  "/experience": "dnaHelix",
  "/skills": "geoBoxes",
  "/projects": "galaxyBeams",
  "/github": "quantumAurora",
  "/blog": "starGlow",
  "/testimonials": "cosmicNoise",
  "/recommendations": "cosmicNoise",
  "/hire-me": "neonSpot",
  "/contact": "neuralWavy",
  "/cv": "particleGrid"
}

// CMS Control System
export const sectionVisibility = {
  experience: true,
  skills: true,
  projects: true,
  blog: true,
  testimonials: true,
  recommendations: true,
  achievements: true,
  services: true,
}

export const ADMIN_SLUG = "xk9-admin-portal-2025"
