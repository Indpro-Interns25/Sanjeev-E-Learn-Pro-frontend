import apiClient from './apiClient';
import * as mock from '../data/mockComments';

// Helper to normalize API responses
function extractData(response) {
  if (!response) return null;
  if (response.data === undefined) return response;
  if (response.data && response.data.success && response.data.data) return response.data.data;
  return response.data;
}

export async function getCourseComments(courseId) {
  const tried = [];
  const paths = [
    `/api/courses/${courseId}/comments`,
    `/api/courses/${courseId}/reviews`,
    `/api/admin/courses/${courseId}/comments`,
    `/api/comments`,
    `/api/comments?courseId=${courseId}`
  ];

  for (const p of paths) {
    try {
      tried.push(p);
      const res = await apiClient.get(p);
      const data = extractData(res);
      if (Array.isArray(data)) return data;
      // handle object shape { comments: [...] }
      if (data && Array.isArray(data.comments)) return data.comments;
    } catch (err) {
      // If 404, try next path. For auth/network errors, break and fallback to mock
      if (err.response && (err.response.status === 404)) continue;
      console.warn('Comments API getCourseComments failed, falling back to mock:', err.message);
      return mock.getCourseComments(parseInt(courseId, 10));
    }
  }

  // No backend endpoint found, fall back to mock
  return mock.getCourseComments(parseInt(courseId, 10));
}

export async function getLessonComments(courseId, lessonId) {
  const paths = [
    `/api/courses/${courseId}/lessons/${lessonId}/comments`,
    `/api/lessons/${lessonId}/comments`,
    `/api/comments?courseId=${courseId}&lessonId=${lessonId}`
  ];

  for (const p of paths) {
    try {
      const res = await apiClient.get(p);
      const data = extractData(res);
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.comments)) return data.comments;
    } catch (err) {
      if (err.response && err.response.status === 404) continue;
      console.warn('Comments API getLessonComments failed, falling back to mock:', err.message);
      return mock.getLessonComments(parseInt(courseId, 10), parseInt(lessonId, 10));
    }
  }

  return mock.getLessonComments(parseInt(courseId, 10), parseInt(lessonId, 10));
}

export async function addComment(comment) {
  // comment should include courseId and optional lessonId
  const courseId = comment.courseId;
  const lessonId = comment.lessonId;
  const payload = { ...comment };

  const paths = [];
  if (lessonId) {
    paths.push(`/api/courses/${courseId}/lessons/${lessonId}/comments`);
  }
  paths.push(`/api/courses/${courseId}/comments`, '/api/comments');

  for (const p of paths) {
    try {
      const res = await apiClient.post(p, payload);
      const data = extractData(res);
      if (data) return data;
      return res.data || res;
    } catch (err) {
      if (err.response && err.response.status === 404) continue;
      console.warn('Comments API addComment failed, falling back to mock:', err.message);
      return mock.addComment(comment);
    }
  }

  // No backend available
  return mock.addComment(comment);
}

export async function addReply(commentId, reply) {
  const paths = [`/api/comments/${commentId}/replies`, `/api/replies`, `/api/comments/${commentId}/reply`];
  for (const p of paths) {
    try {
      const res = await apiClient.post(p, reply);
      const data = extractData(res);
      if (data) return data;
      return res.data || res;
    } catch (err) {
      if (err.response && err.response.status === 404) continue;
      console.warn('Comments API addReply failed, falling back to mock:', err.message);
      return mock.addReply(commentId, reply);
    }
  }

  return mock.addReply(commentId, reply);
}

export async function likeComment(commentId) {
  const paths = [`/api/comments/${commentId}/like`, `/api/comments/${commentId}/likes`, `/api/comments/${commentId}/thumbs-up`];
  for (const p of paths) {
    try {
      const res = await apiClient.post(p);
      const data = extractData(res);
      if (data !== undefined) return data;
      return res.data || res;
    } catch (err) {
      if (err.response && err.response.status === 404) continue;
      console.warn('Comments API likeComment failed, falling back to mock:', err.message);
      return mock.likeComment(commentId);
    }
  }

  return mock.likeComment(commentId);
}

export async function checkCommentsEndpoints(courseId) {
  const results = { available: false, requiresAuth: false, notFound: false };
  try {
    const res = await apiClient.get(`/api/courses/${courseId}/comments`);
    if (res.status === 200) results.available = true;
  } catch (err) {
    if (err.response) {
      if (err.response.status === 401 || err.response.status === 403) results.requiresAuth = true;
      if (err.response.status === 404) results.notFound = true;
    }
  }
  return results;
}

export default {
  getCourseComments,
  getLessonComments,
  addComment,
  addReply,
  likeComment,
  checkCommentsEndpoints
};
