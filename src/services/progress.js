/**
 * Progress Service
 * Handles course/lesson progress persistence via backend API with localStorage fallback.
 */
import apiClient from './apiClient';

// ─── types ─────────────────────────────────────────────────────────────────────
// CompletedLesson: { userId, lessonId, courseId, completedAt }

// ─── helpers ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'lesson_progress';

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── API calls (with localStorage fallback) ────────────────────────────────────

/**
 * Fetch completed lesson IDs for a user in a course.
 * @param {number} userId
 * @param {number} courseId
 * @returns {Promise<number[]>} array of completed lesson IDs
 */
export async function getCourseProgress(userId, courseId) {
  try {
    const res = await apiClient.get(`/api/progress/${userId}/course/${courseId}`);
    const completedIds = res.data?.completedLessons ?? res.data ?? [];
    // Sync to localStorage
    const local = loadLocal().filter(
      (r) => !(r.userId === userId && r.courseId === courseId)
    );
    completedIds.forEach((lessonId) => {
      local.push({ userId, courseId, lessonId, completedAt: new Date().toISOString() });
    });
    saveLocal(local);
    return completedIds.map(Number);
  } catch {
    // Fallback: read from localStorage
    const local = loadLocal();
    return local
      .filter((r) => r.userId === userId && r.courseId === courseId)
      .map((r) => r.lessonId);
  }
}

/**
 * Mark a specific lesson as complete.
 * @param {number} userId
 * @param {number} courseId
 * @param {number} lessonId
 */
export async function markLessonComplete(userId, courseId, lessonId) {
  // Optimistically update localStorage
  const local = loadLocal();
  const exists = local.some(
    (r) => r.userId === userId && r.courseId === courseId && r.lessonId === lessonId
  );
  if (!exists) {
    local.push({ userId, courseId, lessonId, completedAt: new Date().toISOString() });
    saveLocal(local);
  }

  try {
    await apiClient.post(`/api/progress/${userId}/lesson/${lessonId}/complete`, {
      courseId,
    });
  } catch {
    // Already saved locally — will sync on next load
  }
}

/**
 * Check if a specific lesson is complete (local only, fast).
 */
export function isLessonCompleteLocal(userId, courseId, lessonId) {
  const local = loadLocal();
  return local.some(
    (r) =>
      r.userId === userId &&
      r.courseId === courseId &&
      r.lessonId === Number(lessonId)
  );
}

/**
 * Calculate the overall progress percentage for a course.
 * @param {number[]} completedIds
 * @param {number} totalLessons
 * @returns {number} 0–100
 */
export function calcProgressPercent(completedIds, totalLessons) {
  if (!totalLessons) return 0;
  return Math.round((completedIds.length / totalLessons) * 100);
}
