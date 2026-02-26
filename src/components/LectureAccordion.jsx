import { useState } from 'react';
import { Card, Accordion, Badge, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../styles/lecture-accordion.css';

/**
 * LectureAccordion Component
 * Displays lectures in an accordion format for student course view
 * Shows lecture number, title, duration, completion status
 * Highlights active lecture
 */
export default function LectureAccordion({ 
  lectures = [], 
  activeLectureId = null,
  completedLectureIds = [],
  onLectureSelect,
  isEnrolled = false,
  showProgress = true
}) {
  const [expandedKey, setExpandedKey] = useState(activeLectureId ? String(activeLectureId) : null);

  const handleLectureClick = (lecture) => {
    if (!isEnrolled && !lecture.is_free_preview) {
      return; // Don't allow access to non-free lectures if not enrolled
    }
    
    const lectureKey = String(lecture.id);
    setExpandedKey(expandedKey === lectureKey ? null : lectureKey);
    
    if (onLectureSelect) {
      onLectureSelect(lecture);
    }
  };

  const isLectureCompleted = (lectureId) => {
    return completedLectureIds.includes(lectureId);
  };

  const isLectureActive = (lectureId) => {
    return activeLectureId === lectureId;
  };

  const isLectureAccessible = (lecture) => {
    return isEnrolled || lecture.is_free_preview;
  };

  if (!lectures || lectures.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center py-5">
          <i className="bi bi-collection-play display-4 text-muted"></i>
          <h5 className="mt-3 text-muted">No lectures available</h5>
          <p className="text-muted">Check back later for course content</p>
        </Card.Body>
      </Card>
    );
  }

  const completedCount = lectures.filter(l => isLectureCompleted(l.id)).length;
  const progressPercent = lectures.length > 0 ? Math.round((completedCount / lectures.length) * 100) : 0;

  return (
    <div className="lecture-accordion-container">
      {showProgress && (
        <Card className="border-0 shadow-sm mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0 fw-bold">Course Progress</h6>
              <Badge bg="primary">{progressPercent}%</Badge>
            </div>
            <div className="progress" style={{ height: '8px' }}>
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ width: `${progressPercent}%` }}
                aria-valuenow={progressPercent} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
            <small className="text-muted mt-2 d-block">
              {completedCount} of {lectures.length} lectures completed
            </small>
          </Card.Body>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0 fw-bold">
            <i className="bi bi-list-ul me-2"></i>
            Course Content
          </h5>
          <small className="text-muted">{lectures.length} lectures</small>
        </Card.Header>
        <Card.Body className="p-0">
          <Accordion activeKey={expandedKey} flush>
            {lectures.map((lecture, index) => {
              const isCompleted = isLectureCompleted(lecture.id);
              const isActive = isLectureActive(lecture.id);
              const isAccessible = isLectureAccessible(lecture);
              const lectureNumber = lecture.order_number || index + 1;

              return (
                <Accordion.Item 
                  key={lecture.id} 
                  eventKey={String(lecture.id)}
                  className={`lecture-accordion-item ${isActive ? 'active-lecture' : ''}`}
                >
                  <Accordion.Header 
                    onClick={() => handleLectureClick(lecture)}
                    className={`lecture-header ${!isAccessible ? 'locked' : ''}`}
                  >
                    <div className="d-flex align-items-center w-100 me-3">
                      <div className="lecture-number me-3">
                        {isCompleted ? (
                          <i className="bi bi-check-circle-fill text-success fs-4"></i>
                        ) : isActive ? (
                          <i className="bi bi-play-circle-fill text-primary fs-4"></i>
                        ) : (
                          <span className="badge bg-light text-dark border">{lectureNumber}</span>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold lecture-title">
                          {lecture.title}
                          {isActive && (
                            <Badge bg="primary" className="ms-2">Now Playing</Badge>
                          )}
                          {!isAccessible && (
                            <Badge bg="warning" text="dark" className="ms-2">
                              <i className="bi bi-lock-fill me-1"></i>
                              Locked
                            </Badge>
                          )}
                        </div>
                        <div className="d-flex align-items-center gap-3 mt-1">
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {lecture.duration || '10 min'}
                          </small>
                          {lecture.is_free_preview && !isEnrolled && (
                            <Badge bg="success" className="py-0">Free Preview</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="lecture-description">
                      <p className="text-muted mb-3">
                        {lecture.description || `Content for Lecture ${lectureNumber}: ${lecture.title}`}
                      </p>
                      {isAccessible ? (
                        <Button 
                          variant={isActive ? "primary" : "outline-primary"}
                          size="sm"
                          onClick={() => onLectureSelect && onLectureSelect(lecture)}
                          className="me-2"
                        >
                          <i className={`bi ${isActive ? 'bi-pause-fill' : 'bi-play-fill'} me-1`}></i>
                          {isActive ? 'Playing' : 'Play Lecture'}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline-secondary"
                          size="sm"
                          disabled
                        >
                          <i className="bi bi-lock-fill me-1"></i>
                          Enroll to Access
                        </Button>
                      )}
                      {isCompleted && (
                        <Badge bg="success" className="ms-2">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Completed
                        </Badge>
                      )}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </Card.Body>
      </Card>
    </div>
  );
}

LectureAccordion.propTypes = {
  lectures: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    duration: PropTypes.string,
    order_number: PropTypes.number,
    is_free_preview: PropTypes.bool,
    video_url: PropTypes.string
  })),
  activeLectureId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  completedLectureIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  onLectureSelect: PropTypes.func,
  isEnrolled: PropTypes.bool,
  showProgress: PropTypes.bool
};
