import { useState, useEffect, useCallback } from 'react';
import {
  getLessonProgressStatus,
  trackVideoProgress,
  getLocalProgress,
  getRemainingTimeToUnlock,
} from '../services/videoProgressTracker';

/**
 * Custom hook for tracking video progress and quiz unlock status
 * @param {number} lessonId - Lesson ID
 * @param {number} userId - User ID
 * @returns {Object} Video progress state and helpers
 */
export function useVideoProgress(lessonId, userId) {
  const [progress, setProgress] = useState({
    percentage: 0,
    currentTime: 0,
    duration: 0,
    isUnlocked: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial progress from backend
  useEffect(() => {
    if (!lessonId || !userId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        const status = await getLessonProgressStatus(lessonId, userId);
        setProgress({
          percentage: status.percentage,
          currentTime: status.currentTime,
          duration: status.duration,
          isUnlocked: status.isUnlocked,
          lastUpdated: status.lastUpdated,
        });
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError(err.message);
        // Set default progress (not unlocked)
        setProgress({
          percentage: 0,
          currentTime: 0,
          duration: 0,
          isUnlocked: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [lessonId, userId]);

  // Track video progress during playback
  const handleProgressUpdate = useCallback(
    async (progressPercent, currentTime = 0, duration = 0) => {
      if (!lessonId || !userId) return;

      try {
        // Update local state immediately for responsive UI
        const localProgress = getLocalProgress(currentTime, duration);
        setProgress((prev) => ({
          ...prev,
          percentage: localProgress.percentage || progressPercent,
          currentTime,
          duration,
          isUnlocked: localProgress.isUnlocked,
        }));

        // Save to backend asynchronously
        const result = await trackVideoProgress(lessonId, userId, currentTime, duration);
        
        // Update state with backend result
        setProgress((prev) => ({
          ...prev,
          percentage: result.percentage,
          isUnlocked: result.isUnlocked,
          currentTime: result.currentTime,
          duration: result.duration,
        }));
      } catch (err) {
        console.error('Error updating progress:', err);
        setError(err.message);
      }
    },
    [lessonId, userId]
  );

  // Get remaining time info for UI display
  const getRemainingInfo = useCallback(() => {
    if (progress.duration === 0) {
      return {
        percentageRemaining: 90,
        currentPercentage: 0,
        unlockThreshold: 90,
        isUnlocked: false,
        message: 'Start watching to unlock quiz',
      };
    }
    return getRemainingTimeToUnlock(progress.currentTime, progress.duration);
  }, [progress.currentTime, progress.duration]);

  // Reset progress (for testing or fresh start)
  const resetProgress = useCallback(() => {
    setProgress({
      percentage: 0,
      currentTime: 0,
      duration: 0,
      isUnlocked: false,
    });
    setError(null);
  }, []);

  return {
    // State
    progress,
    percentage: progress.percentage,
    isUnlocked: progress.isUnlocked,
    loading,
    error,
    
    // Methods
    handleProgressUpdate,
    getRemainingInfo,
    resetProgress,
    
    // Utils
    currentTime: progress.currentTime,
    duration: progress.duration,
    lastUpdated: progress.lastUpdated,
  };
}
