'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ModuleQuizComponent } from '@/components/tutorial/module-quiz';
import { TutorialSidebar } from '@/components/tutorial/tutorial-sidebar';
import { getModuleById } from '@/lib/tutorial/utils/queries';
import { areAllModuleLessonsCompleted } from '@/lib/tutorial-progress';
import { Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ModuleQuizPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  
  const [module, setModule] = React.useState<ReturnType<typeof getModuleById>>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLocked, setIsLocked] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const foundModule = getModuleById(moduleId);
    setModule(foundModule || null);

    if (foundModule) {
      // Check if all lessons are completed
      const lessonIds = foundModule.lessons.map((l) => l.id);
      const allCompleted = areAllModuleLessonsCompleted(lessonIds);
      setIsLocked(!allCompleted);
    }

    setIsLoading(false);
  }, [moduleId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-gray-400">Preparing quiz</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center">
        <Card className="bg-purple-950/30 border border-purple-700/30 rounded-xl p-6 max-w-md">
          <CardHeader>
            <CardTitle className="text-white text-xl mb-2">Module Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              The module you're looking for doesn't exist.
            </p>
            <Button
              onClick={() => router.push('/learn')}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Back to Tutorials
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!module.quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center">
        <Card className="bg-purple-950/30 border border-purple-700/30 rounded-xl p-6 max-w-md">
          <CardHeader>
            <CardTitle className="text-white text-xl mb-2">Quiz Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              This module doesn't have a quiz yet.
            </p>
            <Button
              onClick={() => router.push('/learn')}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Back to Tutorials
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLocked) {
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
              <TutorialSidebar />
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black/50 z-30"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Main Content */}
            <div>
              <Card className="bg-purple-950/30 border border-purple-700/30 rounded-xl p-8 max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-purple-900/50 border-4 border-purple-600 flex items-center justify-center">
                  <Lock className="h-10 w-10 text-purple-400" />
                </div>
              </div>
              <CardTitle className="text-white text-2xl mb-2">Quiz Locked</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-200 font-semibold mb-1">Complete All Lessons First</p>
                    <p className="text-yellow-200/80 text-sm">
                      You need to complete all lessons in the <strong>{module.title}</strong> module before you can take the quiz.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-white font-medium">Module Lessons:</p>
                <ul className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id} className="text-gray-300 text-sm flex items-center gap-2">
                      <span className="text-purple-400">•</span>
                      <Link
                        href={`/learn?lesson=${lesson.id}`}
                        className="hover:text-purple-300 underline"
                      >
                        {lesson.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => router.push('/learn')}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Back to Tutorials
                </Button>
                {module.lessons.length > 0 && (
                  <Button
                    onClick={() => router.push(`/learn?lesson=${module.lessons[0].id}`)}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-white/10"
                  >
                    Start Module
                  </Button>
                )}
              </div>
            </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      {/* Top Navigation */}
      <div className="border-b border-white/10 bg-purple-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-bold text-lg">{module.title} - Quiz</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push('/learn')}
                className="text-white/80 hover:text-white"
              >
                Back to Tutorials
              </Button>
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
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <div
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 lg:w-auto transition-transform duration-300 ease-in-out`}
          >
            <TutorialSidebar />
          </div>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div>
            <ModuleQuizComponent
              quiz={module.quiz}
              moduleTitle={module.title}
              onComplete={() => {
                // Optionally navigate to next module or back to tutorials
                router.push('/learn');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
