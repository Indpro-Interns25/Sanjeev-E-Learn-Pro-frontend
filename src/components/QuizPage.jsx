import React, { useState, useEffect, useRef } from 'react';
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
  const questionRefs = useRef({});

  // State
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(new Date());

  const buildInitialAnswers = (questionList) => {
    const initialAnswers = {};
    questionList.forEach((question) => {
      initialAnswers[question.id] = null;
    });
    return initialAnswers;
  };

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
        setAnswers(buildInitialAnswers(quizData.questions || []));
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
  const handleSelectAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const scrollToQuestion = (index) => {
    questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Check if all questions answered
  const allAnswered = (quiz?.questions || []).every((question) => answers[question.id] !== null && answers[question.id] !== undefined);

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
    setAnswers(buildInitialAnswers(quiz?.questions || []));
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
  const answeredCount = (quiz.questions || []).filter((question) => answers[question.id] !== null && answers[question.id] !== undefined).length;

  return (
    <Container className="quiz-container py-5">
      <Row className="justify-content-center">
        <Col lg={10} xl={9}>
          {/* Quiz Header */}
          <div className="quiz-header">
            <h1 className="quiz-title">{quiz.title || 'Quiz'}</h1>
            {quiz.description && (
              <p className="quiz-description">{quiz.description}</p>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-muted small">
              Question 1 of {quiz.questions.length}
            </div>
            <div className="text-muted small">
              {answeredCount} / {quiz.questions.length} answered
            </div>
          </div>

          <div
            className="quiz-question-scroll"
            style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.25rem' }}
          >
            {quiz.questions.map((question, index) => (
              <div
                key={question.id}
                ref={(node) => {
                  questionRefs.current[index] = node;
                }}
                className="mb-4"
              >
                <QuestionCard
                  question={question}
                  questionNumber={index + 1}
                  totalQuestions={quiz.questions.length}
                  selectedAnswer={answers[question.id]}
                  onSelectAnswer={(optionIndex) => handleSelectAnswer(question.id, optionIndex)}
                />
              </div>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="warning" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4">
            <div className="text-muted small">
              Scroll through the full quiz and answer every question before submitting.
            </div>
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
                'Submit Full Quiz'
              )}
            </Button>
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
                    answers[question.id] !== null ? 'answered' : 'unanswered'
                  } ${answers[question.id] !== null ? 'answered' : 'unanswered'}`}
                  onClick={() => scrollToQuestion(index)}
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
