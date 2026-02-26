/**
 * Quiz Service
 * Fetches quiz questions and submits answers via backend API.
 * Falls back to mock data if backend is unreachable.
 */
import apiClient from './apiClient';

// ─── mock data (used when backend is unavailable) ──────────────────────────────
const MOCK_QUIZZES = {
  default: {
    id: 1,
    title: 'Course Assessment',
    timeLimit: 600, // seconds
    questions: [
      {
        id: 1,
        text: 'What does HTML stand for?',
        options: [
          'HyperText Markup Language',
          'HyperText Medium Language',
          'HighText Markup Language',
          'HyperTransfer Markup Language',
        ],
        correctIndex: 0,
      },
      {
        id: 2,
        text: 'Which CSS property is used to change text color?',
        options: ['font-color', 'text-color', 'color', 'foreground-color'],
        correctIndex: 2,
      },
      {
        id: 3,
        text: 'Which keyword declares a block-scoped variable in JavaScript?',
        options: ['var', 'let', 'def', 'dim'],
        correctIndex: 1,
      },
      {
        id: 4,
        text: 'What is the correct way to create an arrow function in JS?',
        options: [
          'function() => {}',
          '() -> {}',
          '() => {}',
          '=>() {}',
        ],
        correctIndex: 2,
      },
      {
        id: 5,
        text: 'Which hook is used for side effects in React?',
        options: ['useState', 'useEffect', 'useCallback', 'useReducer'],
        correctIndex: 1,
      },
    ],
  },
};

// ─── API ────────────────────────────────────────────────────────────────────────

/**
 * Fetch quiz for a given course.
 * @param {number|string} courseId
 */
export async function getCourseQuiz(courseId) {
  try {
    const res = await apiClient.get(`/api/courses/${courseId}/quiz`);
    return res.data;
  } catch {
    return MOCK_QUIZZES.default;
  }
}

/**
 * Submit quiz answers to the backend.
 * @param {number} userId
 * @param {number} quizId
 * @param {Record<number,number>} answers  mapping of questionId → selectedOptionIndex
 */
export async function submitQuiz(userId, quizId, answers) {
  try {
    const res = await apiClient.post(`/api/quizzes/${quizId}/submit`, { userId, answers });
    return res.data; // { score, total, passed, results: [{questionId, correct}] }
  } catch {
    // Compute score locally when backend is down
    return null; // caller handles null
  }
}
