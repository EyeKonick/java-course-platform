import { useState } from 'react';
import curriculum from './data/curriculum.json';
import Sidebar from './components/Sidebar';
import Slideshow from './components/Slideshow';

const ALL_LESSONS = curriculum.chapters.flatMap(ch => ch.lessons);

function App() {
  const [activeLessonId, setActiveLessonId]       = useState(ALL_LESSONS[0]?.id ?? null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const activeLesson = ALL_LESSONS.find(l => l.id === activeLessonId) ?? null;

  const handleSelectLesson = (lessonId) => {
    setActiveLessonId(lessonId);
    setCurrentSlideIndex(0);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-white">
      <Sidebar
        curriculum={curriculum}
        activeLessonId={activeLessonId}
        onSelectLesson={handleSelectLesson}
      />

      <Slideshow
        slides={activeLesson?.slides ?? []}
        lessonTitle={activeLesson?.title ?? ''}
        currentSlideIndex={currentSlideIndex}
        onSlideChange={setCurrentSlideIndex}
      />
    </div>
  );
}

export default App;
