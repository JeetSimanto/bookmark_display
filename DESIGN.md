# Design System & Aesthetic Guidelines (DESIGN.md)

## Project: Booktab
**Theme:** Maximalism, Neo-Brutalism, Retro-Web
**Core Philosophy:** "More is more." High contrast, heavy borders, zero-blur drop shadows, and explosive color combinations.

---

## 1. Color Palette

The color system rejects subtle gradients and soft pastels in favor of raw, web-safe, and highly saturated hex codes. 

### Core Structure Colors
*   **Pitch Black:** `#000000` — Used for all typography, thick borders, and solid drop shadows.
*   **Stark White:** `#FFFFFF` — Used for input backgrounds and canvases.

### Primary Accent Colors (The "Neon" Set)
*   **Cyber Yellow:** `#FFDE4D` (Primary Brand Color)
*   **Hot Magenta:** `#FF007F`
*   **Electric Blue:** `#003BFF`
*   **Toxic Green:** `#00FF41`
*   **Safety Orange:** `#FF5722`

---

## 2. Typography

To maintain blazing-fast load times and adhere to MV3, rely strictly on heavily weighted system fonts.

### Display & Headers (Workspace Names, Clock, Big Numbers)
*   **Font Family:** `Impact, 'Arial Black', sans-serif`
*   **Weight:** `900` (Black)
*   **Styling:** ALL CAPS, tight letter-spacing (`-1px`), and heavy line-height. 

### Monospace / Data (Widgets, Search Bar, Metadata)
*   **Font Family:** `'Courier New', Consolas, Monaco, monospace`
*   **Weight:** `700` (Bold)
*   **Usage:** Weather data readouts, input fields. Provides a raw "terminal" aesthetic.

### Base UI & Links (Bookmarks, Task List)
*   **Font Family:** `Arial, 'Helvetica Neue', sans-serif`
*   **Weight:** `700` (Bold) to `900` (Black). *Never use light or regular weights.*

---

## 3. UI Tokens & Shapes (Neo-Brutalism)

These CSS variables form the foundation of Booktab's graphical elements. **No soft shadows, no blurs, and no glassmorphism**.

### Borders (The Outline)
Everything is contained within a heavy black border.
```css
--border-thick: 4px solid #000000;
--border-thin: 2px solid #000000;