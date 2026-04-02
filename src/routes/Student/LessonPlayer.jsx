import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Card, Badge, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCourseById } from '../../data/mockCourses';
import { getLessonById, getLessonsByCourse } from '../../data/mockLessons';
import {
  saveVideoProgress,
  getVideoProgress,
  markLectureCompleted,
  getCourseVideoProgress
} from '../../services/videoProgress';
import {
  getCourseProgress,
  markLessonComplete as apiMarkComplete,
  isLessonCompleteLocal,
  calcProgressPercent,
} from '../../services/progress';
import VideoPlayer from '../../components/VideoPlayer';
import Comments from '../../components/Comments';

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState([]);   // array of completed lesson IDs
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);

  const isPreviewMode = window.location.pathname.includes('/preview');
  const isStudentMode = window.location.pathname.includes('/student/');

  // Fetch saved video progress for resume
  const loadVideoProgress = useCallback(async () => {
    if (!user || !lessonId) return;
    try {
      const progress = await getVideoProgress(parseInt(lessonId), user.id);
      if (progress && progress.current_time > 0) {
        setResumeTime(progress.current_time);
      }
    } catch (error) {
      console.warn('Failed to load video progress:', error);
    }
  }, [user, lessonId]);

  // Fetch course progress from backend
  const loadProgress = useCallback(async () => {
    if (!user || !isStudentMode) return;
    try {
      const ids = await getCourseProgress(user.id, parseInt(courseId));
      setCompletedIds(ids);
      setIsCompleted(ids.includes(parseInt(lessonId)));
    } catch (error) {
      console.warn('Failed to load course progress:', error);
    }
  }, [user, courseId, lessonId, isStudentMode]);

  useEffect(() => {
    const courseData = getCourseById(parseInt(courseId));
    if (!courseData) { navigate('/not-found'); return; }
    setCourse(courseData);

    const lessonData = getLessonById(parseInt(lessonId));
    if (!lessonData) { navigate('/not-found'); return; }
    setLesson(lessonData);

    const allLessons = getLessonsByCourse(parseInt(courseId));
    setLessons(allLessons);
    setCurrentIndex(allLessons.findIndex((l) => l.id === parseInt(lessonId)));

    // Fast local check first, then async backend fetches
    if (user && isStudentMode) {
      setIsCompleted(isLessonCompleteLocal(user.id, parseInt(courseId), parseInt(lessonId)));
      loadVideoProgress();
      loadProgress();
    }

    setLastSavedProgress(0);
  }, [courseId, lessonId, navigate, user, isStudentMode, loadProgress, loadVideoProgress]);

  // Re-check completion state when lesson changes
  useEffect(() => {
    setIsCompleted(completedIds.includes(parseInt(lessonId)));
  }, [completedIds, lessonId]);

  const handleComplete = async () => {
    if (!user || markingComplete) return;
    setMarkingComplete(true);
    try {
      // Mark via videoProgress service (for actual video completion)
      await markLectureCompleted(parseInt(lessonId), user.id);
      // Also mark via progress service (for backward compatibility)
      await apiMarkComplete(user.id, parseInt(courseId), parseInt(lessonId));
      setIsCompleted(true);
      setCompletedIds((prev) =>
        prev.includes(parseInt(lessonId)) ? prev : [...prev, parseInt(lessonId)]
      );
    } catch (error) {
      console.error('Error marking lecture as completed:', error);
    } finally {
      setMarkingComplete(false);
    }
  };

  const navigateToLesson = (index) => {
    if (index < 0 || index >= lessons.length) return;
    const id = lessons[index].id;
    if (isPreviewMode) navigate(`/courses/${courseId}/lessons/${id}/preview`);
    else if (isStudentMode) navigate(`/student/courses/${courseId}/lessons/${id}`);
    else navigate(`/courses/${courseId}/lessons/${id}/preview`);
  };

  const progressPercent = calcProgressPercent(completedIds, lessons.length);

  if (!course || !lesson) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        {/* ─── Main content ────────────────────────────────────────────── */}
        <Col lg={9}>
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Button
                  variant="link"
                  className="p-0 text-decoration-none"
                  onClick={() =>
                    navigate(isStudentMode ? `/student/courses/${courseId}` : `/courses/${courseId}`)
                  }
                >
                  {course.title}
                </Button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {lesson.title}
              </li>
            </ol>
          </nav>

          {/* Video Player */}
          <div className="mb-4 rounded overflow-hidden shadow-sm">
            <VideoPlayer
              videoUrl={lesson.videoUrl}
              title={lesson.title}
              onProgress={(progress) => {
                if (user && isStudentMode && progress > 0) {
                  // Save progress every 5 seconds
                  const progressRounded = Math.floor(progress / 5) * 5;
                  if (progressRounded > lastSavedProgress) {
                    // Calculate duration in seconds
                    let duration = 0;
                    if (lesson.duration_number != null) {
                      duration = parseInt(lesson.duration_number, 10) || 0;
                    } else if (lesson.duration) {
                      const m = String(lesson.duration).match(/(\d+)/);
                      duration = m ? parseInt(m[1], 10) * 60 : 0; // convert minutes to seconds
                    }
                    
                    // Save video progress to backend
                    saveVideoProgress(parseInt(lessonId), user.id, progress, duration)
                      .catch(error => console.warn('Failed to save video progress:', error));
                    
                    setLastSavedProgress(progressRounded);
                  }
                }
                // Auto-complete at 90%
                if (user && isStudentMode && progress >= 90 && !isCompleted) {
                  handleComplete();
                }
              }}
              startTime={resumeTime}
            />
          </div>

          {/* Lesson Info Card */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <h1 className="h4 mb-1">{lesson.title}</h1>
                  <small className="text-muted">
                    {lesson.duration && <><i className="bi bi-clock me-1"></i>{lesson.duration}</>}
                    {lesson.type && <span className="ms-3 text-capitalize"><i className="bi bi-play-circle me-1"></i>{lesson.type}</span>}
                  </small>
                </div>
                {isStudentMode && user && isCompleted && (
                  <Badge bg="success" className="fs-6 px-3 py-2">
                    <i className="bi bi-check-circle-fill me-2"></i>Completed
                  </Badge>
                )}
              </div>

              {lesson.description && (
                <p className="text-muted mt-3 mb-0">{lesson.description}</p>
              )}

              {lesson.content && (
                <div
                  className="lesson-content mt-3"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              )}

              {lesson.resources?.length > 0 && (
                <div className="mt-4">
                  <h3 className="h6 fw-bold mb-2">
                    <i className="bi bi-paperclip me-1"></i>Resources
                  </h3>
                  <ul className="list-unstyled mb-0">
                    {lesson.resources.map((r, i) => (
                      <li key={i} className="mb-1">
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                          <i className="bi bi-download me-2 text-primary"></i>{r.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Comments */}
          <Comments courseId={courseId} lessonId={lessonId} />

          {/* Prev / Next navigation */}
          <div className="d-flex justify-content-between mt-4 mb-5">
            <Button
              variant="outline-secondary"
              disabled={currentIndex === 0}
              onClick={() => navigateToLesson(currentIndex - 1)}
            >
              <i className="bi bi-arrow-left me-2"></i>Previous
            </Button>
            <Button
              variant="primary"
              disabled={currentIndex === lessons.length - 1}
              onClick={() => navigateToLesson(currentIndex + 1)}
            >
              Next<i className="bi bi-arrow-right ms-2"></i>
            </Button>
          </div>
        </Col>

        {/* ─── Sidebar ─────────────────────────────────────────────────── */}
        <Col lg={3}>
          <div className="sticky-top" style={{ top: '1.5rem' }}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-1 fw-bold">Course Content</h5>
                {isStudentMode && lessons.length > 0 && (
                  <>
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">{completedIds.length} / {lessons.length} completed</small>
                      <small className="fw-semibold text-success">{progressPercent}%</small>
                    </div>
                    <ProgressBar
                      now={progressPercent}
                      variant="success"
                      style={{ height: 6 }}
                    />
                  </>
                )}
              </Card.Header>
              <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                {lessons.map((l, index) => {
                  const done = completedIds.includes(l.id);
                  const active = l.id === parseInt(lessonId);
                  return (
                    <button
                      key={l.id}
                      onClick={() => navigateToLesson(index)}
                      className={`d-flex align-items-start w-100 text-start px-3 py-2 border-0 border-bottom ${
                        active ? 'bg-primary bg-opacity-10' : 'bg-transparent'
                      }`}
                      style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    >
                      <span className="me-2 mt-1 flex-shrink-0">
                        {done ? (
                          <i className="bi bi-check-circle-fill text-success"></i>
                        ) : active ? (
                          <i className="bi bi-play-circle-fill text-primary"></i>
                        ) : (
                          <i className="bi bi-circle text-muted"></i>
                        )}
                      </span>
                      <span>
                        <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                          LESSON {index + 1}
                        </small>
                        <span
                          className={`small ${active ? 'fw-semibold text-primary' : done ? 'text-muted text-decoration-line-through' : ''}`}
                          style={{ lineHeight: 1.3 }}
                        >
                          {l.title}
                        </span>
                        {l.duration && (
                          <small className="d-block text-muted" style={{ fontSize: '0.68rem' }}>
                            <i className="bi bi-clock me-1"></i>{l.duration}
                          </small>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

