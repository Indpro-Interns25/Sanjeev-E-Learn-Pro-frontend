import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Card, Table, Button, Badge, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { getAdminStats, getAllCoursesAdmin, getAllLessonsAdmin, getAllStudents, getAllInstructors, deleteCourse, deleteLesson, createInstructor, updateInstructor, deleteInstructor, deleteStudent } from '../services/admin';
import { createLesson, updateLesson } from '../services/lessons';
import { createCourse } from '../services/courses';
import { getUserEnrollments } from '../services/enrollment';
import { toDisplayText } from '../utils/displayValue';

export default function AdminLanding() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [alert, setAlert] = useState(null);
  
  // Data states
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalEnrollments: 0,
    activeUsers: 0,
    recentActivity: []
  });
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [statsLastUpdated, setStatsLastUpdated] = useState(null);
  
  // Reports loading state
  const [reportsLoading, setReportsLoading] = useState(false);
  
  // Form states
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    courseId: '',
    customCourseName: '',
    duration: '',
    orderSequence: '',
    videoUrl: '',
    status: 'published'
  });

  const [instructorForm, setInstructorForm] = useState({
    name: '',
    email: ''
  });


  const [editingInstructorId, setEditingInstructorId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      // Redirect to login if no token is found
      console.warn('⚠️  No admin token found, redirecting to login');
      navigate('/admin-login', { replace: true });
      return;
    }
    fetchInitialData();
  }, [navigate]);

  // Load reports data when reports tab is active
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReportsData();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch admin data in parallel - only use real backend data
      const [adminStats, coursesData, lessonsData, studentsData, instructorsData] = await Promise.all([
        getAdminStats(),
        getAllCoursesAdmin().catch((error) => {
          console.warn('Courses API unavailable:', error.message);
          return [];
        }),
        getAllLessonsAdmin().catch((error) => {
          console.warn('Lessons API unavailable:', error.message);
          return [];
        }),
        getAllStudents().catch((error) => {
          console.warn('Students API unavailable:', error.message);
          return [];
        }),
        getAllInstructors().catch((error) => {
          console.warn('Instructors API unavailable:', error.message);
          return [];
        })
      ]);
      
      setStats(adminStats);
      setCourses(coursesData);
      setLessons(lessonsData);
      setStudents(studentsData);
      setInstructors(instructorsData);
      
      // Fetch individual enrollment counts for each student
      const studentsWithEnrollmentCounts = await Promise.all(
        studentsData.map(async (student) => {
          try {
            const userEnrollments = await getUserEnrollments(student.id);
            return {
              ...student,
              enrolled_courses_count: userEnrollments.length
            };
          } catch (error) {
            console.warn(`Failed to fetch enrollments for student ${student.id}:`, error);
            return {
              ...student,
              enrolled_courses_count: 0
            };
          }
        })
      );
      setStudents(studentsWithEnrollmentCounts);
      
      // Update stats with actual counts from fetched data
      const updatedStats = {
        ...adminStats,
        totalStudents: studentsData.length,
        totalInstructors: instructorsData.length,
        totalCourses: coursesData.length,
        totalLessons: lessonsData.length,
        // Keep enrollments sourced from /api/admin/stats to avoid stale or missing per-student aggregates.
        totalEnrollments: Number(adminStats?.totalEnrollments) || 0,
        activeUsers: Number(adminStats?.activeUsers) || (
          studentsData.filter(student => student.status === 'active').length +
          instructorsData.filter(instructor => instructor.status === 'active').length
        )
      };
      setStats(updatedStats);
      setStatsLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportsData = async () => {
    try {
      setReportsLoading(true);
      // Simply refresh the main data for reports
      await fetchInitialData();
    } catch (error) {
      console.error('Error refreshing reports data:', error);
      showAlert('Failed to refresh reports data', 'danger');
    } finally {
      setReportsLoading(false);
    }
  };

  // Helper to get a display string for lesson duration using backend fields
  const getLessonDisplayDuration = (lesson) => {
    if (!lesson) return '';
    if (lesson.duration_display) return lesson.duration_display;
    if (lesson.duration_number || lesson.duration_number === 0) return `${lesson.duration_number} minutes`;
    if (lesson.duration) {
      // If duration is a numeric string or already a human readable string
      const d = String(lesson.duration).trim();
      if (/^\d+$/.test(d)) return `${d} minutes`;
      return d;
    }
    return '';
  };

    const handleAction = (action, item) => {
      setSelectedItem(item);
      setModalType(action);
    
      if (action === 'editLesson') {
        setLessonForm({
          title: item.title,
          description: item.description,
          courseId: item.course_id,
          duration: item.duration,
          orderSequence: item.order_sequence,
          videoUrl: item.video_url || '',
          status: item.status || 'published'
        });
      } else if (action === 'createLesson') {
        // Reset form for creating new lesson
        setLessonForm({
          title: '',
          description: '',
          courseId: '',
          duration: '',
          orderSequence: '',
          videoUrl: '',
          status: 'draft'
        });
      } else if (action === 'createInstructor') {
        // Reset form for creating new instructor
        setInstructorForm({
          name: '',
          email: '',
          specialization: '',
          bio: '',
          experience: '',
          status: 'active'
        });
        setEditingInstructorId(null);
      }
    
      setShowModal(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
  if (modalType === 'createLesson') {
        let courseId = lessonForm.courseId;
        
        // If "Other" is selected, create a new course first
        if (lessonForm.courseId === 'other') {
          if (!lessonForm.customCourseName.trim()) {
            throw new Error('Please enter a course name');
          }
          
          const newCourseData = {
            title: lessonForm.customCourseName.trim(),
            description: `Course for ${lessonForm.customCourseName.trim()}`,
            category: 'General',
            thumbnail: 'https://via.placeholder.com/400x300/007bff/ffffff?text=Course',
            duration: 'Self-paced',
            status: 'published'
          };
          
          const newCourse = await createCourse(newCourseData);
          courseId = newCourse.id;
          
          // Refresh courses list to include the new course
          const updatedCourses = await getAllCoursesAdmin();
          setCourses(updatedCourses);
        }
        
        // Call the real API to create a lesson
        const lessonData = {
          title: lessonForm.title,
          description: lessonForm.description,
          course_id: parseInt(courseId),
          duration: parseInt(lessonForm.duration),
          order_sequence: parseInt(lessonForm.orderSequence),
          video_url: lessonForm.videoUrl,
          status: lessonForm.status || 'draft'
        };
        
        await createLesson(lessonData);
        showAlert(
          lessonForm.courseId === 'other' 
            ? `New course "${lessonForm.customCourseName}" and lesson created successfully!` 
            : 'Lesson created successfully!', 
          'success'
        );
        
      } else if (modalType === 'editLesson') {
        // Call the real API to update a lesson
        const lessonData = {
          title: lessonForm.title,
          description: lessonForm.description,
          course_id: parseInt(lessonForm.courseId),
          duration: parseInt(lessonForm.duration),
          order_sequence: parseInt(lessonForm.orderSequence),
          video_url: lessonForm.videoUrl,
          status: lessonForm.status || 'draft'
        };
        
        await updateLesson(selectedItem.id, lessonData);
        showAlert('Lesson updated successfully!', 'success');
        
      } else if (modalType === 'createInstructor') {
        // Call the API to create a new instructor
        const instructorData = {
          name: instructorForm.name,
          email: instructorForm.email,
          password: 'defaultPassword123', // You might want to generate this or ask for it
          role: 'instructor'
        };

        if (editingInstructorId) {
          // Update existing instructor
          await updateInstructor(editingInstructorId, instructorData);
          showAlert('Instructor updated successfully!', 'success');
        } else {
          await createInstructor(instructorData);
          showAlert('Instructor created successfully!', 'success');
        }
      }

      // Student create / edit
      // Close modal and reset forms
      setShowModal(false);
    setLessonForm({ title: '', description: '', courseId: '', customCourseName: '', duration: '', orderSequence: '', videoUrl: '', status: 'draft' });
    setInstructorForm({ name: '', email: '', specialization: '', bio: '', experience: '', status: 'active' });
    setEditingInstructorId(null);
      
      // Refresh data to show changes
      await fetchInitialData();
      
    } catch (error) {
      console.error('Error with lesson operation:', error);
      showAlert(`Error: ${error.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin-login', { replace: true });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">Loading...</span>
        </div>
      );
    }

    switch(activeTab) {
      case 'overview':
        return (
          <div>
            <div className="row mb-4">
              <div className="col-md-3">
                <Card className="text-center bg-primary text-white">
                  <Card.Body>
                    <h3>{stats?.totalCourses || 0}</h3>
                    <p>Total Courses</p>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="text-center bg-success text-white">
                  <Card.Body>
                    <h3>{stats?.totalLessons || 0}</h3>
                    <p>Total Lessons</p>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="text-center bg-info text-white">
                  <Card.Body>
                    <h3>{stats?.totalStudents || 0}</h3>
                    <p>Total Students</p>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card className="text-center bg-warning text-white">
                  <Card.Body>
                    <h3>{stats?.totalInstructors || 0}</h3>
                    <p>Total Instructors</p>
                  </Card.Body>
                </Card>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <Card className="shadow-sm">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0"><i className="fas fa-chart-line me-2"></i>System Overview</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="row g-4">
                      {/* Platform Status removed per request */}
                      <div className="col-md-4">
                        <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                          <div className="display-6 text-primary mb-2">
                            <i className="fas fa-book-open"></i>
                          </div>
                          <h6 className="text-muted mb-1">Total Content</h6>
                          <h4 className="text-primary mb-0">{(stats?.totalCourses || 0) + (stats?.totalLessons || 0)}</h4>
                          <small className="text-muted">Courses & Lessons</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                          <div className="display-6 text-info mb-2">
                            <i className="fas fa-users"></i>
                          </div>
                          <h6 className="text-muted mb-1">Active Users</h6>
                          <h4 className="text-info mb-0">{(stats?.totalStudents || 0) + (stats?.totalInstructors || 0)}</h4>
                          <small className="text-muted">Students & Instructors</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                          <div className="display-6 text-warning mb-2">
                            <i className="fas fa-clock"></i>
                          </div>
                          <h6 className="text-muted mb-1">Last Updated</h6>
                          <Badge bg="warning" text="dark" className="px-3 py-2">
                            {new Date().toLocaleDateString()}
                          </Badge>
                          <div><small className="text-muted">{new Date().toLocaleTimeString()}</small></div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        );

                      <Button 
                        variant="outline-success" 
                        onClick={() => setActiveSection('lessons')}
                      >
                        � Manage Lessons
                      </Button>



      case 'courses':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Course Management</h4>
              <Button variant="primary" onClick={() => navigate('/admin/courses/add')}>
                <i className="fas fa-plus"></i> Add New Course
              </Button>
            </div>

            <Card>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Level</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length > 0 ? courses.map((course) => (
                      <tr key={course.id}>
                        <td>
                          <div>
                            <strong>{course.title}</strong>
                            <br />
                            <small className="text-muted">{course.description?.substring(0, 50)}...</small>
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary">{toDisplayText(course.category, 'General')}</Badge>
                        </td>
                        <td>
                          <Badge bg={course.level === 'beginner' ? 'success' : course.level === 'intermediate' ? 'warning' : 'danger'}>
                            {toDisplayText(course.level, 'Beginner')}
                          </Badge>
                        </td>
                        <td>
                          {course.isFree === true ? 'Free' : 'Free'}
                        </td>
                        <td>
                          <Badge bg={course.status === 'published' ? 'success' : 'warning'}>
                            {course.status || 'draft'}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => navigate('/admin/courses/add', { state: { courseId: course.id } })}
                          >
                            Edit
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleAction('deleteCourse', course)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">No courses found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        );

      case 'lessons':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Lesson Management</h4>
              <Button variant="primary" onClick={() => handleAction('createLesson')}>
                <i className="fas fa-plus"></i> Add New Lesson
              </Button>
            </div>

            <Card>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Course</th>
                      <th>Duration</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.length > 0 ? lessons.map((lesson) => (
                      <tr key={lesson.id}>
                        <td>
                          <div>
                            <strong>{toDisplayText(lesson.title, 'Untitled Lesson')}</strong>
                            <br />
                            <small className="text-muted">{lesson.description?.substring(0, 50)}...</small>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info">{lesson.course_title || 'Unknown Course'}</Badge>
                        </td>
                        <td>{getLessonDisplayDuration(lesson)}</td>
                        <td>#{lesson.order_sequence}</td>
                        <td>
                          <Badge bg={lesson.status === 'published' ? 'success' : 'warning'}>
                            {lesson.status || 'published'}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1" 
                            onClick={() => handleAction('editLesson', lesson)}
                            title="Edit lesson"
                          >
                            <i className="bi bi-pencil"></i> Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleAction('deleteLesson', lesson)}
                            title="Delete lesson"
                          >
                            <i className="bi bi-trash"></i> Delete
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">No lessons found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        );

      case 'students':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4>Student Management</h4>
                <small className="text-muted">Basic student information overview</small>
              </div>
            </div>

            <Card>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Enrolled Courses</th>
                      <th>Join Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? students.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                              <i className="fas fa-user text-primary"></i>
                            </div>
                            <div>
                              <strong>{student.name || student.username}</strong>
                              <div><small className="text-muted">ID: {student.id}</small></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            {student.email}
                            <div><small className="text-muted">Contact Information</small></div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                              <i className="fas fa-book text-success"></i>
                            </div>
                            <div>
                              <strong className="text-success">{student.enrolled_courses_count || 0}</strong>
                              <div><small className="text-muted">Course{(student.enrolled_courses_count || 0) !== 1 ? 's' : ''} Enrolled</small></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            {new Date(student.created_at || Date.now()).toLocaleDateString()}
                            <div><small className="text-muted">Registration Date</small></div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={student.status === 'blocked' ? 'danger' : 'success'}>
                            {student.status === 'blocked' ? 'Blocked' : 'Active'}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex">
                            <Button variant="outline-danger" size="sm" onClick={async () => {
                              try {
                                setLoading(true);
                                await deleteStudent(student.id);
                                showAlert('Student deleted successfully!', 'success');
                                await fetchInitialData();
                              } catch (err) {
                                console.error('Failed to delete student:', err);
                                showAlert('Failed to delete student: ' + (err.message || err), 'danger');
                              } finally {
                                setLoading(false);
                              }
                            }}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">No students found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        );

      case 'instructors':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4>Instructor Management</h4>
                <small className="text-muted">Basic instructor information overview</small>
              </div>
              <Button variant="primary" onClick={() => handleAction('createInstructor')}>
                <i className="fas fa-plus"></i> Add New Instructor
              </Button>
            </div>

            <Card>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Total Courses</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.length > 0 ? instructors.map((instructor) => (
                      <tr key={instructor.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-2">
                              <i className="fas fa-chalkboard-teacher text-warning"></i>
                            </div>
                            <div>
                              <strong>{instructor.name || instructor.username}</strong>
                              <div><small className="text-muted">ID: {instructor.id}</small></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            {instructor.email}
                            <div><small className="text-muted">Contact Information</small></div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <Badge bg="primary" className="px-2 py-1">
                              {instructor.role || 'instructor'}
                            </Badge>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                              <i className="fas fa-book text-success"></i>
                            </div>
                            <div>
                              <strong className="text-success">{instructor.total_courses || 0}</strong>
                              <div><small className="text-muted">Course{(instructor.total_courses || 0) !== 1 ? 's' : ''} Created</small></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => {
                                // Prefill form and open modal for editing
                                setInstructorForm({
                                  name: instructor.name || '',
                                  email: instructor.email || '',
                                  specialization: instructor.specialization || '',
                                  bio: instructor.bio || '',
                                  experience: instructor.experience || '',
                                  status: instructor.status || 'active'
                                });
                                setEditingInstructorId(instructor.id);
                                handleAction('createInstructor', instructor);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  await deleteInstructor(instructor.id);
                                  showAlert('Instructor deleted successfully!', 'success');
                                  await fetchInitialData();
                                } catch (err) {
                                  console.error('Failed to delete instructor:', err);
                                  showAlert('Failed to delete instructor: ' + (err.message || err), 'danger');
                                } finally {
                                  setLoading(false);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          <div className="py-5">
                            <div className="display-1 text-muted mb-3">
                              <i className="fas fa-chalkboard-teacher"></i>
                            </div>
                            <h5 className="text-muted mb-2">No Instructors Found</h5>
                            <p className="text-muted mb-0">Instructors will appear here when they are added to the platform</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        );

      case 'reports':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>Reports & Analytics
              </h4>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={fetchReportsData}
                disabled={reportsLoading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                {reportsLoading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>

            {reportsLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" variant="primary" />
                <p className="text-muted mt-3">Loading analytics data...</p>
              </div>
            ) : (
              <>
                {/* Basic Stats Overview */}
                <div className="row mb-4">
                  <div className="col-lg-3 col-md-6 mb-3">
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Body className="text-center p-4">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3 d-inline-flex">
                          <i className="bi bi-book-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                        <h4 className="text-primary mb-1">{stats?.totalCourses || 0}</h4>
                        <p className="text-muted mb-0 small">Total Courses</p>
                      </Card.Body>
                    </Card>
                  </div>

                  <div className="col-lg-3 col-md-6 mb-3">
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Body className="text-center p-4">
                        <div className="bg-success bg-opacity-10 rounded-circle p-3 mb-3 d-inline-flex">
                          <i className="bi bi-people-fill text-success" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                        <h4 className="text-success mb-1">{stats?.totalStudents || 0}</h4>
                        <p className="text-muted mb-0 small">Total Students</p>
                      </Card.Body>
                    </Card>
                  </div>

                  <div className="col-lg-3 col-md-6 mb-3">
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Body className="text-center p-4">
                        <div className="bg-info bg-opacity-10 rounded-circle p-3 mb-3 d-inline-flex">
                          <i className="bi bi-person-check-fill text-info" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                        <h4 className="text-info mb-1">{stats?.totalInstructors || 0}</h4>
                        <p className="text-muted mb-0 small">Total Instructors</p>
                      </Card.Body>
                    </Card>
                  </div>

                  <div className="col-lg-3 col-md-6 mb-3">
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Body className="text-center p-4">
                        <div className="bg-warning bg-opacity-10 rounded-circle p-3 mb-3 d-inline-flex">
                          <i className="bi bi-journal-bookmark-fill text-warning" style={{ fontSize: '1.5rem' }}></i>
                        </div>
                        <h4 className="text-warning mb-1">{stats?.totalEnrollments || 0}</h4>
                        <p className="text-muted mb-0 small">Total Enrollments</p>
                        <small className="text-muted d-block mt-1">
                          Updated {statsLastUpdated ? statsLastUpdated.toLocaleTimeString() : '--:--:--'}
                        </small>
                      </Card.Body>
                    </Card>
                  </div>
                </div>

                {/* Platform Summary */}
                <div className="row mb-4">
                  <div className="col-lg-8 mb-4">
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="bg-light border-0">
                        <h6 className="mb-0">
                          <i className="bi bi-speedometer2 me-2"></i>Platform Overview
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="row g-3">
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded p-2 me-3">
                                <i className="bi bi-play-circle text-primary"></i>
                              </div>
                              <div>
                                <h6 className="mb-0">{stats?.totalLessons || 0}</h6>
                                <small className="text-muted">Total Lessons</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <div className="bg-success bg-opacity-10 rounded p-2 me-3">
                                <i className="bi bi-check-circle text-success"></i>
                              </div>
                              <div>
                                <h6 className="mb-0">{courses.filter(c => c.status === 'published').length || 0}</h6>
                                <small className="text-muted">Published Courses</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <div className="bg-info bg-opacity-10 rounded p-2 me-3">
                                <i className="bi bi-person-workspace text-info"></i>
                              </div>
                              <div>
                                <h6 className="mb-0">{instructors.filter(i => i.status === 'active').length || instructors.length}</h6>
                                <small className="text-muted">Active Instructors</small>
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <div className="bg-warning bg-opacity-10 rounded p-2 me-3">
                                <i className="bi bi-graph-up text-warning"></i>
                              </div>
                              <div>
                                <h6 className="mb-0">{stats?.activeUsers || 0}</h6>
                                <small className="text-muted">Active Users</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>

                  <div className="col-lg-4 mb-4">
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="bg-light border-0">
                        <h6 className="mb-0">
                          <i className="bi bi-activity me-2"></i>Quick Stats
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <div className="text-center">
                          <div className="bg-success bg-opacity-10 rounded-circle p-4 mb-3 d-inline-flex">
                            <i className="bi bi-mortarboard-fill text-success" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h3 className="text-success mb-1">
                            {((stats?.totalEnrollments || 0) / Math.max(stats?.totalCourses || 1, 1)).toFixed(1)}
                          </h3>
                          <p className="text-muted mb-0">Average Enrollments per Course</p>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </div>

                {/* Recent Activity */}
                {stats?.recentActivity && stats.recentActivity.length > 0 && (
                  <div className="row">
                    <div className="col-12">
                      <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light border-0">
                          <h6 className="mb-0">
                            <i className="bi bi-clock-history me-2"></i>Recent Activity
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <div className="list-group list-group-flush">
                            {stats.recentActivity.slice(0, 5).map((activity, index) => (
                              <div key={index} className="list-group-item border-0 px-0">
                                <div className="d-flex align-items-center">
                                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                    <i className="bi bi-bell text-primary"></i>
                                  </div>
                                  <div className="flex-grow-1">
                                    <h6 className="mb-1">{activity.title || activity.description}</h6>
                                    <small className="text-muted">{activity.description || activity.date}</small>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Empty State when no activity */}
                {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                  <div className="row">
                    <div className="col-12">
                      <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center py-5">
                          <div className="bg-light rounded-circle p-4 mb-3 d-inline-flex">
                            <i className="bi bi-graph-up text-muted" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <h5 className="text-muted mb-2">Analytics Ready</h5>
                          <p className="text-muted mb-0">
                            Reports will populate automatically as users interact with your platform.
                            <br />
                            <small>Data is fetched directly from your backend API.</small>
                          </p>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Container fluid className="p-0" style={{ height: '100vh' }}>
      {alert && (
        <Alert 
          variant={alert.type} 
          className="position-fixed top-0 end-0 m-3" 
          style={{ 
            zIndex: 1050, 
            maxWidth: '400px',
            whiteSpace: 'pre-line' // This allows \n to create new lines
          }}
          dismissible 
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}
      
      <Row className="g-0" style={{ height: '100%' }}>
        {/* Sidebar */}
        <Col md={2} className="bg-dark text-white" style={{ height: '100vh', overflowY: 'auto' }}>
          <div className="p-3">
            <h4 className="text-center mb-4">
              <i className="bi bi-mortarboard"></i> Admin Panel
            </h4>
            
            <Nav className="flex-column">
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'overview' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('overview')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-speedometer2 me-2"></i>Overview
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'courses' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('courses')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-journal-bookmark me-2"></i>Courses
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'lessons' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('lessons')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-play-circle me-2"></i>Lessons
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'students' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('students')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-people me-2"></i>Students
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'instructors' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('instructors')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-person-check me-2"></i>Instructors
              </Nav.Link>
              
              <Nav.Link 
                className={`text-white mb-2 ${activeTab === 'reports' ? 'bg-primary rounded' : ''}`}
                onClick={() => setActiveTab('reports')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-graph-up me-2"></i>Reports
              </Nav.Link>
              
              <hr className="my-3" />
              
              <Nav.Link 
                className="text-danger"
                onClick={handleLogout}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </Nav.Link>
            </Nav>
          </div>
        </Col>

        {/* Main Content */}
        <Col md={10} className="p-4" style={{ height: '100vh', overflowY: 'auto' }}>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {renderContent()}
        </Col>
      </Row>

      {/* Modal for Create/Edit Forms */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType?.includes('create') ? 'Create' : modalType?.includes('edit') ? 'Edit' : 'Manage'}{' '}
            {modalType?.includes('Course') ? 'Course' : modalType?.includes('Lesson') ? 'Lesson' : modalType?.includes('Instructor') ? 'Instructor' : 'Item'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(modalType === 'createLesson' || modalType === 'editLesson') && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Lesson Title</Form.Label>
                <Form.Control
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Course</Form.Label>
                <Form.Select
                  value={lessonForm.courseId}
                  onChange={(e) => setLessonForm({...lessonForm, courseId: e.target.value, customCourseName: ''})}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                  <option value="other">Other (Create New Course)</option>
                </Form.Select>
              </Form.Group>
              
              {lessonForm.courseId === 'other' && (
                <Form.Group className="mb-3">
                  <Form.Label>New Course Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={lessonForm.customCourseName}
                    onChange={(e) => setLessonForm({...lessonForm, customCourseName: e.target.value})}
                    placeholder="Enter new course name"
                    required
                  />
                  <Form.Text className="text-muted">
                    This will create a new course with the lesson
                  </Form.Text>
                </Form.Group>
              )}
              
              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Order Sequence</Form.Label>
                <Form.Control
                  type="number"
                  value={lessonForm.orderSequence}
                  onChange={(e) => setLessonForm({...lessonForm, orderSequence: e.target.value})}
                  required
                  min="1"
                  placeholder="e.g., 1, 2, 3..."
                />
                <Form.Text className="text-muted">
                  The order in which this lesson appears in the course (1 = first lesson)
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={lessonForm.status || 'draft'}
                  onChange={(e) => setLessonForm({...lessonForm, status: e.target.value})}
                  required
                >
                  <option value="draft">Draft (Hidden from students)</option>
                  <option value="published">Published (Visible to students)</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Draft lessons are hidden from students. Published lessons are visible.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Video URL</Form.Label>
                <Form.Control
                  type="url"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <Form.Text className="text-muted">
                  Optional: YouTube, Vimeo, or other video platform URL
                </Form.Text>
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      {modalType === 'createLesson' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    modalType === 'createLesson' ? 'Create Lesson' : 'Update Lesson'
                  )}
                </Button>
              </div>
            </Form>
          )}

          {modalType === 'createInstructor' && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={instructorForm.name}
                  onChange={(e) => setInstructorForm({...instructorForm, name: e.target.value})}
                  placeholder="Enter instructor's full name"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  value={instructorForm.email}
                  onChange={(e) => setInstructorForm({...instructorForm, email: e.target.value})}
                  placeholder="Enter email address"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Specialization</Form.Label>
                <Form.Select
                  value={instructorForm.specialization}
                  onChange={(e) => setInstructorForm({...instructorForm, specialization: e.target.value})}
                >
                  <option value="">Select specialization</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="DevOps">DevOps</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Database Management">Database Management</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="General">General</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={instructorForm.bio}
                  onChange={(e) => setInstructorForm({...instructorForm, bio: e.target.value})}
                  placeholder="Brief description about the instructor"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Years of Experience</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="50"
                  value={instructorForm.experience}
                  onChange={(e) => setInstructorForm({...instructorForm, experience: e.target.value})}
                  placeholder="Years of teaching/industry experience"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={instructorForm.status}
                  onChange={(e) => setInstructorForm({...instructorForm, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending Approval</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Creating Instructor...
                    </>
                  ) : (
                    editingInstructorId ? 'Update Instructor' : 'Create Instructor'
                  )}
                </Button>
              </div>
            </Form>
          )}


          {(modalType === 'deleteCourse' || modalType === 'deleteLesson') && (
            <div>
              <p>Are you sure you want to delete this {modalType?.includes('Course') ? 'course' : 'lesson'}?</p>
              <p><strong>{selectedItem?.title}</strong></p>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={async () => {
                    try {
                      setLoading(true);
                      
                      if (modalType === 'deleteCourse') {
                        await deleteCourse(selectedItem.id);
                        showAlert('Course deleted successfully!');
                      } else if (modalType === 'deleteLesson') {
                        await deleteLesson(selectedItem.id);
                        showAlert('Lesson deleted successfully!');
                      }
                      
                      setShowModal(false);
                      fetchInitialData(); // Refresh data
                    } catch (error) {
                      console.error('Delete error:', error);
                      
                      // Show detailed error message
                      let errorMessage = error.message;
                      if (error.message.includes('404') || error.message.includes('not found')) {
                        errorMessage = `❌ API Error: The delete endpoint is not implemented on the backend server. Please ask the backend developer to add the DELETE route for ${modalType === 'deleteCourse' ? 'courses' : 'lessons'}.`;
                      }
                      
                      showAlert(errorMessage, 'danger');
                      setShowModal(false); // Close modal even on error
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
