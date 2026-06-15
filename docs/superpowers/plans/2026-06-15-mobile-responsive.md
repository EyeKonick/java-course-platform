# Mobile Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Java course presentation platform fully responsive across all screen sizes using Tailwind breakpoints and a hamburger overlay drawer for the sidebar.

**Architecture:** Four in-place file edits using Tailwind's `md:` prefix for the 768px breakpoint. On mobile the sidebar becomes a fixed overlay triggered by a `Menu` icon in the slideshow header; the slide content collapses from a two-column grid to a single column with the IDE block stacking below the bullet points.

**Tech Stack:** React 18, Vite, Tailwind CSS v4, lucide-react

---

## File Map

| File | Change |
|------|--------|
| `src/App.jsx` | Add `sidebarOpen` state; wire `isOpen`/`onClose` to Sidebar and `onMenuOpen` to Slideshow |
| `src/components/Sidebar.jsx` | Accept `isOpen`/`onClose` props; add backdrop + close button; swap static position for overlay on mobile |
| `src/components/Slideshow.jsx` | Accept `onMenuOpen` prop; add hamburger button; collapse grid to 1 col on mobile; tighten padding; fix font clamp; fix overflow |
| `src/components/IDEMock.jsx` | Reduce `max-h-96` → `max-h-52 md:max-h-96` |

---

## Task 1: App.jsx — Sidebar state + prop wiring

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace App.jsx with the wired version**

Open `src/App.jsx` and replace the entire file with:

```jsx
import { useState } from 'react';
import curriculum from './data/curriculum.json';
import Sidebar from './components/Sidebar';
import Slideshow from './components/Slideshow';

const ALL_LESSONS = curriculum.chapters.flatMap(ch => ch.lessons);

function App() {
  const [activeLessonId, setActiveLessonId]       = useState(ALL_LESSONS[0]?.id ?? null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen]             = useState(false);

  const activeLesson = ALL_LESSONS.find(l => l.id === activeLessonId) ?? null;

  const handleSelectLesson = (lessonId) => {
    setActiveLessonId(lessonId);
    setCurrentSlideIndex(0);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-white">
      <Sidebar
        curriculum={curriculum}
        activeLessonId={activeLessonId}
        onSelectLesson={handleSelectLesson}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Slideshow
        slides={activeLesson?.slides ?? []}
        lessonTitle={activeLesson?.title ?? ''}
        currentSlideIndex={currentSlideIndex}
        onSlideChange={setCurrentSlideIndex}
        onMenuOpen={() => setSidebarOpen(true)}
      />
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Verify the app still starts without errors**

Run: `npm run dev`

Open `http://localhost:5173` in the browser. Expected: app loads, sidebar and slides render identically to before (no visible change yet since Sidebar doesn't consume the new props yet).

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add sidebarOpen state and wire sidebar/slideshow props"
```

---

## Task 2: Sidebar.jsx — Mobile overlay drawer

**Files:**
- Modify: `src/components/Sidebar.jsx`

- [ ] **Step 1: Replace Sidebar.jsx with the responsive version**

Open `src/components/Sidebar.jsx` and replace the entire file with:

```jsx
import { useState } from 'react';
import { ChevronRight, ChevronDown, FileCode, BookMarked, X } from 'lucide-react';

export default function Sidebar({ curriculum, activeLessonId, onSelectLesson, isOpen, onClose }) {
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(curriculum.chapters.map(ch => [ch.id, true]))
  );

  const toggleChapter = id =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const allLessons = curriculum.chapters.flatMap(ch => ch.lessons);
  const totalLessons = allLessons.length;
  const activeIdx = allLessons.findIndex(l => l.id === activeLessonId);
  const progressPct = totalLessons > 0 && activeIdx >= 0
    ? Math.round(((activeIdx + 1) / totalLessons) * 100)
    : 0;

  return (
    <>
      {/* Backdrop — visible on mobile only when drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={[
        'fixed inset-y-0 left-0 z-50 w-72 flex-shrink-0',
        'bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden',
        'transition-transform duration-300 ease-in-out',
        'md:static md:translate-x-0 md:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>

        {/* Header */}
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <BookMarked className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-emerald-400 text-[10px] font-medium tracking-[0.18em] uppercase flex-1">
              Java Course by: BiieeJiiee
            </span>
            <button
              onClick={onClose}
              className="md:hidden p-1 text-slate-500 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chapter / lesson navigation tree */}
        <nav className="flex-1 overflow-y-auto py-2">
          {curriculum.chapters.map((chapter, chIdx) => {
            const chapterOpen = expanded[chapter.id];
            return (
              <div key={chapter.id} className="mb-1">
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left group hover:bg-slate-800/40 transition-colors duration-100"
                >
                  {chapterOpen
                    ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  }
                  <span className="text-[10px] text-slate-600 font-medium tracking-widest uppercase flex-shrink-0 w-6">
                    {String(chIdx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-slate-300 text-xs font-medium truncate group-hover:text-white transition-colors duration-100">
                    {chapter.title}
                  </span>
                </button>

                {chapterOpen && (
                  <div className="ml-9 border-l border-slate-800">
                    {chapter.lessons.map(lesson => {
                      const isActive = lesson.id === activeLessonId;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson.id)}
                          className={[
                            'w-full flex items-center gap-2.5 pl-3 pr-4 py-2 text-left -ml-px',
                            'border-l-2 transition-all duration-150',
                            isActive
                              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30',
                          ].join(' ')}
                        >
                          <FileCode className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span className="text-xs truncate">{lesson.title}</span>
                          {isActive && (
                            <div className="ml-auto w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Progress footer */}
        <div className="px-5 py-4 border-t border-slate-800 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider">Progress</span>
            <span className="text-slate-500 text-[10px]">
              {activeIdx >= 0 ? activeIdx + 1 : 0} / {totalLessons}
            </span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Step 2: Visual verify on desktop**

With `npm run dev` still running, check `http://localhost:5173` at full browser width (> 768px).

Expected:
- Sidebar is visible and static on the left, identical to before
- No backdrop, no hamburger button visible

- [ ] **Step 3: Visual verify on mobile**

Open browser DevTools → Toggle device toolbar → set to iPhone 14 (390 × 844).

Expected:
- Sidebar is hidden (off-screen to the left)
- A dark backdrop does NOT appear (drawer is closed)
- The main content area fills the full width

- [ ] **Step 4: Commit**

```bash
git add src/components/Sidebar.jsx
git commit -m "feat: sidebar becomes mobile overlay drawer with backdrop and close button"
```

---

## Task 3: Slideshow.jsx — Hamburger, responsive grid, padding, font, overflow

**Files:**
- Modify: `src/components/Slideshow.jsx`

- [ ] **Step 1: Replace Slideshow.jsx with the responsive version**

Open `src/components/Slideshow.jsx` and replace the entire file with:

```jsx
import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import IDEMock from './IDEMock';

const BULLET_ANIMATION = `
  @keyframes bulletIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;

export default function Slideshow({
  slides = [],
  lessonTitle = '',
  currentSlideIndex,
  onSlideChange,
  onMenuOpen,
}) {
  const total = slides.length;
  const slide = slides[currentSlideIndex] ?? null;

  useEffect(() => {
    const handleKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (total === 0) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        onSlideChange(prev => Math.min(prev + 1, total - 1));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onSlideChange(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [total, onSlideChange]);

  if (!slide) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-4 md:px-10 md:pt-8 flex-shrink-0">
          <button
            onClick={onMenuOpen}
            className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-700">
          <div className="w-12 h-12 rounded-xl border border-slate-800 flex items-center justify-center">
            <ChevronRight className="w-5 h-5" />
          </div>
          <p className="text-sm">Select a lesson from the sidebar to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <style>{BULLET_ANIMATION}</style>

      {/* Lesson label row + hamburger */}
      <div className="px-4 pt-4 pb-0 md:px-10 md:pt-8 flex-shrink-0 flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-white transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <p className="text-slate-500 text-[10px] tracking-[0.2em] uppercase font-medium">
          {lessonTitle}
        </p>
      </div>

      {/* Slide content — 1-col on mobile, 2-col on desktop */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-4 py-4 md:px-10 md:py-6 overflow-y-auto md:overflow-hidden md:min-h-0">

        {/* Slide title + bullets */}
        <div className="flex flex-col justify-center">
          <h2
            className="text-white font-bold leading-tight mb-8"
            style={{ fontSize: 'clamp(1.25rem, 5vw, 2.25rem)' }}
          >
            {slide.title}
          </h2>

          <ul key={currentSlideIndex} className="space-y-5">
            {slide.bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-4 text-slate-300 leading-relaxed"
                style={{
                  fontSize: 'clamp(0.95rem, 1.3vw, 1.125rem)',
                  opacity: 0,
                  animation: 'bulletIn 0.35s ease both',
                  animationDelay: `${i * 70}ms`,
                }}
              >
                <span className="text-emerald-400 mt-0.5 text-sm flex-shrink-0 select-none">▸</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* IDEMock — stacks below bullets on mobile */}
        <div className="flex flex-col justify-center overflow-hidden order-last md:order-none">
          {slide.code
            ? <IDEMock code={slide.code} />
            : (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 h-40 flex items-center justify-center">
                <span className="text-slate-700 text-sm">No code example for this slide</span>
              </div>
            )
          }
        </div>
      </div>

      {/* Navigation bar */}
      <div className="flex-shrink-0 px-4 py-3 md:px-10 md:py-4 border-t border-slate-800 flex items-center justify-between">

        <button
          onClick={() => onSlideChange(prev => Math.max(prev - 1, 0))}
          disabled={currentSlideIndex === 0}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-default transition-colors duration-150"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => onSlideChange(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  i === currentSlideIndex
                    ? 'w-5 h-1.5 bg-emerald-400'
                    : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-600 text-[10px] tracking-widest tabular-nums">
            {currentSlideIndex + 1} of {total}
          </span>
        </div>

        <button
          onClick={() => onSlideChange(prev => Math.min(prev + 1, total - 1))}
          disabled={currentSlideIndex === total - 1}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-default transition-colors duration-150"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Visual verify hamburger on mobile**

In DevTools responsive mode (390 × 844):

Expected:
- A hamburger (`☰`) icon appears top-left next to the lesson label
- Tapping it opens the sidebar drawer from the left
- A semi-transparent backdrop appears behind the drawer
- Tapping the backdrop closes the drawer
- The `✕` button inside the drawer header also closes it
- Selecting a lesson closes the drawer and loads the lesson

- [ ] **Step 3: Visual verify single-column layout on mobile**

Still in DevTools responsive mode:

Expected:
- Slide title and bullets appear first (top)
- IDEMock appears below the bullets (bottom), not side-by-side
- Content area is scrollable if it overflows the screen height
- Navigation bar stays pinned at the bottom

- [ ] **Step 4: Visual verify two-column layout on desktop**

Switch DevTools to 1280 × 800 (or exit responsive mode):

Expected:
- Sidebar is static on the left, hamburger button is hidden
- Slide title + bullets on the left, IDEMock on the right (unchanged from original)
- Navigation bar at the bottom

- [ ] **Step 5: Visual verify keyboard navigation still works**

On desktop, press `ArrowRight` and `ArrowLeft` to navigate slides.

Expected: slides advance and go back as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/Slideshow.jsx
git commit -m "feat: add hamburger button and responsive single-column layout for mobile"
```

---

## Task 4: IDEMock.jsx — Reduce max-height on mobile

**Files:**
- Modify: `src/components/IDEMock.jsx`

- [ ] **Step 1: Update the code viewport max-height**

In `src/components/IDEMock.jsx`, find line 148:

```jsx
<div className="overflow-auto max-h-96 text-sm leading-6" style={MONO}>
```

Replace with:

```jsx
<div className="overflow-auto max-h-52 md:max-h-96 text-sm leading-6" style={MONO}>
```

- [ ] **Step 2: Visual verify IDEMock height on mobile**

In DevTools responsive mode (390 × 844), navigate to any slide that has a code example.

Expected:
- The IDEMock is shorter on mobile (`max-h-52` = 208px) but the internal scroll still works — no code is cut off permanently, the user can scroll inside the block
- On desktop (≥ 768px), the IDEMock returns to its original `max-h-96` (384px) height

- [ ] **Step 3: Final full-pass check**

Test the following scenarios in DevTools responsive mode across three widths — 390px (iPhone), 768px (iPad), 1280px (desktop):

| Check | 390px | 768px | 1280px |
|-------|-------|-------|--------|
| Sidebar hidden on load | ✓ | — | — |
| Hamburger visible | ✓ | — | — |
| Hamburger opens drawer | ✓ | — | — |
| Backdrop closes drawer | ✓ | — | — |
| Lesson select closes drawer | ✓ | — | — |
| Single-column slide layout | ✓ | — | — |
| IDEMock below bullets | ✓ | — | — |
| Two-column slide layout | — | ✓ | ✓ |
| Sidebar always visible | — | ✓ | ✓ |
| Keyboard nav works | — | ✓ | ✓ |

- [ ] **Step 4: Commit**

```bash
git add src/components/IDEMock.jsx
git commit -m "feat: reduce IDEMock max-height on mobile for better stacking"
```
