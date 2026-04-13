/**
 * Enhanced video progress tracking service for quiz unlock system
 * Tracks lesson video progress and determines quiz unlock eligibility
 */

import { saveVideoProgress, getVideoProgress } from './videoProgress';

/**
 * Calculate progress percentage from current time and duration
 * @param {number} currentTime - Current playback time in seconds
 * @param {number} duration - Total video duration in seconds
 * @returns {number} Progress percentage (0-100)
 */
export function calculateProgressPercentage(currentTime, duration) {
  if (!duration || duration === 0) return 0;
  return Math.min(100, Math.round((currentTime / duration) * 100));
}

/**
 * Check if a lesson quiz is unlocked based on video progress
 * @param {number} progress - Video progress percentage
 * @returns {boolean} True if progress >= 90%
 */
export function isQuizUnlocked(progress) {
  return progress >= 90;
}

/**
 * Get lesson video progress status
 * @param {number} lessonId - Lesson ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Progress status with percentage and unlock status
 */
export async function getLessonProgressStatus(lessonId, userId) {
  try {
    const progressData = await getVideoProgress(lessonId, userId);
    const percentage = progressData.progress_percentage || 0;
    
    return {
      lessonId,
      userId,
      percentage,
      currentTime: progressData.current_time || 0,
      duration: progressData.duration || 0,
      isUnlocked: isQuizUnlocked(percentage),
      lastUpdated: progressData.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting lesson progress status:', error);
    return {
      lessonId,
      userId,
      percentage: 0,
      currentTime: 0,
      duration: 0,
      isUnlocked: false,
      error: error.message,
    };
  }
}

/**
 * Track video progress and return unlock eligibility
 * @param {number} lessonId - Lesson ID
 * @param {number} userId - User ID
 * @param {number} currentTime - Current playback time in seconds
 * @param {number} duration - Total video duration in seconds
 * @returns {Promise<Object>} Updated progress with unlock status
 */
export async function trackVideoProgress(lessonId, userId, currentTime, duration) {
  try {
    const saveResult = await saveVideoProgress(lessonId, userId, currentTime, duration);
    const percentage = calculateProgressPercentage(currentTime, duration);
    
    return {
      lessonId,
      userId,
      percentage,
      currentTime,
      duration,
      isUnlocked: isQuizUnlocked(percentage),
      savedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error tracking video progress:', error);
    
    // Fallback to local calculation if API fails
    const percentage = calculateProgressPercentage(currentTime, duration);
    return {
      lessonId,
      userId,
      percentage,
      currentTime,
      duration,
      isUnlocked: isQuizUnlocked(percentage),
      offline: true,
    };
  }
}

/**
 * Get local video progress from state (for immediate UI updates)
 * Used during playback to avoid API call latency
 * @param {number} currentTime - Current playback time
 * @param {number} duration - Total duration
 * @returns {Object} Progress object
 */
export function getLocalProgress(currentTime, duration) {
  const percentage = calculateProgressPercentage(currentTime, duration);
  return {
    percentage,
    isUnlocked: isQuizUnlocked(percentage),
    currentTime,
    duration,
  };
}

/**
 * Get remaining time needed to unlock quiz
 * @param {number} currentTime - Current playback time
 * @param {number} duration - Total duration
 * @returns {Object} Time needed info
 */
export function getRemainingTimeToUnlock(currentTime, duration) {
  if (!duration) return { seconds: 0, percentage: 0, message: 'Unknown duration' };
  
  const requiredTime = (duration * 90) / 100;
  const remaining = Math.max(0, requiredTime - currentTime);
  const currentPercent = calculateProgressPercentage(currentTime, duration);
  
  return {
    secondsRemaining: Math.ceil(remaining),
    percentageRemaining: Math.max(0, 90 - currentPercent),
    currentPercentage: currentPercent,
    unlockThreshold: 90,
    isUnlocked: isQuizUnlocked(currentPercent),
    message: isQuizUnlocked(currentPercent)
      ? 'Quiz unlocked! ✅'
      : `Watch ${90 - currentPercent}% more to unlock quiz`,
  };
}
