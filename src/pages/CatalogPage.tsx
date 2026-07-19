import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CATEGORIES } from '../data';
import { useCourses, useCategories } from '../hooks/useCourses';
import { useCourseProgress } from '../hooks/useCourseProgress';
import CourseCard from '../components/CourseCard';
import { Category } from '../types';

function CourseCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 space-y-4 animate-pulse">
      <div className="aspect-video w-full rounded-2xl bg-slate-100" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
        <div className="h-3 bg-slate-100 rounded-lg w-full" />
        <div className="h-3 bg-slate-100 rounded-lg w-5/6" />
      </div>
      <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
        <div className="h-4 bg-slate-100 rounded-lg w-1/4" />
        <div className="h-6 bg-slate-100 rounded-xl w-1/3" />
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const { courses, isCoursesLoading } = useCourses();
  const { categories } = useCategories();
  const { getCourseProgressPercent } = useCourseProgress();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();

  const activeCategories = categories && categories.length > 0 ? categories : CATEGORIES;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLevel, setSearchLevel] = useState<'all' | 'មូលដ្ឋាន' | 'មធ្យម' | 'កម្រិតខ្ពស់'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>(() => {
    const catParam = searchParams.get('category');
    return catParam || 'all';
  });

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchQuery = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      const matchLevel = searchLevel === 'all' || c.level === searchLevel;
      return matchQuery && matchCat && matchLevel;
    });
  }, [courses, searchQuery, selectedCategory, searchLevel]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h2 className={`text-lg font-black uppercase tracking-wide font-sans ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>បញ្ជីស្វែងរកមេរៀន និងវគ្គសិក្សា</h2>
        <p className="text-[11px] text-slate-400 mt-1 font-sans">ជ្រើសរើសមេរៀនដែលត្រូវនឹងចំណង់ចំណូលចិត្ត ឬជំនាញដែលអ្នកចង់ពង្រឹងបន្ថែម។</p>
      </div>

      {/* Filter Options toolbar */}
      <div className={`p-5 rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'} space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Text input search */}
          <div className="relative">
            <input
              type="text"
              placeholder="ស្វែងរកតាមចំណងជើង គ្រូបង្រៀន..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl placeholder-slate-400 focus:outline-none focus:border-orange-500 font-sans ${
                isDarkMode 
                  ? 'border-slate-800 bg-slate-950 text-slate-100' 
                  : 'border-slate-200 bg-white text-slate-800'
              }`}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Category SELECT */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full p-2.5 text-xs border rounded-xl focus:outline-none focus:border-orange-500 font-sans ${
              isDarkMode 
                ? 'border-slate-800 bg-slate-950 text-slate-300' 
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <option value="all">គ្រប់ផ្នែកសិក្សាទាំងអស់ (All categories)</option>
            {activeCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          {/* Level selector toggle */}
          <select
            value={searchLevel}
            onChange={(e) => setSearchLevel(e.target.value as any)}
            className={`w-full p-2.5 text-xs border rounded-xl focus:outline-none focus:border-orange-500 font-sans ${
              isDarkMode 
                ? 'border-slate-800 bg-slate-950 text-slate-300' 
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <option value="all">គ្រប់កម្រិតសិក្សាទាំងអស់ (All levels)</option>
            <option value="មូលដ្ឋាន">មូលដ្ឋាន</option>
            <option value="មធ្យម">មធ្យម</option>
            <option value="កម្រិតខ្ពស់">កម្រិតខ្ពស់</option>
          </select>

        </div>
      </div>

      {/* Listing results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isCoursesLoading ? (
          <>
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </>
        ) : (
          filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progressPercent={getCourseProgressPercent(course.id)}
              onSelect={() => navigate(`/courses/${course.id}`)}
              isDarkMode={isDarkMode}
              categories={activeCategories}
            />
          ))
        )}
      </div>

      {filteredCourses.length === 0 && (
        <div className={`text-center py-20 text-xs font-sans border border-dashed rounded-2xl ${
          isDarkMode ? 'border-slate-800 bg-slate-900/10 text-slate-400' : 'border-slate-200 bg-slate-50/20 text-slate-400'
        }`}>
          រកមិនឃើញវគ្គសិក្សាណាមួយដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកខាងលើឡើយ។
        </div>
      )}
    </div>
  );
}
