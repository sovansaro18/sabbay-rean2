import { useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Favorite, LessonProgress } from '../types';
import { useAuth } from './useAuth';
import { apiFetch } from '../utils/api';

export interface SyncData {
  favorites: Favorite[];
  progressList: LessonProgress[];
}

/**
 * Custom hook to manage synchronization of user data (favorites and progress)
 * with the server or localStorage, preventing race conditions via a sequential mutex queue.
 *
 * The Mutex Pattern:
 * A mutable ref (`pendingRef`) holds the current tail of a promise chain. Each time
 * `updateSync` is invoked, we read the latest cached state, optimistically update the UI,
 * and chain a new fetch/sync operation onto the previous promise via `.then()`.
 * This guarantees that even if multiple updates are triggered rapidly (e.g., clicking
 * favorites/progress fast), they are executed sequentially rather than in parallel,
 * avoiding race conditions and lost updates.
 */
export function useUserSync() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['user-sync', currentUser?.id];

  const [syncingCount, setSyncingCount] = useState<number>(0);
  
  // Mutex tail reference to sequence sync operations
  const pendingRef = useRef<Promise<void>>(Promise.resolve());

  // Query to get user synchronization data
  const { data: syncData } = useQuery<SyncData>({
    queryKey,
    queryFn: async () => {
      if (!currentUser?.id) {
        // Fallback to localStorage for guest users
        const localFav = localStorage.getItem('sabbay_favorites');
        const localProg = localStorage.getItem('sabbay_progress');
        return {
          favorites: localFav ? (JSON.parse(localFav) as Favorite[]) : [],
          progressList: localProg ? (JSON.parse(localProg) as LessonProgress[]) : [],
        };
      }
      
      const res = await apiFetch(`/api/users/${currentUser.id}/sync`);
      if (!res.ok) {
        throw new Error('មិនអាចទាញយកទិន្នន័យបានទេ');
      }
      return (await res.json()) as SyncData;
    },
    placeholderData: () => {
      const localFav = localStorage.getItem('sabbay_favorites');
      const localProg = localStorage.getItem('sabbay_progress');
      return {
        favorites: localFav ? (JSON.parse(localFav) as Favorite[]) : [],
        progressList: localProg ? (JSON.parse(localProg) as LessonProgress[]) : [],
      };
    },
  });

  const favorites = syncData?.favorites || [];
  const progressList = syncData?.progressList || [];

  const performActualMutation = async (merged: SyncData): Promise<void> => {
    try {
      if (currentUser?.id) {
        const res = await apiFetch(`/api/users/${currentUser.id}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merged),
        });
        if (!res.ok) {
          throw new Error('ការរក្សាទុកទិន្នន័យបរាជ័យ');
        }
        const data = (await res.json()) as SyncData;
        queryClient.setQueryData(queryKey, data);
      } else {
        localStorage.setItem('sabbay_favorites', JSON.stringify(merged.favorites));
        localStorage.setItem('sabbay_progress', JSON.stringify(merged.progressList));
        queryClient.setQueryData(queryKey, merged);
      }
    } catch (error) {
      console.error('Sync execution failed:', error);
    }
  };

  const updateSync = useCallback(
    (partial: { favorites?: Favorite[]; progressList?: LessonProgress[] }) => {
      // a) Read latest snapshot immediately before merging
      const current = queryClient.getQueryData<SyncData>(queryKey) || {
        favorites: [],
        progressList: [],
      };

      // b) Merge partial update
      const merged: SyncData = {
        favorites: partial.favorites !== undefined ? partial.favorites : (current.favorites || []),
        progressList: partial.progressList !== undefined ? partial.progressList : (current.progressList || []),
      };

      // c) Optimistic-set cache immediately
      queryClient.setQueryData(queryKey, merged);

      // Increment sync queue counter
      setSyncingCount((prev) => prev + 1);

      // d) Chain actual mutation to guarantee sequential processing
      pendingRef.current = pendingRef.current
        .then(async () => {
          await performActualMutation(merged);
        })
        .finally(() => {
          setSyncingCount((prev) => Math.max(0, prev - 1));
        });
    },
    [queryClient, queryKey, currentUser?.id]
  );

  return {
    favorites,
    progressList,
    updateSync,
    isSyncing: syncingCount > 0,
  };
}
