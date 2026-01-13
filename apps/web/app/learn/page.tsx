'use client';

import * as React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TutorialSidebar } from '@/components/tutorial/tutorial-sidebar';
import { LessonContent } from '@/components/tutorial/lesson-content';
import { lessons, getLessonById } from '@/lib/tutorial';
import { setCurrentLesson, isLessonUnlocked } from '@/lib/tutorial-progress';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LearnPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [currentLessonId, setCurrentLessonId] = React.useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get lesson from URL or default to first lesson
  React.useEffect(() => {
    const lessonParam = searchParams.get('lesson');
    if (lessonParam) {
      const lesson = getLessonById(lessonParam);
      if (lesson && isLessonUnlocked(lessonParam, lesson.unlockAfter)) {
        setCurrentLessonId(lessonParam);
        setCurrentLesson(lessonParam);
      } else {
        // Invalid or locked lesson, redirect to first available
        setCurrentLessonId(lessons[0]?.id ?? null);
        router.replace('/learn?lesson=' + (lessons[0]?.id ?? ''));
      }
    } else {
      // No lesson specified, go to first lesson
      const firstLesson = lessons[0];
      if (firstLesson) {
        setCurrentLessonId(firstLesson.id);
        setCurrentLesson(firstLesson.id);
        router.replace('/learn?lesson=' + firstLesson.id);
      }
    }
  }, [searchParams, router]);

  const currentLesson = currentLessonId ? getLessonById(currentLessonId) : null;
  const currentIndex = currentLessonId ? lessons.findIndex(l => l.id === currentLessonId) : -1;

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      if (isLessonUnlocked(nextLesson.id, nextLesson.unlockAfter)) {
        setCurrentLessonId(nextLesson.id);
        router.push(`/learn?lesson=${nextLesson.id}`);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1];
      setCurrentLessonId(prevLesson.id);
      router.push(`/learn?lesson=${prevLesson.id}`);
    }
  };

  const hasNext = currentIndex >= 0 && currentIndex < lessons.length - 1;
  const hasPrevious = currentIndex > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      {/* Top Navigation */}
      <div className="border-b border-white/10 bg-purple-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-bold text-lg">FFMPEG Tutorials</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white/80 hover:text-white lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <div
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 lg:w-auto transition-transform duration-300 ease-in-out`}
          >
            <TutorialSidebar currentLessonId={currentLessonId ?? undefined} />
          </div>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          {currentLesson ? (
            <div className="bg-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-8">
              <LessonContent
                lesson={currentLesson}
                onNext={handleNext}
                onPrevious={handlePrevious}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <h2 className="text-white text-2xl font-bold mb-4">Loading...</h2>
                <p className="text-gray-400">Preparing your learning experience</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
