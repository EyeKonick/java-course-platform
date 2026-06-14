# CLAUDE.md - Java Presentation Platform Project Configuration

## Development Commands
- **Start Local Dev Server:** `npm run dev`
- **Build Production App:** `npm run build`
- **Preview Production Build:** `npm run preview`
- **Lint Codebase:** `npm run lint` (if configured)

## Tech Stack & Architecture
- **Framework:** React (Vite-powered environment)
- **Styling:** Tailwind CSS v4 (utilizes CSS-first configuration via `@import "tailwindcss";` inside `src/index.css`)
- **Icons:** `lucide-react`
- **Data Model:** Entirely driven by a structural JSON schema (`src/data/curriculum.json`) representing a 12-hour Java course timeline.

---

## Claude Design & UI Guidelines
When generating, editing, or refactoring UI components, prioritize an editorial, elite developer aesthetic modeled after premium tools like Vercel, Linear, and modern IDEs. 

### 1. Color Palette & Dark System
- **Canvas/App Background:** Deepest slate/zinc rich tone (`bg-slate-950`).
- **Surface Panels/Cards:** Slate neutral surfaces (`bg-slate-900` or `bg-slate-900/60`).
- **Dividers & Borders:** Razor-sharp, clean separating lines (`border-slate-800`).
- **Text Hierarchy:** Primary headings in crisp white (`text-white`), secondary labels in muted grey (`text-slate-400`).
- **Accents:** Emerald green (`text-emerald-400`, `border-emerald-500`) for structural success/progress states, and amber/violet for highlighting special interface triggers.

### 2. Layout & Typography Rules
- **Typography:** Sans-serif variants (Inter/Geist) for app frame instructions; absolute crisp Monospace font arrays (JetBrains Mono/Fira Code/Courier New) inside code viewports.
- **Breathing Room:** Maintain clean layout grids with extensive padding (`p-6` to `p-12`), ensuring sections have intentional negative space to prevent student cognitive fatigue.

### 3. The `IDEMock` Component Specification
Any simulated code workspace component must perfectly mimic a high-end dark-themed code editor:
- Top header panel with rounded macOS-style window navigation buttons (rose, amber, emerald).
- A physical workspace file tab labeled `Main.java` complete with a miniature coffee-cup emoji/icon.
- Left-side vertical column showing clean, subtle line numbering (`text-slate-600`) separated by a soft vertical boundary.
- Vivid, eye-catching text color token rules applied to Java elements (keywords, comments, classes, strings) for maximum readability from the back of a lecture hall.

---

## Coding Conventions & Quality Standards
- **Component Design:** Write clean, modular, functional React components utilizing standard ES6 arrow functions or explicit function declarations. Use named exports where applicable.
- **State Architecture:** Maintain clean state synchronization between the active chapter navigation menu, slide view trackers, and the presentation screen mode layouts.
- **Interactive Capabilities:** Integrate reliable event listeners handling global window key-down mappings (`ArrowRight`, `Space`, `ArrowLeft`) so the speaker can transition slides remotely without interactive hitches.
- **Fail-Safes:** Ensure all components parse data strings defensively, preventing application crashes if a particular lesson object lacks code blocks or instructions.