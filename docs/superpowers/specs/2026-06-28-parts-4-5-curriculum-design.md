# Design Spec: Java Course Parts 4 & 5

**Date:** 2026-06-28  
**File:** `src/data/curriculum.json`  
**Scope:** Add two new chapters (ch-04, ch-05) to the existing curriculum JSON

---

## Context

The curriculum currently has 3 chapters:
- ch-01: Part 1 — Core Java Fundamentals
- ch-02: Part 2 — Java Tools & Techniques
- ch-03: Part 3 — Control Flow & Loops (ends at ~video 3:31)

Each chapter follows the same schema: `id`, `title`, `description`, `lessons[]`, where each lesson has `id`, `title`, `slides[]`, and each slide has `id`, `timestamp`, `title`, `content`, `bullets[]`, `code`, `instructorNotes`.

---

## Part 4: For Loops & Arrays (ch-04)

**Description:** "Master the for loop and Java arrays — the backbone of data iteration and collection."

**Rationale:** For loops are the natural partner to the while loops just covered. Arrays immediately give students a concrete reason to use them. The two concepts reinforce each other within the same chapter.

### Lessons

| ID | Title | Key Slides |
|---|---|---|
| le-04-01 | For Loops | Syntax & structure, counting up/down, step sizes, break/continue |
| le-04-02 | Nested For Loops | Multiplication table, triangle patterns, loop variable naming |
| le-04-03 | Number Guessing Game | Project: Random + while + for, attempt counter, win/lose feedback |
| le-04-04 | Arrays | Declaration & initialisation, zero-indexing, `.length`, common mistakes |
| le-04-05 | For-Each Loop | Enhanced for syntax, when to prefer over indexed for, read-only caveat |
| le-04-06 | 2D Arrays | Declaration, `[row][col]` access, nested loop traversal, grid mental model |
| le-04-07 | Array Sorting & Searching | `Arrays.sort()`, `Arrays.toString()`, linear search, find min/max |

---

## Part 5: Methods (ch-05)

**Description:** "Break programs into reusable, named methods — the foundation of structured and maintainable Java code."

**Rationale:** By this point, programs have grown complex enough (array operations, game loops) that students feel the pain of everything in `main()`. Methods feel like a natural solution, not a forced abstraction.

### Lessons

| ID | Title | Key Slides |
|---|---|---|
| le-05-01 | Defining Methods | void method syntax, naming conventions, calling a method, execution flow |
| le-05-02 | Parameters & Arguments | Single param, multiple params, type matching, passing by value |
| le-05-03 | Return Types | `return` statement, non-void return types, storing the result |
| le-05-04 | Overloaded Methods | Same name, different signature, compile-time resolution |
| le-05-05 | Variable Scope | Local scope, block scope, why outer vars aren't visible inside a method |
| le-05-06 | Methods Project | Bank Account simulator — deposit/withdraw/checkBalance as separate methods |

---

## Content Standards (matching existing chapters)

- Each slide has 4 bullets — concise, student-facing facts
- Code examples are self-contained and runnable
- Timestamps use video-time format (`Video: H:MM:SS`) and continue from Part 3's end (~3:31)
- ID format: `ch-04`, `le-04-01`, `sl-04-01-01` etc.
- Projects (Guessing Game, Bank Account) get their own lesson with 2-3 slides (overview → full solution → challenge)
- All code uses the IDEMock aesthetic conventions from CLAUDE.md

---

## Out of Scope

- ArrayList, generics, or Collections — these belong in a later OOP chapter
- Recursion — deferred to a dedicated lesson after methods basics are solid
- Static vs instance methods — introduced in OOP chapter
