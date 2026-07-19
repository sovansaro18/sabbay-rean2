import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { useCourseProgress } from '../hooks/useCourseProgress';
import CourseCard from '../components/CourseCard';

export default function SearchPage() {
  const { courses } = useCourses();
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const { getCourseProgressPercent } = useCourseProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLevel, setSearchLevel] = useState<'all' | 'មូលដ្ឋាន' | 'មធ្យម' | 'កម្រិតខ្ពស់'>('all');

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchQuery = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLevel = searchLevel === 'all' || c.level === searchLevel;
      return matchQuery && matchLevel;
    });
  }, [courses, searchQuery, searchLevel]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>ស្វែងរកមេរៀន និងវគ្គសិក្សា</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">បញ្ចូលពាក្យគន្លឹះដើម្បីរុករកមេរៀនវគ្គសិក្សាទាំងអស់នៅក្នុងបណ្ណាល័យអប់រំ SABBAY REAN។</p>
        
        {/* Expanded Search Bar */}
        <div className="relative max-w-xl mx-auto pt-3">
          <input
            type="text"
            placeholder="ស្វែងរកតាមចំណងជើង ជំនាញ ឬឈ្មោះលោកគ្រូ/អ្នកគ្រូ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-2xl border placeholder-slate-400 text-xs focus:bg-white focus:border-orange-500 transition-all outline-none ${
              isDarkMode 
                ? 'border-slate-800 bg-slate-950 text-slate-100' 
                : 'border-slate-200 bg-slate-50 text-slate-800'
            }`}
            autoFocus
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-6" />
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {['all', 'មូលដ្ឋាន', 'មធ្យម', 'កម្រិតខ្ពស់'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSearchLevel(lvl as any)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border cursor-pointer ${
                searchLevel === lvl
                  ? 'bg-orange-600 border-orange-600 text-white'
                  : isDarkMode
                    ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {lvl === 'all' ? 'គ្រប់កម្រិតទាំងអស់' : lvl}
            </button>
          ))}
        </div>
      </div>

      <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {searchQuery ? `លទ្ធផលរកឃើញ (${filteredCourses.length})` : 'វគ្គសិក្សាដែលណែនាំសម្រាប់អ្នក'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progressPercent={getCourseProgressPercent(course.id)}
              onSelect={() => navigate(`/courses/${course.id}`)}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <p className="text-center py-16 text-xs text-slate-400 font-sans">មិនរកឃើញមេរៀនដែលត្រូវនឹងលក្ខខណ្ឌខាងលើឡើយ។</p>
        )}
      </div>
    </div>
  );
}
