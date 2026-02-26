/**
 * lectures.js - API service layer for course lecture management
 * Handles CRUD, video upload with progress, and drag-and-drop reordering.
 * Falls back to localStorage-backed mock data when the backend is unavailable.
 */
import apiClient from './apiClient';

// ── Mock store helpers (localStorage) ─────────────────────────────────────────
const STORE_KEY = 'edu_lectures';

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStore(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function getLecturesForCourse(courseId) {
  const store = loadStore();
  const id = String(courseId);
  if (!store[id]) {
    // Seed with sensible demo lectures on first access
    store[id] = [
      {
        id: Date.now(),
        course_id: Number(courseId),
        title: 'Introduction & Course Overview',
        description: 'Welcome! In this lecture we cover what you will learn throughout the course.',
        video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: '5:00',
        order_number: 1,
        is_free_preview: true,
        created_at: new Date().toISOString(),
      },
      {
        id: Date.now() + 1,
        course_id: Number(courseId),
        title: 'Setting Up Your Environment',
        description: 'Install all required tools and configure your development environment.',
        video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: '12:30',
        order_number: 2,
        is_free_preview: false,
        created_at: new Date().toISOString(),
      },
      {
        id: Date.now() + 2,
        course_id: Number(courseId),
        title: 'Core Concepts Explained',
        description: 'Deep dive into the fundamental concepts that underpin everything else.',
        video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: '18:45',
        order_number: 3,
        is_free_preview: false,
        created_at: new Date().toISOString(),
      },
    ];
    saveStore(store);
  }
  return store[id].sort((a, b) => a.order_number - b.order_number);
}

function saveLecturesForCourse(courseId, lectures) {
  const store = loadStore();
  store[String(courseId)] = lectures;
  saveStore(store);
}

// ── Timestamp store (resume support) ─────────────────────────────────────────
const TS_KEY = 'edu_vid_ts';

export function saveVideoTimestamp(lectureId, seconds) {
  try {
    const ts = JSON.parse(localStorage.getItem(TS_KEY) || '{}');
    ts[lectureId] = seconds;
    localStorage.setItem(TS_KEY, JSON.stringify(ts));
  } catch { /* ignore */ }
}

export function getVideoTimestamp(lectureId) {
  try {
    const ts = JSON.parse(localStorage.getItem(TS_KEY) || '{}');
    return ts[lectureId] || 0;
  } catch {
    return 0;
  }
}

// ── Completion store ──────────────────────────────────────────────────────────
const COMP_KEY = 'edu_lec_complete';

export function markLectureComplete(userId, lectureId) {
  try {
    const data = JSON.parse(localStorage.getItem(COMP_KEY) || '{}');
    if (!data[userId]) data[userId] = [];
    if (!data[userId].includes(lectureId)) data[userId].push(lectureId);
    localStorage.setItem(COMP_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function isLectureComplete(userId, lectureId) {
  try {
    const data = JSON.parse(localStorage.getItem(COMP_KEY) || '{}');
    return (data[userId] || []).includes(lectureId);
  } catch {
    return false;
  }
}

export function getCompletedLectureIds(userId, courseId, lectures) {
  try {
    const data = JSON.parse(localStorage.getItem(COMP_KEY) || '{}');
    const completed = data[userId] || [];
    return lectures.map((l) => l.id).filter((id) => completed.includes(id));
  } catch {
    return [];
  }
}

// ── API calls (with localStorage fallback) ────────────────────────────────────

/**
 * Fetch all lectures for a course, sorted by order_number.
 */
export async function fetchLectures(courseId) {
  try {
    const res = await apiClient.get(`/api/courses/${courseId}/lectures`);
    const data = res.data?.data ?? res.data ?? [];
    return Array.isArray(data)
      ? data.sort((a, b) => a.order_number - b.order_number)
      : [];
  } catch {
    return getLecturesForCourse(courseId);
  }
}

/**
 * Create a new lecture (JSON, no video).
 */
export async function createLecture(courseId, payload) {
  try {
    const res = await apiClient.post(`/api/courses/${courseId}/lectures`, payload);
    return res.data?.data ?? res.data;
  } catch {
    const lectures = getLecturesForCourse(courseId);
    const maxOrder = lectures.reduce((m, l) => Math.max(m, l.order_number), 0);
    const newLecture = {
      id: Date.now(),
      course_id: Number(courseId),
      title: payload.title,
      description: payload.description || '',
      video_url: payload.video_url || '',
      duration: payload.duration || '',
      order_number: maxOrder + 1,
      is_free_preview: payload.is_free_preview || false,
      created_at: new Date().toISOString(),
    };
    lectures.push(newLecture);
    saveLecturesForCourse(courseId, lectures);
    return newLecture;
  }
}

/**
 * Upload a video file for a lecture using multipart/form-data.
 * Calls onProgress(0–100) during upload.
 */
export async function uploadLectureVideo(courseId, lectureId, file, onProgress) {
  const formData = new FormData();
  formData.append('video', file);

  try {
    const res = await apiClient.post(
      `/api/courses/${courseId}/lectures/${lectureId}/video`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) {
            const pct = Math.round((evt.loaded * 100) / evt.total);
            onProgress?.(pct);
          }
        },
      }
    );
    return res.data?.data ?? res.data;
  } catch {
    // Mock: simulate progress and return a blob URL
    for (let p = 0; p <= 100; p += 10) {
      await new Promise((r) => setTimeout(r, 80));
      onProgress?.(p);
    }
    const url = URL.createObjectURL(file);
    // Persist to mock store
    const lectures = getLecturesForCourse(courseId);
    const idx = lectures.findIndex((l) => l.id === lectureId);
    if (idx !== -1) {
      lectures[idx].video_url = url;
      saveLecturesForCourse(courseId, lectures);
    }
    return { video_url: url };
  }
}

/**
 * Create a lecture AND upload its video in one call.
 * Returns the final lecture object.
 */
export async function createLectureWithVideo(courseId, payload, videoFile, onProgress) {
  const lecture = await createLecture(courseId, payload);
  if (videoFile) {
    const uploaded = await uploadLectureVideo(courseId, lecture.id, videoFile, onProgress);
    lecture.video_url = uploaded.video_url || lecture.video_url;
    // Persist video_url to mock store
    const lectures = getLecturesForCourse(courseId);
    const idx = lectures.findIndex((l) => l.id === lecture.id);
    if (idx !== -1) {
      lectures[idx].video_url = lecture.video_url;
      saveLecturesForCourse(courseId, lectures);
    }
  }
  return lecture;
}

/**
 * Update lecture metadata (title, description, is_free_preview).
 */
export async function updateLecture(courseId, lectureId, payload) {
  try {
    const res = await apiClient.put(
      `/api/courses/${courseId}/lectures/${lectureId}`,
      payload
    );
    return res.data?.data ?? res.data;
  } catch {
    const lectures = getLecturesForCourse(courseId);
    const idx = lectures.findIndex((l) => l.id === lectureId);
    if (idx !== -1) {
      lectures[idx] = { ...lectures[idx], ...payload };
      saveLecturesForCourse(courseId, lectures);
      return lectures[idx];
    }
    throw new Error('Lecture not found');
  }
}

/**
 * Delete a lecture.
 */
export async function deleteLecture(courseId, lectureId) {
  try {
    await apiClient.delete(`/api/courses/${courseId}/lectures/${lectureId}`);
  } catch {
    const lectures = getLecturesForCourse(courseId).filter((l) => l.id !== lectureId);
    saveLecturesForCourse(courseId, lectures);
  }
}

/**
 * Persist a new order for all lectures (drag-and-drop).
 * `orderMap` = [{ id, order_number }, ...]
 */
export async function reorderLectures(courseId, orderMap) {
  try {
    await apiClient.put(`/api/courses/${courseId}/lectures/reorder`, { order: orderMap });
  } catch {
    const lectures = getLecturesForCourse(courseId);
    orderMap.forEach(({ id, order_number }) => {
      const l = lectures.find((x) => x.id === id);
      if (l) l.order_number = order_number;
    });
    saveLecturesForCourse(courseId, lectures);
  }
}

/**
 * Mark a lecture as completed on the backend (with localStorage fallback).
 */
export async function markLectureCompleteApi(userId, courseId, lectureId) {
  markLectureComplete(userId, lectureId); // always persist locally
  try {
    await apiClient.post(`/api/courses/${courseId}/lectures/${lectureId}/complete`);
  } catch { /* ignore – local store is source of truth */ }
}
