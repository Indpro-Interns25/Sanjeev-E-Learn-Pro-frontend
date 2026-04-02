import { useState, useEffect } from 'react';
import { Card, Button, Form, Badge, Alert, ProgressBar, Modal, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../styles/quiz.css';

export default function QuizComponent({
  quizId,
  title = 'Quiz',
  questions = [],
  timeLimit = 0, // in minutes, 0 = no limit
  passing_score = 70,
  onSubmit = null,
  onCancel = null,
  loading = false
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLimit === 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        if (prev <= 60 && !showWarning) {
          setShowWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, isSubmitted, showWarning]);

  const handleSelectAnswer = (questionId, answerIndex) => {
    if (isSubmitted) return;
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      setShowWarning(true);
      return;
    }

    // Calculate score
    let correctCount = 0;
    questions.forEach((question) => {
      const selectedAnswerIndex = answers[question.id];
      if (selectedAnswerIndex !== undefined && question.options[selectedAnswerIndex]?.is_correct) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore({
      correct: correctCount,
      total: questions.length,
      percentage: calculatedScore,
      passed: calculatedScore >= passing_score
    });
    setIsSubmitted(true);

    if (onSubmit) {
      onSubmit({
        quiz_id: quizId,
        score: calculatedScore,
        correct_answers: correctCount,
        total_questions: questions.length,
        answers: answers,
        passed: calculatedScore >= passing_score
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (loading) {
    return (
      <Card className="quiz-container">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Loading quiz...</p>
        </Card.Body>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Alert variant="warning" className="text-center">
        <i className="bi bi-exclamation-triangle me-2"></i>
        No questions available for this quiz
      </Alert>
    );
  }

  if (isSubmitted && score) {
    return (
      <Card className="quiz-container quiz-results">
        <Card.Body className="text-center py-5">
          <div className="result-icon mb-4">
            {score.passed ? (
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
            ) : (
              <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
            )}
          </div>

          <h3 className="mb-3">
            {score.passed ? 'Congratulations!' : 'Try Again'}
          </h3>

          <div className="score-display mb-4">
            <h1 className={score.passed ? 'text-success' : 'text-danger'}>
              {score.percentage}%
            </h1>
            <p className="text-muted">
              You answered {score.correct} out of {score.total} questions correctly
            </p>
          </div>

          {score.passed && (
            <Alert variant="success" className="mb-4">
              <i className="bi bi-check-circle me-2"></i>
              You have passed the quiz! Great job!
            </Alert>
          )}

          {!score.passed && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              You need to score at least {passing_score}% to pass. Please review and try again.
            </Alert>
          )}

          <div className="d-flex gap-2 justify-content-center">
            <Button variant="primary" onClick={() => setShowReview(true)}>
              <i className="bi bi-eye me-2"></i> Review Answers
            </Button>
            <Button variant="outline-secondary" onClick={handleCancel}>
              <i className="bi bi-x-circle me-2"></i> Exit Quiz
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <Card className="quiz-container">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{title}</h5>
            {timeLimit > 0 && (
              <Badge
                bg={timeRemaining <= 60 ? 'danger' : 'light'}
                text={timeRemaining <= 60 ? 'white' : 'dark'}
                className="fs-6"
              >
                <i className="bi bi-clock me-2"></i>
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
        </Card.Header>

        <Card.Body>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="small text-muted">
                {Object.keys(answers).length} answered
              </span>
            </div>
            <ProgressBar now={progress} className="quiz-progress" />
          </div>

          {/* Question */}
          <div className="question-section mb-4">
            <h6 className="question-title mb-3">
              {currentQuestion.question || currentQuestion.text}
            </h6>

            {/* Options */}
            <div className="options-list">
              {currentQuestion.options?.map((option, index) => (
                <Form.Check
                  key={index}
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  id={`option-${index}`}
                  label={
                    <div className="option-label">
                      {option.text || option.option_text}
                    </div>
                  }
                  checked={answers[currentQuestion.id] === index}
                  onChange={() => handleSelectAnswer(currentQuestion.id, index)}
                  disabled={isSubmitted}
                  className="option-item mb-3"
                />
              ))}
            </div>

            {/* Question Description */}
            {currentQuestion.explanation && isSubmitted && (
              <Alert variant="info" className="mt-4">
                <strong>Explanation:</strong>
                <p className="mb-0 mt-2">{currentQuestion.explanation}</p>
              </Alert>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="d-flex gap-2 justify-content-between">
            <Button
              variant="outline-secondary"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSubmitted}
            >
              <i className="bi bi-arrow-left me-2"></i> Previous
            </Button>

            <div className="question-indicator d-flex gap-1 flex-wrap justify-content-center">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={
                    answers[questions[index].id] !== undefined
                      ? 'primary'
                      : 'outline-secondary'
                  }
                  className={currentQuestionIndex === index ? 'active' : ''}
                  onClick={() => setCurrentQuestionIndex(index)}
                  disabled={isSubmitted}
                  title={`Question ${index + 1}`}
                >
                  {index + 1}
                </Button>
              ))}
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={isSubmitted}
              >
                Submit Quiz <i className="bi bi-check-circle ms-2"></i>
              </Button>
            ) : (
              <Button
                variant="outline-secondary"
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1 || isSubmitted}
              >
                Next <i className="bi bi-arrow-right ms-2"></i>
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Review Modal */}
      <Modal show={showReview} onHide={() => setShowReview(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Quiz Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {questions.map((question, index) => {
            const selectedAnswerIndex = answers[question.id];
            const selectedOption = question.options?.[selectedAnswerIndex];
            const isCorrect = selectedOption?.is_correct;

            return (
              <div key={question.id} className="review-item mb-4 p-3 border rounded">
                <div className="d-flex align-items-start mb-2">
                  <Badge
                    bg={isCorrect ? 'success' : 'danger'}
                    className="me-2 mt-1"
                  >
                    {isCorrect ? (
                      <i className="bi bi-check-circle"></i>
                    ) : (
                      <i className="bi bi-x-circle"></i>
                    )}
                  </Badge>
                  <div className="flex-grow-1">
                    <h6 className="mb-2">Question {index + 1}</h6>
                    <p className="mb-2">{question.question || question.text}</p>
                  </div>
                </div>

                {selectedOption && (
                  <div className="answer-review">
                    <p className="mb-1">
                      <strong>Your answer:</strong>{' '}
                      <span className={isCorrect ? 'text-success' : 'text-danger'}>
                        {selectedOption.text || selectedOption.option_text}
                      </span>
                    </p>
                  </div>
                )}

                {question.explanation && (
                  <p className="text-muted small mt-2">
                    <i className="bi bi-info-circle me-1"></i>
                    {question.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReview(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

QuizComponent.propTypes = {
  quizId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  questions: PropTypes.array.isRequired,
  timeLimit: PropTypes.number,
  passing_score: PropTypes.number,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
};
