# AGENTS.md — Labors of GodEmperor

> **Project**: Building 12 companies in 12 months, one per month, using AI for automation and creation.
> **Creator**: GodEmperor (annekin)
> **Stream**: YouTube — GodEmperor channel
> **Started**: July 2026
> **Goal**: Road to a Billion

---

## Directory Structure

```
laborsofgodemperor/
├── AGENTS.md                 # This file — AI agent instructions (update regularly)
├── README.md                 # Public-facing project overview
├── agents/                   # Everything an AI agent needs to know
│   ├── meta/                 # Overarching tracking & planning
│   │   ├── timeline.md       # 12-month timeline, milestones, deadlines
│   │   ├── companies.md      # Company ideas, validation, status per labor
│   │   └── finances.md       # Revenue, costs, profit per company
│   ├── tools/                # AI tools, prompts & automation
│   │   ├── prompts/          # Reusable AI prompts for company building
│   │   ├── workflows/        # Automated workflows (n8n, Zapier, scripts)
│   │   └── configs/          # API keys template, tool configs (NEVER commit secrets)
│   └── learning/             # Knowledge base & retrospective
│       └── notes/            # Lessons learned, research, useful links
├── content/                  # Repurposed & supplementary content
│   ├── youtube/              # Edited videos, chapters, descriptions
│   └── clips/                # Short-form content (Shorts, Reels, TikToks)
├── socials/                  # Branding, streaming & social assets
│   ├── stream/               # Live streaming & production
│   │   ├── schedule.md       # Stream schedule, recurring segments
│   │   ├── scripts/          # Per-stream outlines, talking points, call-to-actions
│   │   └── series-description.md
│   └── theming.md            # Project-wide branding — colors, fonts, style
├── obsidian/                 # Obsidian canvases and notes
├── site/                     # Project website (placeholder)
└── labors/                   # One folder per company/month
    ├── 01_meyquest/          # Named subdirectory for known company names
    ├── 02/ through 12/       # Named once the company has a name
    │   ├── plan.md           # Company plan, tech stack, AI tools used
    │   ├── build-log.md      # Daily/weekly build journal
    │   ├── metrics.md        # KPIs: users, revenue, costs
    │   └── src/              # Company source code / project files
    └── ...
```

---

## Agent Instructions

### Who You Are
You are **opencode**, an AI agent running on annekin's Zorin OS machine. You have sudo access, full filesystem access, and tools for Godot, web, bash, and file operations. You assist with every aspect of this project — from code to content to stream setup.

### Core Principles
1. **Ship fast.** Each company has ~30 days. Bias toward action. MVP > perfection.
2. **AI-first.** Every task should leverage AI before manual effort. Use the `agents/tools/prompts/` library.
3. **Document as you go.** Build logs, metrics, and lessons learned are as valuable as the code.
4. **Stream-ready.** All work should be presentable/streamable. Keep the `socials/stream/scripts/` folder populated.
5. **Atomic labor folders.** Each `labors/NN/` is self-contained. It could be extracted into its own repo at any time.

### Workflow When Starting a New Labor (Month)
1. Create `labors/NN_NAME/plan.md` — define the company, niche, MVP scope, tech stack, AI tools
2. Create `labors/NN_NAME/build-log.md` — start daily log
3. Create `labors/NN_NAME/metrics.md` — set baseline KPIs
4. Update `agents/meta/timeline.md` and `agents/meta/companies.md`
5. Draft stream script in `socials/stream/scripts/`
6. Begin building in `labors/NN_NAME/src/`

### Workflow During a Labor
- Update `build-log.md` at end of each session
- Track metrics weekly
- Save useful prompts to `agents/tools/prompts/`
- Note lessons learned in `agents/learning/notes/`

### Workflow After a Labor (Post-Mortem)
- Write retrospective in `agents/learning/notes/labor-NN-retro.md`
- Extract reusable components/templates
- Clip highlight moments for `content/clips/`
- Update `agents/meta/finances.md`

### File Naming Conventions
- **kebab-case** for all files and folders
- **labor subdirs** with leading zero: `01_meyquest`, `02`, `03`, …
- `YYYY-MM-DD` prefix for dated files (e.g., `2026-07-01-stream-script.md`)

### Commands to Know
```bash
# Validate all markdown links in project
find . -name "*.md" -exec echo "Checking: {}" \;

# Count lines of code across all labors (for milestones)
find labors -type f \( -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.gd" \) | xargs wc -l

# Create a new labor from template — copy & rename existing
# (first labor to set pattern, then adapt)
```

### Security
- **NEVER** commit secrets, API keys, or tokens
- Use environment variables or `.env` files (gitignored)
- Template configs in `agents/tools/configs/` should use placeholders like `{{API_KEY}}`

---

## Project Status

| Labor | Company | Status | Started | Revenue |
|-------|---------|--------|---------|---------|
| 01 | MeyQuest | Building | Jul 2026 | $0 |
| 02 | TBD | — | Aug 2026 | — |
| 03–12 | TBD | — | — | — |

---

## Stream Info

- **Channel**: YouTube — GodEmperor
- **Series Title**: 12 Labors of GodEmperor
- **Schedule**: See `socials/stream/schedule.md`
- **Hashtags**: #12Labors #GodEmperor #AIStartup #RoadToABillion #BuildInPublic

---

*Last updated: 2026-07-03 — Migration to new structure*
