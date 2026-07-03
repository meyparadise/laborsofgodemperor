# LaborsOfGodEmperor — Companion Site Context

> **Location**: `~/workspace/laborsofgodemperor/site/`
> **Project**: 12 Labors of GodEmperor — building 12 companies in 12 months
> **Status**: Planning / Frontend-only prototype
> **Timeline**: 1 week MVP

---

## Vision

A companion website for the 12 Labors of GodEmperor YouTube series. The site serves as:

- A **hero landing page** that explains the mission
- A **company showcase** tracking all 12 businesses with live stats
- An **investment/crowdfunding portal** where viewers can allocate funds across companies (10% equity pool per company)
- A **video content catalog** organizing all VODs and live streams
- An **about/story** page explaining the project
- A **blog/updates** page for lessons learned and milestones

---

## Canvas Reference

From the Obsidian canvas at `obsidian/Socials/Videos/1. Road to becoming a Billionare/plan.canvas`:

- **Introduction Video** → **12 Months, 12 Businesses** (top) / **Building a Rocket Ship to Power** (bottom)
- **Promote** (promote stream on Reddit)
- **MeyQuest** (first company)
- **Stream** → the live stream itself
- **Introduce Crowdfunding Model**: Each company allocates 10% equity split among all investments/donations for that period
- Since the pool of money snowballs all companies, investors can edit their stake until the day it closes
- **LaborsOfGodEmperor Website** → Show Stream/Video Catalogue | Keep informed of Labors | Investment and allocation
- **LaborsOfGodEmperor Repo**

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React + TypeScript via Vite | Fast, modern SPA |
| Package Manager | pnpm | Already established in workspace |
| Routing | React Router v7 (library mode) | Simple client-side routing for SPAs |
| UI Library | shadcn/ui | Reusable, accessible components |
| Styling | Tailwind CSS v4 | Utility-first, Dark theme |
| Animations | Framer Motion | Staggered entrances, counters, scroll reveals |
| Charting | Recharts | Revenue/user growth charts per company |
| Data | JSON files in repo | Videos, companies, blog posts as `.json` or `.ts` |
| Backend/Auth | **None for MVP** | Will add Supabase later for user accounts + allocation persistence |
| Deployment | Vercel | Fast, free tier, git-integrated |
| Domain | TBD | `laborsofgodemperor.com` or similar |

---

## Branding — White Jade & Gold (Celestial Imperial)

Primary palette from `_stream/assets/branding/theming.md` and `_content/social/theming.md`:

| Color | Hex | Usage |
|-------|-----|-------|
| Pure White | `#FFFFFF` | Primary text, highlights |
| Warm White | `#F5F0E8` | Marble tones, soft glow |
| Bright Gold | `#FFD700` | Gradient top, accents, CTAs |
| Deep Gold | `#B8860B` | Gradient bottom, shadows, borders |
| Pale Gold | `#F0C75E` | Mid-tones, soft metallic |
| Jade | `#00A86B` | Accent glow, borders, secondary CTAs |
| Deep Jade | `#006B44` | Dark accents, shadows |
| Dark Imperial | `#0D1117` | Background, drop shadows, contrast backdrop |

**Thumbnail text style reference**: Orbitron Black for "12 LABORS" (gold gradient), Exo Light for "GODEMPEROR" (white with jade outline).

**Design vibe**: Imperial futuristic — white marble, polished gold, jade-green accents, holographic tech details. Dark background (#0D1117) with gold/jade accents. Celestial/starfield motifs.

**Tailwind config**: Extend theme with custom colors:
```ts
colors: {
  imperial: '#0D1117',
  jade: { DEFAULT: '#00A86B', deep: '#006B44' },
  gold: { DEFAULT: '#FFD700', deep: '#B8860B', pale: '#F0C75E' },
  marble: '#F5F0E8',
}
```

**Fonts** (from Google Fonts):
- **Orbitron** (Black 900) — headlines, logos, "12 LABORS"
- **Exo** (Light 300) — body, "GODEMPEROR"
- **Inter** (400, 600, 700) — UI text, cards (fallback)

---

## Pages

### 1. Hero Page (`/`)
- **Layout**: Full-screen (100vh), animated gradient mesh background (gold/jade/dark)
- **Eyebrow badge**: Month X of 12 — "Currently Building Labor 0X"
- **Headline**: "12 Companies. 12 Months. Road to a Billion."
- **Subheadline**: "One builder. AI-powered. One new business every month. Watch the entire journey live."
- **Primary CTA**: "Follow the Journey" (gold filled)
- **Secondary CTA**: "See the Companies" (jade outline)
- **Progress indicator**: Horizontal 12-step stepper showing completed/in-progress/future labors
- **Social proof strip**: YouTube subscriber count, Twitter followers, "X companies built"
- **Microcopy**: "New episodes every week on YouTube"

### 2. Investors Page (`/investors`)
- **Header**: "Invest in the Journey" with gold/jade styling
- **Legal disclaimer**: Simple "This is not financial advice. Invest at your own risk." banner at top
- **Company funding cards**: Each active company shows:
  - Company name + labor number
  - Funding progress bar (raised / target pool)
  - Investor count
  - Countdown timer (days left)
  - Your investment input (slider + numeric field)
  - Your ownership % display: `(your investment / total pool) * 10%`
- **Portfolio summary**:
  - Total allocated
  - Total remaining budget (user-defined mock budget for MVP)
  - Segmented bar showing allocation distribution across companies
- **State**: Frontend-only for MVP. Allocation data stored in local state (will persist to Supabase later)
- **UI pattern**: Linked sliders with numeric input fields, real-time equity recalculation

### 3. Companies Page (`/companies`)
- **Header**: "The 12 Labors" with progress badge (X/12 complete)
- **Layout**: Bento grid of 12 company cards
- **Each card shows**:
  - Company logo/icon + name
  - Status badge (Planning / Building / Launched / Paused / Abandoned)
  - Key metrics: Revenue, Users, Days in market
  - Tech stack badges (small pills)
  - Labor number + month
- **Company detail view** (`/companies/:slug`):
  - Full company info with description, tagline, timeline
  - Detailed metrics: MRR, total revenue, total users, active users, growth rate
  - Tech stack + AI tools used
  - Milestone timeline (idea → MVP → first user → first revenue)
  - Build log link
  - Video/stream archive for that labor

### 4. Content Page (`/content`)
- **Header**: "Watch the Journey"
- **Layout options**: Grid view (default) with optional list toggle
- **Filters**: Type (VOD / Live Stream / Short), Labor number (01-12), Topic
- **Featured video**: Hero slot at top for latest/most important video
- **Video card**: Thumbnail (16:9), play overlay, duration badge, type badge, title, date, view count, labor tag
- **Data source**: `src/data/videos.json` (manual for MVP, YouTube API later)
- **Click behavior**: Cards link out to YouTube for MVP; embed on detail page later

### 5. About Page (`/about`)
- The story of the project
- The creator's background + mission
- How it works (12 months, 12 companies, AI-first, building in public)
- Link to the stream schedule and social channels
- Connection to MeyQuest (first company)

### 6. Blog/Updates Page (`/blog`)
- Chronological list of updates from build logs
- Lessons learned per company
- Milestone announcements
- Retrospectives after each labor
- Data from `src/data/blog-posts.json` (sourced from `_learning/notes/` and `build-log.md` files)

---

## Navigation Structure

```
Sticky Nav (dark, gold/jade accents):
[Logo: "12 LABORS" Orbitron gold + "GODEMPEROR" Exo white/jade]
  Companies  |  Content  |  Investors  |  About  |  Blog

Footer:
  [Mission statement]
  [Social links: YouTube, Twitter, GitHub, Discord]
  [Legal disclaimer: "This is not financial advice"]
  [Copyright / "Built in public"]
```

---

## Folder Structure

```
~/workspace/laborsofgodemperor/site/
├── public/
│   ├── favicon.ico
│   └── og-image.png
├── src/
│   ├── app/
│   │   ├── main.tsx                 # ReactDOM.createRoot
│   │   ├── app.tsx                  # Root layout (Nav + Outlet + Footer)
│   │   └── routes.tsx              # Route definitions
│   ├── features/
│   │   ├── hero/
│   │   │   ├── hero-page.tsx
│   │   │   ├── progress-stepper.tsx
│   │   │   └── cta-section.tsx
│   │   ├── investors/
│   │   │   ├── investors-page.tsx
│   │   │   ├── allocation-slider.tsx
│   │   │   ├── funding-card.tsx
│   │   │   ├── portfolio-summary.tsx
│   │   │   └── disclaimer-banner.tsx
│   │   ├── companies/
│   │   │   ├── companies-page.tsx
│   │   │   ├── company-card.tsx
│   │   │   ├── company-grid.tsx
│   │   │   ├── company-detail.tsx
│   │   │   └── milestone-timeline.tsx
│   │   ├── content/
│   │   │   ├── content-page.tsx
│   │   │   ├── video-card.tsx
│   │   │   ├── video-grid.tsx
│   │   │   └── filter-bar.tsx
│   │   ├── about/
│   │   │   └── about-page.tsx
│   │   └── blog/
│   │       ├── blog-page.tsx
│   │       └── blog-card.tsx
│   ├── shared/
│   │   ├── ui/                      # shadcn/ui components (auto-generated)
│   │   ├── components/
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── page-header.tsx
│   │   ├── hooks/
│   │   │   └── use-scroll.ts
│   │   └── lib/
│   │       └── utils.ts             # cn() utility
│   ├── data/
│   │   ├── companies.ts             # Company data array
│   │   ├── videos.json              # Video catalog
│   │   └── blog-posts.json          # Blog/updates
│   ├── styles/
│   │   └── globals.css              # Tailwind + custom CSS variables
│   └── types/
│       └── index.ts                 # Shared TypeScript types
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── components.json                  # shadcn/ui config
```

---

## Data Model (TypeScript types for MVP)

```typescript
interface Company {
  id: string                    // "labor-01"
  number: number                // 1-12
  name: string                  // "MeyQuest"
  slug: string                  // "meyquest"
  tagline: string
  description: string
  status: 'planning' | 'building' | 'launched' | 'paused' | 'abandoned'
  category: string              // "SaaS", "Marketplace", "AI Tool"
  startDate: string
  launchDate: string | null
  logoUrl: string | null
  websiteUrl: string | null
  repoUrl: string | null
  techStack: { name: string; category: string }[]
  aiToolsUsed: string[]
  metrics: {
    revenue: number
    mrr: number
    totalUsers: number
    activeUsers: number
    payingCustomers: number
    totalCosts: number
  }
  metricsHistory: { date: string; revenue: number; totalUsers: number }[]
  milestones: { date: string; title: string; description: string; icon: string }[]
  lessonsLearned: string[]
  color: string                 // accent color for card
}

interface Video {
  id: string
  youtubeId: string
  title: string
  description: string
  type: 'vod' | 'livestream' | 'short'
  publishedAt: string
  duration: string
  thumbnail: string
  tags: string[]
  labor: number | null
  featured: boolean
  stats: { viewCount: number; likeCount: number }
}

interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string
  labor: number | null
  tags: string[]
  author: string
}
```

---

## Investment / Crowdfunding Logic (MVP)

For the investors page, the core logic is:

```
ownershipPercent = (userInvestmentInCompany / totalPoolForCompany) * 10
```

Where:
- `userInvestmentInCompany` = the amount a user allocates to that company (input via slider)
- `totalPoolForCompany` = sum of all user investments in that company (mock data for MVP)
- `10` = the 10% equity pool allocated per company

For MVP:
- Use mock data for `totalPoolPerCompany` (e.g., $50,000 target per company)
- User allocation is stored in React state (no persistence)
- Real-time calculation on slider change
- Portfolio summary shows total allocated vs mock budget

---

## Setup Commands (for when you build)

```bash
# 1. Create site directory
mkdir -p ~/workspace/laborsofgodemperor/site
cd ~/workspace/laborsofgodemperor/site

# 2. Create Vite + React + TypeScript project
pnpm dlx shadcn@latest init -t vite

# 3. Install dependencies
pnpm add react-router framer-motion recharts
pnpm add -D @types/node

# 4. Add shadcn components
pnpm dlx shadcn@latest add button card input slider progress badge separator navigation-menu tabs

# 5. Configure Tailwind with custom theme colors
# Edit src/styles/globals.css and tailwind config
```

---

## Deployment

- **Platform**: Vercel
- **Build command**: `pnpm build`
- **Output directory**: `dist`
- **Framework preset**: Vite
- **Environment**: None needed for MVP (all data from JSON files)

---

## MVP Scope (1 Week)

### Day 1-2: Project setup + Hero + Navigation
- [ ] Scaffold Vite + React + TS project
- [ ] Configure Tailwind with branding colors (jade, gold, imperial)
- [ ] Add fonts (Orbitron, Exo, Inter)
- [ ] Build navbar and footer
- [ ] Build hero page with animated gradient background, headline, CTAs
- [ ] Build 12-step progress stepper component

### Day 3-4: Companies page
- [ ] Create companies data file
- [ ] Build bento grid layout
- [ ] Build company card component (status badge, metrics, tech stack)
- [ ] Build company detail page with milestone timeline

### Day 5: Content page
- [ ] Create videos.json data file
- [ ] Build video card component
- [ ] Build filter bar (type, labor, topic)
- [ ] Build grid layout with featured slot

### Day 6: Investors page
- [ ] Build allocation slider component
- [ ] Build funding card with progress bar
- [ ] Build portfolio summary
- [ ] Implement ownership % calculation logic
- [ ] Add legal disclaimer banner

### Day 7: About + Blog + Polish
- [ ] Build about page
- [ ] Build blog page
- [ ] Responsive design pass (mobile + desktop)
- [ ] Framer Motion animations (staggered entrance, counters)
- [ ] Deploy to Vercel

---

## Post-MVP (Future)

- [ ] Supabase integration for user accounts + allocation persistence
- [ ] YouTube API integration for auto video sync
- [ ] Real-time funding progress via SSE
- [ ] SEC-compliant disclaimers
- [ ] Stripe/payment integration
- [ ] Dark/light theme toggle
- [ ] Stream schedule page
- [ ] Individual company subpages with live charts
- [ ] Connect to real company metrics (not mock data)

---

## Related Files

- Theme reference: `~/workspace/laborsofgodemperor/_stream/assets/branding/theming.md`
- Theme reference: `~/workspace/laborsofgodemperor/_content/social/theming.md`
- Canvas plan: `~/workspace/laborsofgodemperor/obsidian/Socials/Videos/1. Road to becoming a Billionare/plan.canvas`
- AGENTS.md: `~/workspace/laborsofgodemperor/AGENTS.md`

---

*Generated: 2026-07-03 — Plan for frontend-only MVP, 1-week build*
