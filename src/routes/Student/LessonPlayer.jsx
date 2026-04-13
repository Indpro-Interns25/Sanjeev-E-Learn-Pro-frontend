import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Card, Badge, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useVideoProgress } from '../../hooks/useVideoProgress';
import { getCourseById } from '../../data/mockCourses';
import { getLessonById, getLessonsByCourse } from '../../data/mockLessons';
import {
  saveVideoProgress,
  getVideoProgress,
  markLectureCompleted,
} from '../../services/videoProgress';
import {
  getCourseProgress,
  markLessonComplete as apiMarkComplete,
  isLessonCompleteLocal,
  calcProgressPercent,
} from '../../services/progress';
import {
  getLessonQuiz,
  getFinalCourseTest,
  submitLessonQuiz,
  submitFinalTest,
  getFinalTestStatus,
} from '../../services/quiz';
import {
  generateFinalTestCertificate,
  saveCertificateLocally,
  downloadCertificatePDF,
  getCertificateByCourseid,
} from '../../services/certificates';
import VideoPlayer from '../../components/VideoPlayer';
import QuizComponent from '../../components/QuizComponent';
import QuizUnlockButton from '../../components/QuizUnlockButton';
import CourseProgress from '../../components/CourseProgress';
import Comments from '../../components/Comments';

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Video progress tracking with 90% threshold for quiz unlock
  const videoProgress = useVideoProgress(lessonId && user ? parseInt(lessonId, 10) : null, user?.id);

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState([]);
  const [lastSavedProgress, setLastSavedProgress] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusVariant, setStatusVariant] = useState('info');

  const [quizMode, setQuizMode] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [finalTestResult, setFinalTestResult] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateError, setCertificateError] = useState('');

  const isPreviewMode = window.location.pathname.includes('/preview');
  const isStudentMode = window.location.pathname.includes('/student/');

  const activeLessonId = lesson ? lesson.id : parseInt(lessonId, 10);
  const currentLessonCompleted = completedIds.includes(activeLessonId);
  const progressPercent = calcProgressPercent(completedIds, lessons.length);
  const allLessonsCompleted = lessons.length > 0 && completedIds.length === lessons.length;
  const finalTestStored = user ? getFinalTestStatus(user.id, parseInt(courseId, 10)) : null;
  const finalTestPassed = finalTestResult?.passed || finalTestStored?.passed || !!certificate;

  const showNotice = (message, variant = 'info') => {
    setStatusMessage(message);
    setStatusVariant(variant);
  };

  const loadLessonQuiz = useCallback(async () => {
    if (!lesson || !courseId) return;
    setQuizLoading(true);
    setQuizError('');
    try {
      const quiz = await getLessonQuiz(courseId, lesson.id, lesson.title);
      setActiveQuiz(quiz);
      setQuizMode('lesson');
    } catch (error) {
      setQuizError(error.message || 'Failed to load lesson quiz');
    } finally {
      setQuizLoading(false);
    }
  }, [lesson, courseId]);

  const loadFinalTest = useCallback(async () => {
    if (!courseId || !course) return;
    setQuizLoading(true);
    setQuizError('');
    try {
      const quiz = await getFinalCourseTest(courseId, course.title || 'Course');
      setActiveQuiz(quiz);
      setQuizMode('final');
    } catch (error) {
      setQuizError(error.message || 'Failed to load final test');
    } finally {
      setQuizLoading(false);
    }
  }, [courseId, course]);

  const refreshCertificate = useCallback(() => {
    if (!user || !courseId) return;
    const existing = getCertificateByCourseid(user.id, parseInt(courseId, 10));
    setCertificate(existing);
  }, [user, courseId]);

  useEffect(() => {
    const courseData = getCourseById(parseInt(courseId, 10));
    if (!courseData) {
      navigate('/not-found');
      return;
    }
    setCourse(courseData);

    const lessonData = getLessonById(parseInt(lessonId, 10));
    if (!lessonData) {
      navigate('/not-found');
      return;
    }
    setLesson(lessonData);

    const allLessons = getLessonsByCourse(parseInt(courseId, 10));
    setLessons(allLessons);
    setCurrentIndex(allLessons.findIndex((item) => item.id === parseInt(lessonId, 10)));

    if (user && isStudentMode) {
      setCompletedIds(isLessonCompleteLocal(user.id, parseInt(courseId, 10), parseInt(lessonId, 10))
        ? [parseInt(lessonId, 10)]
        : []);
      getCourseProgress(user.id, parseInt(courseId, 10))
        .then((ids) => setCompletedIds(ids))
        .catch(() => {});
      getVideoProgress(parseInt(lessonId, 10), user.id)
        .then((progress) => {
          if (progress?.current_time > 0) {
            setResumeTime(progress.current_time);
          }
        })
        .catch(() => {});
      refreshCertificate();
    }

    setLastSavedProgress(0);
    setQuizMode(null);
    setActiveQuiz(null);
    setQuizError('');
    setFinalTestResult(user ? getFinalTestStatus(user.id, parseInt(courseId, 10)) : null);
  }, [courseId, lessonId, navigate, user, isStudentMode, refreshCertificate]);

  useEffect(() => {
    if (!courseId || !user) return;
    setFinalTestResult(getFinalTestStatus(user.id, parseInt(courseId, 10)));
    refreshCertificate();
  }, [courseId, user, refreshCertificate]);

  useEffect(() => {
    if (lessons.length === 0 || !lesson) return;
    setCurrentIndex(lessons.findIndex((item) => item.id === lesson.id));
  }, [lessons, lesson]);

  const navigateToLesson = (index) => {
    if (index < 0 || index >= lessons.length) return;
    if (isStudentMode && index > currentIndex && !currentLessonCompleted) {
      showNotice('Complete the lesson quiz to unlock the next lesson.', 'warning');
      return;
    }

    const id = lessons[index].id;
    if (isPreviewMode) navigate(`/courses/${courseId}/lessons/${id}/preview`);
    else if (isStudentMode) navigate(`/student/courses/${courseId}/lessons/${id}`);
    else navigate(`/courses/${courseId}/lessons/${id}/preview`);
  };

  const handleMarkLessonComplete = async () => {
    if (!user || markingComplete || !lesson) return;
    setMarkingComplete(true);
    try {
      await markLectureCompleted(parseInt(lessonId, 10), user.id);
      await apiMarkComplete(user.id, parseInt(courseId, 10), parseInt(lessonId, 10));
      setCompletedIds((prev) => (prev.includes(lesson.id) ? prev : [...prev, lesson.id]));
      showNotice('Lesson quiz recorded. The next lesson is now available.', 'success');
    } catch (error) {
      setQuizError(error.message || 'Failed to record lesson completion');
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleQuizSubmit = async (result) => {
    if (!lesson || !activeQuiz || !user) return;

    if (quizMode === 'lesson') {
      const saved = await submitLessonQuiz(user.id, parseInt(courseId, 10), lesson.id, result.answers, activeQuiz.questions);
      setCompletedIds((prev) => (prev.includes(lesson.id) ? prev : [...prev, lesson.id]));
      await handleMarkLessonComplete();
      setQuizError('');
      showNotice(`Lesson quiz completed with ${saved.percentage}% score.`, 'success');
      return;
    }

    if (quizMode === 'final') {
      const saved = await submitFinalTest(user.id, parseInt(courseId, 10), activeQuiz.id, result.answers, activeQuiz.questions);
      setFinalTestResult(saved);
      if (saved.passed) {
        showNotice('Final test passed. You can now generate your certificate.', 'success');
      } else {
        showNotice('Final test not passed yet. Retry to reach 70% or higher.', 'warning');
      }
    }
  };

  const handleGenerateCertificate = async () => {
    if (!user || !course || !finalTestResult?.passed) return;
    setCertificateLoading(true);
    setCertificateError('');
    try {
      const cert = generateFinalTestCertificate({
        userId: user.id,
        courseId: parseInt(courseId, 10),
        courseTitle: course.title,
        score: finalTestResult.score,
        percentage: finalTestResult.percentage,
        totalScore: finalTestResult.total,
        instructorName: course.instructor_name || course.instructorName || 'EduLearn Pro Team',
      });
      saveCertificateLocally(user.id, cert);
      setCertificate(cert);
      await downloadCertificatePDF(cert, {
        userName: user.name || user.username || 'Student',
        courseTitle: course.title,
        completionDate: cert.completionDate,
      });
      showNotice('Certificate generated and downloaded as PDF.', 'success');
    } catch (error) {
      setCertificateError(error.message || 'Failed to generate certificate');
    } finally {
      setCertificateLoading(false);
    }
  };

  const currentVideo = lesson?.videoUrl || lesson?.video_url;

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
      {statusMessage && (
        <Alert variant={statusVariant} dismissible onClose={() => setStatusMessage('')} className="mb-3">
          {statusMessage}
        </Alert>
      )}

      <Row>
        <Col lg={9}>
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Button
                  variant="link"
                  className="p-0 text-decoration-none"
                  onClick={() => navigate(isStudentMode ? `/student/courses/${courseId}` : `/courses/${courseId}`)}
                >
                  {course.title}
                </Button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {lesson.title}
              </li>
            </ol>
          </nav>

          <div className="mb-4 rounded overflow-hidden shadow-sm">
            <VideoPlayer
              videoUrl={currentVideo}
              title={lesson.title}
              onProgress={(progressPercent) => {
                if (user && isStudentMode && progressPercent > 0) {
                  // Get duration from lesson
                  let duration = 0;
                  if (lesson.duration_number != null) {
                    duration = parseInt(lesson.duration_number, 10) || 0;
                  } else if (lesson.duration) {
                    const match = String(lesson.duration).match(/(\d+)/);
                    duration = match ? parseInt(match[1], 10) * 60 : 0;
                  }

                  // Calculate current time from progress percentage
                  const currentTime = (progressPercent / 100) * duration;

                  // Track progress with useVideoProgress hook
                  try {
                    videoProgress.handleProgressUpdate(progressPercent, currentTime, duration);
                  } catch (err) {
                    console.warn('Error tracking progress:', err);
                  }

                  // Also save via old method for backward compatibility
                  const progressRounded = Math.floor(progressPercent / 5) * 5;
                  if (progressRounded > lastSavedProgress) {
                    saveVideoProgress(parseInt(lessonId, 10), user.id, currentTime, duration)
                      .catch(() => {});
                    setLastSavedProgress(progressRounded);
                  }
                }
              }}
              startTime={resumeTime}
            />
          </div>

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
                {isStudentMode && user && currentLessonCompleted && (
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

              <div className="mt-4 d-flex flex-wrap gap-2 align-items-center">
                {isStudentMode && user && !quizMode && (
                  <div style={{ flex: '1 1 100%', minWidth: '250px' }}>
                    <QuizUnlockButton
                      courseId={parseInt(courseId, 10)}
                      lessonId={parseInt(lessonId, 10)}
                      videoProgress={videoProgress.progress}
                      loading={quizLoading}
                      disabled={!videoProgress.isUnlocked}
                      showProgressBar={true}
                      onQuizClick={() => {
                        // Navigate to lesson-specific quiz page
                        navigate(`/student/courses/${courseId}/lessons/${lessonId}/quiz`);
                      }}
                    />
                  </div>
                )}
                {isStudentMode && allLessonsCompleted && !finalTestPassed && !quizMode && (
                  <Button variant="warning" onClick={loadFinalTest} disabled={quizLoading}>
                    {quizLoading ? (
                      <><Spinner animation="border" size="sm" className="me-2" />Loading test...</>
                    ) : (
                      <><i className="bi bi-file-earmark-text me-2"></i>Start Final Test</>
                    )}
                  </Button>
                )}
                {isStudentMode && finalTestPassed && !certificate && !quizMode && (
                  <Button variant="success" onClick={handleGenerateCertificate} disabled={certificateLoading}>
                    {certificateLoading ? (
                      <><Spinner animation="border" size="sm" className="me-2" />Generating...</>
                    ) : (
                      <><i className="bi bi-award me-2"></i>Generate Certificate</>
                    )}
                  </Button>
                )}
                {certificate && (
                  <Button variant="outline-success" onClick={() => downloadCertificatePDF(certificate, {
                    userName: user?.name || user?.username || 'Student',
                    courseTitle: course.title,
                    completionDate: certificate.completionDate,
                  })}>
                    <i className="bi bi-download me-2"></i>Download Certificate PDF
                  </Button>
                )}
              </div>

              {quizError && (
                <Alert variant="danger" className="mt-3 mb-0">
                  {quizError}
                </Alert>
              )}
              {certificateError && (
                <Alert variant="danger" className="mt-3 mb-0">
                  {certificateError}
                </Alert>
              )}
            </Card.Body>
          </Card>

          {quizMode && activeQuiz && (
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <QuizComponent
                  key={`${quizMode}-${activeQuiz.id}`}
                  quizId={activeQuiz.id}
                  title={activeQuiz.title}
                  questions={activeQuiz.questions}
                  timeLimit={activeQuiz.timeLimit || 0}
                  passing_score={quizMode === 'final' ? 70 : 0}
                  showPassFail={quizMode === 'final'}
                  onSubmit={handleQuizSubmit}
                  onCancel={() => {
                    setQuizMode(null);
                    setActiveQuiz(null);
                  }}
                  onRetry={() => {
                    if (quizMode === 'final') {
                      loadFinalTest();
                    } else {
                      loadLessonQuiz();
                    }
                  }}
                />
              </Card.Body>
            </Card>
          )}

          {allLessonsCompleted && !quizMode && (
            <Card className="mb-4 border-0 shadow-sm bg-light">
              <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <h5 className="mb-1">Final Test Status</h5>
                  <p className="text-muted mb-0">
                    {finalTestPassed ? 'Final test completed.' : 'Final test pending. Pass with 70% to unlock the certificate.'}
                  </p>
                </div>
                {!finalTestPassed ? (
                  <Button variant="warning" onClick={loadFinalTest} disabled={quizLoading}>
                    Start Final Test
                  </Button>
                ) : (
                  <Badge bg="success" className="px-3 py-2">Final Test Completed</Badge>
                )}
              </Card.Body>
            </Card>
          )}

          <Comments courseId={courseId} lessonId={lessonId} />

          <div className="d-flex justify-content-between mt-4 mb-5 gap-2 flex-wrap">
            <Button
              variant="outline-secondary"
              disabled={currentIndex === 0}
              onClick={() => navigateToLesson(currentIndex - 1)}
            >
              <i className="bi bi-arrow-left me-2"></i>Previous
            </Button>
            <Button
              variant="primary"
              disabled={isStudentMode && !currentLessonCompleted}
              onClick={() => navigateToLesson(currentIndex + 1)}
            >
              Next<i className="bi bi-arrow-right ms-2"></i>
            </Button>
          </div>
        </Col>

        <Col lg={3}>
          <div className="sticky-top" style={{ top: '1.5rem' }}>
            {/* Course Completion Progress */}
            {isStudentMode && user && (
              <CourseProgress
                courseId={parseInt(courseId, 10)}
                userId={user.id}
                totalLessons={lessons.length}
                onStartFinalTest={loadFinalTest}
                onGenerateCertificate={handleGenerateCertificate}
              />
            )}

            <Card className="border-0 shadow-sm mb-3">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-1 fw-bold">Learning Progress</h5>
                {isStudentMode && lessons.length > 0 && (
                  <>
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">{completedIds.length} / {lessons.length} completed</small>
                      <small className="fw-semibold text-success">{progressPercent}%</small>
                    </div>
                    <ProgressBar now={progressPercent} variant="success" style={{ height: 6 }} />
                  </>
                )}
              </Card.Header>
              <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                {lessons.map((item, index) => {
                  const done = completedIds.includes(item.id);
                  const active = item.id === parseInt(lessonId, 10);
                  const locked = isStudentMode && index > currentIndex && !currentLessonCompleted;
                  return (
                    <button
                      key={item.id}
                      onClick={() => (!locked ? navigateToLesson(index) : showNotice('Complete the current lesson quiz to unlock this lesson.', 'warning'))}
                      className={`d-flex align-items-start w-100 text-start px-3 py-2 border-0 border-bottom ${active ? 'bg-primary bg-opacity-10' : 'bg-transparent'}`}
                      style={{ cursor: locked ? 'not-allowed' : 'pointer', transition: 'background 0.15s', opacity: locked ? 0.55 : 1 }}
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
                          {item.title}
                        </span>
                        {item.duration && (
                          <small className="d-block text-muted" style={{ fontSize: '0.68rem' }}>
                            <i className="bi bi-clock me-1"></i>{item.duration}
                          </small>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-1 fw-bold">Course Status</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Lessons</span>
                  <Badge bg={allLessonsCompleted ? 'success' : 'secondary'}>{allLessonsCompleted ? 'Completed' : 'In Progress'}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Final Test</span>
                  <Badge bg={finalTestPassed ? 'success' : allLessonsCompleted ? 'warning' : 'secondary'}>
                    {finalTestPassed ? 'Completed' : allLessonsCompleted ? 'Pending' : 'Locked'}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Certificate</span>
                  <Badge bg={certificate ? 'success' : finalTestPassed ? 'warning' : 'secondary'}>
                    {certificate ? 'Ready' : finalTestPassed ? 'Unlocked' : 'Locked'}
                  </Badge>
                </div>
                {certificate && (
                  <div className="mt-3 p-2 bg-light rounded small text-muted">
                    <div><strong>Certificate ID:</strong> {certificate.id}</div>
                    <div><strong>Score:</strong> {certificate.percentage}%</div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
