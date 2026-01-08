// Tutorial progress tracking with localStorage
// Designed to be easily migrated to backend API later

export interface TutorialProgress {
  completedLessons: string[]; // Array of lesson IDs
  currentLesson: string | null; // Current lesson ID
  quizScores: Record<string, number>; // lessonId -> score (0-100)
  challengeCompleted: Record<string, boolean>; // challengeId -> completed
  lastUpdated: number; // Timestamp
}

const STORAGE_KEY = 'ffmpeg_tutorial_progress';

// Initialize default progress
function getDefaultProgress(): TutorialProgress {
  return {
    completedLessons: [],
    currentLesson: null,
    quizScores: {},
    challengeCompleted: {},
    lastUpdated: Date.now()
  };
}

// Get progress from localStorage
export function getProgress(): TutorialProgress {
  if (typeof window === 'undefined') {
    return getDefaultProgress();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const progress = JSON.parse(stored) as TutorialProgress;
      // Ensure all required fields exist
      return {
        completedLessons: progress.completedLessons || [],
        currentLesson: progress.currentLesson || null,
        quizScores: progress.quizScores || {},
        challengeCompleted: progress.challengeCompleted || {},
        lastUpdated: progress.lastUpdated || Date.now()
      };
    }
  } catch (error) {
    console.error('Error reading progress from localStorage:', error);
  }

  return getDefaultProgress();
}

// Save progress to localStorage
export function saveProgress(progress: TutorialProgress): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const updated = {
      ...progress,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
  }
}

// Update progress (merge with existing)
export function updateProgress(updates: Partial<TutorialProgress>): TutorialProgress {
  const current = getProgress();
  const updated = {
    ...current,
    ...updates,
    lastUpdated: Date.now()
  };
  saveProgress(updated);
  return updated;
}

// Mark a lesson as completed
export function completeLesson(lessonId: string): TutorialProgress {
  const progress = getProgress();
  
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
  }
  
  // Set next lesson as current if not already set
  if (progress.currentLesson === lessonId) {
    progress.currentLesson = null; // Will be set by navigation logic
  }
  
  return updateProgress(progress);
}

// Set current lesson
export function setCurrentLesson(lessonId: string | null): TutorialProgress {
  return updateProgress({ currentLesson: lessonId });
}

// Record quiz score
export function recordQuizScore(lessonId: string, score: number): TutorialProgress {
  const progress = getProgress();
  progress.quizScores[lessonId] = score;
  return updateProgress(progress);
}

// Mark challenge as completed
export function completeChallenge(challengeId: string): TutorialProgress {
  const progress = getProgress();
  progress.challengeCompleted[challengeId] = true;
  return updateProgress(progress);
}

// Check if lesson is completed
export function isLessonCompleted(lessonId: string): boolean {
  const progress = getProgress();
  return progress.completedLessons.includes(lessonId);
}

// Check if lesson is unlocked (prerequisites met)
export function isLessonUnlocked(lessonId: string, unlockAfter?: string): boolean {
  if (!unlockAfter) {
    return true; // First lesson or no prerequisites
  }
  
  return isLessonCompleted(unlockAfter);
}

// Calculate overall progress percentage
export function getOverallProgress(totalLessons: number): number {
  const progress = getProgress();
  if (totalLessons === 0) return 0;
  
  const completed = progress.completedLessons.length;
  return Math.round((completed / totalLessons) * 100);
}

// Reset all progress
export function resetProgress(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting progress:', error);
  }
}

// Future: Migrate to backend API
// export async function syncProgressToBackend(): Promise<void> {
//   const progress = getProgress();
//   // API call to save progress
//   await fetch('/api/tutorial/progress', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(progress)
//   });
// }
