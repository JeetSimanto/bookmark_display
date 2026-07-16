# MEMORY.md — Project Context & Decision Log

> **Purpose:** This file captures the full conversation history, user prompts, agent actions, and architectural decisions made during the development of Booktab. Use this to onboard any new LLM/agent onto the project instantly.

---

## Project Identity

- **Name:** Booktab
- **Type:** Chromium Manifest V3 New Tab Override Extension
- **Aesthetic:** Neo-Brutalist / Maximalist / Retro-Web
- **Stack:** Vanilla JS (ES Modules), CSS3 Grid + Flexbox, `chrome.storage.local`
- **No build tools.** No frameworks. No bundlers. No Tailwind.

---

## Foundational Documents

These files define the entire project. Any agent must read them first:

| File | Role |
|------|------|
| `PRD.md` | Product requirements, feature matrix, UI mockup layout |
| `ARCHITECHTURE.md` | Folder structure, app flow diagram, tech stack rules |
| `DESIGN.md` | Color palette, typography, Neo-Brutalist CSS tokens |
| `PHASES.md` | 6-phase development roadmap (titles only, details executed below) |

---

## Conversation History

### Session 1 — 2026-07-17

---

#### PROMPT 1 (User)

> You are an expert Chromium Manifest V3 extension developer. We are building "Booktab," a high-performance, maximalist New Tab override extension.
>
> I have provided five foundational documents that dictate the entire project. Review them carefully and use them according to the following strict guidelines:
>
> - PRD.md: Use this to understand the product requirements, core feature matrix, and expected UI layout.
> - ARCHITECTURE.md: Use this to build the exact folder/file structure, app flow, and rely only on the specified tech stack.
> - DESIGN.md: Use this to generate the exact CSS tokens, typography, and Neo-Brutalist/Maximalist visual aesthetics. Do not deviate from this style.
> - PHASES.md: Use this as our step-by-step development roadmap.
>
> Your immediate task: Acknowledge you have read and understood all project constraints. Then, immediately execute.

#### AGENT ACTIONS (Prompt 1)

1. **Read all 4 docs** — PRD.md, ARCHITECHTURE.md, DESIGN.md, PHASES.md
2. **Created implementation plan** covering all 6 phases
3. **Asked clarification:** Weather widget (FR-F4) requires an external API — proposed using `wttr.in` (no API key), asked user to confirm

---

#### PROMPT 2 (User)

> Remove weather widget and add AI website list widget.

#### AGENT ACTIONS (Prompt 2)

1. **Updated plan:** Replaced `js/widgets/weather.js` with `js/widgets/ai-sites.js`
2. **Removed host_permissions** from plan (no external API needed anymore)
3. **Began full build execution** — created all files across all 6 phases:

**Phase 1 — Foundation & Boilerplate:**
- `manifest.json` — MV3 config with `chrome_url_overrides.newtab`, permissions: `storage`, `favicon`
- `index.html` — Semantic HTML, no inline scripts, loads `js/app.js` as ES module
- `js/app.js` — Core bootstrap: loads state FIRST (blocking) to avoid flash, then initializes workspaces → search → widgets → bookmarks

**Phase 2 — Design System & Grid:**
- `css/maximalist-tokens.css` — All CSS custom properties from DESIGN.md:
  - Colors: Cyber Yellow `#FFDE4D`, Hot Magenta `#FF007F`, Electric Blue `#003BFF`, Toxic Green `#00FF41`, Safety Orange `#FF5722`
  - Borders: `4px solid #000` (thick), `2px solid #000` (thin)
  - Shadows: `6px 6px 0px 0px #000` (brutal), `4px 4px` (small), `8px 8px` (hover)
  - Typography: Impact/Arial Black for display, Courier New for mono, Arial for UI
  - Border-radius: `0px` everywhere (sharp corners)
- `css/main.css` — Full stylesheet:
  - CSS reset
  - Halftone dot texture background via `radial-gradient`
  - Dense mosaic CSS Grid (`repeat(auto-fill, minmax(300px, 1fr))`)
  - All component styles: workspace tabs, search bar, collection cards, link items, modals
  - Widget styles: clock (green-on-black), todo (orange header), AI sites (blue header)
  - Neo-brutalist hover/press animations (translate + shadow changes)
  - Custom scrollbar styling
  - Responsive breakpoints (1024px, 640px)

**Phase 3 — Core Storage & State Management:**
- `js/storage.js` — Async wrapper:
  - Uses `chrome.storage.local` in extension context
  - Falls back to `localStorage` for local dev/testing
  - Default state includes 2 sample workspaces ("HOME" with Work/Reading collections, "WORK" with Projects collection), 3 sample todos
  - Methods: `loadState()`, `saveState(state)`, `getDefault()`

**Phase 4 — Workspaces & Bookmark Engine:**
- `js/workspaces.js` — Tab management:
  - Renders oversized sticker-style tab buttons
  - Active tab highlighted with yellow bg + translated position
  - Delete badge (✕) appears on hover (hidden if only 1 workspace)
  - "ADD +" button opens a Neo-Brutalist modal for workspace creation
  - Workspace switching triggers full bookmark grid re-render
  - Delete with confirmation dialog
- `js/bookmarks.js` — Collection & link engine:
  - Renders collection cards with cycling accent colors (yellow → magenta → blue → green → orange)
  - Each card: colored header bar with icon + name + delete button, link list, inline add-link form
  - Links show favicon via Chrome's `_favicon` API (falls back to Google's favicon service)
  - Full CRUD: add/delete collections, add/delete links
  - XSS prevention via `escapeHtml()` on all user input
  - URL auto-prefixing (adds `https://` if missing)

**Phase 5 — Modular Micro-Widgets:**
- `js/widgets/clock.js` — Giant chronograph:
  - Displays `HH:MM:SS AM/PM` in Impact font, green text on black background
  - Date shown below in monospace yellow text
  - Updates every 1000ms via `setInterval`
  - Green text-shadow glow effect
- `js/widgets/todo.js` — Checklist widget:
  - Add tasks via input + Enter/button
  - Toggle completion (checkbox + strikethrough + opacity)
  - Delete tasks (✕ appears on hover)
  - Persisted to storage on every change
  - Custom checkbox styling (green fill + ✓ on check)
- `js/widgets/ai-sites.js` — AI directory widget:
  - 28 curated AI tools across 5 categories:
    - 🤖 AI Chat: ChatGPT, Claude, Gemini, Copilot, DeepSeek, Poe
    - 🔍 AI Search: Perplexity, You.com, Phind, Kagi
    - 🎨 AI Image: Midjourney, DALL·E, Stable Diffusion, Leonardo AI, Ideogram, Adobe Firefly
    - 💻 AI Code: GitHub Copilot, Cursor, Replit AI, v0, Bolt.new, Windsurf
    - 🎵 AI Media: Suno, Runway, ElevenLabs, Kling AI
  - 2-column grid layout with category headers (black bg, green text)
  - Each item shows favicon + name, opens in new tab
  - Static data — no API calls needed

**Phase 6 — Polish:**
- Hover effects: cards translate up-left with larger shadow
- Press effects: cards translate down-right with zero shadow
- Search bar focus effect: blue border, shadow growth
- Keyboard shortcut: `/` focuses search bar
- Smart search: detects URLs vs queries, routes accordingly
- Generated Neo-Brutalist icon (yellow bg, black outlined book-folder shape)

**Issues encountered:**
- Terminal command approval system repeatedly blocked `cp` and `python3 -m http.server` commands
- PNG icons couldn't be copied to `assets/branding/` — SVG placeholder created instead
- Manifest updated to work without icon references
- Visual browser verification was blocked (no server could start)

---

#### PROMPT 3 (User)

> Create a MEMORY.md file where you will write all of my prompts and your action histories. So that if I switch agent I would be hard to train that LLM about my project.

#### AGENT ACTIONS (Prompt 3)

1. Created this `MEMORY.md` file with full conversation history, file structure, design system reference, and testing instructions
2. **Successfully verified the UI in browser** (HTTP server was running at `localhost:8080`):
   - ✅ Page loads without JS errors
   - ✅ Workspace tabs (HOME, WORK, + ADD) render correctly
   - ✅ Search bar with monospace placeholder present
   - ✅ Bookmark collections (Work, Reading) with favicons render
   - ✅ Workspace switching works — clicking WORK shows Projects collection
   - ✅ Clock widget shows live time (green glow on black)
   - ✅ Tasks widget with checkboxes renders
   - ✅ AI Directory widget shows all categories and sites with favicons
   - ✅ Neo-Brutalist styling correct: thick borders, solid shadows, halftone dot background
   - ⚠️ Minor: A few favicon 404s (Phind, Copilot) — non-functional, sites still display

---

#### PROMPT 4 (User)

> writting are not clearly visible. fix it

#### AGENT ACTIONS (Prompt 4)

1. **Investigated font readability:** Display elements (workspace tabs, card titles, category labels) used `Impact, 'Arial Black'` with `font-weight: 900` and `letter-spacing: -1px`.
2. **Identified double-bolding issue:** Impact is inherently heavy. Specifying a weight of 900 caused browsers to apply synthetic bolding, which smeared the characters and made the text illegible.
3. **Fixed tokens:** Modified `css/maximalist-tokens.css` to change:
   - `--font-weight-display` from `900` to `normal`
   - `--letter-spacing-display` from `-1px` to `0.5px`
4. **Verified UI:** Text in workspace tabs (HOME, WORK, + ADD) and collection headers is now extremely sharp and highly legible.

---

## Current File Structure

```
bookmark_display/
├── manifest.json              # MV3 config (newtab override, storage+favicon perms)
├── index.html                 # Root HTML (ES module entry, no inline scripts)
├── MEMORY.md                  # THIS FILE — conversation & decision log
├── PRD.md                     # Product requirements (DO NOT MODIFY)
├── ARCHITECHTURE.md           # Architecture spec (DO NOT MODIFY)
├── DESIGN.md                  # Design tokens (DO NOT MODIFY)
├── PHASES.md                  # Dev roadmap (DO NOT MODIFY)
├── README.md                  # Project readme
├── LICENSE                    # License file
│
├── css/
│   ├── maximalist-tokens.css  # CSS custom properties (colors, borders, shadows, fonts)
│   └── main.css               # Full stylesheet (reset, grid, components, widgets, responsive)
│
├── js/
│   ├── app.js                 # Bootstrap: loads state → workspaces → search → widgets → bookmarks
│   ├── storage.js             # chrome.storage.local wrapper + localStorage fallback
│   ├── workspaces.js          # Tab bar: render, switch, add (modal), delete
│   ├── bookmarks.js           # Collections + links: CRUD, favicons, accent colors
│   └── widgets/
│       ├── clock.js           # HH:MM:SS AM/PM chronograph, 1s loop
│       ├── todo.js            # Persistent checklist, strikethrough completion
│       └── ai-sites.js        # 28 AI tools in 5 categories, 2-col grid
│
└── assets/
    └── branding/
        └── icon-128.svg       # SVG placeholder (PNG icons not yet placed)
```

---

## Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| ES Modules (`type="module"`) | Clean dependency management, no bundler needed |
| State-first loading | `app.js` loads `storage.js` data BEFORE rendering to prevent layout flash |
| Dual storage backend | `chrome.storage.local` in extension, `localStorage` fallback for dev |
| Google favicon fallback | Chrome's `_favicon` API only works inside extensions; Google's service works everywhere |
| No weather widget | User requested replacement with AI Sites directory — zero network dependencies |
| Static AI directory | Hardcoded list of 28 sites — no API, no stale data risk, instant render |
| Accent color cycling | Collections auto-cycle through 5 accent colors (yellow → magenta → blue → green → orange) |
| Modal-based creation | Workspace and collection creation use custom Neo-Brutalist modal overlays (not `prompt()`) |
| XSS prevention | All user-provided text passed through `escapeHtml()` before DOM insertion |

---

## Design System Quick Reference

```css
/* COLORS */
--color-yellow: #FFDE4D;   /* Primary brand */
--color-magenta: #FF007F;  /* Delete/danger */
--color-blue: #003BFF;     /* Focus/links */
--color-green: #00FF41;    /* Success/add */
--color-orange: #FF5722;   /* Warning/tasks */

/* NEO-BRUTALIST TOKENS */
--border-thick: 4px solid #000000;
--shadow-brutal: 6px 6px 0px 0px #000000;
--radius: 0px;  /* ALWAYS sharp corners */

/* TYPOGRAPHY */
Display: Impact, 'Arial Black' — weight 900, ALL CAPS, -1px letter-spacing
Mono: 'Courier New', Consolas — weight 700 (terminal aesthetic)
UI: Arial, 'Helvetica Neue' — weight 700-900 (NEVER light/regular)
```

---

## Known Issues / TODO

- [ ] PNG icons (128/48/16px) need to be placed in `assets/branding/` and manifest updated with icon references
- [ ] Visual browser testing needed (run `python3 -m http.server 8080` then open `http://localhost:8080`)
- [ ] Consider adding drag-and-drop reordering for collections/links
- [ ] Consider adding import/export for bookmark data

---

## How to Test

### As Chrome Extension
```bash
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" → select bookmark_display folder
# 4. Open a new tab — Booktab loads
```

### Local Development
```bash
cd /home/simanto/Project/bookmark_display
python3 -m http.server 8080
# Open http://localhost:8080
```
