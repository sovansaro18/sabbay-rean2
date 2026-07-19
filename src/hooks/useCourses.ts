import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Course, Announcement, Comment, Category } from '../types';
import { apiFetch } from '../utils/api';

export function useCourses() {
  const queryClient = useQueryClient();

  // Query: Get all courses
  const { data: courses = [], isLoading: isCoursesLoading, error: coursesError } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await apiFetch('/api/courses');
      if (!res.ok) {
        throw new Error('មិនអាចទាញយកទិន្នន័យវគ្គសិក្សាបានទេ');
      }
      return await res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutation: Create Course
  const createCourseMutation = useMutation({
    mutationFn: async (newCourse: Course) => {
      const res = await apiFetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'មិនអាចបង្កើតវគ្គសិក្សាបានទេ');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  // Mutation: Update Course
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, courseData }: { id: string; courseData: Course }) => {
      const res = await apiFetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'មិនអាចធ្វើបច្ចុប្បន្នភាពវគ្គសិក្សាបានទេ');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  // Mutation: Delete Course
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('មិនអាចលុបវគ្គសិក្សាបានទេ');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  // --- ANNOUNCEMENTS ---
  // Query: Get all announcements
  const { data: announcements = [], isLoading: isAnnouncementsLoading } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await apiFetch('/api/announcements');
      if (!res.ok) {
        throw new Error('មិនអាចទាញយកសេចក្តីប្រកាសបានទេ');
      }
      return await res.json();
    },
  });

  // Mutation: Create Announcement
  const createAnnouncementMutation = useMutation({
    mutationFn: async (annData: Omit<Announcement, 'id' | 'date'> & { id?: string; date?: string }) => {
      const res = await apiFetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annData),
      });
      if (!res.ok) {
        throw new Error('មិនអាចបង្កើតសេចក្តីប្រកាសបានទេ');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  // Mutation: Delete Announcement
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('មិនអាចលុបសេចក្តីប្រកាសនេះបានទេ');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  // --- COMMENTS ---
  // Query: Get all comments (Moderation list for Admin)
  const { data: allComments = [], isLoading: isAllCommentsLoading } = useQuery<Comment[]>({
    queryKey: ['comments-all'],
    queryFn: async () => {
      const res = await apiFetch('/api/comments');
      if (!res.ok) {
        throw new Error('មិនអាចទាញយកមតិយោបល់ទាំងអស់បានទេ');
      }
      return await res.json();
    },
  });

  // Mutation: Create Comment
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: { courseId: string; lessonId: string; content: string }) => {
      const res = await apiFetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });
      if (!res.ok) {
        throw new Error('មិនអាចបញ្ជូនមតិយោបល់បានឡើយ');
      }
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.courseId, variables.lessonId],
      });
      queryClient.invalidateQueries({ queryKey: ['comments-all'] });
    },
  });

  // Mutation: Delete Comment
  const deleteCommentMutation = useMutation({
    mutationFn: async ({ id, courseId, lessonId }: { id: string; courseId?: string; lessonId?: string }) => {
      const res = await apiFetch(`/api/comments/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('មិនអាចលុបមតិយោបល់នេះបានឡើយ');
      }
      return await res.json();
    },
    onSuccess: (_, variables) => {
      if (variables.courseId && variables.lessonId) {
        queryClient.invalidateQueries({
          queryKey: ['comments', variables.courseId, variables.lessonId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['comments-all'] });
      }
      queryClient.invalidateQueries({ queryKey: ['comments-all'] });
    },
  });

  return {
    courses,
    isCoursesLoading,
    coursesError,
    createCourse: createCourseMutation.mutateAsync,
    updateCourse: updateCourseMutation.mutateAsync,
    deleteCourse: deleteCourseMutation.mutateAsync,
    
    announcements,
    isAnnouncementsLoading,
    createAnnouncement: createAnnouncementMutation.mutateAsync,
    deleteAnnouncement: deleteAnnouncementMutation.mutateAsync,

    allComments,
    isAllCommentsLoading,
    createComment: createCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
  };
}

// Hook specifically for individual lesson comments (so that it updates reactively and queries only when viewing that lesson)
export function useLessonComments(courseId: string, lessonId: string) {
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery<Comment[]>({
    queryKey: ['comments', courseId, lessonId],
    queryFn: async () => {
      const res = await apiFetch(`/api/comments/course/${courseId}/lesson/${lessonId}`);
      if (!res.ok) {
        throw new Error('មិនអាចទាញយកមតិយោបល់បានឡើយ');
      }
      return await res.json();
    },
    enabled: !!courseId && !!lessonId,
  });

  return {
    comments,
    isCommentsLoading,
  };
}

export function useCategories() {
  const queryClient = useQueryClient();

  // Query: Get all categories
  const { data: categories = [], isLoading: isCategoriesLoading, error: categoriesError } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiFetch('/api/categories');
      if (!res.ok) {
        throw new Error('មិនអាចទាញយកប្រភេទបានទេ');
      }
      return await res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutation: Create Category
  const createCategoryMutation = useMutation({
    mutationFn: async (newCat: Omit<Category, 'iconName'> & { iconName?: string }) => {
      const res = await apiFetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCat, iconName: newCat.iconName || 'BookOpen' }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'មិនអាចបង្កើតប្រភេទបានទេ');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Mutation: Update Category
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, categoryData }: { id: string; categoryData: Partial<Category> }) => {
      const res = await apiFetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'មិនអាចកែសម្រួលប្រភេទបានទេ');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Mutation: Delete Category
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('មិនអាចលុបប្រភេទបានទេ');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    categories,
    isCategoriesLoading,
    categoriesError,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
  };
}
