import { Favorite } from '../types';
import { useUserSync } from './useUserSync';

export function useFavorites() {
  const { favorites, updateSync, isSyncing } = useUserSync();

  const toggleFavorite = async (courseId: string, lessonId: string) => {
    const exists = favorites.some((f) => f.courseId === courseId && f.lessonId === lessonId);
    let updated: Favorite[];
    if (exists) {
      updated = favorites.filter((f) => !(f.courseId === courseId && f.lessonId === lessonId));
    } else {
      updated = [...favorites, { courseId, lessonId, savedAt: new Date().toISOString() }];
    }
    
    updateSync({ favorites: updated });
  };

  const isFavorited = (courseId: string, lessonId: string) => {
    return favorites.some((f) => f.courseId === courseId && f.lessonId === lessonId);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorited,
    isSyncing,
  };
}

