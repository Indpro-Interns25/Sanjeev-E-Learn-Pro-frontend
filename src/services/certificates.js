/**
 * Certificate Service
 * Handles certificate generation, storage, and retrieval
 */
import jsPDF from 'jspdf';
import { API_URL } from '../config/config';
import apiClient from './api';

/**
 * Generate a unique certificate ID
 * Format: CERT-YYYYMMDD-XXXXX (where XXXXX is random)
 */
export function generateCertificateId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CERT-${date}-${random}`;
}

/**
 * Generate certificate data after quiz pass
 * @param {Object} params - Certificate parameters
 * @returns {Object} Certificate object
 */
export function generateCertificate({
  userId,
  courseId,
  courseTitle,
  quizId,
  score,
  totalScore = 100,
  percentage,
  instructorName = 'EduLearn Pro Team',
  completionDate = new Date().toISOString()
}) {
  const certificate = {
    id: generateCertificateId(),
    userId,
    courseId,
    quizId,
    courseTitle,
    score,
    totalScore,
    percentage,
    instructorName,
    completionDate,
    issuedDate: new Date().toISOString(),
    verificationCode: Math.random().toString(36).substring(2, 11).toUpperCase(),
    status: 'active'
  };

  return certificate;
}

/**
 * Generate and save a certificate from a passed final test.
 * @param {Object} params
 * @returns {Object} Generated certificate
 */
export function generateFinalTestCertificate({
  userId,
  courseId,
  courseTitle,
  score,
  percentage,
  totalScore,
  instructorName = 'EduLearn Pro Team',
  completionDate = new Date().toISOString(),
}) {
  const certificate = generateCertificate({
    userId,
    courseId,
    courseTitle,
    quizId: `final-${courseId}`,
    score,
    totalScore,
    percentage,
    instructorName,
    completionDate,
  });

  saveCertificateLocally(userId, certificate);
  return certificate;
}

/**
 * Download a certificate as PDF.
 * @param {Object} certificate
 * @param {Object} options
 */
export async function downloadCertificatePDF(certificate, options = {}) {
  if (!certificate) {
    throw new Error('Certificate is required');
  }

  const userName = options.userName || 'Student';
  const courseTitle = options.courseTitle || certificate.courseTitle || 'Course';
  const completionDate = options.completionDate || certificate.completionDate;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;

  pdf.setFillColor(250, 250, 252);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(1.5);
  pdf.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(28);
  pdf.text('Certificate of Completion', pageWidth / 2, 34, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This certifies that', pageWidth / 2, 50, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text(userName, pageWidth / 2, 66, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text('has successfully completed the course', pageWidth / 2, 80, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  const wrappedCourse = pdf.splitTextToSize(courseTitle, pageWidth - 40);
  pdf.text(wrappedCourse, pageWidth / 2, 94, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text(`Score: ${certificate.score} / ${certificate.totalScore}`, pageWidth / 2, 118, { align: 'center' });
  pdf.text(`Percentage: ${certificate.percentage}%`, pageWidth / 2, 128, { align: 'center' });
  pdf.text(`Completion Date: ${new Date(completionDate).toLocaleDateString()}`, pageWidth / 2, 138, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.text(`Certificate ID: ${certificate.id}`, pageWidth / 2, 158, { align: 'center' });
  pdf.text(`Verification Code: ${certificate.verificationCode}`, pageWidth / 2, 168, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.text(certificate.instructorName || 'EduLearn Pro Team', pageWidth / 2, pageHeight - 24, { align: 'center' });

  const fileName = `Certificate-${certificate.id}.pdf`;
  pdf.save(fileName);
  return fileName;
}

/**
 * Save certificate to localStorage
 * @param {number} userId - User ID
 * @param {Object} certificate - Certificate object
 */
export function saveCertificateLocally(userId, certificate) {
  try {
    const key = `certificates_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Check if certificate already exists
    const exists = existing.find(c => 
      c.id === certificate.id || 
      (c.courseId === certificate.courseId && c.userId === certificate.userId)
    );
    
    if (!exists) {
      existing.push(certificate);
      localStorage.setItem(key, JSON.stringify(existing));
      console.warn('✅ Certificate saved locally:', certificate);
    } else {
      console.warn('⚠️ Certificate already exists:', certificate.id);
    }
    
    return certificate;
  } catch (error) {
    console.error('❌ Error saving certificate:', error);
    throw new Error('Failed to save certificate');
  }
}

/**
 * Get all certificates for a user
 * @param {number} userId - User ID
 * @returns {Array} Array of certificate objects
 */
export function getUserCertificates(userId) {
  try {
    const key = `certificates_${userId}`;
    const certificates = JSON.parse(localStorage.getItem(key) || '[]');
    console.warn('📚 User certificates:', certificates);
    return certificates || [];
  } catch (error) {
    console.error('❌ Error retrieving certificates:', error);
    return [];
  }
}

/**
 * Get a specific certificate by ID
 * @param {number} userId - User ID
 * @param {string} certificateId - Certificate ID
 * @returns {Object|null} Certificate object or null
 */
export function getCertificateById(userId, certificateId) {
  try {
    const certificates = getUserCertificates(userId);
    const certificate = certificates.find(c => c.id === certificateId);
    return certificate || null;
  } catch (error) {
    console.error('❌ Error retrieving certificate:', error);
    return null;
  }
}

/**
 * Get certificate by course ID
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @returns {Object|null} Certificate object or null
 */
export function getCertificateByCourseid(userId, courseId) {
  try {
    const certificates = getUserCertificates(userId);
    const certificate = certificates.find(c => 
      c.courseId === parseInt(courseId) && c.status === 'active'
    );
    return certificate || null;
  } catch (error) {
    console.error('❌ Error retrieving certificate:', error);
    return null;
  }
}

/**
 * Delete a certificate
 * @param {number} userId - User ID
 * @param {string} certificateId - Certificate ID
 * @returns {boolean} Success status
 */
export function deleteCertificate(userId, certificateId) {
  try {
    const key = `certificates_${userId}`;
    const certificates = JSON.parse(localStorage.getItem(key) || '[]');
    
    const filtered = certificates.filter(c => c.id !== certificateId);
    localStorage.setItem(key, JSON.stringify(filtered));
    
    console.warn('✅ Certificate deleted:', certificateId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting certificate:', error);
    return false;
  }
}

/**
 * Verify certificate authenticity
 * @param {Object} certificate - Certificate object to verify
 * @returns {Object} Verification result
 */
export function verifyCertificate(certificate) {
  const result = {
    valid: true,
    issues: []
  };

  if (!certificate.id) {
    result.valid = false;
    result.issues.push('Missing certificate ID');
  }

  if (!certificate.userId || !certificate.courseId) {
    result.valid = false;
    result.issues.push('Missing user or course information');
  }

  if (certificate.percentage < 60) {
    result.valid = false;
    result.issues.push('Certificate awarded to user with less than 60% score');
  }

  if (certificate.status !== 'active') {
    result.valid = false;
    result.issues.push('Certificate is not active');
  }

  // Check if certificate is not from future
  const issuedDate = new Date(certificate.issuedDate);
  if (issuedDate > new Date()) {
    result.valid = false;
    result.issues.push('Certificate has future date');
  }

  return result;
}

/**
 * Export certificate as JSON
 * @param {Object} certificate - Certificate object
 * @returns {string} JSON string
 */
export function exportCertificateJSON(certificate) {
  try {
    return JSON.stringify(certificate, null, 2);
  } catch (error) {
    console.error('❌ Error exporting certificate:', error);
    return null;
  }
}

/**
 * Import certificate from JSON
 * @param {string} jsonString - JSON string
 * @returns {Object|null} Certificate object or null
 */
export function importCertificateJSON(jsonString) {
  try {
    const certificate = JSON.parse(jsonString);
    const verification = verifyCertificate(certificate);
    
    if (!verification.valid) {
      console.warn('⚠️ Certificate verification failed:', verification.issues);
      return null;
    }
    
    return certificate;
  } catch (error) {
    console.error('❌ Error importing certificate:', error);
    return null;
  }
}

/**
 * Generate certificate data summary for API submission
 * @param {Object} certificate - Certificate object
 * @returns {Object} Summary object
 */
export function getCertificateSummary(certificate) {
  return {
    certificateId: certificate.id,
    userId: certificate.userId,
    courseId: certificate.courseId,
    courseTitle: certificate.courseTitle,
    score: certificate.score,
    percentage: certificate.percentage,
    completionDate: certificate.completionDate,
    issuedDate: certificate.issuedDate,
    verificationCode: certificate.verificationCode
  };
}

/**
 * Send certificate to backend (optional)
 * @param {Object} certificate - Certificate object
 */
export async function submitCertificateToBackend(certificate) {
  try {
    try {
      const res = await apiClient.post('/api/certificates', certificate);
      console.warn('✅ Certificate submitted to backend:', res.data);
      return res.data;
    } catch (err) {
      console.warn('⚠️ Certificate submit failed via apiClient, falling back:', err?.message || err);
      throw err;
    }
  } catch (error) {
    console.warn('⚠️ Could not submit to backend, using localStorage:', error.message);
    return null;
  }
}

/**
 * Get certificate statistics for user
 * @param {number} userId - User ID
 * @returns {Object} Statistics object
 */
export function getCertificateStatistics(userId) {
  try {
    const certificates = getUserCertificates(userId);
    
    return {
      totalCertificates: certificates.length,
      activeCertificates: certificates.filter(c => c.status === 'active').length,
      averageScore: certificates.length > 0 
        ? Math.round(certificates.reduce((sum, c) => sum + c.percentage, 0) / certificates.length)
        : 0,
      courses: certificates.map(c => ({
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        percentage: c.percentage,
        completionDate: c.completionDate
      }))
    };
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    return null;
  }
}

/**
 * Generate and save course completion certificate
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @param {Object} courseData - Course information { title, instructor }
 * @returns {Object} Generated certificate
 */
export function generateCourseCompletionCertificate(userId, courseId, courseData = {}) {
  const certificate = generateCertificate({
    userId,
    courseId,
    courseTitle: courseData.title || 'Course',
    quizId: null,
    score: 100,
    totalScore: 100,
    percentage: 100,
    instructorName: courseData.instructor || 'EduLearn Pro Team',
    completionDate: new Date().toISOString()
  });
  
  saveCertificateLocally(userId, certificate);
  return certificate;
}

/**
 * Check if user has certificate for course
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @returns {boolean} Has certificate
 */
export function hasCourseCompletionCertificate(userId, courseId) {
  const certificate = getCertificateByCourseid(userId, courseId);
  return certificate !== null;
}
