import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Tab, Nav, Card, Alert, Spinner, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatCourseData } from '../../services/courses';
import { getAllInstructors } from '../../services/admin';
import { getCourseCurriculum } from '../../services/lessons';
import { enrollUserInCourse, getUserEnrollments, getCourseEnrollmentCount } from '../../services/enrollment';
import Comments from '../../components/Comments';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const [realEnrollmentCount, setRealEnrollmentCount] = useState(0);
  const [loadingEnrollmentCount, setLoadingEnrollmentCount] = useState(true);

  // Review/Rating state
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.warn('🔍 Fetching curriculum for course ID:', courseId);
        
        // Fetch course curriculum (includes course details + lessons)
        const curriculumData = await getCourseCurriculum(parseInt(courseId));
        
        console.warn('📚 Curriculum data received:', curriculumData);
        
        // Set course data (format and attempt enrichment)
        let formattedCourse = formatCourseData(curriculumData.course);

        // If instructor is unknown but an instructor_id/user_id exists, try to enrich from admin instructors
        const instructorId = curriculumData?.course?.instructor_id || curriculumData?.course?.user_id || null;
        if ((formattedCourse.instructor_name === 'Unknown Instructor' || !formattedCourse.instructor_name) && instructorId) {
          try {
            const instructors = await getAllInstructors();
            const match = instructors.find(i => i.id === instructorId || String(i.id) === String(instructorId));
            if (match) {
              formattedCourse = {
                ...formattedCourse,
                instructor_name: match.name || match.username || formattedCourse.instructor_name,
                instructor: { id: match.id, name: match.name || match.username, email: match.email }
              };
            }
          } catch (e) {
            console.warn('❌ Failed to enrich instructor for course detail:', e?.message || e);
          }
        }

        // Set course data
        setCourse(formattedCourse);
        
        // Set lessons data
        setLessons(curriculumData.curriculum || []);
        
        // Set total lessons count
        setTotalLessons(curriculumData.totalLessons || curriculumData.curriculum?.length || 0);
        
        // Check enrollment status if user is authenticated
        if (isAuthenticated && user) {
          let userId = user?.id || user?.user_id || user?.ID;
          
          console.warn('🔍 Checking enrollment for user:', userId, 'course:', courseId);
          
          if (userId) {
            try {
              const enrollments = await getUserEnrollments(userId);
              console.warn('📚 All user enrollments:', enrollments);
              
              const enrolled = enrollments.some(enrollment => {
                const enrollmentCourseId = parseInt(enrollment.course_id);
                const currentCourseId = parseInt(courseId);
                console.warn(`Comparing enrollment course ${enrollmentCourseId} with current course ${currentCourseId}`);
                return enrollmentCourseId === currentCourseId;
              });
              
              setIsEnrolled(enrolled);
              console.warn('📋 Final enrollment status:', enrolled);
            } catch (enrollmentError) {
              console.warn('⚠️ Could not check enrollment status:', enrollmentError.message);
              setIsEnrolled(false);
            }
          }
        } else {
          console.warn('❌ User not authenticated - showing enroll button');
          setIsEnrolled(false);
        }
        
        console.warn('✅ Data loaded successfully - Lessons:', curriculumData.curriculum?.length || 0);
        
      } catch (err) {
        console.error('❌ Error fetching course curriculum:', err);
        setError(err.message);
        
        if (err.message === 'Course curriculum not found') {
          navigate('/not-found');
        }
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, navigate, isAuthenticated, user]);

  // Fetch real enrollment count
  useEffect(() => {
    const fetchEnrollmentCount = async () => {
      if (!courseId) return;
      
      try {
        setLoadingEnrollmentCount(true);
        const count = await getCourseEnrollmentCount(courseId);
        setRealEnrollmentCount(count);
      } catch (error) {
        console.error('Failed to fetch enrollment count:', error);
        setRealEnrollmentCount(0);
      } finally {
        setLoadingEnrollmentCount(false);
      }
    };

    fetchEnrollmentCount();
  }, [courseId]);

  // Listen for enrollment changes to refresh enrollment status
  useEffect(() => {
    const handleEnrollmentChange = async (event) => {
      const { courseId: enrolledCourseId, userId: enrolledUserId } = event.detail;
      
      // Only refresh if this is the current course and current user
      if (parseInt(enrolledCourseId) === parseInt(courseId) && 
          enrolledUserId === (user?.id || user?.user_id || user?.ID)) {
        console.warn('🔄 Enrollment change detected for current course, refreshing status...');
        setIsEnrolled(true);
      }
    };

    window.addEventListener('enrollmentChanged', handleEnrollmentChange);

    return () => {
      window.removeEventListener('enrollmentChanged', handleEnrollmentChange);
    };
  }, [courseId, user]);

  // Load reviews from localStorage
  useEffect(() => {
    if (!courseId) return;
    try {
      const stored = localStorage.getItem(`reviews_${courseId}`);
      if (stored) setReviews(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [courseId]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newRating || !newComment.trim()) return;
    setSubmittingReview(true);
    const review = {
      id: Date.now(),
      userId: user?.id || user?.user_id,
      userName: user?.name || user?.username || 'Anonymous',
      rating: newRating,
      comment: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${courseId}`, JSON.stringify(updated));
    setNewRating(0);
    setNewComment('');
    setSubmittingReview(false);
  };

  const deleteReview = (id) => {
    const updated = reviews.filter(r => r.id !== id);
    setReviews(updated);
    localStorage.setItem(`reviews_${courseId}`, JSON.stringify(updated));
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }
    
    if (isEnrolled) {
      // If already enrolled, navigate to the enrolled course view
      navigate('/student/my-courses');
      return;
    }
    
    // Show enrollment modal for confirmation
    setShowEnrollModal(true);
  };

  const confirmEnrollment = async () => {
    // Try to get user ID from different possible fields
    let userId = user?.id || user?.user_id || user?.ID;
    
    // Require authentication for enrollment
    if (!userId) {
      console.warn('⚠️ No authenticated user found');
      showAlert('Please login to enroll in courses', 'warning');
      return;
    }

    console.warn('🎯 Starting enrollment process...');
    console.warn('User object:', user);
    console.warn('User ID (resolved):', userId);
    console.warn('Course ID:', courseId);

    setEnrolling(true);
    try {
      const result = await enrollUserInCourse(userId, parseInt(courseId));
      console.warn('✅ Enrollment result:', result);
      
      setIsEnrolled(true);
      setShowEnrollModal(false);
      showAlert(`Successfully enrolled in ${course.title}! Redirecting to My Learning...`, 'success');
      
      // Refresh enrollment count
      try {
        const newCount = await getCourseEnrollmentCount(courseId);
        setRealEnrollmentCount(newCount);
      } catch (countError) {
        console.warn('Failed to refresh enrollment count:', countError);
      }
      
      // Force refresh of enrollments by dispatching custom event
      window.dispatchEvent(new CustomEvent('enrollmentChanged', {
        detail: { 
          userId: userId, 
          courseId: parseInt(courseId), 
          enrollment: result.enrollment,
          action: 'enrolled'
        }
      }));
      
      // Navigate to My Learning to immediately see the enrolled course
      setTimeout(() => {
        navigate(`/student/my-learning`);
      }, 1500);
      
    } catch (err) {
      console.error('❌ Enrollment error:', err);
      showAlert(`Error enrolling in course: ${err.message}`, 'danger');
    } finally {
      setEnrolling(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading course...</span>
            </Spinner>
            <p>Loading course details...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger" className="text-center">
              <h4>Unable to load course</h4>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={() => navigate('/catalog')}>
                Browse Other Courses
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // No course found
  if (!course) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="warning" className="text-center">
              <h4>Course not found</h4>
              <p>The course you&apos;re looking for doesn&apos;t exist.</p>
              <Button variant="outline-primary" onClick={() => navigate('/catalog')}>
                Browse Available Courses
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {alert && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert(null)} className="mb-4">
          {alert.message}
        </Alert>
      )}
      
      <Row>
        <Col lg={8}>
          <div className="position-relative mb-4 rounded-4 overflow-hidden shadow-lg">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="img-fluid w-100"
              style={{ height: '400px', objectFit: 'cover', filter: 'brightness(0.6)' }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-4" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)', pointerEvents: 'none' }}>
              <h1 className="text-white fw-bold mb-2" style={{ textShadow: '0 2px 8px #000' }}>{course.title}</h1>
              <div className="d-flex gap-2 mb-2">
                <Badge bg="primary" className="fs-6 px-3 py-1 rounded-pill">{course.category}</Badge>
                <Badge bg="secondary" className="fs-6 px-3 py-1 rounded-pill">{course.level}</Badge>
              </div>
              <div className="d-flex align-items-center mb-2">
                <img src='https://placehold.co/40x40?text=I' alt={course.instructor?.name || course.instructor_name || 'Instructor'} width="40" height="40" className="rounded-circle me-2 border border-2 border-white" />
                <span className="text-white fw-semibold">{course.instructor?.name || course.instructor_name || 'Instructor'}</span>
              </div>
              <div className="d-flex align-items-center">
                <div className="text-warning">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`bi bi-star${i < Math.round(parseFloat(course.rating || 0)) ? '-fill' : ''}`}></i>
                  ))}
                </div>
                <span className="text-white ms-2">{parseFloat(course.rating || 0).toFixed(1)} / 5</span>
                <span className="text-white ms-3">
                  <i className="bi bi-people me-1"></i>
                  {loadingEnrollmentCount ? '...' : realEnrollmentCount.toLocaleString()} students
                </span>
              </div>
            </div>
          </div>

          <Tab.Container defaultActiveKey="overview">
            <Nav variant="tabs" className="mb-3 rounded-3 overflow-auto">
              <Nav.Item>
                <Nav.Link eventKey="overview" className="fw-semibold">Overview</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="curriculum" className="fw-semibold">Curriculum</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reviews" className="fw-semibold">Reviews</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="overview">
                <div className="py-3">
                  <h4 className="fw-bold mb-3"><i className="bi bi-info-circle me-2"></i>About This Course</h4>
                  <p className="fs-5 text-muted">{course.description}</p>

                  <h4 className="fw-bold mt-4 mb-3"><i className="bi bi-lightbulb me-2"></i>What You&apos;ll Learn</h4>
                  <ul className="mb-4">
                    <li>Learn the fundamentals of the subject</li>
                    <li>Apply your knowledge to real-world projects</li>
                    <li>Gain practical experience through hands-on exercises</li>
                    <li>Master advanced concepts and techniques</li>
                  </ul>

                  <h4 className="fw-bold mb-3"><i className="bi bi-clipboard-check me-2"></i>Requirements</h4>
                  <ul>
                    <li>Basic understanding of the subject</li>
                    <li>Computer with internet connection</li>
                    <li>Willingness to learn and practice</li>
                  </ul>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="curriculum">
                <div className="py-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0 fw-bold"><i className="bi bi-list-ol me-2"></i>Course Content</h4>
                    <div className="text-muted">
                      {totalLessons} lessons • {course.duration || '10 weeks'}
                    </div>
                  </div>

                  {lessons && lessons.length > 0 ? (
                    <div className="list-group">
                      {lessons.map((lesson, index) => (
                        <div key={lesson.id || index} className="list-group-item list-group-item-action py-3">
                          <div className="d-flex align-items-start">
                            <div className="me-3">
                              <span className="badge bg-primary">{lesson.order_sequence || index + 1}</span>
                            </div>
                            <div className="flex-grow-1">
                              <h5 className="mb-1">{lesson.title}</h5>
                              <p className="mb-1 text-muted">{lesson.description || `Lesson ${lesson.order_sequence || index + 1} content`}</p>
                              <small className="text-secondary">
                                <i className="bi bi-clock me-1"></i>
                                {lesson.duration || '10 min'}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-journal-text display-4 text-muted"></i>
                      <h3 className="mt-3">No lessons available</h3>
                      <p>Check back soon for new content!</p>
                    </div>
                  )}
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="reviews">
                <div className="py-3">
                  {/* Aggregate Rating Summary */}
                  {(() => {
                    const avg = reviews.length
                      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                      : null;
                    const dist = [5, 4, 3, 2, 1].map(star => ({
                      star,
                      count: reviews.filter(r => r.rating === star).length,
                    }));
                    return (
                      <div className="mb-4 p-4 rounded-4 border">
                        <h5 className="fw-bold mb-3"><i className="bi bi-star-half me-2 text-warning"></i>Course Ratings</h5>
                        {reviews.length === 0 ? (
                          <p className="text-muted mb-0">No ratings yet. Be the first to review!</p>
                        ) : (
                          <div className="d-flex align-items-center gap-4 flex-wrap">
                            <div className="text-center">
                              <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, color: '#f5a623' }}>{avg}</div>
                              <div className="text-warning fs-5">
                                {[1,2,3,4,5].map(s => (
                                  <i key={s} className={`bi ${parseFloat(avg) >= s ? 'bi-star-fill' : parseFloat(avg) >= s - 0.5 ? 'bi-star-half' : 'bi-star'}`}></i>
                                ))}
                              </div>
                              <small className="text-muted">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</small>
                            </div>
                            <div className="flex-grow-1" style={{ minWidth: 200 }}>
                              {dist.map(({ star, count }) => (
                                <div key={star} className="d-flex align-items-center gap-2 mb-1">
                                  <span className="text-muted" style={{ width: 16, textAlign: 'right' }}>{star}</span>
                                  <i className="bi bi-star-fill text-warning" style={{ fontSize: '0.75rem' }}></i>
                                  <div className="progress flex-grow-1" style={{ height: 8, borderRadius: 4 }}>
                                    <div
                                      className="progress-bar bg-warning"
                                      style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                                    />
                                  </div>
                                  <span className="text-muted" style={{ width: 20, fontSize: '0.8rem' }}>{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Submit Review Form */}
                  {isAuthenticated ? (
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                      <Card.Body className="p-4">
                        <h6 className="fw-bold mb-3"><i className="bi bi-pencil-square me-2"></i>Write a Review</h6>
                        <form onSubmit={handleSubmitReview}>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Your Rating <span className="text-danger">*</span></label>
                            <div className="d-flex gap-1" style={{ fontSize: '2rem' }}>
                              {[1,2,3,4,5].map(star => (
                                <i
                                  key={star}
                                  className={`bi ${
                                    (hoverRating || newRating) >= star ? 'bi-star-fill text-warning' : 'bi-star text-secondary'
                                  }`}
                                  style={{ cursor: 'pointer', transition: 'color 0.15s' }}
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => setNewRating(star)}
                                />
                              ))}
                              {newRating > 0 && (
                                <span className="ms-2 align-self-center fs-6 text-muted">
                                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newRating]}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Your Review <span className="text-danger">*</span></label>
                            <textarea
                              className="form-control"
                              rows={4}
                              placeholder="Share your experience with this course..."
                              value={newComment}
                              onChange={e => setNewComment(e.target.value)}
                              maxLength={1000}
                            />
                            <div className="text-end text-muted" style={{ fontSize: '0.78rem' }}>{newComment.length}/1000</div>
                          </div>
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={!newRating || !newComment.trim() || submittingReview}
                          >
                            {submittingReview ? <><Spinner animation="border" size="sm" className="me-2" />Submitting...</> : <><i className="bi bi-send me-2"></i>Submit Review</>}
                          </Button>
                        </form>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Alert variant="info" className="rounded-4">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Sign in</strong> to leave a review.{' '}
                      <a href="/login" className="alert-link">Login here</a>
                    </Alert>
                  )}

                  {/* Reviews List */}
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-chat-quote me-2"></i>
                    {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
                  </h6>
                  {reviews.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-chat-dots" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                      <p className="mt-3">No reviews yet. Be the first!</p>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <Card key={review.id} className="border-0 shadow-sm rounded-4 mb-3">
                        <Card.Body className="p-3">
                          <div className="d-flex align-items-start gap-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                              style={{ width: 42, height: 42, background: '#6366f1', fontSize: '1rem' }}
                            >
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                                <span className="fw-semibold">{review.userName}</span>
                                <div className="d-flex align-items-center gap-2">
                                  <span className="text-warning">
                                    {[1,2,3,4,5].map(s => (
                                      <i key={s} className={`bi ${review.rating >= s ? 'bi-star-fill' : 'bi-star'}`} style={{ fontSize: '0.8rem' }}></i>
                                    ))}
                                  </span>
                                  <small className="text-muted">
                                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </small>
                                  {(user?.id === review.userId || user?.user_id === review.userId) && (
                                    <button
                                      className="btn btn-sm btn-outline-danger py-0 px-1"
                                      style={{ fontSize: '0.75rem' }}
                                      onClick={() => deleteReview(review.id)}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="mb-0 text-secondary" style={{ lineHeight: 1.6 }}>{review.comment}</p>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>

        <Col lg={4}>
          <div className="position-sticky" style={{ top: '2rem' }}>
            <Card className="shadow-lg rounded-4 border-0">
              <Card.Body>
                <div className="mb-3 text-center">
                  <h3 className="h2 mb-0 fw-bold text-success">Free</h3>
                </div>

                <div className="d-grid gap-2 mb-3">
                  <Button
                    variant={isEnrolled ? 'success' : 'primary'}
                    size="lg"
                    className="fw-semibold"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                      {enrolling ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <i className={`bi ${isEnrolled ? 'bi-play-circle' : 'bi-cart-plus'} me-2`}></i>
                          {isEnrolled ? 'View My Courses' : 'Enroll Now'}
                        </>
                      )}
                    </Button>
                </div>

                <div className="mb-3">
                  <h5 className="fw-bold mb-3">This course includes:</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-clock me-2 text-primary"></i>
                      Course length: {course.duration}
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-file-earmark-arrow-down me-2 text-info"></i>
                      Downloadable resources
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-patch-check me-2 text-success"></i>
                      Certificate of completion
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-infinity me-2 text-warning"></i>
                      Full lifetime access
                    </li>
                  </ul>
                </div>

                <hr />

                <div className="d-flex justify-content-between text-muted small">
                  <div>
                    <i className="bi bi-people me-1"></i>
                    {loadingEnrollmentCount ? '...' : realEnrollmentCount.toLocaleString()} students
                  </div>
                  <div className="text-warning">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`bi bi-star${i < Math.round(parseFloat(course.rating || 0)) ? '-fill' : ''}`}></i>
                    ))}
                    <span className="ms-1">{parseFloat(course.rating || 0).toFixed(1)}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Enrollment Confirmation Modal */}
      <Modal show={showEnrollModal} onHide={() => setShowEnrollModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-bookmark-plus me-2"></i>
            Enroll in Course
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {course && (
            <>
              <div className="text-center mb-4">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="img-fluid rounded"
                  style={{ maxHeight: '120px', objectFit: 'cover' }}
                />
              </div>
              
              <h5 className="text-center mb-3">{course.title}</h5>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Course Level:</span>
                  <Badge bg={course.level === 'beginner' ? 'success' : 
                            course.level === 'intermediate' ? 'warning' : 'info'}>
                    {course.level}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Duration:</span>
                  <span>{course.duration}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Lessons:</span>
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Price:</span>
                  <span className="text-success fw-bold">Free</span>
                </div>
              </div>

              <Alert variant="info" className="mb-3">
                <i className="bi bi-info-circle me-2"></i>
                By enrolling, you&apos;ll get lifetime access to all course materials and updates.
              </Alert>

              <p className="text-muted text-center">
                Ready to start your learning journey?
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEnrollModal(false)} disabled={enrolling}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmEnrollment} disabled={enrolling}>
            {enrolling ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Enrolling...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Confirm Enrollment
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
