import { Modal, Button } from 'react-bootstrap';
import VideoPlayer from './VideoPlayer';
import PropTypes from 'prop-types';

export default function VideoPreviewModal({ course, show, onHide }) {
  if (!course) return null;

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      centered
      className="video-preview-modal"
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title>{course.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <VideoPlayer
          videoUrl={course.previewVideo}
          title={course.title}
          autoPlay={true}
        />
        
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Course Preview</h5>
          </div>
          
          <p className="text-muted mb-3">{course.description}</p>
          
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-person-badge me-2 text-primary"></i>
                <span><strong>Instructor:</strong> {course.instructor.name}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-clock me-2 text-info"></i>
                <span><strong>Duration:</strong> {course.duration}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-bar-chart me-2 text-warning"></i>
                <span><strong>Level:</strong> {course.level}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-people me-2 text-success"></i>
                <span><strong>Enrolled:</strong> {course.enrolled.toLocaleString()} students</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 d-flex justify-content-between align-items-center">
            <div>
              <div className="h4 text-success mb-0">
                {course.isFree === true ? 'Free' : 'Free'}
              </div>
              <div className="text-warning small">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`bi bi-star${i < Math.round(course.rating) ? '-fill' : ''}`}></i>
                ))}
                <span className="ms-1">{course.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={onHide}>
                Close Preview
              </Button>
              <Button variant="primary" size="lg">
                <i className="bi bi-cart-plus me-2"></i>
                Enroll Now
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

VideoPreviewModal.propTypes = {
  course: PropTypes.object,
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired
};