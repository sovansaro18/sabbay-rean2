import { LessonProgress } from '../types';
import { useUserSync } from './useUserSync';

export function useLessonProgress() {
  const { progressList, updateSync, isSyncing } = useUserSync();

  const toggleProgress = async (courseId: string, lessonId: string) => {
    const exists = progressList.find((p) => p.courseId === courseId && p.lessonId === lessonId);
    let updated: LessonProgress[];

    if (exists) {
      const updatedStatus = !exists.completed;
      updated = progressList.map((p) =>
        p.lessonId === lessonId
          ? { ...p, completed: updatedStatus, updatedAt: new Date().toISOString() }
          : p
      );
    } else {
      updated = [
        ...progressList,
        {
          courseId,
          lessonId,
          completed: true,
          lastWatchedPosition: 0,
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    updateSync({ progressList: updated });
  };

  const updateWatchPosition = async (courseId: string, lessonId: string, seconds: number) => {
    const exists = progressList.find((p) => p.courseId === courseId && p.lessonId === lessonId);
    let updated: LessonProgress[];

    if (exists) {
      updated = progressList.map((p) =>
        p.lessonId === lessonId
          ? { ...p, lastWatchedPosition: seconds, updatedAt: new Date().toISOString() }
          : p
      );
    } else {
      updated = [
        ...progressList,
        {
          courseId,
          lessonId,
          completed: false,
          lastWatchedPosition: seconds,
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    updateSync({ progressList: updated });
  };

  const isCompleted = (courseId: string, lessonId: string) => {
    return progressList.some((p) => p.courseId === courseId && p.lessonId === lessonId && p.completed);
  };

  const getWatchPosition = (courseId: string, lessonId: string) => {
    const item = progressList.find((p) => p.courseId === courseId && p.lessonId === lessonId);
    return item ? item.lastWatchedPosition : 0;
  };

  return {
    progressList,
    toggleProgress,
    updateWatchPosition,
    isCompleted,
    getWatchPosition,
    isSyncing,
  };
}

