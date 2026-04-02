import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import QuestionCard from './QuestionCard';
import ResultPage from './ResultPage';
import { getCourseQuiz, submitQuizAnswers } from '../services/quizAPI';
import '../styles/quiz-interface.css';

export default function QuizPage() {
  const { courseId, quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(new Date());

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let quizData;
        if (courseId) {
          quizData = await getCourseQuiz(courseId);
        } else if (quizId) {
          const response = await fetch(`/api/quiz/${quizId}`);
          quizData = await response.json();
        }

        if (!quizData) {
          setError('Quiz not found');
          return;
        }

        setQuiz(quizData);
        // Initialize answers object
        const initialAnswers = {};
        quizData.questions?.forEach((question) => {
          initialAnswers[question.id] = null;
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, quizId]);

  // Handle answer selection
  const handleSelectAnswer = (optionIndex) => {
    const currentQuestion = quiz?.questions?.[currentQuestionIndex];
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: optionIndex
      }));
    }
  };

  // Navigation
  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Check if all questions answered
  const allAnswered = Object.values(answers).every(a => a !== null && a !== undefined);

  // Submit quiz
  const handleSubmit = async () => {
    if (!allAnswered) {
      setError('Please answer all questions before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await submitQuizAnswers(
        quiz.id,
        user?.id,
        answers
      );

      // Calculate score
      let correctCount = 0;
      quiz.questions?.forEach((question, index) => {
        const userAnswer = answers[question.id];
        const correctAnswer = question.correctAnswer !== undefined 
          ? question.correctAnswer 
          : question.correctAnswerIndex;
        
        if (userAnswer === correctAnswer) {
          correctCount++;
        }
      });

      setResult({
        ...response,
        correctAnswers: correctCount,
        wrongAnswers: quiz.questions?.length - correctCount,
        answers,
        timeTaken: Math.round((new Date() - startTime) / 1000)
      });
      
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    quiz?.questions?.forEach((question) => {
      setAnswers(prev => ({
        ...prev,
        [question.id]: null
      }));
    });
    setSubmitted(false);
    setResult(null);
  };

  // Loading state
  if (loading) {
    return (
      <Container className="quiz-container py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading quiz...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading quiz...</p>
      </Container>
    );
  }

  // Error state
  if (error && !quiz) {
    return (
      <Container className="quiz-container py-5">
        <Alert variant="danger">
          <h4>Unable to load quiz</h4>
          <p>{error}</p>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline-danger"
          >
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  // Quiz not found
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Container className="quiz-container py-5">
        <Alert variant="warning">
          <h4>No quiz available</h4>
          <p>This course does not have a quiz yet.</p>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline-warning"
          >
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  // Result page
  if (submitted && result) {
    return (
      <Container className="quiz-container py-5">
        <ResultPage
          score={result.score}
          totalQuestions={quiz.questions.length}
          passingScore={quiz.passingScore || 60}
          correctAnswers={result.correctAnswers}
          wrongAnswers={result.wrongAnswers}
          answers={answers}
          questions={quiz.questions}
          courseId={courseId}
          onRetry={handleRetry}
          loading={submitting}
        />
      </Container>
    );
  }

  // Main quiz page
  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.id];

  return (
    <Container className="quiz-container py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          {/* Quiz Header */}
          <div className="quiz-header">
            <h1 className="quiz-title">{quiz.title || 'Quiz'}</h1>
            {quiz.description && (
              <p className="quiz-description">{quiz.description}</p>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="warning" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Question */}
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={quiz.questions.length}
              selectedAnswer={currentAnswer}
              onSelectAnswer={handleSelectAnswer}
            />
          )}

          {/* Navigation */}
          <div className="quiz-navigation">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline-primary"
              className="nav-btn"
            >
              ← Previous
            </Button>

            <div className="nav-info">
              <span className="question-counter">
                {currentQuestionIndex + 1} / {quiz.questions.length}
              </span>
              <span className={`answer-status ${currentAnswer !== null ? 'answered' : 'unanswered'}`}>
                {currentAnswer !== null ? '✓ Answered' : '○ Unanswered'}
              </span>
            </div>

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="primary"
                className="nav-btn"
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                variant="success"
                className="nav-btn submit-btn"
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            )}
          </div>

          {/* Unanswered Questions Warning */}
          {!allAnswered && (
            <div className="unanswered-warning">
              <span className="warning-icon">!</span>
              <span className="warning-text">
                Please answer all questions before submitting
              </span>
            </div>
          )}

          {/* Question Overview */}
          <div className="question-overview">
            <h4 className="overview-title">Questions Overview</h4>
            <div className="overview-grid">
              {quiz.questions.map((question, index) => (
                <button
                  key={index}
                  className={`overview-item ${
                    index === currentQuestionIndex ? 'active' : ''
                  } ${answers[question.id] !== null ? 'answered' : 'unanswered'}`}
                  onClick={() => setCurrentQuestionIndex(index)}
                  title={`Question ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
