// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LMS CONFIGURATION & SETUP EXAMPLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * This file demonstrates how to set up and configure the LMS upgrade
 * with all components and services properly integrated.
 */

// ─── Step 1: Import Everything You Need ──────────────────────────────────────

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Components
import VideoPlayer from '@/components/VideoPlayer';
import LectureAccordionImproved from '@/components/LectureAccordionImproved';
import NotesPanel from '@/components/NotesPanel';
import BookmarksPanel from '@/components/BookmarksPanel';
import QuizComponent from '@/components/QuizComponent';
import StudentDashboard from '@/components/StudentDashboard';
import {
  CourseProgressBar,
  LectureProgressBar,
  DashboardProgressCard
} from '@/components/ProgressBarComponents';

// Services
import {
  saveVideoProgress,
  getVideoProgress,
  markLectureCompleted,
  getCourseProgress,
  getResumePoint
} from '@/services/videoProgress';
import {
  createBookmark,
  getLectureBookmarks,
  updateBookmark,
  deleteBookmark
} from '@/services/bookmarks';
import {
  createNote,
  getLectureNotes,
  updateNote,
  deleteNote
} from '@/services/notes';

// ─── Step 2: Configuration Constants ──────────────────────────────────────────

export const LMS_CONFIG = {
  // Video Configuration
  VIDEO: {
    AUTO_SAVE_INTERVAL: 15000, // 15 seconds
    MIN_WATCH_PERCENTAGE: 80, // 80% watched = completed
    PLAYBACK_SPEEDS: [0.5, 1, 1.25, 1.5, 2],
    DEFAULT_QUALITY: '720p'
  },

  // Progress Configuration
  PROGRESS: {
    TRACK_INTERVAL: 10000, // 10 seconds
    BATCH_SIZE: 50 // Max items to save at once
  },

  // Notes Configuration
  NOTES: {
    MAX_LENGTH: 2000,
    MAX_NOTES_PER_LECTURE: 100,
    EXPORT_FORMATS: ['text', 'pdf', 'json']
  },

  // Bookmarks Configuration
  BOOKMARKS: {
    MAX_BOOKMARKS_PER_LECTURE: 50,
    TIMESTAMP_PRECISION: 1 // 1 second
  },

  // Quiz Configuration
  QUIZ: {
    AUTO_SUBMIT_ON_TIMEOUT: true,
    SHOW_CORRECT_ANSWERS: true,
    SHOW_EXPLANATIONS: true,
    PASSING_SCORE: 70 // percent
  },

  // API Configuration
  API: {
    BASE_URL: 'http://localhost:3002/api',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3
  }
};

// ─── Step 3: Example - Enhanced Course Learning Page ───────────────────────────

export function CourseLearningPageExample() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [currentLectureId, setCurrentLectureId] = useState(null);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [courseProgress, setCourseProgress] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchCourseData();
  }, []);

  // Load video progress when lecture changes
  useEffect(() => {
    if (currentLectureId && user?.id) {
      loadVideoProgress();
      loadBookmarks();
    }
  }, [currentLectureId, user?.id]);

  // Auto-save video progress
  useEffect(() => {
    if (!currentLectureId || !user?.id || videoDuration === 0) return;

    const saveInterval = setInterval(async () => {
      try {
        await saveVideoProgress(
          currentLectureId,
          user.id,
          videoTime,
          videoDuration
        );
      } catch (err) {
        console.error('Error saving progress:', err);
      }
    }, LMS_CONFIG.VIDEO.AUTO_SAVE_INTERVAL);

    return () => clearInterval(saveInterval);
  }, [currentLectureId, user?.id, videoTime, videoDuration]);

  // Functions
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const courseId = new URLSearchParams(window.location.search).get('id');
      // const courseData = await getCourseCurriculum(courseId);
      // setCourse(courseData.course);
      // setLectures(courseData.curriculum);
      // setCurrentLectureId(courseData.curriculum[0]?.id);

      // Load course progress
      // const progress = await getCourseProgress(courseId, user.id);
      // setCourseProgress(progress);
    } catch (err) {
      setError('Failed to load course');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadVideoProgress = async () => {
    try {
      const progress = await getVideoProgress(currentLectureId, user.id);
      if (progress?.current_time > 0) {
        setVideoTime(progress.current_time);
      }
    } catch (err) {
      console.error('Error loading video progress:', err);
    }
  };

  const loadBookmarks = async () => {
    try {
      const fetchedBookmarks = await getLectureBookmarks(currentLectureId, user.id);
      setBookmarks(fetchedBookmarks || []);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
    }
  };

  const handleSelectLecture = async (lecture) => {
    setCurrentLectureId(lecture.id);
    // Auto-resume from last watched time
    if (lecture.resumeAt > 0) {
      setVideoTime(lecture.resumeAt);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await markLectureCompleted(currentLectureId, user.id);
      // Show toast
      console.log('Lecture marked as complete');
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  };

  const handleBookmarkJump = async (timestamp) => {
    setVideoTime(timestamp);
    // Video player will seek to this time
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p>Loading course...</p>
      </Container>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const currentLecture = lectures.find(l => l.id === currentLectureId);
  const currentVideo = currentLecture?.video_url || currentLecture?.videoUrl;

  return (
    <Container fluid className="py-4">
      <Row className="g-4">
        {/* Main Content - Video & Notes */}
        <Col lg={8}>
          {/* Progress Bar */}
          {courseProgress && (
            <Card className="mb-4">
              <Card.Body>
                <CourseProgressBar
                  completed={courseProgress.completed}
                  total={courseProgress.total}
                  showLabel={true}
                />
              </Card.Body>
            </Card>
          )}

          {/* Video Player */}
          {currentVideo && (
            <VideoPlayer
              videoUrl={currentVideo}
              title={currentLecture?.title}
              onProgress={(progress, total) => {
                const currentTime = (progress / 100) * total;
                setVideoTime(currentTime);
                setVideoDuration(total);
              }}
            />
          )}

          {/* Video Progress Bar */}
          {videoDuration > 0 && (
            <Card className="mt-4">
              <Card.Body>
                <LectureProgressBar
                  currentTime={videoTime}
                  duration={videoDuration}
                  onSeek={(time) => setVideoTime(time)}
                  showLabel={true}
                />
              </Card.Body>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="mt-4 d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={handleMarkComplete}
            >
              Mark as Completed
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/student/my-learning')}
            >
              Back to Dashboard
            </button>
          </div>

          {/* Bookmarks Panel */}
          {currentLectureId && (
            <div className="mt-4">
              <BookmarksPanel
                lectureId={currentLectureId}
                userId={user?.id}
                currentTimestamp={videoTime}
                bookmarks={bookmarks}
                onBookmarkClick={handleBookmarkJump}
                isEnrolled={true}
                onBookmarksChange={setBookmarks}
              />
            </div>
          )}

          {/* Notes Panel */}
          {currentLectureId && (
            <div className="mt-4">
              <NotesPanel
                lectureId={currentLectureId}
                userId={user?.id}
                currentTimestamp={videoTime}
                isEnrolled={true}
              />
            </div>
          )}
        </Col>

        {/* Sidebar - Lecture List */}
        <Col lg={4}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Course Content</h5>
            </Card.Header>
            <Card.Body>
              {lectures.length > 0 ? (
                <LectureAccordionImproved
                  lectures={lectures}
                  onSelectLecture={handleSelectLecture}
                  activeLectureId={currentLectureId}
                  completedLectureIds={courseProgress?.completedIds || []}
                  userId={user?.id}
                  lectureProgress={{}} // Load actual progress
                  isEnrolled={true}
                />
              ) : (
                <p className="text-muted">No lectures available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

// ─── Step 4: Example - Quiz After Module ──────────────────────────────────────

export function QuizPageExample() {
  const handleQuizSubmit = (result) => {
    console.log('Quiz Result:', result);
    // {
    //   quiz_id: 1,
    //   score: 85,
    //   correct_answers: 17,
    //   total_questions: 20,
    //   passed: true,
    //   answers: { question1: 0, question2: 1, ... }
    // }

    if (result.passed) {
      // Unlock next module
      // Navigate to next section
      // Show success message
    } else {
      // Show retry option
    }
  };

  const exampleQuestions = [
    {
      id: 1,
      question: 'What is React?',
      options: [
        { text: 'A JavaScript library for UI', is_correct: true },
        { text: 'A programming language', is_correct: false },
        { text: 'A CSS framework', is_correct: false },
        { text: 'A backend framework', is_correct: false }
      ],
      explanation: 'React is a JavaScript library maintained by Facebook...'
    },
    // More questions...
  ];

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <QuizComponent
            quizId={1}
            title="React Fundamentals Quiz"
            questions={exampleQuestions}
            timeLimit={15}
            passing_score={70}
            onSubmit={handleQuizSubmit}
          />
        </Col>
      </Row>
    </Container>
  );
}

// ─── Step 5: Example - Student Dashboard ──────────────────────────────────────

export function StudentDashboardPageExample() {
  return <StudentDashboard />;
}

// ─── Step 6: Hook for Video Progress Tracking ───────────────────────────────

export function useVideoProgress(lectureId, userId) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lectureId || !userId) return;

    const loadProgress = async () => {
      try {
        setLoading(true);
        const data = await getVideoProgress(lectureId, userId);
        setProgress(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [lectureId, userId]);

  const save = async (currentTime, duration) => {
    try {
      const result = await saveVideoProgress(lectureId, userId, currentTime, duration);
      setProgress(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const markComplete = async () => {
    try {
      const result = await markLectureCompleted(lectureId, userId);
      setProgress(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { progress, loading, error, save, markComplete };
}

// ─── Step 7: Route Configuration ──────────────────────────────────────────────

/**
 * Add these routes to your App.jsx:
 *
 * import { CourseLearningPageExample, StudentDashboardPageExample } from '@/config/lms-setup';
 *
 * <Routes>
 *   <Route path="/student/my-learning" element={<StudentDashboardPageExample />} />
 *   <Route path="/student/course/:courseId" element={<CourseLearningPageExample />} />
 *   <Route path="/student/quiz/:quizId" element={<QuizPageExample />} />
 * </Routes>
 */

// ─── Step 8: Environment Variables ────────────────────────────────────────────

/**
 * Add to .env file:
 *
 * VITE_API_BASE_URL=http://localhost:3002
 * VITE_AUTO_SAVE_INTERVAL=15000
 * VITE_PASSING_SCORE=70
 */

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Format video timestamp for display
 */
export const formatVideoTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hours = Math.floor(mins / 60);

  if (hours > 0) {
    return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Check if user has completed a lecture
 */
export const isLectureCompleted = (lectureId, completedIds) => {
  return completedIds.includes(lectureId);
};

/**
 * Calculate course completion percentage
 */
export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Check if user can unlock next lecture
 */
export const canUnlockLecture = (currentIndex, completedIds, lectures) => {
  if (currentIndex === 0) return true;
  const previousLecture = lectures[currentIndex - 1];
  return isLectureCompleted(previousLecture?.id, completedIds);
};

// ─── Error Handling ──────────────────────────────────────────────────────────

export class LMSError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = 'LMSError';
  }
}

/**
 * Handle API errors consistently
 */
export const handleLMSError = (error) => {
  if (error.response?.status === 401) {
    // Handle unauthorized - redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Handle forbidden - show message
    throw new LMSError('You do not have permission to access this content', 'FORBIDDEN');
  } else if (error.response?.status === 404) {
    // Handle not found
    throw new LMSError('Resource not found', 'NOT_FOUND');
  } else {
    throw new LMSError(error.message, 'UNKNOWN_ERROR');
  }
};

export default LMS_CONFIG;
