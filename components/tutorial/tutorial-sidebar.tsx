'use client';

import * as React from 'react';
import { CheckCircle, Lock, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { lessons, getModules, getLessonsByModule } from '@/lib/tutorial-content';
import { getProgress, isLessonCompleted, isLessonUnlocked } from '@/lib/tutorial-progress';
import { getOverallProgress } from '@/lib/tutorial-progress';
import Link from 'next/link';

interface TutorialSidebarProps {
  currentLessonId?: string;
}

export function TutorialSidebar({ currentLessonId }: TutorialSidebarProps) {
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(new Set(['Fundamentals']));
  const [progress, setProgress] = React.useState(getProgress());

  // Update progress when it changes
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(getProgress());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const overallProgress = getOverallProgress(lessons.length);
  const modules = getModules();

  const toggleModule = (module: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
  };

  const getLessonStatus = (lessonId: string, unlockAfter?: string) => {
    if (isLessonCompleted(lessonId)) {
      return 'completed';
    }
    if (currentLessonId === lessonId) {
      return 'current';
    }
    if (!isLessonUnlocked(lessonId, unlockAfter)) {
      return 'locked';
    }
    return 'available';
  };

  return (
    <div className="lg:sticky lg:top-8 lg:self-start">
      <div className="bg-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-6">
        <h2 className="text-white text-xl mb-2">FFMPEG Tutorials</h2>
        
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Overall Progress</span>
            <span className="text-white">{overallProgress}%</span>
          </div>
          <div className="bg-purple-950/50 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Lesson Categories */}
        <div className="space-y-2">
          {modules.map((module) => {
            const moduleLessons = getLessonsByModule(module);
            const isExpanded = expandedModules.has(module);
            const completedCount = moduleLessons.filter(l => isLessonCompleted(l.id)).length;
            const progressText = `${completedCount}/${moduleLessons.length}`;

            return (
              <div key={module}>
                <button
                  onClick={() => toggleModule(module)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-purple-900/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-purple-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-purple-400" />
                    )}
                    <span className="text-white">{module}</span>
                  </div>
                  <span className="text-white/40 text-sm">{progressText}</span>
                </button>

                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {moduleLessons.map((lesson) => {
                      const status = getLessonStatus(lesson.id, lesson.unlockAfter);
                      const isCurrent = currentLessonId === lesson.id;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/learn?lesson=${lesson.id}`}
                          disabled={status === 'locked'}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left ${
                            isCurrent
                              ? "bg-purple-700/30 border border-purple-500/50"
                              : status === 'locked'
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-purple-900/30"
                          }`}
                          onClick={(e) => {
                            if (status === 'locked') {
                              e.preventDefault();
                            }
                          }}
                        >
                          {status === 'locked' ? (
                            <Lock className="w-4 h-4 text-white/40 flex-shrink-0" />
                          ) : status === 'completed' ? (
                            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <Circle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm truncate">{lesson.title}</div>
                            <div className="text-white/40 text-xs">{lesson.duration} minutes</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
