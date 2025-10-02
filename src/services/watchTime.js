// Watch Time Tracking Service
const WATCH_TIME_KEY = 'lesson_watch_times';
const PROGRESS_KEY = 'course_progress';

// Get watch times for a user
export function getUserWatchTimes(userId) {
  try {
    const data = localStorage.getItem(WATCH_TIME_KEY);
    if (!data) return {};
    
    const allWatchTimes = JSON.parse(data);
    return allWatchTimes[userId] || {};
  } catch (error) {
    console.error('Error getting watch times:', error);
    return {};
  }
}

// Save watch time for a specific lesson
export function saveWatchTime(userId, lessonId, watchedMinutes) {
  try {
    const data = localStorage.getItem(WATCH_TIME_KEY);
    const allWatchTimes = data ? JSON.parse(data) : {};
    
    if (!allWatchTimes[userId]) {
      allWatchTimes[userId] = {};
    }
    
    // Update watch time (keep the maximum time watched)
    allWatchTimes[userId][lessonId] = Math.max(
      allWatchTimes[userId][lessonId] || 0,
      watchedMinutes
    );
    
    localStorage.setItem(WATCH_TIME_KEY, JSON.stringify(allWatchTimes));
    
    console.warn(`💾 Saved watch time: User ${userId}, Lesson ${lessonId}, ${watchedMinutes} minutes`);
    return allWatchTimes[userId][lessonId];
  } catch (error) {
    console.error('Error saving watch time:', error);
    return 0;
  }
}

// Get course progress based on watch times
export function getCourseProgress(userId, courseId, lessons) {
  try {
    const watchTimes = getUserWatchTimes(userId);
    
    let totalDuration = 0;
    let totalWatched = 0;
    
    lessons.forEach(lesson => {
      const duration = parseInt(lesson.duration) || 0;
      const watched = watchTimes[lesson.id] || 0;
      
      totalDuration += duration;
      totalWatched += Math.min(watched, duration); // Don't count over-watched time
    });
    
    const progress = totalDuration > 0 ? Math.round((totalWatched / totalDuration) * 100) : 0;
    
    // Save course progress
    saveCourseProgress(userId, courseId, progress);
    
    return {
      totalDuration,
      totalWatched,
      progress
    };
  } catch (error) {
    console.error('Error calculating course progress:', error);
    return { totalDuration: 0, totalWatched: 0, progress: 0 };
  }
}

// Save course progress
export function saveCourseProgress(userId, courseId, progress) {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    const allProgress = data ? JSON.parse(data) : {};
    
    if (!allProgress[userId]) {
      allProgress[userId] = {};
    }
    
    allProgress[userId][courseId] = progress;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
    
    console.warn(`📊 Saved course progress: User ${userId}, Course ${courseId}, ${progress}%`);
  } catch (error) {
    console.error('Error saving course progress:', error);
  }
}

// Get saved course progress
export function getSavedCourseProgress(userId, courseId) {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (!data) return 0;
    
    const allProgress = JSON.parse(data);
    return allProgress[userId]?.[courseId] || 0;
  } catch (error) {
    console.error('Error getting saved course progress:', error);
    return 0;
  }
}

// Convert progress percentage to watch time format
export function progressToWatchTime(progress, totalDuration) {
  return Math.floor((progress / 100) * totalDuration);
}

// Convert video progress (0-100) to minutes watched based on video duration
export function videoProgressToMinutes(progressPercent, videoDurationMinutes) {
  return Math.floor((progressPercent / 100) * videoDurationMinutes);
}