# Mobile Responsive Design Spec
**Date:** 2026-06-15
**Approach:** Tailwind Responsive Breakpoints + Overlay Drawer (Approach A)

---

## Overview

Make the Java course presentation platform fully responsive across all screen sizes using Tailwind CSS responsive prefixes and a hamburger drawer for the sidebar. No new files are created — all changes are in-place modifications to existing components.

---

## Breakpoints

| Name    | Min width | Tailwind prefix |
|---------|-----------|-----------------|
| Mobile  | default   | (none)          |
| Desktop | 768px     | `md:`           |

A single breakpoint is sufficient. The two-column slide layout works from 768px up.

---

## Component Changes

### `src/App.jsx`

- Add `sidebarOpen` boolean state (default: `false`).
- Pass `isOpen={sidebarOpen}` and `onClose={() => setSidebarOpen(false)}` to `<Sidebar>`.
- Pass `onMenuOpen={() => setSidebarOpen(true)}` to `<Slideshow>`.

---

### `src/components/Sidebar.jsx`

**Mobile (default):**
- Position: `fixed inset-y-0 left-0 z-50`
- Width: `w-72`
- Translate: `-translate-x-full` (hidden) → `translate-x-0` (open) controlled by `isOpen` prop
- Transition: `transition-transform duration-300 ease-in-out`
- A semi-transparent backdrop `<div>` (`fixed inset-0 bg-black/60 z-40`) renders behind the sidebar when open, closes it on click.
- A close button (`X` icon from lucide-react) visible only on mobile (`md:hidden`) placed in the sidebar header row next to the BookMarked icon.

**Desktop (`md:`):**
- Position: `md:static md:translate-x-0`
- Backdrop: hidden (`md:hidden` on the backdrop element)
- Close button: `md:hidden` (not shown)
- Behaviour identical to current implementation.

---

### `src/components/Slideshow.jsx`

**Hamburger button:**
- Renders a `Menu` icon (lucide-react) button visible only on mobile (`md:hidden`).
- Placed in the lesson-label row at top-left.
- Calls `onMenuOpen` prop on click.

**Content grid:**
- `grid-cols-2` → `grid-cols-1 md:grid-cols-2`
- `gap-10` stays unchanged on desktop; `gap-6` on mobile → `gap-6 md:gap-10`
- IDEMock column gets `order-last md:order-none` so it stacks below bullets on mobile.

**Padding adjustments:**
| Section          | Before         | After                        |
|------------------|----------------|------------------------------|
| Lesson label     | `px-10 pt-8`   | `px-4 pt-4 md:px-10 md:pt-8`|
| Content area     | `px-10 py-6`   | `px-4 py-4 md:px-10 md:py-6`|
| Nav bar          | `px-10 py-4`   | `px-4 py-3 md:px-10 md:py-4`|

**Slide title font clamp:**
- Before: `clamp(1.5rem, 2.4vw, 2.25rem)` — 2.4vw is tiny on a phone viewport
- After: `clamp(1.25rem, 5vw, 2.25rem)` — scales correctly across all widths

**Overflow on mobile:**
- Content area switches from `overflow-hidden` to `overflow-y-auto` on mobile so long slide content is scrollable: `overflow-y-auto md:overflow-hidden`
- Remove fixed `min-h-0` restriction on mobile: `md:min-h-0`

---

### `src/components/IDEMock.jsx`

- `max-h-96` → `max-h-52 md:max-h-96`
- Internal scroll (`overflow-auto`) already present — no code is permanently hidden.

---

## Mobile Layout Flow (single column, top → bottom)

```
┌─────────────────────────────┐
│ [☰]  LESSON TITLE LABEL     │  ← hamburger left, label center/left
├─────────────────────────────┤
│                             │
│  Slide Title                │
│  ▸ Bullet one               │
│  ▸ Bullet two               │
│  ▸ Bullet three             │
│                             │
├─────────────────────────────┤
│  ┌─ IDEMock ──────────────┐ │
│  │ Main.java              │ │
│  │  1  public class ...   │ │
│  └────────────────────────┘ │
├─────────────────────────────┤
│  ← Previous  ● ○ ○  Next → │
└─────────────────────────────┘
```

---

## Desktop Layout (unchanged)

```
┌──────────────┬────────────────────────────────────────┐
│              │  LESSON TITLE LABEL                    │
│   Sidebar    ├──────────────────┬─────────────────────┤
│   w-72       │  Slide Title     │  ┌─ IDEMock ──────┐ │
│              │  ▸ Bullet one    │  │ Main.java      │ │
│              │  ▸ Bullet two    │  │  1  public ... │ │
│              │  ▸ Bullet three  │  └────────────────┘ │
│              ├──────────────────┴─────────────────────┤
│              │  ← Previous    ● ○ ○    Next →         │
└──────────────┴────────────────────────────────────────┘
```

---

## Files Modified

| File                              | Change summary                                          |
|-----------------------------------|---------------------------------------------------------|
| `src/App.jsx`                     | Add `sidebarOpen` state; wire props                     |
| `src/components/Sidebar.jsx`      | Overlay drawer on mobile, static on desktop             |
| `src/components/Slideshow.jsx`    | Hamburger button, single-col grid, responsive padding   |
| `src/components/IDEMock.jsx`      | Reduce max-height on mobile                             |

No new files. No data changes.

---

## Out of Scope

- Touch swipe gestures for slide navigation (not requested)
- Landscape phone optimization (covered by the single breakpoint already)
- PWA / offline support
