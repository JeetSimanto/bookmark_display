# Technical Architecture Document (TAD)

**Version:** 1.0  
**Target Architecture:** Chromium Manifest V3

---

## 1. App Flow & System Architecture

Booktab operates entirely client-side inside a sandboxed browser workspace container. 

### A. Lifecycle & Data Flow
```text
  [ Browser Event ] ──> User opens new tab window
         │
         ▼
  [ Manifest Router ] ──> Intercepts request via chrome_url_overrides
         │
         ▼
  [ HTML Root Mount ] ──> index.html initializes DOM structure
         │
         ▼
  [ Core App Engine ] ──> Bootstraps app.js, mounting structural sub-modules
         │
  ┌──────┴────────────────────────┬────────────────────────┐
  ▼                               ▼                        ▼
[ Storage Controller ]     [ Visual Renderer ]      [ Chrono Engine ]
Queries local cache        Generates dense CSS Grid  Starts 1000ms loop
for user layout states     & retro neon style frames for real-time clocks
  │                               │                        │
  └───────────────┬───────────────┘                        │
                  ▼                                        ▼
      [ Layout & Link Render ]                    [ Update UI State ]
   Builds high-density dashboard matrix           Refreshes widget logs
```

### B. Core Systems & Module Interactions
*   **Initialization:** `app.js` runs a blocking call to the `storage.js` wrapper to pull the last saved layout before pushing pixels to avoid structural layout flashes.
*   **Workspace State Machine:** When a user switches tabs, the system triggers a virtual unmount of the card grid and redraws the new visual blocks based on local storage JSON schemas.
*   **Asynchronous API Workers:** Elements like the weather feed run background async fetch routines. If offline, the UI gracefully defaults to an offline-cached state badge.

---

## 2. Folder and File Structure

```text
booktab-extension/
│
├── manifest.json                 # Extension configuration (Manifest V3)
├── index.html                    # Unified root HTML entry file
├── ARCHITECTURE.md               # Technical project structure blueprint
├── PRD.md                        # Product requirements and UI feature rules
├── DESIGN.md                     # Design system tokens and aesthetics
├── RULE.md                       # Development constraints and rules
├── PHASES.md                     # Sequential development roadmap
│
├── css/
│   ├── main.css                  # Typography, layout resets, grid configurations
│   └── maximalist-tokens.css     # Heavy strokes, drop shadows, and neon palettes
│
├── js/
│   ├── app.js                    # Core bootstrap script running module setups
│   ├── storage.js                # State wrapper abstraction managing local storage
│   ├── workspaces.js             # Tab management state engine logic
│   ├── bookmarks.js              # Links matrix generator and favicon generator
│   └── widgets/
│       ├── clock.js              # Timer engine running high-density seconds displays
│       ├── todo.js               # Checklist management state engine logic
│       └── weather.js            # Asynchronous endpoint JSON data handler
│
└── assets/
    ├── branding/                 # Extension app store display icon files
    ├── textures/                 # Halftone dots and retro checkered patterns
    └── UI/                       # Custom heavy system stickers and graphic tokens
```

---

## 3. Technology Stack

### A. Core Engine
*   **Runtime Environment:** Chromium Extension System (Manifest V3).
*   **Language:** Vanilla JavaScript (ES Modules). No build steps.
*   **Data Layer:** Native Browser Local Storage (`chrome.storage.local`). Asynchronous non-blocking storage.

### B. Styling Layer
*   **Visual Engine:** Native CSS3 Grid Layout + Flexbox layout matrix.
*   **Design Tokens:** Custom CSS Properties (Variables) modeling Neo-Brutalist UI states.

### C. Developer Tools
*   **Debugging Tooling:** Chromium Built-In Developer Inspector Utilities.
