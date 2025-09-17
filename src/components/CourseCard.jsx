import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function CourseCard({ course }) {
  return (
    <Card className="h-100 course-card border-0 shadow-sm rounded-4" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Card.Img 
        variant="top" 
        src={course.thumbnail} 
        alt={course.title}
        style={{ height: '200px', objectFit: 'cover' }}
      />
      <Card.Body className="d-flex flex-column">
        <div className="mb-2 d-flex align-items-center justify-content-between">
          <div>
            <Badge bg="primary" className="me-2">{course.category}</Badge>
            <Badge bg="secondary">{course.level}</Badge>
          </div>
          <div className="d-flex align-items-center">
            <img src={course.instructor?.avatar || 'https://placehold.co/32x32?text=I'} alt={course.instructor?.name || 'Instructor'} width="32" height="32" className="rounded-circle me-2" />
            <span className="small text-muted">{course.instructor?.name || 'Instructor'}</span>
          </div>
        </div>
        <Card.Title className="mb-1">{course.title}</Card.Title>
        <Card.Text className="text-muted mb-2">
          {course.description.length > 120 
            ? `${course.description.substring(0, 120)}...` 
            : course.description}
        </Card.Text>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">
              <i className="bi bi-clock me-1"></i>
              {course.duration}
            </small>
            <small className="text-muted">
              <i className="bi bi-people me-1"></i>
              {course.enrolled.toLocaleString()} enrolled
            </small>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong className="h5 mb-0">${course.price}</strong>
              <div className="text-warning small">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`bi bi-star${i < Math.round(course.rating) ? '-fill' : ''}`}></i>
                ))}
                <span className="ms-1">{course.rating.toFixed(1)}</span>
              </div>
            </div>
            <Button 
              as={Link} 
              to={`/courses/${course.id}`}
              variant="outline-primary"
              className="fw-bold"
            >
              View Details
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    level: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    enrolled: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    rating: PropTypes.number.isRequired,
    instructor: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.string
    })
  }).isRequired
};
