# Parts 4 & 5 Curriculum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Append ch-04 (For Loops & Arrays, 7 lessons) and ch-05 (Methods, 6 lessons) to `src/data/curriculum.json`.

**Architecture:** Single-file append — two Edit operations, one per chapter. Each chapter is a self-contained JSON object appended to the `chapters[]` array. Validate JSON after each edit. Commit after each chapter.

**Tech Stack:** JSON (data only), React/Vite (renders data), Node.js (JSON validation)

## Global Constraints

- Schema per slide: `id`, `timestamp`, `title`, `content` (1 sentence), `bullets` (exactly 4), `code`, `instructorNotes`
- ID format: `ch-04`, `le-04-01`, `sl-04-01-01` — continue existing numbering
- `instructorNotes` format: `Video: H:MM:SS`
- Code must be valid Java, JSON-escaped (`\"` for quotes, `\n` for newlines)
- No UI changes — data only

---

### Task 1: Add ch-04 (Part 4: For Loops & Arrays)

**Files:**
- Modify: `src/data/curriculum.json`

**Lessons:** le-04-01 For Loops · le-04-02 Nested For Loops · le-04-03 Number Guessing Game · le-04-04 Arrays · le-04-05 For-Each Loop · le-04-06 2D Arrays · le-04-07 Array Sorting & Searching

- [ ] **Step 1: Append ch-04 to curriculum.json**

Use Edit tool. `old_string` = last 6 lines of file:
```
          ]
        }
      ]
    }
  ]
}
```
`new_string` = same but ch-04 inserted before `  ]` close of chapters (see implementation).

- [ ] **Step 2: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/data/curriculum.json','utf8'));console.log('Valid')"
```
Expected: `Valid`

- [ ] **Step 3: Commit**

```bash
git add src/data/curriculum.json
git commit -m "feat: add Part 4 - For Loops & Arrays to curriculum"
```

---

### Task 2: Add ch-05 (Part 5: Methods)

**Files:**
- Modify: `src/data/curriculum.json`

**Lessons:** le-05-01 Defining Methods · le-05-02 Parameters & Arguments · le-05-03 Return Types · le-05-04 Overloaded Methods · le-05-05 Variable Scope · le-05-06 Bank Account Project

- [ ] **Step 1: Append ch-05 to curriculum.json**

Use Edit tool. `old_string` = last 6 lines of file after Task 1.
`new_string` = same but ch-05 inserted before `  ]` close of chapters.

- [ ] **Step 2: Validate JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/data/curriculum.json','utf8'));console.log('Valid')"
```
Expected: `Valid`

- [ ] **Step 3: Commit**

```bash
git add src/data/curriculum.json
git commit -m "feat: add Part 5 - Methods to curriculum"
```
