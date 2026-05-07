import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { getCourseEnrollmentCount } from '../services/enrollment';

function toDisplayText(value, fallback = 'N/A') {
  if (value == null) return fallback;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    const parts = value.map((item) => toDisplayText(item, '')).filter(Boolean);
    return parts.length ? parts.join(', ') : fallback;
  }
  if (typeof value === 'object') {
    return value?.name || value?.title || value?._id || value?.id || fallback;
  }
  return fallback;
}

export default function CourseCard({ course }) {
  const [realEnrollmentCount, setRealEnrollmentCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const isFreeCourse = course?.isFree === true;
  const courseTitle = toDisplayText(course?.title, 'Untitled Course');
  const courseDescription = toDisplayText(course?.description, '');
  const courseCategory = toDisplayText(course?.category, 'General');
  const courseLevel = toDisplayText(course?.difficulty_level || course?.level, 'Beginner');
  const instructorName = toDisplayText(course?.instructor || course?.instructor_name, 'Instructor');
  const courseDuration = toDisplayText(course?.duration, 'Self-paced');

  useEffect(() => {
    const fetchEnrollmentCount = async () => {
      try {
        setLoadingCount(true);
        const count = await getCourseEnrollmentCount(course?.id);
        setRealEnrollmentCount(count);
      } catch (error) {
        console.error('Failed to fetch enrollment count for course:', course?.id, error);
        setRealEnrollmentCount(0);
      } finally {
        setLoadingCount(false);
      }
    };

    fetchEnrollmentCount();
  }, [course?.id]);

  return (
    <Card className="h-100 course-card border-0 shadow-sm rounded-4" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Card.Img 
        variant="top" 
        src={course?.thumbnail} 
        alt={courseTitle}
        className="responsive-img img-ratio-card"
        loading="lazy"
      />
      <Card.Body className="d-flex flex-column">
        <div className="mb-2 d-flex align-items-center justify-content-between">
          <div>
            <Badge bg="primary" className="me-2">{courseCategory}</Badge>
            <Badge bg="secondary">{courseLevel}</Badge>
          </div>
          <div className="d-flex align-items-center">
            <img
              src="https://placehold.co/32x32.webp?text=I"
              alt={instructorName}
              className="responsive-img rounded-circle me-2 img-avatar-32"
              loading="lazy"
            />
            <span className="small text-muted">{instructorName}</span>
          </div>
        </div>
        <Card.Title className="mb-1">{courseTitle}</Card.Title>
        <Card.Text className="text-muted mb-2">
          {courseDescription.length > 120
            ? `${courseDescription.substring(0, 120)}...`
            : courseDescription}
        </Card.Text>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">
              <i className="bi bi-clock me-1"></i>
              {courseDuration}
            </small>
            <small className="text-muted">
              <i className="bi bi-people me-1"></i>
              {loadingCount ? '...' : realEnrollmentCount.toLocaleString()} enrolled
            </small>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong className="h5 mb-0">
                {isFreeCourse === true
                  ? <span className="text-success fw-bold">Free</span>
                  : <span className="text-success fw-bold">Free</span>
                }
              </strong>
              <div className="text-warning small">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`bi bi-star${i < Math.round(parseFloat(course?.rating || 0)) ? '-fill' : ''}`}></i>
                ))}
                <span className="ms-1">{parseFloat(course?.rating || 0).toFixed(1)}</span>
              </div>
            </div>
            <Button 
              as={Link} 
              to={`/courses/${course?.id}`}
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
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    thumbnail: PropTypes.string,
    category: PropTypes.string,
    difficulty_level: PropTypes.string,
    level: PropTypes.string, // fallback field
    duration: PropTypes.string,
    instructor: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    instructor_name: PropTypes.string,
    enrolled_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    enrolled: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isFree: PropTypes.bool,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired
};
