/**
 * LMS Professional Components & Services Index
 * 
 * This file exports all new professional-grade LMS components and services
 * for easy importing throughout the application.
 */

// ─── Components ───────────────────────────────────────────────────────────────
export { default as LectureAccordionImproved } from './LectureAccordionImproved';
export { default as NotesPanel } from './NotesPanel';
export { default as BookmarksPanel } from './BookmarksPanel';
export { default as QuizComponent } from './QuizComponent';
export { default as StudentDashboard } from './StudentDashboard';

// ─── Progress Components ──────────────────────────────────────────────────────
export {
  CourseProgressBar,
  LectureProgressBar,
  SkillProgressBar,
  DashboardProgressCard
} from './ProgressBarComponents';

// ─── Styling ──────────────────────────────────────────────────────────────────
// Import these in your root CSS file or per-component
// import '../styles/progress-bar.css';
// import '../styles/notes-panel.css';
// import '../styles/bookmarks-panel.css';
// import '../styles/quiz.css';
// import '../styles/student-dashboard.css';

/**
 * COMPONENT USAGE EXAMPLES
 * 
 * import {
 *   LectureAccordionImproved,
 *   NotesPanel,
 *   BookmarksPanel,
 *   QuizComponent,
 *   CourseProgressBar,
 *   LectureProgressBar,
 *   StudentDashboard
 * } from '@/components/index-lms-professional';
 */
