import { useState } from 'react';
import { Copy, Check, Coffee } from 'lucide-react';

const KEYWORDS = new Set([
  'abstract','assert','break','case','catch','class','const','continue',
  'default','do','else','enum','extends','final','finally','for','goto',
  'if','implements','import','instanceof','interface','native','new',
  'package','private','protected','public','return','static','strictfp',
  'super','switch','synchronized','this','throw','throws','transient',
  'try','volatile','while','null','true','false','void',
]);

const TYPES = new Set([
  'int','double','float','long','short','byte','char','boolean',
  'String','Integer','Double','Float','Long','Short','Byte','Character',
  'Boolean','Object','var','System','Math','Scanner','ArrayList','HashMap',
]);

function tokenizeLine(line) {
  const tokens = [];
  let i = 0;

  while (i < line.length) {
    // Line comment — consume the rest of the line as one token
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }
    // String literal (handles escaped quotes inside)
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length && line[j] !== '"') {
        if (line[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', value: line.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    // Char literal
    if (line[i] === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== "'") {
        if (line[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', value: line.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    // Numeric literal (includes _ separator, L/f/d/x suffixes)
    if (/[0-9]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[0-9_.LlFfDdXxA-Fa-f]/.test(line[j])) j++;
      tokens.push({ type: 'number', value: line.slice(i, j) });
      i = j;
      continue;
    }
    // Identifier, keyword, or type
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let type = 'identifier';
      if (KEYWORDS.has(word)) type = 'keyword';
      else if (TYPES.has(word)) type = 'type';
      else if (/^[A-Z]/.test(word)) type = 'class-name';
      tokens.push({ type, value: word });
      i = j;
      continue;
    }
    tokens.push({ type: 'punct', value: line[i] });
    i++;
  }

  return tokens;
}

const TOKEN_CLASS = {
  comment:    'text-slate-500 italic',
  string:     'text-amber-300',
  keyword:    'text-violet-400',
  type:       'text-cyan-400',
  number:     'text-emerald-300',
  'class-name': 'text-sky-300',
  identifier: 'text-slate-300',
  punct:      'text-slate-400',
};

function CodeLine({ line }) {
  if (!line.trim()) return <span>&nbsp;</span>;
  return (
    <>
      {tokenizeLine(line).map((token, i) => (
        <span key={i} className={TOKEN_CLASS[token.type] ?? 'text-slate-300'}>
          {token.value}
        </span>
      ))}
    </>
  );
}

const MONO = {
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
};

export default function IDEMock({ code = '' }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
        {/* macOS window dots */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 block" />
          <span className="w-3 h-3 rounded-full bg-amber-500 block" />
          <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
        </div>

        {/* File tab */}
        <div className="flex items-center gap-1.5 bg-slate-800 rounded-md px-3 py-1.5 border border-slate-700/50">
          <Coffee className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span className="text-slate-300 text-xs" style={MONO}>Main.java</span>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-400 text-xs px-2 py-1 rounded-md hover:bg-slate-800 transition-colors duration-150"
        >
          {copied
            ? <><Check className="w-3.5 h-3.5" /><span>Copied!</span></>
            : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
          }
        </button>
      </div>

      {/* Code viewport — single scroll container to avoid double scrollbar */}
      <div className="overflow-auto max-h-52 md:max-h-96 text-sm leading-6" style={MONO}>
        <div className="flex min-w-max p-4">
          {/* Line number gutter — sticky so it stays visible during horizontal scroll */}
          <div className="select-none text-right pr-4 border-r border-slate-800 w-10 shrink-0 sticky left-0 bg-slate-900 z-10">
            {lines.map((_, i) => (
              <div key={i} className="text-slate-600">{i + 1}</div>
            ))}
          </div>

          {/* Syntax-highlighted code */}
          <div className="pl-4">
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre">
                <CodeLine line={line} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
