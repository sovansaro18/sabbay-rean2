import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Megaphone, ArrowRight, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../data';
import { useCourses, useCategories } from '../hooks/useCourses';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { useCourseProgress } from '../hooks/useCourseProgress';
import CourseCard from '../components/CourseCard';
import { Category } from '../types';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1200',
    tag: 'ភាសាអង់គ្លេស និងភាសាចិន',
    title: 'ពង្រីកសក្តានុពលពិភពលោករបស់អ្នក',
    desc: 'សិក្សាភាសាអង់គ្លេស និងចិនជាមួយគ្រូជំនាញ តាមរយៈមេរៀនវីដេអូងាយយល់ និងការសន្ទនាប្រចាំថ្ងៃ។',
  },
  {
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200',
    tag: 'ជំនាញកុំព្យូទ័រ និងបច្ចេកវិទ្យា',
    title: 'ជំនាញកុំព្យូទ័រ ដើម្បីការងារនាពេលអនាគត',
    desc: 'រៀនពីមូលដ្ឋានគ្រឹះកូដ Python, Excel ការិយាល័យ, Canva Graphic រហូតដល់បច្ចេកវិទ្យា AI ឈានមុខ។',
  },
  {
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1200',
    tag: 'ការអប់រំទូទៅ និងការអភិវឌ្ឍន៍ខ្លួន',
    title: 'អភិវឌ្ឍផ្នត់គំនិត និងសមត្ថភាពផ្ទាល់ខ្លួន',
    desc: 'បង្កើនសមត្ថភាពគ្រប់គ្រងពេលវេលា កំណត់គោលដៅជីវិត និងរបៀបសិក្សាឱ្យមានប្រសិទ្ធភាពខ្ពស់។',
  }
];

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

export default function HomePage() {
  const { courses, announcements, isCoursesLoading } = useCourses();
  const { categories } = useCategories();
  const { progressList } = useLessonProgress();
  const { getCourseProgressPercent } = useCourseProgress();
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();

  const activeCategories = categories && categories.length > 0 ? categories : CATEGORIES;

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  const systemStats = useMemo(() => {
    const activeLessons = progressList.length;
    const completedLessons = progressList.filter(p => p.completed).length;
    return { activeLessons, completedLessons };
  }, [progressList]);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero Carousel Banner Section */}
      <section className="relative overflow-hidden bg-slate-950 sm:rounded-3xl max-w-7xl mx-auto sm:mt-6 shadow-sm group">
        <div className="relative h-[250px] sm:h-[350px] md:h-[400px] w-full overflow-hidden">
          <img 
            src={HERO_SLIDES[heroIndex].image} 
            alt={HERO_SLIDES[heroIndex].title} 
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-12 space-y-2 max-w-3xl">
            <span className="px-2.5 py-1 bg-orange-600 text-white rounded-md text-[9px] font-bold uppercase tracking-wider w-fit font-sans">
              {HERO_SLIDES[heroIndex].tag}
            </span>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight font-sans">
              {HERO_SLIDES[heroIndex].title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 leading-normal line-clamp-2 sm:line-clamp-none font-sans max-w-xl">
              {HERO_SLIDES[heroIndex].desc}
            </p>
            <div className="pt-2">
              <button 
                onClick={() => navigate('/courses')}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-transform duration-200 active:scale-95 shadow-md shadow-orange-950/20 font-sans"
              >
                <span>ចាប់ផ្តើមរៀនឥឡូវនេះ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel slide indicators */}
        <div className="absolute bottom-4 right-6 flex gap-1.5 z-10">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                heroIndex === idx ? 'bg-orange-500 w-5' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Announcements Broadcast Widget */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isDarkMode ? 'border-orange-500/20 bg-orange-500/5' : 'border-orange-500/10 bg-orange-500/5'
          }`}>
            <div className="w-8 h-8 rounded-lg bg-orange-600/10 text-orange-600 flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-black uppercase text-orange-600 tracking-wider font-sans">សេចក្តីជូនដំណឹងថ្មីបំផុត</span>
              <h4 className={`text-xs font-black truncate mt-0.5 font-sans ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{announcements[0].title}</h4>
              <p className={`text-[11px] leading-normal font-sans line-clamp-1 sm:line-clamp-none mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{announcements[0].content}</p>
            </div>
          </div>
        </section>
      )}

      {/* Education Category Selection Circles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 font-sans">ផ្នែកសិក្សាដែលត្រូវរៀន</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activeCategories.map((cat) => {
            const courseCount = courses.filter(c => c.category === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/courses?category=${cat.id}`)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  isDarkMode 
                    ? 'border-slate-800 bg-slate-900/40 hover:border-orange-500/30 hover:bg-orange-500/5' 
                    : 'border-slate-100 hover:border-orange-500/30 bg-slate-50/50 hover:bg-orange-500/5'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase tracking-wider font-sans ${cat.color}`}>
                  {cat.id.substring(0, 2).toUpperCase()}
                </span>
                <div>
                  <h4 className={`text-xs font-extrabold font-sans ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>{cat.label}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-sans">{courseCount} វគ្គសិក្សាសកម្ម</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Courses Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 font-sans">វគ្គសិក្សាកំពុងពេញនិយម</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-sans">មេរៀនល្បីៗដែលត្រូវបានរៀបចំយ៉ាងល្អបំផុត</p>
          </div>
          <button 
            onClick={() => navigate('/courses')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer font-sans"
          >
            <span>មើលទាំងអស់</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isCoursesLoading ? (
            <>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </>
          ) : (
            courses.slice(0, 3).map((course) => (
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
      </section>

      {/* Metrics of Progress / Gamified learning tracker summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
          isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="space-y-1 text-center md:text-left font-sans">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">ស្ថិតិនៃការសិក្សារបស់អ្នក</h4>
            <p className={`text-xs font-extrabold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>បន្តការរៀនសូត្រឱ្យបានទៀងទាត់ដើម្បីទទួលបានជំនាញច្បាស់លាស់!</p>
          </div>
          <div className="flex gap-8">
            <div className="text-center font-sans">
              <span className="text-xl font-black text-orange-600 font-mono">{systemStats.activeLessons}</span>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">មេរៀនចាប់ផ្តើម</p>
            </div>
            <div className="text-center font-sans">
              <span className="text-xl font-black text-emerald-600 font-mono">{systemStats.completedLessons}</span>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">មេរៀនរៀនចប់</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
