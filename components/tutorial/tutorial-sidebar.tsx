'use client';

import * as React from 'react';
import { CheckCircle, Lock, Circle, ChevronDown, ChevronRight, Trophy, HelpCircle } from 'lucide-react';
import { lessons, getModules, getLessonsByModule } from '@/lib/tutorial';
import { modules } from '@/lib/tutorial/data';
import { getProgress, isLessonCompleted, isLessonUnlocked, TutorialProgress, areAllModuleLessonsCompleted, getModuleQuizScore, isModuleQuizCompleted } from '@/lib/tutorial-progress';
import { getOverallProgress } from '@/lib/tutorial-progress';
import { getModuleById } from '@/lib/tutorial/utils/queries';
import Link from 'next/link';

interface TutorialSidebarProps {
  currentLessonId?: string;
}

export function TutorialSidebar({ currentLessonId }: TutorialSidebarProps) {
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(new Set(['Fundamentals']));
  // Initialize with default to match server render (no localStorage access during SSR)
  const [progress, setProgress] = React.useState<TutorialProgress | null>(null);
  const [overallProgress, setOverallProgress] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);

  // Only read from localStorage after component mounts (client-side only)
  React.useEffect(() => {
    setIsMounted(true);
    const loadProgress = () => {
      const currentProgress = getProgress();
      const calculatedProgress = getOverallProgress(lessons.length);
      setProgress(currentProgress);
      setOverallProgress(calculatedProgress);
    };
    
    // Load immediately
    loadProgress();
    
    // Update progress periodically
    const interval = setInterval(loadProgress, 1000);
    return () => clearInterval(interval);
  }, []);

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
    // Only check status after component has mounted (to avoid hydration mismatch)
    if (!isMounted) {
      // Return default status during SSR/initial render
      if (currentLessonId === lessonId) {
        return 'current';
      }
      return unlockAfter ? 'locked' : 'available';
    }
    
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
          {modules.map((moduleObj) => {
            const moduleLessons = getLessonsByModule(moduleObj.title);
            const isExpanded = expandedModules.has(moduleObj.title);
            // Only calculate completed count after mount to avoid hydration mismatch
            const completedCount = isMounted 
              ? moduleLessons.filter(l => isLessonCompleted(l.id)).length 
              : 0;
            const progressText = `${completedCount}/${moduleLessons.length}`;

            return (
              <div key={moduleObj.id}>
                <button
                  onClick={() => toggleModule(moduleObj.title)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-purple-900/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-purple-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-purple-400" />
                    )}
                    <span className="text-white">{moduleObj.title}</span>
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
                    
                    {/* Module Quiz */}
                    {(() => {
                      if (!moduleObj.quiz) return null;
                      
                      const lessonIds = moduleObj.lessons.map((l) => l.id);
                      const allLessonsCompleted = isMounted && areAllModuleLessonsCompleted(lessonIds);
                      const quizScore = isMounted ? getModuleQuizScore(moduleObj.id) : null;
                      const quizPassed = quizScore && isModuleQuizCompleted(moduleObj.id, moduleObj.quiz.passingScore);
                      const isPerfect = quizScore?.score === 100;
                      const isQuizCurrent = typeof window !== 'undefined' && window.location.pathname.includes(`/learn/${moduleObj.id}/quiz`);
                      
                      return (
                        <>
                          <div className="my-2 border-t border-purple-700/30"></div>
                          <Link
                            href={`/learn/${moduleObj.id}/quiz`}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left ${
                              isQuizCurrent
                                ? "bg-purple-700/30 border border-purple-500/50"
                                : !allLessonsCompleted
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-purple-900/30"
                            }`}
                            onClick={(e) => {
                              if (!allLessonsCompleted) {
                                e.preventDefault();
                              }
                            }}
                          >
                            {!allLessonsCompleted ? (
                              <Lock className="w-4 h-4 text-white/40 flex-shrink-0" />
                            ) : quizPassed ? (
                              isPerfect ? (
                                <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              )
                            ) : (
                              <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm truncate">Module Quiz</div>
                              <div className="text-white/40 text-xs">
                                {quizScore 
                                  ? `${quizScore.score}%${quizScore.bestScore !== quizScore.score ? ` (Best: ${quizScore.bestScore}%)` : ''}`
                                  : `${moduleObj.quiz.questions.length} questions`
                                }
                              </div>
                            </div>
                            {quizPassed && (
                              <div className="flex-shrink-0">
                                <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  isPerfect
                                    ? 'bg-yellow-500/20 text-yellow-300'
                                    : 'bg-green-500/20 text-green-300'
                                }`}>
                                  {isPerfect ? 'Perfect' : 'Passed'}
                                </div>
                              </div>
                            )}
                          </Link>
                        </>
                      );
                    })()}
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
