export interface ProgressQueue {
  completedLessonIds: string[];
  lastWatchedLessonId?: string;
  lastWatchedAt?: string;
  playbackPositions: Record<string, number>;
}

export function getSyncQueue(courseId: string): ProgressQueue {
  try {
    const q = localStorage.getItem(`lms_sync_queue_${courseId}`);
    return q ? JSON.parse(q) : { completedLessonIds: [], playbackPositions: {} };
  } catch {
    return { completedLessonIds: [], playbackPositions: {} };
  }
}

export function saveSyncQueue(courseId: string, queue: ProgressQueue): void {
  localStorage.setItem(`lms_sync_queue_${courseId}`, JSON.stringify(queue));
}

export function clearSyncQueue(courseId: string): void {
  localStorage.removeItem(`lms_sync_queue_${courseId}`);
}

export function mergeLocalAndServerEnrollment(
  enrollment: any,
  queue: ProgressQueue,
  totalLessonsCount: number
): any {
  if (!enrollment) return null;

  const merged = { ...enrollment };
  
  // Merge completed lessons
  const completedIds = new Set((merged.completedLessons || []).map((l: any) => l.id));
  const mergedCompletedLessons = [...(merged.completedLessons || [])];
  
  queue.completedLessonIds.forEach((lid: string) => {
    if (!completedIds.has(lid)) {
      mergedCompletedLessons.push({ id: lid });
      completedIds.add(lid);
    }
  });
  merged.completedLessons = mergedCompletedLessons;

  // Recalculate progress percentage
  if (totalLessonsCount > 0) {
    const progress = Math.round((mergedCompletedLessons.length / totalLessonsCount) * 100);
    merged.progress = progress > 100 ? 100 : progress;
  }

  // Merge last watched details
  if (queue.lastWatchedLessonId) {
    merged.lastWatchedLessonId = queue.lastWatchedLessonId;
  }

  // Merge playback positions (keep maximum position)
  const mergedPlayback = { ...(merged.playbackPositions || {}) };
  Object.entries(queue.playbackPositions || {}).forEach(([lid, pos]) => {
    mergedPlayback[lid] = Math.max(mergedPlayback[lid] || 0, pos);
  });
  merged.playbackPositions = mergedPlayback;

  return merged;
}
