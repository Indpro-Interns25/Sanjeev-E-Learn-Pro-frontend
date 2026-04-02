import React from 'react';
import PropTypes from 'prop-types';
import '../styles/quiz-interface.css';

/**
 * QuestionCard Component
 * Displays a single quiz question with multiple choice options
 */
export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  disabled = false
}) {
  if (!question) return null;

  return (
    <div className="question-card">
      {/* Progress Indicator */}
      <div className="question-progress">
        <span className="progress-text">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{
              width: `${(questionNumber / totalQuestions) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="question-section">
        <h3 className="question-text">{question.question || question.text}</h3>
        {question.description && (
          <p className="question-description">{question.description}</p>
        )}
      </div>

      {/* Options */}
      <div className="options-section">
        <div className="options-list">
          {question.options && question.options.map((option, index) => (
            <label
              key={index}
              className={`option-label ${
                selectedAnswer === index ? 'selected' : ''
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={selectedAnswer === index}
                onChange={() => !disabled && onSelectAnswer(index)}
                disabled={disabled}
                className="option-input"
              />
              <span className="option-text">
                {option.text || option}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Selection Feedback */}
      {selectedAnswer !== null && selectedAnswer !== undefined && (
        <div className="selection-feedback">
          <span className="feedback-icon">✓</span>
          <span className="feedback-text">Option selected</span>
        </div>
      )}
    </div>
  );
}

QuestionCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    question: PropTypes.string,
    text: PropTypes.string,
    description: PropTypes.string,
    options: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          text: PropTypes.string,
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        })
      ])
    ).isRequired
  }).isRequired,
  questionNumber: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  selectedAnswer: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectAnswer: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};
