/**
 * Course Progression Service
 * Manages course progression: lessons → final test → certificate
 * Tracks completion status and unlocking of course components
 */

import { getCourseProgress } from './progress';
import { getFinalTestStatus } from './quiz';
import { getCertificateByCourseid } from './certificates';

/**
 * Get course completion status overview
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @param {number} totalLessons - Total number of lessons in course
 * @returns {Promise<Object>} Course status with all unlocking conditions
 */
export async function getCourseCompletionStatus(userId, courseId, totalLessons) {
  try {
    // Get lessons completed
    const progress = await getCourseProgress(userId, courseId);
    const lessonsCompleted = progress?.completed || 0;
    const allLessonsCompleted = lessonsCompleted === totalLessons && totalLessons > 0;

    // Get final test status
    const finalTestStatus = getFinalTestStatus(userId, courseId);
    const finalTestCompleted = finalTestStatus?.completed || false;
    const finalTestPassed = finalTestStatus?.passed || false;

    // Get certificate
    const certificate = getCertificateByCourseid(userId, courseId);
    const certificateGenerated = !!certificate;

    return {
      userId,
      courseId,
      lessonsCompleted,
      totalLessons,
      allLessonsCompleted,
      lessonProgressPercent: totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0,
      
      // Final test status
      finalTestEnabled: allLessonsCompleted,
      finalTestCompleted,
      finalTestPassed,
      finalTestScore: finalTestStatus?.score || 0,
      finalTestPercentage: finalTestStatus?.percentage || 0,
      
      // Certificate status
      certificateEnabled: finalTestPassed,
      certificateGenerated,
      certificateId: certificate?.id,
      
      // Overall course status
      courseStatus: getCourseStatus(allLessonsCompleted, finalTestPassed, certificateGenerated),
      courseProgressPercent: calculateCourseProgress(
        allLessonsCompleted,
        finalTestPassed,
        certificateGenerated
      ),
    };
  } catch (error) {
    console.error('Error getting course completion status:', error);
    return {
      userId,
      courseId,
      lessonsCompleted: 0,
      totalLessons,
      allLessonsCompleted: false,
      lessonProgressPercent: 0,
      finalTestEnabled: false,
      finalTestCompleted: false,
      finalTestPassed: false,
      finalTestScore: 0,
      finalTestPercentage: 0,
      certificateEnabled: false,
      certificateGenerated: false,
      courseStatus: 'not_started',
      courseProgressPercent: 0,
      error: error.message,
    };
  }
}

/**
 * Determine course status based on completion states
 * @param {boolean} allLessonsCompleted
 * @param {boolean} finalTestPassed
 * @param {boolean} certificateGenerated
 * @returns {string} Status: 'not_started', 'in_progress', 'lessons_completed', 'test_completed', 'completed'
 */
function getCourseStatus(allLessonsCompleted, finalTestPassed, certificateGenerated) {
  if (certificateGenerated) return 'completed';
  if (finalTestPassed) return 'test_completed';
  if (allLessonsCompleted) return 'lessons_completed';
  return 'in_progress';
}

/**
 * Calculate overall course progress percentage
 * Progress breakdown:
 * - 0-50%: Lessons progress
 * - 50-90%: Final test
 * - 90-100%: Certificate generation
 *
 * @param {boolean} allLessonsCompleted
 * @param {boolean} finalTestPassed
 * @param {boolean} certificateGenerated
 * @returns {number} Overall progress 0-100
 */
function calculateCourseProgress(allLessonsCompleted, finalTestPassed, certificateGenerated) {
  if (certificateGenerated) return 100;
  if (finalTestPassed) return 90;
  if (allLessonsCompleted) return 50;
  return 0;
}

/**
 * Check if final test is unlocked
 * Final test unlocks when all lessons are completed
 * @param {number} lessonsCompleted
 * @param {number} totalLessons
 * @returns {boolean} True if final test should be available
 */
export function isFinalTestUnlocked(lessonsCompleted, totalLessons) {
  return lessonsCompleted === totalLessons && totalLessons > 0;
}

/**
 * Check if certificate is unlocked
 * Certificate unlocks after final test is passed (>= 70%)
 * @param {boolean} finalTestPassed
 * @returns {boolean} True if certificate should be available
 */
export function isCertificateUnlocked(finalTestPassed) {
  return finalTestPassed;
}

/**
 * Get course completion milestone information
 * Useful for UI to show progress and next steps
 * @param {Object} status - Status from getCourseCompletionStatus
 * @returns {Object} Milestone info
 */
export function getCourseMilestones(status) {
  const milestones = [];

  // Lessons milestone
  milestones.push({
    name: 'Complete All Lessons',
    completed: status.allLessonsCompleted,
    progress: `${status.lessonsCompleted}/${status.totalLessons}`,
    percentage: status.lessonProgressPercent,
    description: 'Watch and complete quiz for each lesson',
    order: 1,
  });

  // Final test milestone
  milestones.push({
    name: 'Pass Final Test (≥70%)',
    completed: status.finalTestPassed,
    unlocked: status.finalTestEnabled,
    progress: status.finalTestCompleted ? `${status.finalTestPercentage}%` : 'Locked',
    percentage: status.finalTestPercentage,
    description: 'Complete comprehensive assessment to test your knowledge',
    order: 2,
  });

  // Certificate milestone
  milestones.push({
    name: 'Generate Certificate',
    completed: status.certificateGenerated,
    unlocked: status.certificateEnabled,
    progress: status.certificateGenerated ? 'Ready' : 'Locked',
    percentage: status.certificateGenerated ? 100 : 0,
    description: 'Earn and download your course completion certificate',
    order: 3,
  });

  return milestones;
}

/**
 * Get next action for student based on course status
 * @param {Object} status - Status from getCourseCompletionStatus
 * @returns {Object} Next action info
 */
export function getNextAction(status) {
  if (!status.allLessonsCompleted) {
    return {
      action: 'complete_lessons',
      message: `Complete ${status.totalLessons - status.lessonsCompleted} more lessons to unlock the final test`,
      buttonText: 'Continue Learning',
      buttonVariant: 'primary',
      progress: `${status.lessonsCompleted}/${status.totalLessons} lessons done`,
    };
  }

  if (!status.finalTestPassed) {
    return {
      action: 'start_final_test',
      message: status.finalTestCompleted
        ? `Your score was ${status.finalTestPercentage}%. Try again to reach 70% or higher.`
        : 'All lessons completed! Take the final test to unlock your certificate.',
      buttonText: status.finalTestCompleted ? 'Retake Final Test' : 'Start Final Test',
      buttonVariant: 'warning',
      progress: 'Ready for final test',
    };
  }

  if (!status.certificateGenerated) {
    return {
      action: 'generate_certificate',
      message: `Congratulations! You passed with ${status.finalTestPercentage}%. Generate your certificate now.`,
      buttonText: 'Generate Certificate',
      buttonVariant: 'success',
      progress: 'Certificate available',
    };
  }

  return {
    action: 'course_complete',
    message: 'Course completed! You can download your certificate or explore other courses.',
    buttonText: 'Download Certificate',
    buttonVariant: 'success',
    progress: 'Course Complete ✓',
  };
}

/**
 * Format course status for display
 * @param {string} status - Status from getCourseStatus
 * @returns {Object} Display info
 */
export function formatCourseStatusDisplay(status) {
  const statusMap = {
    not_started: {
      label: 'Not Started',
      color: 'secondary',
      icon: 'circle',
    },
    in_progress: {
      label: 'In Progress',
      color: 'primary',
      icon: 'hourglass-split',
    },
    lessons_completed: {
      label: 'Lessons Complete',
      color: 'info',
      icon: 'check-circle',
    },
    test_completed: {
      label: 'Test Complete',
      color: 'warning',
      icon: 'star-fill',
    },
    completed: {
      label: 'Completed',
      color: 'success',
      icon: 'award-fill',
    },
  };

  return statusMap[status] || statusMap.not_started;
}
