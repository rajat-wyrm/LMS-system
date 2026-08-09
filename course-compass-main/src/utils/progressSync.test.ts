import { describe, expect, it, beforeEach } from "vitest";
import {
  getSyncQueue,
  saveSyncQueue,
  clearSyncQueue,
  mergeLocalAndServerEnrollment,
  ProgressQueue,
} from "./progressSync";

describe("progressSync utility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("gets empty queue by default", () => {
    const queue = getSyncQueue("course-1");
    expect(queue).toEqual({ completedLessonIds: [], playbackPositions: {} });
  });

  it("saves and clears queue correctly", () => {
    const testQueue: ProgressQueue = {
      completedLessonIds: ["lesson-1"],
      lastWatchedLessonId: "lesson-1",
      playbackPositions: { "lesson-1": 15 },
    };
    saveSyncQueue("course-1", testQueue);
    expect(getSyncQueue("course-1")).toEqual(testQueue);

    clearSyncQueue("course-1");
    expect(getSyncQueue("course-1")).toEqual({ completedLessonIds: [], playbackPositions: {} });
  });

  it("merges local queue into server enrollment correctly", () => {
    const serverEnrollment = {
      id: "enr-1",
      progress: 33,
      completedLessons: [{ id: "lesson-1" }],
      playbackPositions: { "lesson-1": 5 },
      lastWatchedLessonId: "lesson-1",
    };

    const localQueue: ProgressQueue = {
      completedLessonIds: ["lesson-2"],
      lastWatchedLessonId: "lesson-2",
      playbackPositions: { "lesson-1": 10, "lesson-2": 45 },
    };

    const merged = mergeLocalAndServerEnrollment(serverEnrollment, localQueue, 3);
    
    expect(merged.progress).toBe(67);
    expect(merged.completedLessons).toEqual([{ id: "lesson-1" }, { id: "lesson-2" }]);
    expect(merged.lastWatchedLessonId).toBe("lesson-2");
    expect(merged.playbackPositions).toEqual({ "lesson-1": 10, "lesson-2": 45 });
  });
});
