import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LessonProgress } from '../types';
import { useAuth } from './useAuth';

export function useLessonProgress() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Query to get favorites and progress (unified sync data)
  const { data: syncData } = useQuery<{ progressList: LessonProgress[] }>({
    queryKey: ['user-sync', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return { progressList: [] };
      const res = await fetch(`/api/users/${currentUser.id}/sync`);
      if (!res.ok) {
        throw new Error('មិនអាចទាញយកទិន្នន័យវឌ្ឍនភាពសិក្សាបានទេ');
      }
      return await res.json();
    },
    enabled: !!currentUser?.id,
    placeholderData: () => {
      const local = localStorage.getItem('sabbay_progress');
      return { progressList: local ? JSON.parse(local) : [] };
    },
  });

  const progressList: LessonProgress[] = currentUser?.id
    ? (syncData?.progressList || [])
    : (() => {
        const local = localStorage.getItem('sabbay_progress');
        return local ? JSON.parse(local) : [];
      })();

  // Mutation to sync progress back
  const syncMutation = useMutation({
    mutationFn: async (updatedProgress: LessonProgress[]) => {
      if (currentUser?.id) {
        // Fetch current favorites to avoid overwriting them
        const currentSync = queryClient.getQueryData<{ favorites?: any }>(['user-sync', currentUser.id]);
        const favorites = currentSync?.favorites || [];

        const res = await fetch(`/api/users/${currentUser.id}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favorites, progressList: updatedProgress }),
        });
        if (!res.ok) {
          throw new Error('ការរក្សាទុកទិន្នន័យវឌ្ឍនភាពបរាជ័យ');
        }
        return await res.json();
      } else {
        localStorage.setItem('sabbay_progress', JSON.stringify(updatedProgress));
        return { progressList: updatedProgress };
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-sync', currentUser?.id], (prev: any) => ({
        ...prev,
        progressList: data.progressList,
      }));
    },
  });

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

    // Optimistic update
    if (currentUser?.id) {
      queryClient.setQueryData(['user-sync', currentUser.id], (prev: any) => ({
        ...prev,
        progressList: updated,
      }));
    } else {
      localStorage.setItem('sabbay_progress', JSON.stringify(updated));
    }

    await syncMutation.mutateAsync(updated);
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

    // Optimistic update
    if (currentUser?.id) {
      queryClient.setQueryData(['user-sync', currentUser.id], (prev: any) => ({
        ...prev,
        progressList: updated,
      }));
    } else {
      localStorage.setItem('sabbay_progress', JSON.stringify(updated));
    }

    await syncMutation.mutateAsync(updated);
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
    isSyncing: syncMutation.isPending,
  };
}
