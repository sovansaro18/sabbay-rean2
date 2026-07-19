import React, { useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import { useFavorites } from '../hooks/useFavorites';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { useToast } from '../context/ToastContext';
import { Document, DownloadedItem } from '../types';
import CourseDetail from '../components/CourseDetail';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, isCoursesLoading } = useCourses();
  const { favorites, toggleFavorite } = useFavorites();
  const { progressList, toggleProgress } = useLessonProgress();
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const { toast } = useToast();

  const course = useMemo(() => {
    return courses.find(c => c.id === id);
  }, [courses, id]);

  const relatedCourses = useMemo(() => {
    if (!course) return [];
    return courses.filter(c => c.category === course.category && c.id !== course.id);
  }, [courses, course]);

  const handleAddDownload = async (doc: Document, lessonTitle: string) => {
    if (!course) return;
    try {
      const saved = localStorage.getItem('sabbay_downloads');
      const downloads = saved ? JSON.parse(saved) : [];
      const exists = downloads.some((d: any) => d.id === doc.id);
      if (exists) {
        toast.info('ឯកសារនេះត្រូវបានទាញយករួចរាល់ហើយ!');
        return;
      }

      // Pre-cache the file via the Cache API in the background
      if ('caches' in window) {
        try {
          const cache = await caches.open('sabbay-offline-files');
          const response = await fetch(doc.fileUrl, { mode: 'cors' });
          if (response.ok) {
            await cache.put(doc.fileUrl, response);
          }
        } catch (cacheErr) {
          console.warn('Background caching failed (CORS or offline):', cacheErr);
        }
      }

      const newItem: DownloadedItem = {
        id: doc.id,
        courseId: course.id,
        courseTitle: course.title,
        lessonId: doc.id,
        lessonTitle: lessonTitle,
        document: doc
      };

      downloads.push(newItem);
      localStorage.setItem('sabbay_downloads', JSON.stringify(downloads));
      toast.success('បានទាញយកឯកសារដោយជោគជ័យ សម្រាប់មើលពេលគ្មានអ៊ីនធឺណិត!');
    } catch {
      toast.error('មានបញ្ហាក្នុងការទាញយកឯកសារ!');
    }
  };

  if (isCoursesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-sans">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-slate-500 font-bold uppercase mt-3">កំពុងផ្ទុកមេរៀន...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 font-sans">
        <h2 className={`text-lg font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>រកមិនឃើញវគ្គសិក្សានេះទេ</h2>
        <button 
          onClick={() => navigate('/courses')}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          ត្រឡប់ទៅបញ្ជីមេរៀនវិញ
        </button>
      </div>
    );
  }

  return (
    <CourseDetail
      course={course}
      onBack={() => navigate('/courses')}
      favorites={favorites}
      onToggleFavorite={toggleFavorite}
      onAddDownload={handleAddDownload}
      isDarkMode={isDarkMode}
      progressList={progressList}
      onToggleProgress={toggleProgress}
      relatedCourses={relatedCourses}
      onSelectCourse={(c) => navigate(`/courses/${c.id}`)}
    />
  );
}
