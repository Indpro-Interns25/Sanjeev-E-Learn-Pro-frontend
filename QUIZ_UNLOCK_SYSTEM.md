# Global Quiz Unlock System - Implementation Guide

## Overview

A comprehensive quiz unlock system has been implemented that tracks video progress per lesson and enables the "Take Quiz" button only when students have watched 90% of the lesson video.

## ✅ What Was Implemented

### 1. **Video Progress Tracking Service** 
**File:** `src/services/videoProgressTracker.js`

Tracks lesson video progress and determines quiz unlock eligibility:
- `calculateProgressPercentage()` - Calculates progress from current time and duration
- `isQuizUnlocked()` - Checks if progress >= 90% (quiz unlock threshold)
- `getLessonProgressStatus()` - Fetches current progress status for a lesson
- `trackVideoProgress()` - Tracks video playback and returns unlock status
- `getRemainingTimeToUnlock()` - Shows how much more video needs to be watched

### 2. **Video Progress Hook**
**File:** `src/hooks/useVideoProgress.js`

React hook for managing video progress state:
- Fetches initial progress from backend
- Tracks real-time progress during playback
- Provides unlocked/locked state
- Includes progress percentage and remaining time calculations
- Fallback for offline scenarios

**Usage:**
```javascript
const videoProgress = useVideoProgress(lessonId, userId);
```

Returns:
```javascript
{
  progress: { percentage, currentTime, duration, isUnlocked },
  percentage, isUnlocked,
  loading, error,
  handleProgressUpdate(),
  getRemainingInfo(),
  resetProgress(),
}
```

### 3. **Quiz Unlock Button Component**
**File:** `src/components/QuizUnlockButton.jsx`

Visual button that shows lock state based on progress:

**Features:**
- 🔒 Locked state when progress < 90%
  - Button disabled (opacity 0.5, cursor not-allowed)
  - Lock icon displayed
  - Shows "Complete video to unlock quiz"
  - Displays progress bar with percentage
  - Shows remaining percentage needed

- 🔓 Unlocked state when progress >= 90%
  - Button enabled with success styling
  - Unlock icon with checkmark
  - Button text: "Take Quiz ✅"
  - Animated pulse effect
  - Shows success alert

**Props:**
```jsx
<QuizUnlockButton
  courseId={courseId}
  lessonId={lessonId}
  videoProgress={{ percentage, isUnlocked, currentTime, duration }}
  onQuizClick={callback}    // Optional
  loading={false}           // Optional
  disabled={false}          // Optional
  showProgressBar={true}    // Optional
/>
```

**Styles:** `src/styles/quiz-unlock-button.css`
- Responsive design
- Smooth animations
- Progress bar visualization
- Mobile-friendly

### 4. **Updated Lesson Player**
**File:** `src/routes/Student/LessonPlayer.jsx`

Integrated video progress tracking:
- Added `useVideoProgress` hook
- Updated VideoPlayer's `onProgress` callback to track progress
- Replaced old "Take Quiz" button with `QuizUnlockButton`
- Video progress saved both to new tracker and old service (backward compatible)
- Toast notifications for early quiz click attempts
- Navigation to lesson-specific quiz page when unlocked

### 5. **Lesson-Specific Quiz Page**
**File:** `src/routes/Student/LessonQuizPage.jsx`

New dedicated quiz page for lessons:

**Route:** `/student/courses/:courseId/lessons/:lessonId/quiz`

**Features:**
- Validates quiz unlock status before showing quiz
- Checks video progress (must be >= 90%)
- Redirects back to lesson if not unlocked
- Shows lesson title, course breadcrumb
- Displays video progress status
- Quiz with full question rendering
- Result page with score and analysis
- Retry and back-to-lesson navigation
- Responsive design

### 6. **Updated Routing**
**File:** `src/App.jsx`

Added new route:
```javascript
<Route
  path="/student/courses/:courseId/lessons/:lessonId/quiz"
  element={
    <ProtectedRoute>
      <RoleGuard roles={['student']}>
        <LessonQuizPage />
      </RoleGuard>
    </ProtectedRoute>
  }
/>
```

## 🔄 How It Works

### Video Progress Flow

1. **Student starts lesson:**
   - VideoPlayer loads
   - useVideoProgress hook fetches last progress from backend
   - Quiz button shows as locked

2. **During video playback:**
   - VideoPlayer's `onProgress` callback fires as video plays
   - Progress percentage is calculated from current time / duration
   - `handleProgressUpdate()` called from useVideoProgress hook
   - Progress saved to backend for persistence
   - Quiz button state updates in real-time

3. **At 90% progress:**
   - Quiz button automatically enables
   - Button styling changes to success
   - Toast notification optional
   - Student can click "Take Quiz ✅"

4. **Student clicks quiz button:**
   - Navigates to `/student/courses/:courseId/lessons/:lessonId/quiz`
   - LessonQuizPage validates progress >= 90%
   - If unlocked: Shows quiz
   - If locked: Shows alert and redirects to lesson (shouldn't happen)

5. **Quiz submission:**
   - Quiz results saved
   - Score calculated
   - Lesson marked as completed
   - Progress updated

6. **Persistence:**
   - Progress saved to backend
   - On return to lesson: Progress fetched and restored
   - Can resume video from last watched time

## 📊 Progress Threshold

- **Unlock Threshold:** 90% video completion
- **Progress saved every:** ~5% increments
- **Button state updates:** Real-time during playback
- **Backend sync:** Asynchronous (doesn't block UI)

## 🎨 UI/UX Features

### Progress Bar Display
```
Lesson Progress: 75%
████████░░ 75%
Watch 15% more to unlock quiz
```

### Locked Button State
```
🔒 Complete video to unlock quiz
[DISABLED BUTTON - opacity 0.5]
```

### Unlocked Button State
```
🔓 Take Quiz ✅
[GREEN BUTTON - success styling]
💫 Animated pulse effect
```

### Toast Notifications
- "Please complete this lesson to unlock the quiz. You're X% away!" (on early click)
- "Quiz is locked. Complete X% more of the lesson video." (on navigation)
- "Quiz submitted! Score: X%" (on completion)

## 🔌 API Integration

### Backend Endpoints Used

1. **Save Video Progress:**
   ```
   POST /api/video-progress
   {
     lecture_id, user_id, current_time, 
     duration, progress_percentage
   }
   ```

2. **Get Video Progress:**
   ```
   GET /api/video-progress/:lectureId/:userId
   ```

3. **Get Lesson Quiz:**
   ```
   GET /api/lessons/:lessonId/quiz
   ```

4. **Submit Quiz:**
   ```
   POST /api/lessons/:lessonId/quiz/submit
   ```

## 📁 Files Created/Modified

### New Files
- ✅ `src/services/videoProgressTracker.js` - Progress tracking logic
- ✅ `src/hooks/useVideoProgress.js` - Progress hook
- ✅ `src/components/QuizUnlockButton.jsx` - Unlock button component
- ✅ `src/routes/Student/LessonQuizPage.jsx` - Lesson quiz page
- ✅ `src/styles/quiz-unlock-button.css` - Button styles

### Modified Files
- ✅ `src/routes/Student/LessonPlayer.jsx` - Integrated progress tracking
- ✅ `src/App.jsx` - Added new route

## 🧪 Testing Checklist

- [ ] Load a lesson and verify quiz button is locked initially
- [ ] Play 50% of video - button still locked
- [ ] Play 90%+ of video - button enables
- [ ] Click button when locked - toast shows "Please complete..."
- [ ] Click button when unlocked - navigates to quiz page
- [ ] Complete quiz - results saved
- [ ] Revisit lesson - progress restored from backend
- [ ] Check responsive design on mobile
- [ ] Test on different video lengths (short, long)
- [ ] Verify animations and transitions smooth
- [ ] Test with slow network (progress saves asynchronously)

## 🚀 Deployment Notes

1. **Database Support Required:**
   - Needs video_progress table in backend
   - Tracks: lecture_id, user_id, current_time, duration, progress_percentage

2. **Backend APIs Must Exist:**
   - `/api/video-progress` (POST/GET)
   - `/api/lessons/:id/quiz`
   - `/api/lessons/:id/quiz/submit`

3. **Configuration:**
   - Quiz unlock threshold: 90% (configurable in `videoProgressTracker.js`)
   - Progress save interval: 5% (configurable)

4. **Backward Compatibility:**
   - Old "Take Quiz" button logic preserved
   - Quiz submission still works via existing flows
   - Progress saved to both old and new systems

## 📝 Code Examples

### Using the Hook
```javascript
import { useVideoProgress } from '../../hooks/useVideoProgress';

function MyComponent() {
  const videoProgress = useVideoProgress(lessonId, userId);

  return (
    <QuizUnlockButton
      courseId={courseId}
      lessonId={lessonId}
      videoProgress={videoProgress.progress}
    />
  );
}
```

### Custom Progress Display
```javascript
const info = videoProgress.getRemainingInfo();
console.log(info);
// {
//   percentageRemaining: 10,
//   currentPercentage: 80,
//   unlockThreshold: 90,
//   isUnlocked: false,
//   message: 'Watch 10% more to unlock quiz'
// }
```

## 🔐 Security Features

- Progress only accessible to logged-in users
- Student can only access their own progress
- Quiz locked behind role guard (student only)
- Protected by ProtectedRoute wrapper
- Backend validates quiz unlock status

## 📱 Responsive Design

- Works on desktop (lg, md, sm)
- Mobile optimized button sizing
- Touch-friendly progress bar
- Adaptive layout for lesson list
- Progress bar text sizing adjusts

## 🎯 Future Enhancements

Possible improvements:
- [ ] Add resume playback reminder
- [ ] Show estimated time to unlock
- [ ] Add congratulation confetti on unlock
- [ ] Track fastest time to 90%
- [ ] Add progress notifications/reminders
- [ ] Adaptive unlock threshold per course
- [ ] Video quality selection (affects duration)

---

**Status:** ✅ Complete and Ready for Testing
**Version:** 1.0.0
**Last Updated:** 2026-04-14
