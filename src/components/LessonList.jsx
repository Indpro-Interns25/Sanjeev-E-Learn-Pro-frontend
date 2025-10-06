import { ListGroup, Button, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default function LessonList({ lessons, currentLessonId, onLessonSelect, userProgress }) {
  return (
    <ListGroup variant="flush">
      {lessons.map((lesson) => {
        const getDisplayDuration = (l) => {
          if (!l) return '';
          if (l.duration_display) return l.duration_display;
          if (l.duration_number || l.duration_number === 0) return `${l.duration_number} minutes`;
          if (l.duration) return String(l.duration).trim();
          return '';
        };
        const isComplete = userProgress[lesson.id];
        const isCurrent = lesson.id === currentLessonId;
        
        return (
          <ListGroup.Item
            key={lesson.id}
            className={`d-flex justify-content-between align-items-center ${
              isCurrent ? 'active' : ''
            }`}
          >
            <div className="d-flex align-items-center">
              {isComplete ? (
                <i className="bi bi-check-circle-fill text-success me-2"></i>
              ) : (
                <i className="bi bi-circle text-secondary me-2"></i>
              )}
              
              <div>
                <div className="fw-medium">{lesson.title}</div>
                <small className="text-muted d-block">
                  <i className="bi bi-clock me-1"></i>
                  {getDisplayDuration(lesson)}
                </small>
              </div>
            </div>

            <div className="d-flex align-items-center">
              {isComplete && (
                <Badge bg="success" className="me-2">
                  Completed
                </Badge>
              )}
              
              <Button
                variant={isCurrent ? "primary" : "outline-primary"}
                size="sm"
                onClick={() => onLessonSelect(lesson.id)}
              >
                {isCurrent ? 'Current' : 'Start'}
              </Button>
            </div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}

LessonList.propTypes = {
  lessons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      duration: PropTypes.string.isRequired
    })
  ).isRequired,
  currentLessonId: PropTypes.number,
  onLessonSelect: PropTypes.func.isRequired,
  userProgress: PropTypes.objectOf(PropTypes.bool).isRequired
};
