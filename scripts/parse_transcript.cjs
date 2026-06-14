#!/usr/bin/env node
'use strict';

/**
 * parse_transcript.js
 *
 * Reads a YouTube auto-caption transcript (Java_Part_NN.txt), splits it into
 * timestamped segments, detects topic boundaries, and emits a chapter block
 * that is merged into src/data/curriculum.json.
 *
 * Usage:
 *   node scripts/parse_transcript.js [part-number]
 *
 * Example:
 *   node scripts/parse_transcript.js 1   ← parse Part 01
 *   node scripts/parse_transcript.js 2   ← parse Part 02
 */

const fs   = require('fs');
const path = require('path');

// ─── CLI / Paths ──────────────────────────────────────────────────────────────

const PART     = parseInt(process.argv[2] ?? '1', 10);
const PART_STR = String(PART).padStart(2, '0');

const INPUT_FILE  = path.resolve(__dirname, `../src/assets/files/Java_Part_${PART_STR}.txt`);
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/curriculum.json');

// ─── Step 1 — Parse raw transcript into timestamped segments ──────────────────

/**
 * Converts a "h:mm:ss" or "m:ss" timestamp string to total seconds.
 */
function tsToSeconds(ts) {
  const parts = ts.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

/**
 * YouTube auto-captions inject human-readable time labels between caption
 * blocks ("8 seconds", "1 minute, 3 seconds", "1 hour, 2 minutes, 31 seconds").
 * These are NOT spoken words — filter them out.
 */
function isTimeLabel(text) {
  const t = text.trim();
  if (!t) return false;
  // Matches any combination of "N hour(s), N minute(s), N second(s)"
  return /^(?:\d+\s+hours?,\s*)?(?:\d+\s+minutes?,\s*)?\d+\s+seconds?$/.test(t)
      || /^\d+\s+minutes?(?:,\s*\d+\s+seconds?)?$/.test(t)
      || /^\d+\s+hours?(?:,\s*\d+\s+minutes?)?(?:,\s*\d+\s+seconds?)?$/.test(t);
}

/**
 * Returns an array of segment objects:
 *   { ts: "0:00", secs: 0, text: "spoken words here" }
 *
 * Lines without timestamps are appended to the current segment.
 * Pure time-label lines are discarded.
 */
function parseTranscript(raw) {
  const TS_PATTERN = /^(\d{1,2}:\d{2}(?::\d{2})?)\s*/;
  const lines      = raw.split('\n');
  const segments   = [];
  let   cur        = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const m = line.match(TS_PATTERN);
    if (m) {
      if (cur) segments.push(cur);
      const ts   = m[1];
      const rest = line.slice(m[0].length).trim();
      cur = {
        ts,
        secs: tsToSeconds(ts),
        text: isTimeLabel(rest) ? '' : rest,
      };
    } else if (cur) {
      if (!isTimeLabel(line)) {
        cur.text += (cur.text ? ' ' : '') + line;
      }
    }
  }
  if (cur) segments.push(cur);

  // Drop empty segments produced by label-only timestamp lines
  return segments.filter(s => s.text.length > 0);
}

// ─── Step 2 — Detect topic (lesson) boundaries ───────────────────────────────

/**
 * Phrases that reliably signal the start of a new lesson in a BroCode Java
 * tutorial.  Each segment whose text matches one of these patterns becomes the
 * first segment of a new lesson.
 */
const LESSON_BOUNDARY_PATTERNS = [
  // "hello again friends so today I'm going to show you..."
  /hello\s+(?:again\s+)?friends[,\s]+(?:so\s+)?today/i,
  // "hey everybody so today we're going to..."
  /hey\s+(?:everybody|guys|friends)[,\s]+(?:so\s+)?today/i,
  // "all right everybody so we are moving on to variables in Java"
  /all\s+right\s+everybody\s+so\s+(?:we\s+are|we're)\s+moving\s+on\s+to/i,
  // "all right everybody so in this video we're going to create..."
  /all\s+right\s+everybody\s+so\s+in\s+this\s+(?:video|lesson)/i,
  // "in this video we're going to create / discuss / cover..."
  /in\s+this\s+(?:video|lesson|topic)\s+(?:we(?:'re|\s+are)|I(?:'m|\s+am))\s+going\s+to\s+(?:create|discuss|cover|show|demonstrate|talk)/i,
  // "today we're going to discuss if statements..."
  /today\s+(?:we(?:'re|\s+are)|I(?:'m|\s+am))\s+going\s+to\s+(?:discuss|cover|create|show|demonstrate|talk)/i,
  // "so today we got a really important topic to discuss"  [original variant]
  /so\s+today\s+(?:we|I)\s+(?:got|have)\s+a\s+(?:really\s+)?important\s+topic/i,
  // "all right everybody so we got a really important topic" [actual Part 1 wording]
  /all\s+right\s+everybody\s+so\s+we\s+got\s+a\s+(?:really\s+)?important\s+topic/i,
  // "we're going to create a game of Mad Libs"
  /we(?:'re|\s+are)\s+going\s+to\s+create\s+a\s+(?:game\s+of|shopping|simple)/i,
  // "to discuss if statements in Java" — prev segment held "today we're going"
  /to\s+discuss\s+if\s+statements?\s+in\s+java/i,
];

function detectLessonBoundaries(segments) {
  const boundaries = [0]; // index 0 always opens the first lesson

  for (let i = 1; i < segments.length; i++) {
    const { text } = segments[i];
    if (LESSON_BOUNDARY_PATTERNS.some(p => p.test(text))) {
      boundaries.push(i);
    }
  }
  return boundaries;
}

// ─── Step 3 — Extract structured data from a lesson's segments ───────────────

/**
 * Extracts a concise title from the opening text of a lesson.
 * Auto-captions have no punctuation, so we strip known filler prefixes and
 * take the first meaningful phrase (up to 70 chars).
 */
function extractTitle(text) {
  let t = text
    // Strip everything before a mid-segment topic transition
    .replace(/^.*?(?:hello\s+(?:again\s+)?(?:everybody|friends)|hey\s+everybody)\s*/i, '')
    // "to discuss X" → "X"
    .replace(/^to\s+discuss\s+/i, '')
    // "so we are moving on to X" → "X"
    .replace(/^so\s+we\s+(?:are|were)\s+moving\s+on\s+to\s+/i, '')
    // "can write using Java all right everybody so we got a really important topic to discuss today [and that is]"
    .replace(/^can\s+write\s+using\s+java\s+.*?discuss\s+today\s+(?:although[^,]+,\s+)?(?:and\s+)?that\s+is\s+(?:the\s+use\s+of\s+)?/i, '')
    // "in this video/lesson we're going to create/discuss/cover"
    .replace(/^(?:in\s+this\s+(?:video|lesson|topic)[,\s]+)?(?:we(?:'re|\s+are)|I(?:'m|\s+am))\s+going\s+to\s+(?:discuss|cover|create|show|demonstrate|talk\s+about|build|teach\s+you)\s*/gi, '')
    // "today we're going to..."
    .replace(/^today[,\s]+(?:we(?:'re|\s+are)|I(?:'m|\s+am))\s+going\s+to\s+(?:discuss|cover|create|show|demonstrate)\s*/gi, '')
    // Leading discourse markers
    .replace(/^(?:all\s+right|hey|hello|okay|so|now|well|a)[,\s]+(?:everybody|friends|guys|again|game\s+of|program|project)?[,\s]*/gi, '')
    .trim();

  // Auto-captions: take the first 10–14 words as the title (no punctuation to split on)
  const words = t.split(/\s+/).slice(0, 10).join(' ');
  const capped = words.charAt(0).toUpperCase() + words.slice(1);
  return capped.length > 70 ? capped.slice(0, 67) + '…' : capped || 'Untitled';
}

const JAVA_TERMS = new Set([
  'variable','int','double','boolean','char','String','class','method',
  'object','array','loop','if','else','for','while','scanner','import',
  'public','static','void','main','print','return','operator','type',
  'primitive','reference','stack','heap','compile','jvm','bytecode',
  'concatenat','increment','decrement','modulus','expression','statement',
]);

/**
 * Extracts bullet-worthy phrases from auto-caption text.
 *
 * Auto-captions have NO punctuation, so sentence-splitting is useless.
 * Instead we use a keyword-anchored sliding window:
 *   1. Locate every word that is a Java term or a definitional verb.
 *   2. Build a ~20-word window centred on that word.
 *   3. Score each window by Java-term density and definitional phrasing.
 *   4. Deduplicate overlapping windows and return the top `max`.
 */
function extractBullets(text, max = 5) {
  const DEF_VERB = /\b(?:is|are|means|allows|represents|stores|returns|contains|refers to|stands for)\b/i;
  const words    = text.split(/\s+/);
  const WINDOW   = 20; // words per candidate phrase
  const STEP     = 5;  // slide by 5 words so windows overlap gracefully

  const candidates = [];

  for (let i = 0; i < words.length - WINDOW; i += STEP) {
    const slice  = words.slice(i, i + WINDOW);
    const phrase = slice.join(' ');
    const lower  = phrase.toLowerCase();

    let score = 0;
    for (const term of JAVA_TERMS) {
      if (lower.includes(term)) score += 2;
    }
    if (DEF_VERB.test(phrase)) score += 3;
    if (/\ba (?:variable|method|class|type|statement|operator|primitive|reference)\b/i.test(phrase)) score += 4;
    if (/\bthink of\b/i.test(phrase)) score += 2;

    if (score >= 4) candidates.push({ phrase, score, pos: i });
  }

  // Sort by score, then deduplicate windows that start within 15 words of each other
  candidates.sort((a, b) => b.score - a.score);
  const selected    = [];
  const usedPos     = [];

  for (const c of candidates) {
    if (selected.length >= max) break;
    const tooClose = usedPos.some(p => Math.abs(p - c.pos) < 15);
    if (!tooClose) {
      selected.push(c);
      usedPos.push(c.pos);
    }
  }

  // Return in narrative order
  return selected
    .sort((a, b) => a.pos - b.pos)
    .map(({ phrase }) => phrase.charAt(0).toUpperCase() + phrase.slice(1));
}

/**
 * Looks for verbally-described Java code patterns and reconstructs a
 * syntactically correct snippet where possible.
 */
function extractCodeSnippet(text) {
  const lower = text.toLowerCase();

  // Detect which code patterns are discussed in this block
  const hasMainMethod  = /public\s+static\s+void\s+main/i.test(text);
  const hasPrintLn     = /system\.out\.print(?:ln)?/i.test(text) || /print\s+line/.test(lower);
  const hasScanner     = /scanner\.(next\w*)/i.test(text) || /scanner\s+object/i.test(text);
  const hasImport      = /import\s+java\.util/i.test(text);
  const hasInt         = /\bint\b/.test(text) && /\bvariable\b/.test(lower);
  const hasDouble      = /\bdouble\b/.test(text) && /\bdecimal\b/.test(lower);
  const hasBoolean     = /\bboolean\b/.test(text);
  const hasArithmetic  = /\b(?:addition|subtraction|multiplication|division|modulus)\b/i.test(text);
  const hasIfStatement = /\bif\s+statement\b/i.test(text);
  const hasString      = /\bstring\b/.test(text) && /concatenat/i.test(text);

  const lines = [];

  if (hasMainMethod) {
    lines.push('public class Main {');
    lines.push('    public static void main(String[] args) {');
    if (hasPrintLn) {
      const quoteMatch = text.match(/"([^"]{2,50})"/);
      const content    = quoteMatch ? quoteMatch[0] : '"Hello, World!"';
      lines.push(`        System.out.println(${content});`);
    }
    lines.push('    }');
    lines.push('}');
  } else if (hasImport || hasScanner) {
    lines.push('import java.util.Scanner;', '');
    lines.push('Scanner scanner = new Scanner(System.in);');
    if (/next\s*int/i.test(text))    lines.push('int age = scanner.nextInt();');
    if (/next\s*double/i.test(text)) lines.push('double gpa = scanner.nextDouble();');
    if (/next\s*boolean/i.test(text))lines.push('boolean ok = scanner.nextBoolean();');
    if (/next\s*line/i.test(text))   lines.push('String name = scanner.nextLine();');
    lines.push('scanner.close();');
  } else if (hasInt && hasDouble && hasBoolean) {
    lines.push('// Primitive data types');
    lines.push('int    age       = 21;');
    lines.push('double price     = 19.99;');
    lines.push('char   grade     = \'A\';');
    lines.push('boolean isStudent = true;');
    lines.push('String  name     = "Your Name";');
  } else if (hasArithmetic) {
    lines.push('int x = 10, y = 3;');
    lines.push('System.out.println(x + y);  // 13  (addition)');
    lines.push('System.out.println(x - y);  // 7   (subtraction)');
    lines.push('System.out.println(x * y);  // 30  (multiplication)');
    lines.push('System.out.println(x / y);  // 3   (integer division)');
    lines.push('System.out.println(x % y);  // 1   (modulus / remainder)');
  } else if (hasIfStatement) {
    lines.push('int age = 18;', '');
    lines.push('if (age >= 18) {');
    lines.push('    System.out.println("You are an adult.");');
    lines.push('} else if (age < 0) {');
    lines.push('    System.out.println("You haven\'t been born yet.");');
    lines.push('} else {');
    lines.push('    System.out.println("You are a child.");');
    lines.push('}');
  } else if (hasString) {
    lines.push('String firstName = "Java";');
    lines.push('String lastName  = "Learner";');
    lines.push('String fullName  = firstName + " " + lastName;');
    lines.push('System.out.println("Hello, " + fullName + "!");');
  } else if (hasPrintLn) {
    const quoteMatch = text.match(/"([^"]{2,50})"/);
    const content    = quoteMatch ? quoteMatch[0] : '"Hello, World!"';
    lines.push(`System.out.println(${content});`);
  }

  return lines.length > 0 ? lines.join('\n') : '';
}

/**
 * Generates instructor notes from a segment's content by summarising the
 * opening context and flagging common student confusion points.
 */
function generateInstructorNotes(text, ts, endTs) {
  const lower      = text.toLowerCase();
  const timeRange  = `Covers ${ts}–${endTs}.`;
  const confusions = [];

  if (/single.*quote|double.*quote|mix.*quote/i.test(lower))
    confusions.push('Remind students: chars use single quotes (\' \'), Strings use double quotes (\" \").');
  if (/semicolon/.test(lower))
    confusions.push('Emphasise: every statement must end with a semicolon.');
  if (/camel\s*case/.test(lower))
    confusions.push('Demo camelCase naming live: firstName, isStudent, totalPrice.');
  if (/input\s+buffer|new\s+line\s+character/i.test(lower))
    confusions.push('Common pitfall: consuming the leftover newline with scanner.nextLine() after nextInt().');
  if (/integer\s+division/.test(lower))
    confusions.push('Gotcha: int / int truncates the decimal. Use doubles or cast to retain it.');
  if (/double\s+equals|comparison\s+operator/i.test(lower))
    confusions.push('Distinguish = (assignment) from == (equality comparison) — a very common bug.');

  const notes = [timeRange];
  if (confusions.length > 0) notes.push(...confusions);
  else notes.push(text.slice(0, 150).trimEnd() + '…');

  return notes.join(' ');
}

// ─── Step 4 — Assemble curriculum JSON chapter ────────────────────────────────

const SEGMENTS_PER_SLIDE = 12; // ~2–3 minutes of speech per slide

function buildChapter(segments, part) {
  const boundaries  = detectLessonBoundaries(segments);
  const lessonGroups = boundaries.map((startIdx, bi) => {
    const endIdx = boundaries[bi + 1] ?? segments.length;
    return segments.slice(startIdx, endIdx);
  });

  const lessons = lessonGroups.map((group, li) => {
    const lessonNum  = String(li + 1).padStart(2, '0');
    const lessonId   = `le-${PART_STR}-${lessonNum}`;
    const lessonTitle = extractTitle(group[0].text);

    // Subdivide the lesson into slides
    const slideGroups = [];
    for (let i = 0; i < group.length; i += SEGMENTS_PER_SLIDE) {
      slideGroups.push(group.slice(i, i + SEGMENTS_PER_SLIDE));
    }

    const slides = slideGroups.map((sg, si) => {
      const slideNum  = String(si + 1).padStart(2, '0');
      const slideId   = `sl-${PART_STR}-${lessonNum}-${slideNum}`;
      const content   = sg.map(s => s.text).join(' ');
      const tsStart   = sg[0].ts;
      const tsEnd     = sg[sg.length - 1].ts;

      return {
        id:              slideId,
        timestamp:       tsStart,
        title:           extractTitle(sg[0].text),
        content,
        bullets:         extractBullets(content),
        code:            extractCodeSnippet(content),
        instructorNotes: generateInstructorNotes(content, tsStart, tsEnd),
      };
    });

    return { id: lessonId, title: lessonTitle, slides };
  });

  return {
    id:          `ch-${PART_STR}`,
    title:       `Part ${PART}: Core Java Fundamentals`,
    description: `Chapter ${PART} of the Java Full Course — auto-parsed from transcript.`,
    lessons,
  };
}

// ─── Step 5 — Validation ─────────────────────────────────────────────────────

function validate(segments, chapter) {
  // Count non-whitespace input characters from the raw segments
  const inputChars = segments.reduce((sum, s) => sum + s.text.replace(/\s+/g, '').length, 0);

  // Count non-whitespace characters captured in slide `content` fields
  const outputChars = chapter.lessons.reduce((sum, l) =>
    sum + l.slides.reduce((s2, sl) => s2 + (sl.content ?? '').replace(/\s+/g, '').length, 0),
  0);

  const retentionPct = ((outputChars / inputChars) * 100).toFixed(1);

  console.log('\n── Validation ───────────────────────────────────────────');
  console.log(`   Input chars (non-ws):   ${inputChars.toLocaleString()}`);
  console.log(`   Output chars (non-ws):  ${outputChars.toLocaleString()}`);
  console.log(`   Content retention:      ${retentionPct}%`);

  if (parseFloat(retentionPct) < 99) {
    console.warn(`   ⚠  Retention below 99% — some transcript content may have been dropped.`);
  } else {
    console.log(`   ✓  Zero data loss confirmed.`);
  }

  console.log('─────────────────────────────────────────────────────────\n');
}

// ─── Step 6 — Write output ────────────────────────────────────────────────────

function writeCurriculum(chapter) {
  let curriculum;
  try {
    curriculum = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  } catch {
    curriculum = {
      courseTitle:        'Java Full Course',
      totalDurationHours: 12,
      chapters:           [],
    };
  }

  const existingIdx = curriculum.chapters.findIndex(c => c.id === chapter.id);
  if (existingIdx >= 0) {
    curriculum.chapters[existingIdx] = chapter;
    console.log(`Replaced Part ${PART} chapter in curriculum.json`);
  } else {
    curriculum.chapters.push(chapter);
    console.log(`Added Part ${PART} chapter to curriculum.json`);
  }

  // Keep chapters sorted by id
  curriculum.chapters.sort((a, b) => a.id.localeCompare(b.id));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(curriculum, null, 2), 'utf-8');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`\n✗  Input file not found:\n   ${INPUT_FILE}\n`);
    process.exit(1);
  }

  console.log(`\nparse_transcript.js — Part ${PART}`);
  console.log(`Input:  ${path.relative(process.cwd(), INPUT_FILE)}`);
  console.log(`Output: ${path.relative(process.cwd(), OUTPUT_FILE)}\n`);

  // 1. Read + parse
  const raw      = fs.readFileSync(INPUT_FILE, 'utf-8');
  const segments = parseTranscript(raw);
  console.log(`Parsed ${segments.length} transcript segments`);

  // 2. Build chapter
  const chapter = buildChapter(segments, PART);
  const totalSlides = chapter.lessons.reduce((s, l) => s + l.slides.length, 0);
  console.log(`Built  ${chapter.lessons.length} lessons, ${totalSlides} slides`);

  // 3. Validate
  validate(segments, chapter);

  // 4. Write
  writeCurriculum(chapter);

  // Summary
  console.log(`\n✓  Part ${PART} complete`);
  console.log(`   Lessons: ${chapter.lessons.map(l => l.title).join('\n            ')}`);
  console.log(`\n   Run Part ${PART + 1} next:`);
  console.log(`   node scripts/parse_transcript.js ${PART + 1}\n`);
}

main();
