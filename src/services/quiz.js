/**
 * Quiz Service
 * Fetches lesson quizzes and final tests, submits answers via backend API,
 * and falls back to deterministic local quiz data when the backend is unavailable.
 */
import apiClient from './apiClient';

const FINAL_TEST_STORAGE_KEY = 'edu_final_test_results';
const LESSON_QUIZ_STORAGE_KEY = 'edu_lesson_quiz_attempts';

function toOption(text, isCorrect = false) {
  return { text, is_correct: isCorrect };
}

function normalizeQuestions(questions = []) {
  return questions.map((question, index) => {
    const correctIndex =
      question.correctIndex ??
      question.correctAnswerIndex ??
      question.correctAnswer ??
      0;

    const options = Array.isArray(question.options)
      ? question.options.map((option, optionIndex) => {
          if (typeof option === 'string') {
            return toOption(option, optionIndex === correctIndex);
          }
          if (option && typeof option === 'object') {
            return {
              text: option.text ?? option.option_text ?? '',
              option_text: option.option_text,
              is_correct:
                option.is_correct ?? option.isCorrect ?? optionIndex === correctIndex,
            };
          }
          return toOption(String(option ?? ''), optionIndex === correctIndex);
        })
      : [];

    return {
      id: question.id ?? index + 1,
      question: question.question ?? question.text ?? question.title ?? '',
      text: question.text ?? question.question ?? question.title ?? '',
      explanation: question.explanation ?? '',
      options,
    };
  });
}

function createQuestion(id, prompt, correctAnswer, wrongAnswers, explanation) {
  return {
    id,
    question: prompt,
    text: prompt,
    explanation: explanation || '',
    options: [
      toOption(correctAnswer, true),
      ...wrongAnswers.map((answer) => toOption(answer, false)),
    ],
  };
}

function buildLessonQuiz(courseId, lessonId, lessonTitle = 'Lesson') {
  const title = lessonTitle || `Lesson ${lessonId}`;

  return {
    id: `lesson-${courseId}-${lessonId}`,
    title: `${title} Quiz`,
    timeLimit: 0,
    passing_score: 0,
    questions: normalizeQuestions([
      createQuestion(
        1,
        `What should you do after finishing "${title}"?`,
        'Take the lesson quiz',
        ['Skip ahead without checking progress', 'Close the lesson immediately', 'Jump to the final certificate screen'],
        'Lesson quizzes are used to record progress and confirm completion.'
      ),
      createQuestion(
        2,
        'Does this lesson quiz require a strict pass mark to continue?',
        'No, the attempt itself records progress',
        ['Yes, you must score 100%', 'Yes, you must score at least 90%', 'No, but only after the final test'],
        'Lesson quizzes are mandatory for progress tracking, not for grading.'
      ),
      createQuestion(
        3,
        'What happens after submitting the lesson quiz?',
        'The lesson is marked as completed',
        ['The course certificate is issued immediately', 'The lesson is deleted from progress', 'The next lesson opens without checking anything'],
        'Completion is recorded after the quiz attempt is submitted.'
      ),
    ]),
  };
}

function buildFinalTest(courseId, courseTitle = 'Course') {
  return {
    id: `final-${courseId}`,
    title: `${courseTitle} Final Test`,
    timeLimit: 900,
    passing_score: 70,
    questions: normalizeQuestions([
      createQuestion(
        1,
        'What score is required to pass the final test?',
        '70% or higher',
        ['50% or higher', '60% or higher', '90% or higher'],
        'The final test uses a 70% pass threshold.'
      ),
      createQuestion(
        2,
        'When can you generate the course certificate?',
        'After passing the final test',
        ['After watching one lesson', 'After opening the course page', 'After attempting any quiz'],
        'The certificate remains locked until the final test is passed.'
      ),
      createQuestion(
        3,
        'What unlocks the final test?',
        'Completing all lessons in the course',
        ['Opening the dashboard', 'Submitting a lesson comment', 'Refreshing the page'],
        'The final test becomes available only after all lessons are completed.'
      ),
      createQuestion(
        4,
        'What should happen after each lesson video?',
        'Take the lesson quiz',
        ['Skip directly to the certificate', 'Wait for manual approval', 'Restart the course from the beginning'],
        'Each lesson video should be followed by its own quiz.'
      ),
      createQuestion(
        5,
        'What records lesson progress in this flow?',
        'A submitted lesson quiz attempt',
        ['The final test score', 'The course thumbnail', 'The comments section'],
        'Lesson completion is tracked when the quiz is attempted.'
      ),
    ]),
  };
}

function calculateResult(questions, answers) {
  const safeQuestions = normalizeQuestions(questions);
  let correctAnswers = 0;

  safeQuestions.forEach((question) => {
    const selectedIndex = answers?.[question.id];
    const selectedOption = question.options?.[selectedIndex];
    if (selectedOption?.is_correct) {
      correctAnswers += 1;
    }
  });

  const total = safeQuestions.length;
  const percentage = total > 0 ? Math.round((correctAnswers / total) * 100) : 0;

  return {
    score: correctAnswers,
    total,
    percentage,
    passed: percentage >= 70,
    correct_answers: correctAnswers,
    total_questions: total,
    answers,
    questions: safeQuestions,
  };
}

function loadStoredCollection(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function saveStoredCollection(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function storeLessonAttempt(userId, courseId, lessonId, result) {
  try {
    const store = loadStoredCollection(LESSON_QUIZ_STORAGE_KEY);
    const userKey = String(userId);
    if (!store[userKey]) {
      store[userKey] = {};
    }
    if (!store[userKey][courseId]) {
      store[userKey][courseId] = {};
    }
    store[userKey][courseId][lessonId] = {
      ...result,
      attemptedAt: new Date().toISOString(),
    };
    saveStoredCollection(LESSON_QUIZ_STORAGE_KEY, store);
  } catch {
    // ignore local storage failures
  }
}

function storeFinalTestResult(userId, courseId, result) {
  try {
    const store = loadStoredCollection(FINAL_TEST_STORAGE_KEY);
    const userKey = String(userId);
    if (!store[userKey]) {
      store[userKey] = {};
    }
    store[userKey][courseId] = {
      ...result,
      completedAt: new Date().toISOString(),
    };
    saveStoredCollection(FINAL_TEST_STORAGE_KEY, store);
  } catch {
    // ignore local storage failures
  }
}

export function getStoredFinalTestResult(userId, courseId) {
  const store = loadStoredCollection(FINAL_TEST_STORAGE_KEY);
  return store[String(userId)]?.[courseId] || null;
}

export function getStoredLessonQuizAttempt(userId, courseId, lessonId) {
  const store = loadStoredCollection(LESSON_QUIZ_STORAGE_KEY);
  return store[String(userId)]?.[courseId]?.[lessonId] || null;
}

export async function getCourseQuiz(courseId) {
  try {
    const res = await apiClient.get(`/api/courses/${courseId}/quiz`);
    return {
      id: res.data?.id ?? `course-${courseId}`,
      title: res.data?.title ?? 'Course Assessment',
      timeLimit: res.data?.timeLimit ?? 600,
      questions: normalizeQuestions(res.data?.questions ?? []),
    };
  } catch {
    return buildFinalTest(courseId, `Course ${courseId}`);
  }
}

export async function getLessonQuiz(courseId, lessonId, lessonTitle = 'Lesson') {
  try {
    const res = await apiClient.get(`/api/courses/${courseId}/lessons/${lessonId}/quiz`);
    return {
      id: res.data?.id ?? `lesson-${courseId}-${lessonId}`,
      title: res.data?.title ?? `${lessonTitle} Quiz`,
      timeLimit: res.data?.timeLimit ?? 0,
      questions: normalizeQuestions(res.data?.questions ?? []),
    };
  } catch {
    return buildLessonQuiz(courseId, lessonId, lessonTitle);
  }
}

export async function getFinalCourseTest(courseId, courseTitle = 'Course') {
  try {
    const res = await apiClient.get(`/api/courses/${courseId}/final-test`);
    return {
      id: res.data?.id ?? `final-${courseId}`,
      title: res.data?.title ?? `${courseTitle} Final Test`,
      timeLimit: res.data?.timeLimit ?? 900,
      passing_score: res.data?.passing_score ?? 70,
      questions: normalizeQuestions(res.data?.questions ?? []),
    };
  } catch {
    return buildFinalTest(courseId, courseTitle);
  }
}

export async function submitQuiz(userId, quizId, answers) {
  try {
    const res = await apiClient.post(`/api/quizzes/${quizId}/submit`, { userId, answers });
    return res.data;
  } catch {
    return null;
  }
}

export async function submitLessonQuiz(userId, courseId, lessonId, answers, questions) {
  const result = calculateResult(questions, answers);
  storeLessonAttempt(userId, courseId, lessonId, result);

  try {
    const res = await apiClient.post(`/api/courses/${courseId}/lessons/${lessonId}/quiz/submit`, {
      userId,
      answers,
    });
    return res.data ?? result;
  } catch {
    return result;
  }
}

export async function submitFinalTest(userId, courseId, quizId, answers, questions) {
  const result = calculateResult(questions, answers);
  storeFinalTestResult(userId, courseId, result);

  try {
    const res = await apiClient.post(`/api/courses/${courseId}/final-test/${quizId}/submit`, {
      userId,
      answers,
    });
    return res.data ?? result;
  } catch {
    return result;
  }
}

export function getFinalTestStatus(userId, courseId) {
  return getStoredFinalTestResult(userId, courseId);
}
