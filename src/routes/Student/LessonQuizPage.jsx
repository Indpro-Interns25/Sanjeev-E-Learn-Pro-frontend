import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { getLessonById } from '../../data/mockLessons';
import { getCourseById } from '../../data/mockCourses';
import { getLessonQuiz, submitLessonQuiz } from '../../services/quiz';
import { getLessonProgressStatus } from '../../services/videoProgressTracker';
import QuizComponent from '../../components/QuizComponent';
import { useUi } from '../../context/ui-context';
import { toDisplayText } from '../../utils/displayValue';

/**
 * Lesson-Specific Quiz Page
 * Displays quiz for a particular lesson with progress tracking
 * Route: /student/courses/:courseId/lessons/:lessonId/quiz
 */
export default function LessonQuizPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useUi();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [videoProgress, setVideoProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Load lesson, course, and quiz data
  useEffect(() => {
    if (!courseId || !lessonId || !user) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // Load lesson and course
        const lessonData = getLessonById(parseInt(lessonId, 10));
        if (!lessonData) {
          setError('Lesson not found');
          navigate('/not-found');
          return;
        }
        setLesson(lessonData);

        const courseData = getCourseById(parseInt(courseId, 10));
        if (!courseData) {
          setError('Course not found');
          navigate('/not-found');
          return;
        }
        setCourse(courseData);

        // Check video progress
        try {
          const progressStatus = await getLessonProgressStatus(parseInt(lessonId, 10), user.id);
          setVideoProgress(progressStatus);

          // Check if quiz is unlocked
          if (!progressStatus.isUnlocked) {
            showToast(
              `Quiz is locked. Complete ${100 - progressStatus.percentage}% more of the lesson video.`,
              'warning'
            );
            setTimeout(() => {
              navigate(`/student/courses/${courseId}/lessons/${lessonId}`);
            }, 3000);
            return;
          }
        } catch (err) {
          console.warn('Could not fetch video progress:', err);
          // Don't block quiz if progress check fails
        }

        // Load quiz
        const quizData = await getLessonQuiz(courseId, parseInt(lessonId, 10), lessonData.title);
        setQuiz(quizData);
      } catch (err) {
        console.error('Error loading quiz page:', err);
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, lessonId, user, navigate, showToast]);

  const handleQuizSubmit = useCallback(
    async (quizResult) => {
      if (!user || !quiz || !lesson) return;

      try {
        setSubmitting(true);
        setError('');

        const saved = await submitLessonQuiz(
          user.id,
          parseInt(courseId, 10),
          lesson.id,
          quizResult.answers,
          quiz.questions
        );

        setResult(saved);
        showToast(
          `Quiz submitted! Score: ${saved.percentage}%`,
          saved.passed ? 'success' : 'info'
        );
      } catch (err) {
        console.error('Error submitting quiz:', err);
        setError(err.message || 'Failed to submit quiz');
        showToast('Error submitting quiz', 'danger');
      } finally {
        setSubmitting(false);
      }
    },
    [user, quiz, lesson, courseId, showToast]
  );

  const handleRetry = useCallback(() => {
    setResult(null);
  }, []);

  const handleBackToLesson = useCallback(() => {
    navigate(`/student/courses/${courseId}/lessons/${lessonId}`);
  }, [navigate, courseId, lessonId]);

  if (loading) {
    return (
      <Container className="py-5" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3" />
          <p className="text-muted">Loading quiz...</p>
        </div>
      </Container>
    );
  }

  if (error && !quiz) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button onClick={handleBackToLesson}>
          <i className="bi bi-arrow-left me-2"></i>Back to Lesson
        </Button>
      </Container>
    );
  }

  if (!quiz || !lesson || !course) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Quiz data not available
        </Alert>
        <Button onClick={handleBackToLesson}>
          <i className="bi bi-arrow-left me-2"></i>Back to Lesson
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ minHeight: '90vh', backgroundColor: '#f8f9fa' }}>
      {/* Header Navigation */}
      <Row className="mb-4">
        <Col lg={8} className="offset-lg-2">
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Button
                  variant="link"
                  className="p-0 text-decoration-none"
                  onClick={() => navigate(`/student/courses/${courseId}`)}
                >
                  {course.title}
                </Button>
              </li>
              <li className="breadcrumb-item">
                <Button
                  variant="link"
                  className="p-0 text-decoration-none"
                  onClick={handleBackToLesson}
                >
                  {toDisplayText(lesson.title, 'Untitled Lesson')}
                </Button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Quiz
              </li>
            </ol>
          </nav>

          {/* Quiz Header */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <h1 className="h4 mb-1">{toDisplayText(lesson.title, 'Untitled Lesson')} - Assessment</h1>
                  <p className="text-muted mb-0">
                    <i className="bi bi-file-earmark-text me-1"></i>
                    {quiz.questions?.length || 0} questions
                    {quiz.timeLimit ? ` • ${quiz.timeLimit} minutes` : ''}
                  </p>
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <Badge bg="success" className="px-3 py-2">
                    <i className="bi bi-unlock-fill me-1"></i>Quiz Unlocked
                  </Badge>
                </Col>
              </Row>

              {videoProgress && (
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted">
                    Video Progress: <strong>{videoProgress.percentage}%</strong>
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quiz Content */}
      <Row>
        <Col lg={8} className="offset-lg-2">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          )}

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {result ? (
                // Result View
                <div className="text-center py-4">
                  <div className="mb-4">
                    {result.passed ? (
                      <>
                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                        <h2 className="mt-3 text-success">Quiz Passed!</h2>
                        <p className="text-muted">You scored {result.percentage}%</p>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-x-circle-fill text-warning" style={{ fontSize: '3rem' }}></i>
                        <h2 className="mt-3 text-warning">Need Improvement</h2>
                        <p className="text-muted">Your score: {result.percentage}%</p>
                      </>
                    )}
                  </div>

                  <div className="my-4">
                    <div className="progress" style={{ height: '30px' }}>
                      <div
                        className={`progress-bar ${result.passed ? 'bg-success' : 'bg-warning'}`}
                        role="progressbar"
                        style={{ width: `${result.percentage}%` }}
                        aria-valuenow={result.percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {result.percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-md-6">
                      <p className="mb-2"><strong>Correct</strong></p>
                      <p className="h5 text-success mb-3">{result.correct_answers} / {quiz.questions?.length || 0}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2"><strong>Score</strong></p>
                      <p className="h5 text-primary mb-3">{result.score} / {result.total}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top">
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={handleRetry}
                      disabled={submitting}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>Retry Quiz
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={handleBackToLesson}
                    >
                      <i className="bi bi-arrow-left me-2"></i>Back to Lesson
                    </Button>
                  </div>
                </div>
              ) : (
                // Quiz View
                <QuizComponent
                  key={`lesson-quiz-${quiz.id}`}
                  quizId={quiz.id}
                  title={quiz.title}
                  questions={quiz.questions}
                  timeLimit={quiz.timeLimit || 0}
                  passing_score={0}
                  showPassFail={false}
                  onSubmit={handleQuizSubmit}
                  onCancel={handleBackToLesson}
                  onRetry={handleRetry}
                  disabled={submitting}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
