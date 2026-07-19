import { useMemo } from 'react';
import { useCourses } from './useCourses';
import { useLessonProgress } from './useLessonProgress';

export function useCourseProgress() {
  const { courses } = useCourses();
  const { progressList } = useLessonProgress();

  const getCourseProgressPercent = useMemo(() => {
    return (courseId: string) => {
      const course = courses.find(c => c.id === courseId);
      if (!course || !course.lessons || course.lessons.length === 0) return 0;
      const courseProgress = progressList.filter(
        (p) => p.courseId === courseId && p.completed
      );
      return Math.round((courseProgress.length / course.lessons.length) * 100);
    };
  }, [courses, progressList]);

  return { getCourseProgressPercent };
}
