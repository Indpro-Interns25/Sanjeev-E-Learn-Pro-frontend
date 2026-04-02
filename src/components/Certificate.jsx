import React from 'react';
import PropTypes from 'prop-types';
import '../styles/certificate.css';

/**
 * Certificate Component
 * Displays a professional certificate design
 */
export default function Certificate({
  userName,
  courseTitle,
  score,
  percentage,
  completionDate,
  certificateId,
  certificateNumber,
  instructorName = 'EduLearn Pro Team'
}) {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="certificate-container">
      <div className="certificate">
        {/* Background decorations */}
        <div className="certificate-overlay"></div>
        
        {/* Top decorative border */}
        <div className="certificate-top-border"></div>
        
        {/* Certificate content */}
        <div className="certificate-content">
          {/* Header section */}
          <div className="certificate-header">
            <div className="certificate-badge">
              <i className="bi bi-trophy-fill"></i>
            </div>
            <h1 className="certificate-title">Certificate of Completion</h1>
            <p className="certificate-subtitle">EduLearn Pro</p>
          </div>

          {/* Main content section */}
          <div className="certificate-main">
            <p className="certificate-text">This is to certify that</p>
            
            <h2 className="certificate-name">{userName}</h2>
            
            <p className="certificate-text">has successfully completed the course</p>
            
            <h3 className="certificate-course">{courseTitle}</h3>
            
            <div className="certificate-stats">
              <div className="stat">
                <span className="stat-label">Score</span>
                <span className="stat-value">{score} pts</span>
              </div>
              <div className="stat-divider">|</div>
              <div className="stat">
                <span className="stat-label">Percentage</span>
                <span className="stat-value">{percentage}%</span>
              </div>
            </div>

            <p className="certificate-text-small">
              Awarded on <strong>{formatDate(completionDate)}</strong>
            </p>
          </div>

          {/* Signature section */}
          <div className="certificate-signature">
            <div className="signature-block">
              <div className="signature-line"></div>
              <p className="signature-name">{instructorName}</p>
              <p className="signature-title">Instructor / Instructor Team</p>
            </div>
            
            <div className="signature-block">
              <div className="certificate-seal">
                <i className="bi bi-award-fill"></i>
              </div>
              <p className="signature-title">Certificate ID</p>
              <p className="certificate-id">{certificateNumber}</p>
            </div>
          </div>

          {/* Bottom border */}
          <div className="certificate-bottom-border"></div>

          {/* Ribbon decorations */}
          <div className="ribbon ribbon-left"></div>
          <div className="ribbon ribbon-right"></div>
        </div>
      </div>
    </div>
  );
}

Certificate.propTypes = {
  userName: PropTypes.string.isRequired,
  courseTitle: PropTypes.string.isRequired,
  score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  completionDate: PropTypes.string,
  certificateId: PropTypes.string,
  certificateNumber: PropTypes.string,
  instructorName: PropTypes.string
};
