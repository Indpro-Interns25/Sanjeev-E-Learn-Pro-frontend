import { useEffect, useState } from 'react';
import { Card, ProgressBar, Table, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import { getUserEnrollments } from '../../services/enrollment';
import { getCourseById } from '../../services/courses';
import { getLessonsByCourse } from '../../data/mockLessons';
import { getUserWatchTimes, getCourseProgress, getSavedCourseProgress } from '../../services/watchTime';

// Find the next lesson to continue with based on progress
function getNextLessonId(courseId, userId) {
  const lessons = getLessonsByCourse(courseId);
  const watchTimes = getUserWatchTimes(userId);
  
  // Find the first lesson that's not fully watched
  for (let lesson of lessons) {
    // Determine duration robustly
    let duration = 60;
    if (lesson.duration_number !== undefined && lesson.duration_number !== null) {
      duration = parseInt(lesson.duration_number, 10) || 60;
    } else if (lesson.duration) {
      const m = String(lesson.duration).match(/(\d+)/);
      duration = m ? parseInt(m[1], 10) || 60 : 60;
    }

    const watched = watchTimes[lesson.id] || 0;

    if (watched < duration) {
      return lesson.id;
    }
  }
  
  // If all lessons are watched, return the first lesson
  return lessons[0]?.id;
}

export default function MyLearning() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) {
        console.warn('❌ No user found in MyLearning');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.warn('🔍 Fetching enrolled courses for My Learning...');
        console.warn('👤 Current user:', user);
        console.warn('🆔 User ID:', user.id);
        console.warn('🔍 User object keys:', Object.keys(user));
        console.warn('🔍 All user properties:', JSON.stringify(user, null, 2));
        
        // Get user's enrollments
        const enrollments = await getUserEnrollments(user.id);
        console.warn('📚 User enrollments found:', enrollments);
        console.warn('📊 Number of enrollments:', enrollments.length);
        console.warn('🔍 Enrollment details:', JSON.stringify(enrollments, null, 2));
        
        if (enrollments.length === 0) {
          console.warn('❌ No enrollments found - showing empty state');
          setEnrolledCourses([]);
          setLoading(false);
          return;
        }
        
        // Fetch course details for each enrollment
        const coursePromises = enrollments.map(async (enrollment, index) => {
          try {
            console.warn(`🔍 [${index + 1}/${enrollments.length}] Fetching course details for enrollment:`, enrollment);
            console.warn(`🔍 Course ID: ${enrollment.course_id}, User ID: ${enrollment.user_id}`);
            
            const course = await getCourseById(enrollment.course_id);
            console.warn(`✅ Course data fetched for course ${enrollment.course_id}:`, course);
            
            const lessons = getLessonsByCourse(enrollment.course_id);
            console.warn(`📖 Lessons found for course ${enrollment.course_id}:`, lessons.length);
            
            // Calculate real-time progress based on actual watch times
            const progressData = getCourseProgress(user.id, enrollment.course_id, lessons);
            console.warn(`📊 Progress calculated for course ${enrollment.course_id}:`, progressData);
            
            const courseWithEnrollment = {
              ...course,
              enrollment_id: enrollment.id,
              enrolled_at: enrollment.enrolled_at,
              progress: progressData.progress, // Use real calculated progress
              status: enrollment.status || 'active',
              totalWatched: progressData.totalWatched,
              totalDuration: progressData.totalDuration
            };
            console.warn(`✅ Course details fetched with real progress ${progressData.progress}%:`, courseWithEnrollment);
            return courseWithEnrollment;
          } catch (error) {
            console.error(`❌ Failed to fetch course ${enrollment.course_id}:`, error);
            console.error(`❌ Error details:`, error.message);
            console.error(`❌ Enrollment object:`, enrollment);
            return null;
          }
        });

        const coursesWithDetails = await Promise.all(coursePromises);
        const validCourses = coursesWithDetails.filter(course => course !== null);
        
        // Remove any potential duplicates based on course ID
        const uniqueCourses = validCourses.filter((course, index, self) => 
          index === self.findIndex(c => c.id === course.id)
        );
        
        console.warn('✅ Final enrolled courses with real-time progress:', uniqueCourses);
        console.warn('📊 Number of valid courses:', validCourses.length);
        console.warn('📊 Number of unique courses:', uniqueCourses.length);
        setEnrolledCourses(uniqueCourses);
        
      } catch (error) {
        console.error('❌ Failed to fetch enrolled courses:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();

    // Listen for enrollment changes to refresh the list
    const handleEnrollmentChange = (event) => {
      console.warn('🔄 Enrollment change detected, refreshing My Learning...', event.detail);
      // Refresh after a short delay to ensure localStorage is updated
      setTimeout(() => {
        fetchEnrolledCourses();
      }, 500);
    };

    window.addEventListener('enrollmentChanged', handleEnrollmentChange);

    return () => {
      window.removeEventListener('enrollmentChanged', handleEnrollmentChange);
    };
  }, [user]);

  // Refresh progress when component becomes visible (user returns from watching videos)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && enrolledCourses.length > 0) {
        // Refresh course progress when user returns to the page
        setTimeout(() => {
          const updatedCourses = enrolledCourses.map(course => {
            const lessons = getLessonsByCourse(course.id);
            const progressData = getCourseProgress(user.id, course.id, lessons);
            
            return {
              ...course,
              progress: progressData.progress,
              totalWatched: progressData.totalWatched,
              totalDuration: progressData.totalDuration
            };
          });
          setEnrolledCourses(updatedCourses);
        }, 500); // Small delay to ensure localStorage is updated
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, enrolledCourses]);

  if (!user) {
    return (
      <DashboardLayout title="My Learning">
      <Container className="py-5 text-center">
        <p>Please log in to view your learning progress.</p>
      </Container>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title="My Learning">
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading your enrolled courses...</p>
      </Container>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="My Learning">
      <Container className="py-5">
        <div className="alert alert-warning">
          <h4>Unable to load enrolled courses</h4>
          <p>{error}</p>
          <Button as={Link} to="/catalog" variant="primary">
            Browse Courses
          </Button>
        </div>
      </Container>
      </DashboardLayout>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <DashboardLayout title="My Learning">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8} className="text-center">
            <div className="mb-4">
              <i className="bi bi-journal-bookmark display-4 text-muted"></i>
            </div>
            <h2 className="mb-3">No Enrolled Courses Yet</h2>
            <p className="lead text-muted mb-4">
              Start your learning journey by enrolling in courses that interest you.
            </p>
            <Button as={Link} to="/catalog" variant="primary" size="lg">
              Browse Courses
            </Button>
          </Col>
        </Row>
      </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Learning">
    <Container className="py-5">
      <h1 className="mb-4">My Learning Progress</h1>
      {enrolledCourses.map(course => {
        const lessons = getLessonsByCourse(course.id);
        const watchTimes = getUserWatchTimes(user.id); // Get real watch times
        
        // Use real course progress
        const percent = course.progress || 0;
        
        return (
          <Card className="mb-4 shadow-sm" key={course.id}>
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    style={{
                      width: 50, 
                      height: 35, 
                      objectFit: 'cover', 
                      borderRadius: 6, 
                      marginRight: 12
                    }} 
                  />
                  <div>
                    <h5 className="mb-0">{course.title}</h5>
                    <small className="text-muted">{course.category} &bull; {course.level}</small>
                  </div>
                </div>
                <div className="text-end">
                  <div className="mb-1">
                    <span className="badge bg-primary">{percent}% Complete</span>
                  </div>
                  <small className="text-muted">
                    {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                  </small>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <ProgressBar now={percent} label={`${percent}%`} className="mb-3" />
              <Table size="sm" bordered hover>
                <thead>
                  <tr>
                    <th>Lesson</th>
                    <th>Watched (min)</th>
                    <th>Total (min)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map(lesson => {
                    let duration = 0;
                    if (lesson.duration_number !== undefined && lesson.duration_number !== null) {
                      duration = parseInt(lesson.duration_number, 10) || 0;
                    } else if (lesson.duration) {
                      const m = String(lesson.duration).match(/(\d+)/);
                      duration = m ? parseInt(m[1], 10) || 0 : 0;
                    }
                    const watched = watchTimes[lesson.id] || 0;
                    const isFullyWatched = watched >= duration;
                    
                    return (
                      <tr key={lesson.id} className={isFullyWatched ? 'table-success' : ''}>
                        <td>
                          <div className="d-flex align-items-center">
                            {isFullyWatched ? (
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                            ) : watched > 0 ? (
                              <i className="bi bi-play-circle-fill text-warning me-2"></i>
                            ) : (
                              <i className="bi bi-play-circle text-muted me-2"></i>
                            )}
                            {lesson.title}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {watched}
                            {isFullyWatched && (
                              <i className="bi bi-check-circle-fill text-success ms-1" style={{fontSize: '0.8rem'}}></i>
                            )}
                          </div>
                        </td>
                        <td>{duration}</td>
                        <td>
                          <Button
                            as={Link}
                            to={`/student/courses/${course.id}/lessons/${lesson.id}`}
                            variant={isFullyWatched ? "outline-success" : "outline-primary"}
                            size="sm"
                            className="d-flex align-items-center"
                          >
                            <i className={`bi ${isFullyWatched ? 'bi-arrow-clockwise' : 'bi-play-fill'} me-1`}></i>
                            {isFullyWatched ? 'Rewatch' : 'Watch'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  Watched: {course.totalWatched || 0} / {course.totalDuration || 0} min
                </div>
                <div className="d-flex gap-2">
                  <Button
                    as={Link}
                    to={`/student/courses/${course.id}`}
                    variant="outline-primary"
                    size="sm"
                  >
                    <i className="bi bi-eye me-1"></i>
                    View Course
                  </Button>
                  <Button
                    as={Link}
                    to={`/student/courses/${course.id}/lessons/${getNextLessonId(course.id, user.id)}`}
                    variant="primary"
                    size="sm"
                  >
                    <i className="bi bi-play-fill me-1"></i>
                    Continue Learning
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </Container>
    </DashboardLayout>
  );
}
