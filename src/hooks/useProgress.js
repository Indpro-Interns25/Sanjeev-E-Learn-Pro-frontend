import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useProgress = (courseId) => {
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user && courseId) {
      // Simulate API call to get course progress
      const calculateProgress = () => {
        const completedLessons = user.completedLessons?.filter(
          lesson => lesson.courseId === courseId
        ) || [];
        const totalLessons = 10; // This would come from API
        return Math.round((completedLessons.length / totalLessons) * 100);
      };
      
      setProgress(calculateProgress());
    }
  }, [user, courseId]);

  return progress;
};
