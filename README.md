# MD Muntasir Shihab — Portfolio

Personal portfolio website built with **Vite + React + TypeScript + Tailwind CSS**.

## ✨ Features

- 🎨 Gold (#e7b84b) dark theme with glassmorphism
- 🌗 Dark / Light mode toggle
- 🌐 Bilingual (English / বাংলা)
- 🧩 Animated backgrounds (beams, particles, neural, cosmic)
- 📊 GitHub stats, contribution heatmap & language mix
- 💬 Contact form → Supabase + Resend email
- 📄 CV / Resume download
- 📱 PWA-ready (manifest + icons)
- 🔐 Admin panel (secret slug) with Firebase auth
- 🚀 Animated page transitions (Framer Motion)

## 🛠️ Tech Stack

| Layer        | Technology                                   |
| ------------ | -------------------------------------------- |
| Framework    | Vite + React 19 + TypeScript                 |
| Styling      | Tailwind CSS v4                              |
| Animation    | Framer Motion                                |
| Database     | Supabase (PostgreSQL)                        |
| Storage      | Supabase Storage                             |
| Auth         | Firebase Authentication                      |
| Cache/Limit  | Upstash Redis                                |
| Email        | Resend                                       |

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in your real API keys

# 3. Run dev server
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

## 🔑 Environment Variables

See [`.env.example`](./.env.example) for all required variables.

> ⚠️ **Never commit `.env`** — it contains secrets. It is already gitignored.

## 📁 Project Structure

```
src/
├── App.tsx                 # Routes + all pages
├── main.tsx                # Entry point
├── index.css               # Global styles + animations
├── components/
│   ├── backgrounds.tsx     # Animated backgrounds
│   └── ui-kit.tsx          # Shared UI components
├── lib/
│   ├── data.ts             # Portfolio content (profile, projects, etc.)
│   ├── store.tsx           # State management + admin
│   └── supabase.ts         # Supabase client
└── utils/
    └── cn.ts               # Class name helper
```

## 📄 License

MIT © MD Muntasir Shihab
