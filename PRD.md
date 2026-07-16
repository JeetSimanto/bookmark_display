# Product Requirement Document (PRD)

## Project Name: Booktab - Maximalist Workspace New Tab
**Version:** 1.0  
**Target Architecture:** Chromium Manifest V3 (Chrome, Edge, Brave, Opera)

---

## 1. Executive Summary & Objective
Booktab is a visually explosive, productivity-driven "New Tab" override extension designed for Chromium browsers. The goal of this project is to replace the generic browser home page with a high-energy, feature-dense personal dashboard. 

Inspired by modern **Maximalism and Neo-Brutalism UI aesthetics**, the extension rejects barren minimalism in favor of "more is more"—blending personalized workspaces, rich information densities, bold typography, contrasting color blocks, and modular micro-widgets onto a chaotic yet highly organized dynamic backdrop. 

---

## 2. Core User Personas
*   **The Power Navigator:** Wants access to everything all at once. Values instant clickability, massive grid layouts, and having widgets layered right alongside deep nested bookmark modules.
*   **The Gen-Z / Creative Visualist:** Craves vibrant, high-contrast, brutalist-tinged aesthetics, retro design cues, sticker-like elements, and rich visual textures.
*   **The Context Multitasker:** Thrives in dense visual environments where work status, task queues, news feeds, and clocks are constantly visible simultaneously.

---

## 3. Functional Requirements & Feature Matrix

### Module A: Extension & Environment Configuration
*   **FR-A1 (Manifest Override):** The extension must intercept the native Chromium behavior using `chrome_url_overrides.newtab` to inject the custom view seamlessly.
*   **FR-A2 (Data Persistence):** All configuration states—including user bookmarks, widgets, and workspaces—must persist locally across sessions via `chrome.storage.local`.
*   **FR-A3 (Asset Sandboxing):** The system must not run inline scripts, adhering strictly to the Content Security Policy (CSP) enforced by modern extension standards.

### Module B: The Interface Layout & Visual Engine
*   **FR-B1 (Dense Mosaic Grid Matrix):** The application viewport must feature a multi-column CSS Grid layout optimized for maximal layout density. Element cards wrap tightly together with explicit borders.
*   **FR-B2 (Unified Maximalist/Neo-Brutalist Theme Tokens):** All UI interaction elements must utilize rich saturation, bold block shadows, and strong strokes:
    ```css
    background: #FFDE4D; /* Bold primary color pops */
    color: #000000;
    border: 4px solid #000000; /* Chunky black outlines */
    box-shadow: 6px 6px 0px 0px #000000; /* Neo-brutalist solid drop shadow */
    font-family: "Impact", "Arial Black", sans-serif; /* High-weight typography */
    ```
*   **FR-B3 (Texture-Rich Dynamic Wallpapers):** Support highly patterned, retro-gradient, or high-contrast imagery backdrops via CSS backgrounds (halftone dots, checkerboards).

### Module C: Context Workspaces & Navigation
*   **FR-C1 (Workspace Switching):** Provide an oversized, sticker-style tab switching block in the top-left section. Clicking a workspace updates the grid layout instantly.
*   **FR-C2 (Workspace Mutation):** Provide a highly visible `[ ADD + ]` heavy button trigger that appends custom named workspaces dynamically.

### Module D: High-Density Bookmarks Grid
*   **FR-D1 (Logical Grouping):** Support the creation of named collections within an active workspace, each contained in its own brightly colored background block.
*   **FR-D2 (Auto-Favicon Acquisition):** Link items must automatically resolve web icons using the native Chrome favicon utility endpoint (`chrome-extension://<id>/_favicon/`).
*   **FR-D3 (Management Controls):** Permanent, raw CRUD control triggers (plus icons, delete badges `[X]`) are always visible on the surface of cards.

### Module E: Unified Search Framework
*   **FR-E1 (High-Contrast Omni-Search Bar):** Placed dead-center at the top, utilizing a massive, block-bordered text entry element with ultra-large text styling.
*   **FR-E2 (Action Routing):** Pressing `Enter` forwards query inputs to the default Google Search query string.

### Module F: Modular Micro-Widgets
*   **FR-F1 (Unified Widget Container):** Widgets match the raw, thick-border block appearance of the bookmark modules, slotting perfectly into the grid space.
*   **FR-F2 (Giant Chronograph Module):** An oversized typography layout displaying time (`HH:MM:SS`) down to the second, updating every 1000ms.
*   **FR-F3 (Micro To-Do Task-List):** An active checklist widget providing text insertion for focal tasks featuring stark checkmarks and strike-through styles.
*   **FR-F4 (Weather API Feed):** Displays graphical layout statistics natively using retro-styled weather artwork via an asynchronous external data fetch.

---

## 4. User Interface (UI) Mockup Flow
```text
+---------------------------------------------------------------------------------+
| ========[ HOME ] [ WORK ] [ EXTRA + ]========     | SEARCH: [________________]  |
|                                                                                 |
|  +--------------------+   +--------------------+   +--------------------+       |
|  | # WORK          [X]|   | # READING       [X]|   | # TASKS 🔥      [X]|       |
|  |--------------------|   |--------------------|   |--------------------|       |
|  | [N] Notion         |   | [Y] Hacker News    |   | [X] Review Docs    |       |
|  | [F] Figma          |   | [M] Medium         |   | [ ] Push Commits   |       |
|  |                    |   |                    |   | [Input...       ]  |       |
|  +--------------------+   +--------------------+   +--------------------+       |
|    |__Solid Shadow|         |__Solid Shadow|         |__Solid Shadow|           |
|                                                                                 |
|                                                     +-----------------------+   |
|                                                     | 🕒 12:41:18 AM        |   |
|                                                     +-----------------------+   |
+---------------------------------------------------------------------------------+
