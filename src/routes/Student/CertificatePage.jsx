import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '../../hooks/useAuth';
import { getCertificateById, verifyCertificate } from '../../services/certificates';
import Certificate from '../../components/Certificate';

/**
 * Certificate Page - Full page view of a certificate with download options
 */
export default function CertificatePage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const certificateRef = useRef(null);

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [verification, setVerification] = useState(null);

  React.useEffect(() => {
    if (!user || !certificateId) {
      setError('Unable to load certificate. Please try again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cert = getCertificateById(user.id, certificateId);

      if (!cert) {
        setError('Certificate not found. It may have been deleted.');
        setLoading(false);
        return;
      }

      setCertificate(cert);

      // Verify certificate
      const verif = verifyCertificate(cert);
      setVerification(verif);

      if (!verif.valid) {
        console.warn('⚠️ Certificate verification issues:', verif.issues);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading certificate:', err);
      setError('Failed to load certificate');
      setLoading(false);
    }
  }, [user, certificateId]);

  const downloadCertificatePDF = async () => {
    if (!certificateRef.current) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });

      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        pdfWidth,
        pdfHeight
      );

      const fileName = `Certificate-${certificate.id}.pdf`;
      pdf.save(fileName);

      console.warn('✅ Certificate downloaded:', fileName);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const downloadCertificateImage = async () => {
    if (!certificateRef.current) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `Certificate-${certificate.id}.png`;
      link.click();

      console.warn('✅ Certificate downloaded as image:', link.download);
    } catch (err) {
      console.error('Error downloading certificate image:', err);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const printCertificate = () => {
    if (!certificateRef.current) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(certificateRef.current.outerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>{error}</h4>
          <Button variant="primary" onClick={() => navigate('/student/my-learning')}>
            Go Back to My Learning
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!certificate) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h4>Certificate not found</h4>
          <Button variant="primary" onClick={() => navigate('/student/my-learning')}>
            Go Back to My Learning
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Button variant="link" onClick={() => navigate(-1)} className="p-0">
            <i className="bi bi-arrow-left me-2"></i>Back
          </Button>
          <h1 className="mt-3">Certificate of Completion</h1>
          <p className="text-muted">
            {certificate.courseTitle} • Completed on {new Date(certificate.completionDate).toLocaleDateString()}
          </p>
        </Col>
      </Row>

      {/* Verification Alert */}
      {verification && !verification.valid && (
        <Alert variant="warning" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Certificate Issues:</strong>
          <ul className="mb-0 mt-2">
            {verification.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Action Buttons */}
      <Row className="mb-4">
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={downloadCertificatePDF}
            disabled={downloading}
          >
            <i className="bi bi-download me-2"></i>
            {downloading ? 'Downloading...' : 'Download PDF'}
          </Button>
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-primary"
            onClick={downloadCertificateImage}
            disabled={downloading}
          >
            <i className="bi bi-image me-2"></i>Download Image
          </Button>
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-secondary"
            onClick={printCertificate}
          >
            <i className="bi bi-printer me-2"></i>Print
          </Button>
        </Col>
      </Row>

      {/* Certificate Details */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">Certificate ID</small>
                    <strong>{certificate.id}</strong>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">Verification Code</small>
                    <strong className="font-monospace">{certificate.verificationCode}</strong>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">Score</small>
                    <strong className="text-success">{certificate.score} pts ({certificate.percentage}%)</strong>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">Status</small>
                    <Badge bg="success">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      {certificate.status}
                    </Badge>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">Issue Date</small>
                    <strong>{new Date(certificate.issuedDate).toLocaleDateString()}</strong>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-muted d-block">Instructor</small>
                    <strong>{certificate.instructorName}</strong>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm bg-light">
            <Card.Body className="text-center">
              <i className="bi bi-award-fill" style={{ fontSize: '3rem', color: '#667eea' }}></i>
              <p className="mt-2 mb-1 fw-bold">Congratulations!</p>
              <small className="text-muted d-block">
                You have successfully completed the course and earned this certificate.
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Certificate Preview */}
      <Row className="mb-4">
        <Col>
          <h5 className="fw-bold mb-3">Certificate Preview</h5>
          <div
            ref={certificateRef}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Certificate
              userName={user?.name || user?.username || 'User'}
              courseTitle={certificate.courseTitle}
              score={certificate.score}
              percentage={certificate.percentage}
              completionDate={certificate.completionDate}
              certificateId={certificate.id}
              certificateNumber={certificate.id}
              instructorName={certificate.instructorName}
            />
          </div>
        </Col>
      </Row>

      {/* Share Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm bg-info bg-opacity-10">
            <Card.Body>
              <h6 className="fw-bold mb-2">
                <i className="bi bi-share me-2"></i>Share Your Achievement
              </h6>
              <p className="small mb-2 text-muted">
                Share this certificate with others to showcase your achievement!
              </p>
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="link"
                  href={`https://linkedin.com/in/profile`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-linkedin"></i>
                </Button>
                <Button
                  size="sm"
                  variant="link"
                  href={`https://twitter.com/intent/tweet?text=I%20just%20completed%20${certificate.courseTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-twitter"></i>
                </Button>
                <Button
                  size="sm"
                  variant="link"
                  href={`mailto:?subject=Check%20out%20my%20certificate&body=I%20just%20completed%20${certificate.courseTitle}`}
                >
                  <i className="bi bi-envelope"></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
