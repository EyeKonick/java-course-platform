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
        'fixed inset-y-0 left-0 z-50 w-72 shrink-0',
        'bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden',
        'transition-transform duration-300 ease-in-out',
        'md:static md:translate-x-0 md:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>

        {/* Header */}
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
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
          <h1 className="text-white text-sm font-semibold leading-snug">
            {curriculum.courseTitle}
          </h1>
          <p className="text-slate-500 text-xs mt-1.5">
            {curriculum.totalDurationHours}h · {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
          </p>
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
                    ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  }
                  <span className="text-[10px] text-slate-600 font-medium tracking-widest uppercase shrink-0 w-6">
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
                          <FileCode className={`w-3 h-3 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span className="text-xs truncate">{lesson.title}</span>
                          {isActive && (
                            <div className="ml-auto w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
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
        <div className="px-5 py-4 border-t border-slate-800 shrink-0">
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
