import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { useUi } from '../context/ui-context';
import Certificate from './Certificate';
import { generateCourseCompletionCertificate, getCertificateByCourseid } from '../services/certificates';
import '../styles/course-completion.css';

/**
 * CourseCompletionCard Component
 * Displays course completion status and certificate generation/download
 */
export default function CourseCompletionCard({
  courseId,
  courseTitle,
  progressPct = 0,
  courseInstructor = 'EduLearn Pro Team',
  onCertificateGenerated = () => {}
}) {
  const { user } = useAuth();
  const { showToast } = useUi();

  const [certificate, setCertificate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [error, setError] = useState(null);

  // Check if user already has certificate for this course
  useEffect(() => {
    if (!user || !courseId) return;

    const existingCert = getCertificateByCourseid(user.id, courseId);
    if (existingCert) {
      setCertificate(existingCert);
    }
  }, [user, courseId]);

  // Generate certificate when course is completed (100%)
  const handleGenerateCertificate = async () => {
    if (!user || !courseId) {
      setError('User or course information missing');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const newCert = generateCourseCompletionCertificate(user.id, courseId, {
        title: courseTitle,
        instructor: courseInstructor
      });

      setCertificate(newCert);
      showToast('Certificate generated successfully!', 'success');
      onCertificateGenerated(newCert);

      // Auto-open certificate view
      setTimeout(() => {
        setShowCertificateModal(true);
      }, 500);
    } catch (err) {
      const errMsg = err.message || 'Failed to generate certificate';
      setError(errMsg);
      showToast(errMsg, 'danger');
      console.error('Certificate generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download certificate as printable page
  const handleDownloadCertificate = async () => {
    if (!certificate) return;

    try {
      setIsGenerating(true);

      const printWindow = window.open('', '', 'height=600,width=800');
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate - ${courseTitle}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
              .certificate-content { padding: 40px; text-align: center; }
              h1 { color: #4f46e5; margin: 20px 0; }
              h2 { color: #17243d; font-size: 28px; margin: 20px 0; }
              .info { margin: 20px 0; font-size: 16px; }
              .footer { margin-top: 60px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="certificate-content">
              <h1>Certificate of Completion</h1>
              <p class="info">This is to certify that</p>
              <h2>${user?.name || 'Student'}</h2>
              <p class="info">has successfully completed the course</p>
              <h3>${courseTitle}</h3>
              <p class="info">Completed on ${new Date(certificate.completionDate).toLocaleDateString()}</p>
              <div class="footer">
                <p>Certificate ID: ${certificate.id}</p>
                <p>Verification Code: ${certificate.verificationCode}</p>
              </div>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.print();
      showToast('Certificate ready to download', 'success');
    } catch (err) {
      const errMsg = err.message || 'Failed to download certificate';
      setError(errMsg);
      showToast(errMsg, 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  const isCompleted = progressPct === 100;
  const hasCertificate = !!certificate;

  if (!isCompleted) {
    return (
      <Card className="course-completion-card incomplete mb-3">
        <Card.Body>
          <div className="d-flex align-items-center gap-3">
            <div className="completion-icon incomplete-icon">
              <i className="bi bi-lock-fill"></i>
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-1">Course Not Yet Complete</h5>
              <p className="text-muted mb-0">Complete all lessons to unlock your certificate</p>
              <div className="mt-2">
                <div className="small">Progress: <span className="fw-bold">{progressPct}%</span></div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="course-completion-card completed mb-3">
        <Card.Body>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="completion-icon completed-icon">
              <i className="bi bi-trophy-fill"></i>
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-1">Course Completed!</h5>
              <p className="text-muted mb-0">Congratulations on finishing this course</p>
            </div>
            <Badge bg="success" className="rounded-pill">
              <i className="bi bi-check-circle me-1"></i>100%
            </Badge>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
              <i className="bi bi-exclamation-circle me-2"></i>{error}
            </Alert>
          )}

          <div className="button-group d-flex gap-2 flex-wrap">
            {!hasCertificate ? (
              <Button
                variant="success"
                className="btn-generate-certificate rounded-pill px-4"
                onClick={handleGenerateCertificate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-pdf me-2"></i>
                    Download Certificate
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  className="rounded-pill px-4"
                  onClick={() => setShowCertificateModal(true)}
                  disabled={isGenerating}
                >
                  <i className="bi bi-eye me-2"></i>
                  View Certificate
                </Button>
                <Button
                  variant="outline-primary"
                  className="rounded-pill px-4"
                  onClick={handleDownloadCertificate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download me-2"></i>
                      Download PDF
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {certificate && (
            <div className="certificate-info mt-3 p-2 bg-light rounded">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Certificate ID: <span className="font-monospace">{certificate.id}</span>
              </small>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showCertificateModal} onHide={() => setShowCertificateModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-file-earmark-pdf me-2"></i>Your Certificate
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {certificate && (
            <Certificate
              userName={user?.name || 'Student'}
              courseTitle={courseTitle}
              score={certificate.score}
              percentage={certificate.percentage}
              completionDate={certificate.completionDate}
              certificateId={certificate.id}
              certificateNumber={certificate.verificationCode}
              instructorName={certificate.instructorName}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleDownloadCertificate} disabled={isGenerating}>
            <i className="bi bi-download me-2"></i>
            {isGenerating ? 'Downloading...' : 'Download as PDF'}
          </Button>
          <Button variant="secondary" onClick={() => setShowCertificateModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

CourseCompletionCard.propTypes = {
  courseId: PropTypes.number.isRequired,
  courseTitle: PropTypes.string.isRequired,
  progressPct: PropTypes.number,
  courseInstructor: PropTypes.string,
  onCertificateGenerated: PropTypes.func
};
