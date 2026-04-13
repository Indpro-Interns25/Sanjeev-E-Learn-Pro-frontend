import { Card, Badge, ProgressBar, Alert, Button, ListGroup, Row, Col, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { getCourseCompletionStatus, getCourseMilestones, getNextAction, formatCourseStatusDisplay } from '../services/courseProgression';
import PropTypes from 'prop-types';
import '../styles/course-progress.css';

/**
 * Course Progress Component
 * Shows course completion status with milestones and next actions
 */
export default function CourseProgress({ courseId, userId, totalLessons, onStartFinalTest, onGenerateCertificate }) {
  const [status, setStatus] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [nextAction, setNextAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId || !userId || totalLessons === null) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const completionStatus = await getCourseCompletionStatus(userId, courseId, totalLessons);
        setStatus(completionStatus);
        setMilestones(getCourseMilestones(completionStatus));
        setNextAction(getNextAction(completionStatus));
      } catch (err) {
        console.error('Error fetching course status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [courseId, userId, totalLessons]);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center py-4">
          <Spinner animation="border" className="mb-2" />
          <p className="text-muted">Loading course progress...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Alert variant="warning" className="mb-0">
            Unable to load course progress. Please refresh the page.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  const statusDisplay = formatCourseStatusDisplay(status.courseStatus);

  return (
    <Card className="border-0 shadow-sm course-progress-card">
      {/* Header with status badge */}
      <Card.Header className="bg-white border-bottom">
        <Row className="align-items-center">
          <Col md={8}>
            <h5 className="mb-1 fw-bold">
              <i className={`bi bi-${statusDisplay.icon} me-2`}></i>
              Course Progress
            </h5>
          </Col>
          <Col md={4} className="text-md-end">
            <Badge bg={statusDisplay.color} className="px-3 py-2">
              {statusDisplay.label}
            </Badge>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {/* Overall progress bar */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <small className="fw-semibold text-muted">Overall Progress</small>
            <small className="fw-bold text-primary">{status.courseProgressPercent}%</small>
          </div>
          <ProgressBar
            now={status.courseProgressPercent}
            label={`${status.courseProgressPercent}%`}
            variant={
              status.courseProgressPercent === 100 ? 'success' :
              status.courseProgressPercent >= 50 ? 'info' :
              'primary'
            }
            striped
            animated={status.courseProgressPercent < 100}
            style={{ height: '10px' }}
          />
        </div>

        {/* Milestones list */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">
            <i className="bi bi-list-check me-2"></i>
            Milestones
          </h6>
          <ListGroup variant="flush">
            {milestones.map((milestone, index) => (
              <ListGroup.Item key={index} className="px-0 py-3 border-bottom last-child-no-border">
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="d-flex align-items-center mb-2">
                      <span className="milestone-number me-2">
                        {index + 1}
                      </span>
                      <span className="fw-semibold">
                        {milestone.name}
                      </span>
                      {milestone.completed && (
                        <Badge bg="success" className="ms-2 px-2">
                          <i className="bi bi-check-lg me-1"></i>Done
                        </Badge>
                      )}
                      {!milestone.completed && milestone.unlocked === false && (
                        <Badge bg="secondary" className="ms-2 px-2">
                          <i className="bi bi-lock me-1"></i>Locked
                        </Badge>
                      )}
                    </div>
                    <small className="text-muted d-block mb-2">
                      {milestone.description}
                    </small>
                  </Col>
                  <Col md={4} className="text-md-end">
                    <small className="d-block fw-bold text-primary mb-1">
                      {milestone.progress}
                    </small>
                    {milestone.percentage > 0 && (
                      <ProgressBar
                        now={milestone.percentage}
                        className="milestone-progress"
                        variant={milestone.completed ? 'success' : 'primary'}
                        style={{ height: '6px' }}
                      />
                    )}
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        {/* Next action section */}
        {nextAction && (
          <div className="next-action-section">
            <div className="p-3 bg-light rounded-3 border border-primary border-opacity-25">
              <h6 className="fw-bold mb-2 text-primary">
                <i className="bi bi-arrow-right-circle-fill me-2"></i>
                Next Step
              </h6>
              <p className="text-muted mb-3">
                {nextAction.message}
              </p>
              <small className="d-block text-muted mb-3 fw-semibold">
                {nextAction.progress}
              </small>
              {nextAction.action !== 'course_complete' && (
                <Button
                  variant={nextAction.buttonVariant}
                  className="w-100"
                  onClick={() => {
                    if (nextAction.action === 'start_final_test' && onStartFinalTest) {
                      onStartFinalTest();
                    } else if (nextAction.action === 'generate_certificate' && onGenerateCertificate) {
                      onGenerateCertificate();
                    }
                  }}
                >
                  {nextAction.buttonText}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Completion info */}
        {status.certificateGenerated && (
          <Alert variant="success" className="mt-3 mb-0">
            <i className="bi bi-award-fill me-2"></i>
            <strong>Course Complete!</strong> You've earned your certificate. Download it and celebrate your achievement!
          </Alert>
        )}
      </Card.Body>

      {/* Footer with stats */}
      <Card.Footer className="bg-light border-top py-3">
        <Row className="text-center small text-muted">
          <Col xs={4}>
            <div>
              <strong className="d-block text-dark fs-5">
                {status.lessonsCompleted}/{status.totalLessons}
              </strong>
              <span>Lessons</span>
            </div>
          </Col>
          <Col xs={4}>
            <div>
              <strong className="d-block text-dark fs-5">
                {status.finalTestPassed ? status.finalTestPercentage : '—'}%
              </strong>
              <span>Final Test</span>
            </div>
          </Col>
          <Col xs={4}>
            <div>
              <strong className="d-block text-dark fs-5">
                {status.certificateGenerated ? '✓' : '—'}
              </strong>
              <span>Certificate</span>
            </div>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
}

CourseProgress.propTypes = {
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  totalLessons: PropTypes.number.isRequired,
  onStartFinalTest: PropTypes.func,
  onGenerateCertificate: PropTypes.func,
};
