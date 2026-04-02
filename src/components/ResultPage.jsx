import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/quiz-interface.css';

/**
 * ResultPage Component
 * Displays quiz results with score, correct/wrong answers, and pass/fail status
 */
export default function ResultPage({
  score,
  totalQuestions,
  passingScore = 60,
  correctAnswers,
  wrongAnswers,
  answers,
  questions,
  courseId,
  onRetry,
  loading = false
}) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = percentage >= passingScore;

  // Calculate time if available
  const calculatePerformance = () => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="result-page">
      {/* Header */}
      <div className="result-header">
        <div className={`result-status ${passed ? 'passed' : 'failed'}`}>
          <div className="status-icon">
            {passed ? (
              <span className="icon-pass">✓</span>
            ) : (
              <span className="icon-fail">✕</span>
            )}
          </div>
          <h2 className="status-title">
            {passed ? 'Great Job!' : 'Try Again'}
          </h2>
          <p className="status-message">
            {passed
              ? `You passed the quiz with ${percentage}% score!`
              : `You scored ${percentage}%. Try again to reach ${passingScore}%`}
          </p>
        </div>
      </div>

      {/* Score Card */}
      <div className="score-card">
        <div className="score-main">
          <div className="score-circle">
            <div className="score-percentage">{percentage}%</div>
            <div className="score-label">Score</div>
          </div>
          <div className="score-details">
            <div className="score-item">
              <span className="score-label-text">Performance</span>
              <span className="score-value">{calculatePerformance()}</span>
            </div>
            <div className="score-item">
              <span className="score-label-text">Passing Score</span>
              <span className="score-value">{passingScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-box correct">
          <div className="stat-icon">✓</div>
          <div className="stat-value">{correctAnswers}</div>
          <div className="stat-label">Correct Answers</div>
        </div>
        <div className="stat-box total">
          <div className="stat-icon"># </div>
          <div className="stat-value">{totalQuestions}</div>
          <div className="stat-label">Total Questions</div>
        </div>
        <div className="stat-box wrong">
          <div className="stat-icon">✕</div>
          <div className="stat-value">{wrongAnswers}</div>
          <div className="stat-label">Wrong Answers</div>
        </div>
      </div>

      {/* Answer Review */}
      {questions && questions.length > 0 && (
        <div className="answer-review">
          <h3 className="review-title">Answer Review</h3>
          <div className="review-list">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer || 
                              userAnswer === question.correctAnswerIndex;
              const option = question.options?.[userAnswer];

              return (
                <div key={index} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="review-header">
                    <span className="review-number">Q{index + 1}</span>
                    <span className={`review-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? '✓ Correct' : '✕ Incorrect'}
                    </span>
                  </div>
                  <p className="review-question">{question.question || question.text}</p>
                  <div className="review-answer">
                    <span className="answer-label">Your answer:</span>
                    <span className="answer-text">
                      {typeof option === 'string' ? option : option?.text || 'Not answered'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div className="correct-answer">
                      <span className="answer-label">Correct answer:</span>
                      <span className="answer-text">
                        {typeof question.options?.[question.correctAnswerIndex] === 'string'
                          ? question.options[question.correctAnswerIndex]
                          : question.options?.[question.correctAnswerIndex]?.text}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="result-actions">
        {!passed && (
          <Button
            onClick={onRetry}
            disabled={loading}
            className="btn-primary-quiz"
          >
            {loading ? 'Loading...' : 'Retake Quiz'}
          </Button>
        )}
        {courseId && (
          <Button
            as={Link}
            to={`/courses/${courseId}`}
            variant="outline-primary"
            className="btn-secondary-quiz"
          >
            Back to Course
          </Button>
        )}
        <Button
          as={Link}
          to="/explore"
          variant="outline-secondary"
          className="btn-secondary-quiz"
        >
          Browse More Courses
        </Button>
      </div>

      {/* Certificate Note */}
      {passed && (
        <div className="certificate-note">
          <span className="note-icon">🎓</span>
          <span className="note-text">
            Certificate has been added to your account
          </span>
        </div>
      )}
    </div>
  );
}

ResultPage.propTypes = {
  score: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  passingScore: PropTypes.number,
  correctAnswers: PropTypes.number.isRequired,
  wrongAnswers: PropTypes.number.isRequired,
  answers: PropTypes.object.isRequired,
  questions: PropTypes.arrayOf(PropTypes.object),
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onRetry: PropTypes.func,
  loading: PropTypes.bool
};
