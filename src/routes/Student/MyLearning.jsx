import { useEffect, useState } from 'react';
import { Card, ProgressBar, Table } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { getLessonsByCourse } from '../../data/mockLessons';
import { mockCourses } from '../../data/mockCourses';

// Simulate watch time per lesson (in minutes) for demo
function getUserLessonWatchTimes(_userId) {
  // In a real app, fetch from backend or localStorage
  // Here, we simulate with random data for demo
  const watchTimes = {};
  mockCourses.forEach(course => {
    getLessonsByCourse(course.id).forEach(lesson => {
      // Simulate: user watched 0-100% of lesson duration (in minutes)
      const duration = parseInt(lesson.duration);
      watchTimes[lesson.id] = Math.floor(Math.random() * (duration || 60));
    });
  });
  return watchTimes;
}

export default function MyLearning() {
  const { user } = useAuth();
  const [watchTimes, setWatchTimes] = useState({});

  useEffect(() => {
    if (user) {
      setWatchTimes(getUserLessonWatchTimes(user.id));
    }
  }, [user]);

  if (!user) return <div className="p-5 text-center">Please log in to view your learning progress.</div>;

  return (
    <div className="container py-5">
      <h1 className="mb-4">My Learning Progress</h1>
      {mockCourses.map(course => {
        const lessons = getLessonsByCourse(course.id);
        const totalMinutes = lessons.reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);
        const watchedMinutes = lessons.reduce((sum, l) => sum + (watchTimes[l.id] || 0), 0);
        const percent = totalMinutes ? Math.round((watchedMinutes / totalMinutes) * 100) : 0;
        return (
          <Card className="mb-4 shadow-sm" key={course.id}>
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <img src={course.thumbnail} alt={course.title} style={{width:60, height:40, objectFit:'cover', borderRadius:8, marginRight:16}} />
                <div>
                  <h4 className="mb-0">{course.title}</h4>
                  <small className="text-muted">{course.category} &bull; {course.level}</small>
                </div>
              </div>
              <ProgressBar now={percent} label={`${percent}%`} className="mb-3" />
              <Table size="sm" bordered hover>
                <thead>
                  <tr>
                    <th>Lesson</th>
                    <th>Watched (min)</th>
                    <th>Total (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map(lesson => (
                    <tr key={lesson.id}>
                      <td>{lesson.title}</td>
                      <td>{watchTimes[lesson.id] || 0}</td>
                      <td>{parseInt(lesson.duration) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="text-end text-muted">
                Watched: {watchedMinutes} / {totalMinutes} min
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}
