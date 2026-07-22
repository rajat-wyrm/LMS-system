export const COURSE_SYNC_EVENT = 'lms-course-sync';

export function notifyCourseSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COURSE_SYNC_EVENT));
  }
}
