import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useState } from 'react';
import VideoPlayer from '../../components/VideoPlayer';
import VideoPreviewModal from '../../components/VideoPreviewModal';
import { mockCourses } from '../../data/mockCourses';

export default function VideoDemo() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentVideoMode, setCurrentVideoMode] = useState('preview'); // 'preview' or 'live'

  const demoVideos = {
    preview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    live: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8'
  };

  const handleCoursePreview = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <div className="text-center mb-4">
            <h1 className="display-4 fw-bold text-primary mb-3">
              🎬 Real-Time Video Streaming
            </h1>
            <p className="lead text-muted">
              Experience our advanced video player with live streaming capabilities
            </p>
          </div>
        </Col>
      </Row>

      {/* Demo Video Player */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <i className="bi bi-play-circle me-2"></i>
                  Interactive Video Player
                </h4>
                <div className="d-flex gap-2">
                  <Button
                    variant={currentVideoMode === 'preview' ? 'light' : 'outline-light'}
                    size="sm"
                    onClick={() => setCurrentVideoMode('preview')}
                  >
                    <i className="bi bi-film me-1"></i>
                    Sample Video
                  </Button>
                  <Button
                    variant={currentVideoMode === 'live' ? 'danger' : 'outline-light'}
                    size="sm"
                    onClick={() => setCurrentVideoMode('live')}
                  >
                    <i className="bi bi-broadcast me-1"></i>
                    Live Stream
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <VideoPlayer
                videoUrl={demoVideos.preview}
                liveStreamUrl={demoVideos.live}
                title="Demo Video Player"
                isLive={currentVideoMode === 'live'}
                autoPlay={false}
                onProgress={(progress) => {
                  // Track video progress for analytics
                  if (progress === 100) {
                    // Video completed
                  }
                }}
              />
              <div className="p-3 bg-light">
                <div className="row g-3">
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-fullscreen me-2 text-primary"></i>
                      <small>Fullscreen Support</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-speedometer me-2 text-info"></i>
                      <small>Playback Speed</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-volume-up me-2 text-success"></i>
                      <small>Volume Control</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-skip-forward me-2 text-warning"></i>
                      <small>Seek & Progress</small>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Course Grid with Video Previews */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-center mb-4">
            <i className="bi bi-collection-play me-2"></i>
            Courses with Video Previews
          </h2>
          <p className="text-center text-muted mb-4">
            Click on any course card to see the video preview modal in action
          </p>
        </Col>
      </Row>

      <Row>
        {mockCourses.slice(0, 6).map((course) => (
          <Col key={course.id} md={6} lg={4} className="mb-4">
            <Card 
              className="h-100 course-card border-0 shadow-sm rounded-4" 
              style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div className="position-relative">
                <Card.Img 
                  variant="top" 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="responsive-img img-ratio-card"
                  loading="lazy"
                />
                {/* Video Preview Button */}
                <div className="position-absolute top-50 start-50 translate-middle">
                  <Button
                    variant="light"
                    className="rounded-circle shadow-lg"
                    style={{ width: '60px', height: '60px', opacity: 0.9 }}
                    onClick={() => handleCoursePreview(course)}
                  >
                    <i className="bi bi-play-fill text-primary fs-3"></i>
                  </Button>
                </div>
                {/* Live Badge */}
                {course.liveStreamUrl && (
                  <div className="position-absolute top-0 end-0 m-2">
                    <Badge bg="danger" className="d-flex align-items-center gap-1">
                      <div 
                        className="bg-white rounded-circle live-indicator" 
                        style={{ width: '6px', height: '6px' }}
                      ></div>
                      LIVE
                    </Badge>
                  </div>
                )}
              </div>
              <Card.Body>
                <div className="d-flex gap-2 mb-2">
                  <Badge bg="primary">{course.category}</Badge>
                  <Badge bg="secondary">{course.level}</Badge>
                </div>
                <Card.Title className="h5">{course.title}</Card.Title>
                <Card.Text className="text-muted small">
                  {course.description.length > 100 
                    ? `${course.description.substring(0, 100)}...` 
                    : course.description}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <div>
                    <strong className="h5">
                      {course.isFree === true
                        ? <span className="text-success">Free</span>
                        : <span className="text-success">Free</span>
                      }
                    </strong>
                    <div className="text-warning small">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`bi bi-star${i < Math.round(course.rating) ? '-fill' : ''}`}></i>
                      ))}
                      <span className="ms-1">{course.rating}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => handleCoursePreview(course)}
                  >
                    Preview
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Features Section */}
      <Row className="mt-5 pt-5 border-top">
        <Col>
          <h2 className="text-center mb-4">
            <i className="bi bi-stars me-2"></i>
            Advanced Video Features
          </h2>
        </Col>
      </Row>

      <Row>
        <Col md={6} lg={3} className="mb-4">
          <div className="text-center p-4 h-100 border rounded-4">
            <div className="bg-primary bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
              <i className="bi bi-broadcast fs-1"></i>
            </div>
            <h5>Live Streaming</h5>
            <p className="text-muted small">
              Real-time HLS streaming with low latency for live classes and events
            </p>
          </div>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <div className="text-center p-4 h-100 border rounded-4">
            <div className="bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
              <i className="bi bi-speedometer2 fs-1"></i>
            </div>
            <h5>Adaptive Quality</h5>
            <p className="text-muted small">
              Automatic quality adjustment based on network conditions
            </p>
          </div>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <div className="text-center p-4 h-100 border rounded-4">
            <div className="bg-info bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
              <i className="bi bi-fullscreen fs-1"></i>
            </div>
            <h5>Fullscreen Mode</h5>
            <p className="text-muted small">
              Immersive fullscreen experience with custom controls
            </p>
          </div>
        </Col>
        
        <Col md={6} lg={3} className="mb-4">
          <div className="text-center p-4 h-100 border rounded-4">
            <div className="bg-warning bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
              <i className="bi bi-phone fs-1"></i>
            </div>
            <h5>Mobile Ready</h5>
            <p className="text-muted small">
              Responsive design optimized for mobile devices and tablets
            </p>
          </div>
        </Col>
      </Row>

      {/* Video Preview Modal */}
      <VideoPreviewModal 
        course={selectedCourse}
        show={showModal}
        onHide={() => setShowModal(false)}
      />
    </Container>
  );
}