import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { useUi } from '../context/ui-context';
import Certificate from './Certificate';
import {
  generateCourseCompletionCertificate,
  hasCourseCompletionCertificate,
  getCertificateByCourseid,
  downloadCertificatePDF
} from '../services/certificates';
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
      const newCert = generateCourseCompletionCertificate(
        user.id,
        courseId,
        {
          title: courseTitle,
          instructor: courseInstructor
        }
      );

      setCertificate(newCert);
      showToast('🎉 Certificate generated successfully!', 'success');
      onCertificateGenerated(newCert);
      
      // Auto-open certificate view
      setTimeout(() => {
        setShowCertificateModal(true);
      }, 500);
    } catch (err) {
      const errMsg = err.message || 'Failed to generate certificate';
      setError(errMsg);
      showToast(`❌ ${errMsg}`, 'danger');
      console.error('Certificate generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download certificate as PDF
  const handleDownloadCertificate = async () => {
    if (!certificate) return;

    try {
      setIsGenerating(true);
      // For now, we'll trigger a browser print dialog or use html2pdf
      // In production, this would call downloadCertificatePDF from the service
      const printWindow = window.open('', '', 'height=600,width=800');
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
                <p>Certificate ID: ${certificate.id}</p>\n                <p>Verification Code: ${certificate.verificationCode}</p>\n              </div>\n            </div>\n          </body>\n        </html>\n      `);\n      printWindow.document.close();\n      printWindow.print();\n      showToast('📄 Certificate ready to download', 'success');\n    } catch (err) {\n      const errMsg = err.message || 'Failed to download certificate';\n      setError(errMsg);\n      showToast(`❌ ${errMsg}`, 'danger');\n    } finally {\n      setIsGenerating(false);\n    }\n  };

  const isCompleted = progressPct === 100;
  const hasCertificate = !!certificate;

  // If not completed, show incomplete message
  if (!isCompleted) {
    return (\n      <Card className=\"course-completion-card incomplete mb-3\">\n        <Card.Body>\n          <div className=\"d-flex align-items-center gap-3\">\n            <div className=\"completion-icon incomplete-icon\">\n              <i className=\"bi bi-lock-fill\"></i>\n            </div>\n            <div className=\"flex-grow-1\">\n              <h5 className=\"mb-1\">Course Not Yet Complete</h5>\n              <p className=\"text-muted mb-0\">Complete all lessons to unlock your certificate</p>\n              <div className=\"mt-2\">\n                <div className=\"small\">Progress: <span className=\"fw-bold\">{progressPct}%</span></div>\n              </div>\n            </div>\n          </div>\n        </Card.Body>\n      </Card>\n    );\n  }

  // Show completion with certificate options
  return (\n    <>\n      <Card className=\"course-completion-card completed mb-3\">\n        <Card.Body>\n          <div className=\"d-flex align-items-center gap-3 mb-3\">\n            <div className=\"completion-icon completed-icon\">\n              <i className=\"bi bi-trophy-fill\"></i>\n            </div>\n            <div className=\"flex-grow-1\">\n              <h5 className=\"mb-1\">🎉 Course Completed!</h5>\n              <p className=\"text-muted mb-0\">Congratulations on finishing this course</p>\n            </div>\n            <Badge bg=\"success\" className=\"rounded-pill\">\n              <i className=\"bi bi-check-circle me-1\"></i>100%\n            </Badge>\n          </div>\n\n          {error && (\n            <Alert variant=\"danger\" dismissible onClose={() => setError(null)} className=\"mb-3\">\n              <i className=\"bi bi-exclamation-circle me-2\"></i>{error}\n            </Alert>\n          )}\n\n          <div className=\"button-group d-flex gap-2 flex-wrap\">\n            {!hasCertificate ? (\n              <Button\n                variant=\"success\"\n                className=\"btn-generate-certificate rounded-pill px-4\"\n                onClick={handleGenerateCertificate}\n                disabled={isGenerating}\n              >\n                {isGenerating ? (\n                  <>\n                    <Spinner animation=\"border\" size=\"sm\" className=\"me-2\" />\n                    Generating...\n                  </>\n                ) : (\n                  <>\n                    <i className=\"bi bi-file-earmark-pdf me-2\"></i>\n                    Download Certificate\n                  </>\n                )}\n              </Button>\n            ) : (\n              <>\n                <Button\n                  variant=\"primary\"\n                  className=\"rounded-pill px-4\"\n                  onClick={() => setShowCertificateModal(true)}\n                  disabled={isGenerating}\n                >\n                  <i className=\"bi bi-eye me-2\"></i>\n                  View Certificate\n                </Button>\n                <Button\n                  variant=\"outline-primary\"\n                  className=\"rounded-pill px-4\"\n                  onClick={handleDownloadCertificate}\n                  disabled={isGenerating}\n                >\n                  {isGenerating ? (\n                    <>\n                      <Spinner animation=\"border\" size=\"sm\" className=\"me-2\" />\n                      Downloading...\n                    </>\n                  ) : (\n                    <>\n                      <i className=\"bi bi-download me-2\"></i>\n                      Download PDF\n                    </>\n                  )}\n                </Button>\n              </>\n            )}\n          </div>\n\n          {certificate && (\n            <div className=\"certificate-info mt-3 p-2 bg-light rounded\">\n              <small className=\"text-muted\">\n                <i className=\"bi bi-info-circle me-1\"></i>\n                Certificate ID: <span className=\"font-monospace\">{certificate.id}</span>\n              </small>\n            </div>\n          )}\n        </Card.Body>\n      </Card>\n\n      {/* Certificate Modal */}\n      <Modal show={showCertificateModal} onHide={() => setShowCertificateModal(false)} size=\"lg\" centered>\n        <Modal.Header closeButton>\n          <Modal.Title>\n            <i className=\"bi bi-file-earmark-pdf me-2\"></i>Your Certificate\n          </Modal.Title>\n        </Modal.Header>\n        <Modal.Body>\n          {certificate && (\n            <Certificate\n              userName={user?.name || 'Student'}\n              courseTitle={courseTitle}\n              score={certificate.score}\n              percentage={certificate.percentage}\n              completionDate={certificate.completionDate}\n              certificateId={certificate.id}\n              certificateNumber={certificate.verificationCode}\n              instructorName={certificate.instructorName}\n            />\n          )}\n        </Modal.Body>\n        <Modal.Footer>\n          <Button\n            variant=\"primary\"\n            onClick={handleDownloadCertificate}\n            disabled={isGenerating}\n          >\n            <i className=\"bi bi-download me-2\"></i>\n            {isGenerating ? 'Downloading...' : 'Download as PDF'}\n          </Button>\n          <Button variant=\"secondary\" onClick={() => setShowCertificateModal(false)}>\n            Close\n          </Button>\n        </Modal.Footer>\n      </Modal>\n    </>\n  );\n}\n\nCourseCompletionCard.propTypes = {\n  courseId: PropTypes.number.isRequired,\n  courseTitle: PropTypes.string.isRequired,\n  progressPct: PropTypes.number,\n  courseInstructor: PropTypes.string,\n  onCertificateGenerated: PropTypes.func\n};\n