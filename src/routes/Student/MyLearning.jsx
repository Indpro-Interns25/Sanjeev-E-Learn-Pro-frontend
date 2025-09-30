import { useEffect, useState } from 'react';
import { Card, ProgressBar, Table, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserEnrollments } from '../../services/enrollment';
import { getCourseById } from '../../services/courses';
import { getLessonsByCourse } from '../../data/mockLessons';

// Simulate watch time per lesson (in minutes) for demo
function getUserLessonWatchTimes(userId, courseId) {
  // In a real app, fetch from backend or localStorage
  // Here, we simulate with random data for demo based on course progress
  const watchTimes = {};
  const lessons = getLessonsByCourse(courseId);
  lessons.forEach(lesson => {
    // Simulate: user watched 0-100% of lesson duration (in minutes)
    const duration = parseInt(lesson.duration) || 60;
    watchTimes[lesson.id] = Math.floor(Math.random() * duration);
  });
  return watchTimes;
}

export default function MyLearning() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchTimes, setWatchTimes] = useState({});

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
        
        // Get user's enrollments
        const enrollments = await getUserEnrollments(user.id);
        console.warn('📚 User enrollments found:', enrollments);
        console.warn('📊 Number of enrollments:', enrollments.length);
        
        if (enrollments.length === 0) {
          console.warn('❌ No enrollments found - showing empty state');
          setEnrolledCourses([]);
          setLoading(false);
          return;
        }
        
        // Fetch course details for each enrollment
        const coursePromises = enrollments.map(async (enrollment) => {
          try {
            console.warn(`🔍 Fetching course details for course ID: ${enrollment.course_id}`);
            const course = await getCourseById(enrollment.course_id);
            const courseWithEnrollment = {
              ...course,
              enrollment_id: enrollment.id,
              enrolled_at: enrollment.enrolled_at,
              progress: enrollment.progress || 0,
              status: enrollment.status || 'active'
            };
            console.warn(`✅ Course details fetched:`, courseWithEnrollment);
            return courseWithEnrollment;
          } catch (error) {
            console.error(`❌ Failed to fetch course ${enrollment.course_id}:`, error);
            return null;
          }
        });

        const coursesWithDetails = await Promise.all(coursePromises);
        const validCourses = coursesWithDetails.filter(course => course !== null);
        
        console.warn('✅ Final enrolled courses with details:', validCourses);
        console.warn('📊 Number of valid courses:', validCourses.length);
        setEnrolledCourses(validCourses);
        
        // Generate watch times for each enrolled course
        const allWatchTimes = {};
        validCourses.forEach(course => {
          const courseWatchTimes = getUserLessonWatchTimes(user.id, course.id);
          Object.assign(allWatchTimes, courseWatchTimes);
        });
        setWatchTimes(allWatchTimes);
        
      } catch (error) {
        console.error('❌ Failed to fetch enrolled courses:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <p>Please log in to view your learning progress.</p>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading your enrolled courses...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning">
          <h4>Unable to load enrolled courses</h4>
          <p>{error}</p>
          <Button as={Link} to="/catalog" variant="primary">
            Browse Courses
          </Button>
        </div>
      </Container>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
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
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">My Learning Progress</h1>
      {enrolledCourses.map(course => {
        const lessons = getLessonsByCourse(course.id);
        const totalMinutes = lessons.reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
        const watchedMinutes = lessons.reduce((sum, l) => sum + (watchTimes[l.id] || 0), 0);
        const percent = totalMinutes ? Math.round((watchedMinutes / totalMinutes) * 100) : 0;
        return (
          <Card className="mb-4 shadow-sm" key={course.id}>
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <img src={course.thumbnail} alt={course.title} style={{width:60, height:40, objectFit:'cover', borderRadius:8, marginRight:16}} />
                <div>
                  <h4 className="mb-0">{course.title}</h4>
                  <small className="text-muted">{course.category} &bull; {course.level}</small>
                </div>
              </div>
              <ProgressBar now={percent} label={`${percent}%`} className="mb-3" />
              <Table size="sm" bordered hover>
                <thead>
                  <tr>
                    <th>Lesson</th>
                    <th>Watched (min)</th>
                    <th>Total (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map(lesson => (
                    <tr key={lesson.id}>
                      <td>{lesson.title}</td>
                      <td>{watchTimes[lesson.id] || 0}</td>
                      <td>{parseInt(lesson.duration) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="text-end text-muted">
                Watched: {watchedMinutes} / {totalMinutes} min
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </Container>
  );
}
