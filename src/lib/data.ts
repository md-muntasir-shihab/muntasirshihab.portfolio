// Portfolio Data – bilingual BN/EN
// MD MUNTASIR SHIHAB — Panchagarh & Khulna University, Bangladesh

export type Lang = 'bn' | 'en'

export const profile = {
  name: { en: "MD MUNTASIR SHIHAB", bn: "মোঃ মুনতাসির শিহাব" },
  firstName: "MUNTASIR",
  lastName: "SHIHAB",
  avatar: "", // Paste Image URL from Admin to show profile photo
  title: { 
    en: "Statistics Student • Graphic Designer & Web Developer",
    bn: "পরিসংখ্যান শিক্ষার্থী • গ্রাফিক ডিজাইনার ও ওয়েব ডেভেলপার"
  },
  roleLines: {
    en: [
      "B.Sc. in Statistics @ Khulna University",
      "Graphic & Brand Identity Designer",
      "Web Developer (HTML, CSS)",
      "Former President @ Rongdhonu Foundation"
    ],
    bn: [
      "বি.এস.সি. পরিসংখ্যান @ খুলনা বিশ্ববিদ্যালয়",
      "গ্রাফিক ও ব্র্যান্ড আইডেন্টিটি ডিজাইনার",
      "ওয়েব ডেভেলপার (HTML, CSS)",
      "প্রাক্তন সভাপতি @ রংধনু ফাউন্ডেশন"
    ]
  },
  bioShort: {
    en: "B.Sc. Statistics student at Khulna University (Session starting 2026). Passionate Graphic Designer, Brand specialist, Basic Web Developer, and social leader.",
    bn: "খুলনা বিশ্ববিদ্যালয়ে পরিসংখ্যানের স্নাতক শিক্ষার্থী। গ্রাফিক ডিজাইনার, ব্র্যান্ডিং স্পেশালিস্ট, বেসিক ওয়েব ডেভেলপার এবং রংধনু ফাউন্ডেশন সদর শাখার প্রাক্তন সভাপতি।"
  },
  bioLong: {
    en: "I am MD Muntasir Shihab from Panchagarh, Rangpur. Currently pursuing B.Sc. in Statistics at Khulna University. Passionate about data statistics, graphic design, branding, digital marketing, and modern web technologies. I served as the President of Rongdhonu Foundation Sadar Branch (2023–2024), leading impactful community initiatives.",
    bn: "আমি মোঃ মুনতাসির শিহাব, পঞ্চগড়, রংপুর থেকে। খুলনা বিশ্ববিদ্যালয়ে পরিসংখ্যান বিভাগে বি.এস.সি. অধ্যয়নরত। ডাটা পরিসংখ্যান, গ্রাফিক ডিজাইন, ব্র্যান্ডিং, ডিজিটাল মার্কেটিং এবং ওয়েব টেকনোলজিতে আগ্রহী। আমি রংধনু ফাউন্ডেশন সদর শাখার সভাপতি (২০২৩–২০২৪) হিসেবে সমাজকল্যাণমূলক কার্যক্রমে নেতৃত্ব দিয়েছি।"
  },
  location: { en: "Panchagarh • Khulna University, BD", bn: "পঞ্চগড় • খুলনা বিশ্ববিদ্যালয়, বাংলাদেশ" },
  email: "muntasir.shihab@gmail.com",
  phone: "+880 1X XXX XXXXX",
  availability: true,
  currentlyWorkingOn: {
    en: "B.Sc. Statistics @ Khulna University & Creative Brand Identity Designs",
    bn: "পরিসংখ্যান স্নাতক অধ্যয়ন ও ক্রিয়েটিভ ব্র্যান্ড আইডেন্টিটি ডিজাইন"
  },
  currentlyWorkingUrl: "https://github.com",
  personalDetails: {
    gender: { en: "Male", bn: "পুরুষ" },
    bloodGroup: "A+",
    dob: "12/10/2005",
    placeOfBirth: { en: "Panchagarh", bn: "পঞ্চগড়" },
    religion: { en: "Islam", bn: "ইসলাম" },
    maritalStatus: { en: "Unmarried", bn: "অবিবাহিত" },
    birthRegNo: "20057717343100708",
    fatherName: { en: "MD MOKBULAR RAHMAN", bn: "মোঃ মকবুলার রহমান" },
    motherName: { en: "MOST SURAIYA BEGUM", bn: "মোছাঃ সুরাইয়া বেগম" },
    presentAddress: {
      en: "C & B Mor, House No: 557/02, Ward No-09, Old Panchagarh, Panchagarh Sadar, Panchagarh - 5000",
      bn: "সিএন্ডবি মোড়, বাসা নং: ৫৫৭/০২, ওয়ার্ড নং-০৯, পুরাতন পঞ্চগড়, পঞ্চগড় সদর, পঞ্চগড় - ৫০০০"
    },
    permanentAddress: {
      en: "House No: 1088, Dangabari, Mahimaganj, Gorinabari, Panchagarh Sadar, Panchagarh - 5041",
      bn: "বাসা নং: ১০৮৮, ডাঙ্গাবাড়ি, মহিমাগঞ্জ, গরিনাবাড়ী, পঞ্চগড় সদর, পঞ্চগড় - ৫০৪১"
    }
  },
  stats: [
    { label: { en: "Graphic & Web Projects", bn: "ডিজাইন ও ওয়েব কাজ" }, value: 24 },
    { label: { en: "Leadership Experience", bn: "লিডারশিপ অভিজ্ঞতা" }, value: 2 },
    { label: { en: "Academic Excellence (HSC/SSC)", bn: "একাডেমিক জিপিএ" }, value: 5 },
    { label: { en: "Happy Clients", bn: "সন্তুষ্ট ক্লায়েন্ট" }, value: 18 },
  ],
  socials: [
    // Set enabled=false or url="" to hide individual platforms (admin controlled)
    // customLogo: paste image URL to override the default icon (e.g. uploaded brand logo)
    { name: "WhatsApp", handle: "WhatsApp", url: "https://wa.me/8801XXXXXXXXX", color: "#25d366", enabled: true, customLogo: "" },
    { name: "Telegram", handle: "@muntasir", url: "https://t.me/muntasir", color: "#26A5E4", enabled: true, customLogo: "" },
    { name: "LinkedIn", handle: "muntasir-shihab", url: "https://linkedin.com", color: "#0A66C2", enabled: true, customLogo: "" },
    { name: "GitHub", handle: "@muntasir-shihab", url: "https://github.com", color: "#ffffff", enabled: true, customLogo: "" },
    { name: "Facebook", handle: "muntasir.shihab", url: "https://facebook.com", color: "#1877F2", enabled: true, customLogo: "" },
    { name: "Instagram", handle: "@muntasir.shihab", url: "https://instagram.com", color: "#E4405F", enabled: true, customLogo: "" },
    { name: "X", handle: "@muntasir", url: "https://x.com", color: "#ffffff", enabled: true, customLogo: "" },
    { name: "Threads", handle: "@muntasir", url: "https://threads.net", color: "#ffffff", enabled: true, customLogo: "" },
    { name: "YouTube", handle: "YouTube Channel", url: "https://youtube.com", color: "#FF0000", enabled: true, customLogo: "" },
    { name: "Pinterest", handle: "Pinterest", url: "https://pinterest.com", color: "#E60023", enabled: true, customLogo: "" },
    { name: "Behance", handle: "Behance", url: "https://behance.net", color: "#1769FF", enabled: true, customLogo: "" },
    { name: "Dribbble", handle: "Dribbble", url: "https://dribbble.com", color: "#EA4C89", enabled: true, customLogo: "" },
    { name: "Reddit", handle: "Reddit", url: "https://reddit.com", color: "#FF4500", enabled: true, customLogo: "" },
    { name: "Upwork", handle: "Upwork", url: "https://upwork.com", color: "#14A800", enabled: true, customLogo: "" },
    { name: "Fiverr", handle: "Fiverr", url: "https://fiverr.com", color: "#1DBF73", enabled: true, customLogo: "" },
    { name: "Freelancer", handle: "Freelancer", url: "https://freelancer.com", color: "#29B2FE", enabled: true, customLogo: "" },
    { name: "Toptal", handle: "Toptal", url: "https://toptal.com", color: "#3863A0", enabled: true, customLogo: "" },
  ]
}

export const experience = [
  {
    id: "e1",
    company: "Rongdhonu Foundation (রংধনু ফাউন্ডেশন)",
    role: { en: "President, Sadar Branch", bn: "সদর শাখা সভাপতি" },
    period: "2023 — 2024",
    location: "Panchagarh • On-site",
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
    tags: ["Leadership","Community Work","Management","Public Speaking"]
  },
  {
    id: "e2",
    company: "Creative Studio & Freelance",
    role: { en: "Graphic Designer & Brand Identity Specialist", bn: "গ্রাফিক ও ব্র্যান্ড ডিজাইনার" },
    period: "2022 — Present",
    location: "Remote",
    bullets: {
      en: [
        "Designed modern logos, brand guidelines, social media kits, and promotional materials.",
        "Created digital marketing campaigns and graphics for startups and local organizations.",
        "Developed clean, structured HTML/CSS frontends for personal and business sites."
      ],
      bn: [
        "আধুনিক লোগো, ব্র্যান্ড গাইডলাইন, সোশ্যাল মিডিয়া কিট এবং প্রমোশনাল মেটেরিয়াল ডিজাইন।",
        "স্টার্টআপ এবং স্থানীয় প্রতিষ্ঠানের জন্য ডিজিটাল মার্কেটিং ও ক্রিয়েটিভ গ্রাফিক্স তৈরি।",
        "ব্যক্তিগত ও ব্যবসায়িক ওয়েবসাইটের জন্য পরিচ্ছন্ন HTML/CSS ফ্রন্টএন্ড তৈরি।"
      ]
    },
    tags: ["Graphic Design","Logo Design","Branding","HTML & CSS","Digital Marketing"]
  }
]

export const education = [
  {
    school: "Khulna University (খুলনা বিশ্ববিদ্যালয়)",
    degree: { en: "B.Sc. in Statistics (স্নাতক)", bn: "বি.এস.সি. পরিসংখ্যান বিভাগ" },
    period: "৫ এপ্রিল ২০২৬ – বর্তমান",
    note: { en: "Bachelor's Degree • Statistics Department", bn: "স্নাতক ডিগ্রি • পরিসংখ্যান বিভাগ" }
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
  { name: "Graphic Design (গ্রাফিক ডিজাইন)", level: 96, cat: "design" },
  { name: "Branding & Logo Design", level: 94, cat: "design" },
  { name: "Microsoft Office Suite", level: 95, cat: "design" },
  { name: "Basic Web Dev (HTML, CSS)", level: 85, cat: "dev" },
  { name: "Digital Marketing", level: 88, cat: "design" },
  { name: "Statistics & Data Analysis", level: 86, cat: "dev" },
  { name: "Leadership & Communication", level: 95, cat: "dev" },
]

export const tools = [
  "Adobe Illustrator", "Adobe Photoshop", "Canva Pro", "HTML5", "CSS3", "JavaScript", "Microsoft Word", "Excel", "PowerPoint", "Digital Marketing", "Statistical Analysis", "Firebase", "Git"
]

export const projects = [
  {
    id:"p1",
    title: { en: "Brand Identity — Modern Startup Kit", bn: "ব্র্যান্ড আইডেন্টিটি — মডার্ন স্টার্টআপ কিট" },
    blurb: { en: "Complete brand guidelines, custom logo typography, and corporate stationery design.", bn: "সম্পূর্ণ ব্র্যান্ড গাইডলাইন, কাস্টম লোগো টাইপোগ্রাফি এবং কর্পোরেট স্টেশনারি ডিজাইন।" },
    tags: ["Graphic Design","Branding","Logo","Illustrator"],
    year:"2025",
    featured: true,
    link: "#",
    github: "#"
  },
  {
    id:"p2",
    title: { en: "Rongdhonu Foundation Welfare Portal", bn: "রংধনু ফাউন্ডেশন ওয়েলফেয়ার পোর্টাল" },
    blurb: { en: "Digital campaign banners, community outreach graphics, and clean HTML/CSS web layout.", bn: "ডিজিটাল ক্যাম্পেইন ব্যানার, কমিউনিটি সচেতনতা গ্রাফিক্স এবং HTML/CSS ওয়েব লেআউট।"},
    tags: ["HTML & CSS","Digital Marketing","Social Welfare"],
    year:"2024",
    featured: true,
    link: "#",
    github: "#"
  },
  {
    id:"p3",
    title: { en: "Statistical Data Infographics Series", bn: "পরিসংখ্যানগত ডাটা ইনফোগ্রাফিক্স সিরিজ" },
    blurb: { en: "Visual presentation of demographic and sample data using charts and modern infographic vectors.", bn: "চার্ট এবং মডার্ন ইনফোগ্রাফিক ভেক্টরের মাধ্যমে পরিসংখ্যানগত ডাটার ভিজ্যুয়াল উপস্থাপন।"},
    tags: ["Statistics","Infographics","Excel","Design"],
    year:"2025",
    featured: true,
    link:"#",
    github:"#"
  }
]

export const githubStats = {
  contributions: 340,
  streak: 18,
  repos: 12,
  followers: 45,
  stars: 84,
  langs: [
    { name: "HTML/CSS", pct: 52 },
    { name: "JavaScript", pct: 24 },
    { name: "Markdown", pct: 14 },
    { name: "Other", pct: 10 },
  ]
}

export const blogPosts = [
  {
    slug: "power-of-brand-identity-2026",
    title: { en: "Why Clean Brand Identity Matters for Modern Organizations", bn: "আধুনিক প্রতিষ্ঠানের জন্য পরিচ্ছন্ন ব্র্যান্ড আইডেন্টিটি কেন জরুরি" },
    date: "2026-01-15",
    read: "5 min",
    excerpt: { en: "Exploring how consistent typography, color psychology, and minimal logo design build immediate trust.", bn: "ধারাবাহিক টাইপোগ্রাফি, কালার সাইকোলজি এবং মিনিমাল লোগো কীভাবে দ্রুত বিশ্বাসযোগ্যতা তৈরি করে।" },
    tags: ["Branding","Graphic Design"]
  },
  {
    slug: "statistics-in-everyday-decision-making",
    title: { en: "The Role of Statistics in Data-Driven Decision Making", bn: "ডাটা-ড্রিভেন সিদ্ধান্ত গ্রহণে পরিসংখ্যানের ভূমিকা" },
    date: "2025-11-20",
    read: "6 min",
    excerpt: { en: "How statistical principles help organizations accurately interpret trends and forecast growth.", bn: "পরিসংখ্যানগত নীতিমালা কীভাবে ট্রেন্ড বিশ্লেষণ ও প্রবৃদ্ধি অনুমানে সহায়তা করে।" },
    tags: ["Statistics","Analytics"]
  }
]

export const testimonials = [
  {
    name: "General Secretary",
    role: { en: "Rongdhonu Foundation", bn: "রংধনু ফাউন্ডেশন" },
    text: { 
      en: "Muntasir Shihab demonstrated exceptional leadership as President of our Sadar Branch. Energetic, dedicated, and highly creative.",
      bn: "মুনতাসির শিহাব আমাদের সদর শাখার সভাপতি হিসেবে অসাধারণ নেতৃত্ব প্রদর্শন করেছেন। উদ্যোমী, দায়িত্বশীল ও অত্যন্ত সৃজনশীল।"
    },
    company: "Rongdhonu Foundation"
  },
  {
    name: "Tanvir Ahmed",
    role: { en: "Startup Founder", bn: "স্টার্টআপ উদ্যোক্তা" },
    text: {
      en: "Shipped our complete branding kit and HTML landing page on time. Clean design aesthetic and great communication.",
      bn: "আমাদের সম্পূর্ণ ব্র্যান্ডিং কিট ও ল্যান্ডিং পেজ যথাসময়ে ডেলিভারি দিয়েছেন। চমৎকার ডিজাইন এবং পেশাদার আচরণ।"
    },
    company: "TechCraft BD"
  }
]

export const recommendations = [
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
  },
  {
    icon: "database",
    title: { en: "Statistical Data Organization", bn: "পরিসংখ্যানগত ডাটা অর্গানাইজেশন" },
    desc: { en: "Data tabulation, Excel formatting, visual charts, and basic statistical reports.", bn: "ডাটা সারণি, এক্সেল ফরম্যাটিং, ভিজ্যুয়াল চার্ট এবং প্রাথমিক পরিসংখ্যান রিপোর্ট।" },
    time: "2–5 days",
    price: "Custom Quote"
  },
  {
    icon: "gauge",
    title: { en: "Digital Marketing & Graphics", bn: "ডিজিটাল মার্কেটিং ও গ্রাফিক্স" },
    desc: { en: "Social media post designs, banners, promotional posters, and ad creatives.", bn: "সোশ্যাল মিডিয়া পোস্ট ডিজাইন, ব্যানার, প্রমোশনাল পোস্টার ও বিজ্ঞাপন ক্রিয়েটিভ।" },
    time: "1–3 days",
    price: "Custom Quote"
  },
]

export const hireMe = {
  available: true,
  status: { en: "Available for Graphic Design & Web Projects", bn: "গ্রাফিক ডিজাইন ও ওয়েব প্রজেক্টের জন্য Available" },
  workType: ["freelance","part-time","contract"],
  workMode: ["remote","hybrid"],
  notice: { en: "Immediate", bn: "তাত্ক্ষণিক" },
  timezone: "GMT+6 • Bangladesh",
  hours: "Flexible • GMT+6",
  stack: ["Graphic Design","Branding","HTML/CSS","Statistics","Digital Marketing"],
  calendly: "https://cal.com",
  whatsapp: "8801XXXXXXXXX",
  salary: { show: false, range: "Negotiable" }
}

export const achievements = [
  { en: "President, Rongdhonu Foundation Sadar Branch (2023–2024)", bn: "সভাপতি, রংধনু ফাউন্ডেশন সদর শাখা (২০২৩–২০২৪)" },
  { en: "Golden GPA 5.00 in SSC & JSC (ABRMS)", bn: "এসএসসি ও জেএসসিতে গোল্ডেন জিপিএ ৫.০০ (ABRMS)" },
  { en: "HSC GPA 4.92 — Science (Makbular Rahman Govt College)", bn: "এইচএসসি জিপিএ ৪.৯২ — বিজ্ঞান (মকবুলার রহমান সরকারি কলেজ)" },
]

export const pageBackgroundMap = {
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
} as const

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
