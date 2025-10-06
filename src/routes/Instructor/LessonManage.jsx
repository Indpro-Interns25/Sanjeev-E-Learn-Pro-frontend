import { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, ListGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import LessonForm from '../../components/forms/LessonForm';
import { getCourseById } from '../../data/mockCourses';
import { getLessonsByCourse } from '../../data/mockLessons';

export default function LessonManage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const courseData = getCourseById(parseInt(courseId));
    if (!courseData) {
      navigate('/not-found');
      return;
    }
    setCourse(courseData);

    const lessonData = getLessonsByCourse(parseInt(courseId));
    setLessons(lessonData);
  }, [courseId, navigate]);

  const formatDuration = (lesson) => {
    if (!lesson) return '';
    if (lesson.duration_display) return lesson.duration_display;
    if (typeof lesson.duration_number === 'number') return `${lesson.duration_number} minutes`;
    if (lesson.duration) return lesson.duration;
    return '';
  };

  const handleAddLesson = () => {
    setSelectedLesson(null);
    setIsEditing(true);
  };

  const handleEditLesson = (lesson) => {
    setSelectedLesson(lesson);
    setIsEditing(true);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      // In a real app, this would be an API call
      // await deleteLesson(lessonId);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      // In a real app, this would be an API call
      if (selectedLesson) {
        // Update existing lesson
        // const updatedLesson = await updateLesson(selectedLesson.id, formData);
        setLessons(prev =>
          prev.map(l => (l.id === selectedLesson.id ? { ...l, ...formData } : l))
        );
      } else {
        // Create new lesson
        // const newLesson = await createLesson({ ...formData, courseId });
        const newLesson = {
          id: Date.now(),
          ...formData,
          courseId: parseInt(courseId)
        };
        setLessons(prev => [...prev, newLesson]);
      }
      setIsEditing(false);
      setSelectedLesson(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property for each lesson
    const reorderedLessons = items.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));

    setLessons(reorderedLessons);
  };

  if (!course) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h1 className="h2 mb-0">
          <i className="bi bi-journal-code me-2"></i>Manage Lessons: {course.title}
        </h1>
        <Button variant="primary" size="lg" onClick={handleAddLesson}>
          <i className="bi bi-plus-circle me-2"></i>Add New Lesson
        </Button>
      </div>

      <div className="row">
        <div className={`col-${isEditing ? '8' : '12'}`}> {/* Lessons List */}
          <Card className="mb-4 shadow-lg rounded-4">
            <Card.Header className="bg-info text-white rounded-top-4">
              <h2 className="h5 mb-0">
                <i className="bi bi-list-ol me-2"></i>Course Lessons
              </h2>
            </Card.Header>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="lessons">
                {(provided) => (
                  <ListGroup 
                    variant="flush" 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                  >
                    {lessons.map((lesson, index) => (
                      <Draggable
                        key={lesson.id}
                        draggableId={lesson.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <ListGroup.Item
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="d-flex align-items-center bg-light border-0 mb-2 rounded-3 shadow-sm"
                          >
                            <div {...provided.dragHandleProps} className="me-3 text-secondary" style={{ cursor: 'grab' }}>
                              <i className="bi bi-grip-vertical"></i>
                            </div>
                            <div className="flex-grow-1">
                              <h3 className="h6 mb-1">{lesson.title}</h3>
                              <small className="text-muted">
                                Duration: {formatDuration(lesson)}
                              </small>
                            </div>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditLesson(lesson)}
                              >
                                <i className="bi bi-pencil-square"></i> Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </Button>
                            </div>
                          </ListGroup.Item>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ListGroup>
                )}
              </Droppable>
            </DragDropContext>

            {lessons.length === 0 && (
              <Card.Body className="text-center py-5">
                <div className="text-muted">
                  <i className="bi bi-journal-text display-4"></i>
                  <h3 className="mt-3">No lessons yet</h3>
                  <p>Start by adding your first lesson</p>
                  <Button variant="primary" onClick={handleAddLesson}>
                    <i className="bi bi-plus-circle me-2"></i>Add Lesson
                  </Button>
                </div>
              </Card.Body>
            )}
          </Card>
        </div>

        {isEditing && (
          <div className="col-4"> {/* Lesson Form Sidebar */}
            <Card className="sticky-top shadow-lg rounded-4" style={{ top: '2rem' }}>
              <Card.Header className="bg-success text-white rounded-top-4">
                <h2 className="h5 mb-0">
                  <i className={`bi ${selectedLesson ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                  {selectedLesson ? 'Edit Lesson' : 'Add New Lesson'}
                </h2>
              </Card.Header>
              <Card.Body>
                <LessonForm
                  lesson={selectedLesson}
                  onSubmit={handleSubmit}
                  isEdit={Boolean(selectedLesson)}
                />
              </Card.Body>
              <Card.Footer className="text-end rounded-bottom-4">
                <Button
                  variant="link"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedLesson(null);
                  }}
                >
                  Cancel
                </Button>
              </Card.Footer>
            </Card>
          </div>
        )}
      </div>
    </Container>
  );
}
