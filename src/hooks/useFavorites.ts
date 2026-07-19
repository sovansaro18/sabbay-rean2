import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Favorite } from '../types';
import { useAuth } from './useAuth';
import { apiFetch } from '../utils/api';

export function useFavorites() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Query to get favorites and progress (unified sync data)
  const { data: syncData } = useQuery<{ favorites: Favorite[] }>({
    queryKey: ['user-sync', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return { favorites: [] };
      const res = await apiFetch(`/api/users/${currentUser.id}/sync`);
      if (!res.ok) {
        throw new Error('មិនអាចទាញយកទិន្នន័យចូលចិត្តបានទេ');
      }
      return await res.json();
    },
    enabled: !!currentUser?.id,
    placeholderData: () => {
      // Return localStorage as initial placeholder if available
      const local = localStorage.getItem('sabbay_favorites');
      return { favorites: local ? JSON.parse(local) : [] };
    },
  });

  // Dynamic favorites resolver: use syncData from db or fall back to localStorage
  const favorites: Favorite[] = currentUser?.id 
    ? (syncData?.favorites || []) 
    : (() => {
        const local = localStorage.getItem('sabbay_favorites');
        return local ? JSON.parse(local) : [];
      })();

  // Mutation: Sync back to Server / LocalStorage
  const syncMutation = useMutation({
    mutationFn: async (updatedFavorites: Favorite[]) => {
      if (currentUser?.id) {
        // Fetch current progress list to avoid overwriting it
        const currentSync = queryClient.getQueryData<{ progressList?: any }>(['user-sync', currentUser.id]);
        const progressList = currentSync?.progressList || [];

        const res = await apiFetch(`/api/users/${currentUser.id}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ favorites: updatedFavorites, progressList }),
        });
        if (!res.ok) {
          throw new Error('ការរក្សាទុកទិន្នន័យចូលចិត្តបរាជ័យ');
        }
        return await res.json();
      } else {
        localStorage.setItem('sabbay_favorites', JSON.stringify(updatedFavorites));
        return { favorites: updatedFavorites };
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-sync', currentUser?.id], (prev: any) => ({
        ...prev,
        favorites: data.favorites,
      }));
    },
  });

  const toggleFavorite = async (courseId: string, lessonId: string) => {
    const exists = favorites.some((f) => f.courseId === courseId && f.lessonId === lessonId);
    let updated: Favorite[];
    if (exists) {
      updated = favorites.filter((f) => !(f.courseId === courseId && f.lessonId === lessonId));
    } else {
      updated = [...favorites, { courseId, lessonId, savedAt: new Date().toISOString() }];
    }
    
    // Optimistic update
    if (currentUser?.id) {
      queryClient.setQueryData(['user-sync', currentUser.id], (prev: any) => ({
        ...prev,
        favorites: updated,
      }));
    } else {
      localStorage.setItem('sabbay_favorites', JSON.stringify(updated));
    }

    await syncMutation.mutateAsync(updated);
  };

  const isFavorited = (courseId: string, lessonId: string) => {
    return favorites.some((f) => f.courseId === courseId && f.lessonId === lessonId);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorited,
    isSyncing: syncMutation.isPending,
  };
}
