import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCourseById } from '../../data/mockCourses';
import { getLessonById, markLessonComplete, getLessonsByCourse, isLessonComplete } from '../../data/mockLessons';
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
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Detect if we're in preview mode or student mode
  const isPreviewMode = window.location.pathname.includes('/preview');
  const isStudentMode = window.location.pathname.includes('/student/');

  useEffect(() => {
    const courseData = getCourseById(parseInt(courseId));
    if (!courseData) {
      navigate('/not-found');
      return;
    }
    setCourse(courseData);

    const lessonData = getLessonById(parseInt(lessonId));
    if (!lessonData) {
      navigate('/not-found');
      return;
    }
    setLesson(lessonData);

    const allLessons = getLessonsByCourse(parseInt(courseId));
    setLessons(allLessons);
    
    const lessonIndex = allLessons.findIndex(l => l.id === parseInt(lessonId));
    setCurrentIndex(lessonIndex);
    
    // Check if user completed this lesson (only if user exists and in student mode)
    if (user && isStudentMode) {
      const completed = isLessonComplete(user.id, parseInt(lessonId));
      setIsCompleted(completed);
    }
  }, [courseId, lessonId, navigate, user, isStudentMode]);

  const handleComplete = () => {
    if (user) {
      markLessonComplete(user.id, parseInt(lessonId));
      setIsCompleted(true);
    }
  };

  const navigateToLesson = (index) => {
    if (index >= 0 && index < lessons.length) {
      const targetLessonId = lessons[index].id;
      
      if (isPreviewMode) {
        // Navigate in preview mode
        navigate(`/courses/${courseId}/lessons/${targetLessonId}/preview`);
      } else if (isStudentMode) {
        // Navigate in student mode
        navigate(`/student/courses/${courseId}/lessons/${targetLessonId}`);
      } else {
        // Default fallback to preview mode
        navigate(`/courses/${courseId}/lessons/${targetLessonId}/preview`);
      }
    }
  };

  if (!course || !lesson) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col lg={9}>
          <div className="mb-4">
            <h1 className="h3">{course.title}</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Button 
                    variant="link" 
                    className="p-0"
                    onClick={() => {
                      if (isStudentMode) {
                        navigate(`/student/courses/${courseId}`);
                      } else {
                        navigate(`/courses/${courseId}`);
                      }
                    }}
                  >
                    Course Home
                  </Button>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {lesson.title}
                </li>
              </ol>
            </nav>
          </div>

          <div className="mb-4">
            <VideoPlayer 
              videoUrl={lesson.videoUrl} 
              title={lesson.title}
              onProgress={(progress) => {
                // Auto-complete lesson when video reaches 90% completion
                if (user && isStudentMode && progress >= 90 && !isCompleted) {
                  markLessonComplete(user.id, parseInt(lessonId));
                  setIsCompleted(true);
                }
              }}
            />
          </div>

          <Card className="mb-4">
            <Card.Body>
              <h2 className="h4 mb-3">{lesson.title}</h2>
              <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.content }} />
              
              {lesson.resources && lesson.resources.length > 0 && (
                <div className="mt-4">
                  <h3 className="h5">Lesson Resources</h3>
                  <ul className="list-unstyled">
                    {lesson.resources.map((resource, index) => (
                      <li key={index} className="mb-2">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          <i className="bi bi-download me-2"></i>
                          {resource.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Lesson Comments Section */}
          <Comments courseId={courseId} lessonId={lessonId} />

          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button
              variant="outline-primary"
              disabled={currentIndex === 0}
              onClick={() => navigateToLesson(currentIndex - 1)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Previous Lesson
            </Button>

            {/* Only show completion button in student mode with authenticated user */}
            {isStudentMode && user && (
              !isCompleted ? (
                <Button variant="success" onClick={handleComplete}>
                  <i className="bi bi-check-circle me-2"></i>
                  Mark as Complete
                </Button>
              ) : (
                <Button variant="success" disabled>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Completed
                </Button>
              )
            )}

            <Button
              variant="outline-primary"
              disabled={currentIndex === lessons.length - 1}
              onClick={() => navigateToLesson(currentIndex + 1)}
            >
              Next Lesson
              <i className="bi bi-arrow-right ms-2"></i>
            </Button>
          </div>
        </Col>

        <Col lg={3}>
          <div className="sticky-top" style={{ top: '2rem' }}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Course Content</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                  {lessons.map((l, index) => (
                    <Button
                      key={l.id}
                      variant="link"
                      className={`w-100 text-start px-3 py-2 border-bottom ${
                        l.id === parseInt(lessonId) ? 'active bg-light' : ''
                      }`}
                      onClick={() => navigateToLesson(index)}
                    >
                      <small className="d-block text-muted mb-1">
                        Lesson {index + 1}
                      </small>
                      {l.title}
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
