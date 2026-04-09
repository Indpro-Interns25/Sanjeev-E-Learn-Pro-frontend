import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getAllStudents, deleteStudent, blockStudent, unblockStudent, assignCourseToStudent, getCoursesList } from '../services/admin';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  
  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Assign course modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      setStudents(data || []);
    } catch (err) {
      showAlert('Failed to fetch students: ' + (err.message || err), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getCoursesList();
      setCourses(data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Block student
  const handleBlockStudent = async (studentId) => {
    try {
      setLoading(true);
      await blockStudent(studentId);
      showAlert('Student blocked successfully!', 'success');
      await fetchStudents();
    } catch (err) {
      showAlert('Failed to block student: ' + (err.message || err), 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Unblock student
  const handleUnblockStudent = async (studentId) => {
    try {
      setLoading(true);
      await unblockStudent(studentId);
      showAlert('Student unblocked successfully!', 'success');
      await fetchStudents();
    } catch (err) {
      showAlert('Failed to unblock student: ' + (err.message || err), 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Delete confirmation modal handlers
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteStudent(studentToDelete.id);
      showAlert('Student deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
      await fetchStudents();
    } catch (err) {
      showAlert('Failed to delete student: ' + (err.message || err), 'danger');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Assign course modal handlers
  const handleAssignClick = (student) => {
    setSelectedStudent(student);
    setSelectedCourse('');
    setShowAssignModal(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedCourse) {
      showAlert('Please select a course', 'warning');
      return;
    }

    try {
      setAssignLoading(true);
      await assignCourseToStudent(selectedStudent.id, selectedCourse);
      showAlert('Course assigned to student successfully!', 'success');
      setShowAssignModal(false);
      setSelectedStudent(null);
      setSelectedCourse('');
      await fetchStudents();
    } catch (err) {
      showAlert('Failed to assign course: ' + (err.message || err), 'danger');
    } finally {
      setAssignLoading(false);
    }
  };

  const getStatusBadge = (student) => {
    const status = student.status || 'active';
    if (status === 'blocked' || status === 'inactive') {
      return <Badge bg="danger">Blocked</Badge>;
    }
    return <Badge bg="success">Active</Badge>;
  };

  const isStudentBlocked = (student) => {
    return (student.status || 'active') === 'blocked' || (student.status || 'active') === 'inactive';
  };

  if (loading && students.length === 0) {
    return (
      <Container className="p-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading students...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2>Student Management</h2>
          <p className="text-muted">Manage student accounts, block/unblock, and assign courses</p>
        </Col>
      </Row>

      {/* Alert */}
      {alert && (
        <Row className="mb-3">
          <Col>
            <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
              {alert.message}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Students Table */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead className="table-light">
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Enrolled Courses</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                                <i className="fas fa-user text-primary"></i>
                              </div>
                              <div>
                                <strong>{student.name || student.username || 'N/A'}</strong>
                                <div><small className="text-muted">ID: {student.id}</small></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              {student.email || 'N/A'}
                              <div><small className="text-muted">Contact</small></div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                                <i className="fas fa-book text-success"></i>
                              </div>
                              <div>
                                <strong className="text-success">{student.enrolled_courses_count || 0}</strong>
                                <div><small className="text-muted">Course{(student.enrolled_courses_count || 0) !== 1 ? 's' : ''}</small></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(student)}
                          </td>
                          <td>
                            <div>
                              {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                              <div><small className="text-muted">Registration</small></div>
                            </div>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              {isStudentBlocked(student) ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleUnblockStudent(student.id)}
                                  title="Unblock this student"
                                  disabled={loading}
                                >
                                  <i className="fas fa-check me-1"></i> Unblock
                                </Button>
                              ) : (
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleBlockStudent(student.id)}
                                  title="Block this student"
                                  disabled={loading}
                                >
                                  <i className="fas fa-ban me-1"></i> Block
                                </Button>
                              )}
                              
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleAssignClick(student)}
                                title="Assign a course to this student"
                                disabled={loading}
                              >
                                <i className="fas fa-graduation-cap me-1"></i> Assign
                              </Button>
                              
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(student)}
                                title="Delete this student"
                                disabled={loading}
                              >
                                <i className="fas fa-trash me-1"></i> Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          <i className="fas fa-inbox fa-2x mb-3 d-block opacity-50"></i>
                          No students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {students.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <small className="text-muted">
                    Total Students: <strong>{students.length}</strong>
                  </small>
                  <Button variant="outline-primary" size="sm" onClick={fetchStudents} disabled={loading}>
                    <i className="fas fa-sync-alt me-1"></i> Refresh
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Are you sure you want to delete <strong>{studentToDelete?.name || studentToDelete?.username || 'this student'}</strong>?
          </p>
          <Alert variant="warning" className="mb-0">
            <i className="fas fa-exclamation-triangle me-2"></i>
            This action cannot be undone. All associated data will be deleted.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <i className="fas fa-trash me-2"></i> Delete Student
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Assign Course Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Assigning course to: <strong>{selectedStudent?.name || selectedStudent?.username || 'Student'}</strong>
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Select Course</Form.Label>
            <Form.Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={assignLoading}
            >
              <option value="">-- Choose a course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title || course.name || `Course ${course.id}`}
                </option>
              ))}
            </Form.Select>
            {courses.length === 0 && (
              <small className="text-warning d-block mt-2">
                <i className="fas fa-exclamation-circle me-1"></i>
                No courses available
              </small>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAssignModal(false)}
            disabled={assignLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmAssign}
            disabled={assignLoading || !selectedCourse}
          >
            {assignLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Assigning...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i> Assign Course
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
