import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-700">
        <div className="w-12 h-12 rounded-xl border border-slate-800 flex items-center justify-center">
          <ChevronRight className="w-5 h-5" />
        </div>
        <p className="text-sm">Select a lesson from the sidebar to begin</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <style>{BULLET_ANIMATION}</style>

      {/* Lesson label */}
      <div className="px-10 pt-8 pb-0 flex-shrink-0">
        <p className="text-slate-500 text-[10px] tracking-[0.2em] uppercase font-medium">
          {lessonTitle}
        </p>
      </div>

      {/* Two-column slide content */}
      <div className="flex-1 grid grid-cols-2 gap-10 px-10 py-6 overflow-hidden min-h-0">

        {/* Left: slide title + bullets */}
        <div className="flex flex-col justify-center overflow-y-auto">
          <h2
            className="text-white font-bold leading-tight mb-8"
            style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2.25rem)' }}
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

        {/* Right: IDEMock code viewer */}
        <div className="flex flex-col justify-center overflow-hidden">
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
      <div className="flex-shrink-0 px-10 py-4 border-t border-slate-800 flex items-center justify-between">

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
