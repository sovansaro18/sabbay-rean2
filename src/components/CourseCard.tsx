import React, { useState } from 'react';
import { BookOpen, User, Star, Award, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { Course } from '../types';
import { CATEGORIES } from '../data';

interface CourseCardProps {
  key?: string | number;
  course: Course;
  progressPercent?: number;
  onSelect: (course: Course) => void;
  isDarkMode: boolean;
}

export default function CourseCard({ course, progressPercent, onSelect, isDarkMode }: CourseCardProps) {
  const [imageError, setImageError] = useState(false);

  // Find category detail
  const categoryDetail = CATEGORIES.find(c => c.id === course.category);
  
  // Rating & student indicators
  const rating = course.rating || 4.8;
  const students = course.studentCount || 1200;

  // Level color mapping
  const levelColors = {
    'មូលដ្ឋាន': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    'មធ្យម': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    'កម្រិតខ្ពស់': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
  };

  const levelBadge = levelColors[course.level] || 'bg-slate-500/10 text-slate-600 dark:text-slate-400';

  return (
    <div 
      onClick={() => onSelect(course)}
      className={`group relative flex flex-col rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer ${
        isDarkMode 
          ? 'bg-slate-900/85 hover:bg-slate-900 border-slate-800 hover:border-orange-500/30 shadow-md shadow-black/30' 
          : 'bg-white hover:bg-slate-50/50 border-slate-200/80 hover:border-orange-500/40 shadow-sm hover:shadow-lg'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950/40 flex items-center justify-center">
        {!imageError && course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-850 flex flex-col items-center justify-center p-4 text-center">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm text-slate-400 dark:text-slate-500 mb-2">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
              {course.title}
            </span>
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border backdrop-blur-md bg-opacity-80 dark:bg-opacity-40 ${categoryDetail?.color || 'bg-slate-500/10 text-slate-600 border-slate-200'}`}>
            {categoryDetail?.label.split(' ')[0] || 'ទូទៅ'}
          </span>
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border backdrop-blur-md bg-opacity-80 dark:bg-opacity-40 ${levelBadge}`}>
            {course.level}
          </span>
        </div>

        {/* Floating Student Count */}
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur-md flex items-center gap-1 shadow-xs">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>{students.toLocaleString()} សិស្ស</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Author/Teacher */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{course.author}</span>
          </div>

          {/* Title */}
          <h3 className={`font-sans font-bold text-[14px] leading-snug line-clamp-2 min-h-[40px] group-hover:text-orange-600 transition-colors ${
            isDarkMode ? 'text-slate-100' : 'text-slate-800'
          }`}>
            {course.title}
          </h3>
        </div>

        {/* Rating and Info */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-medium">
            {/* Rating Stars */}
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className={`font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{rating.toFixed(1)}</span>
            </div>

            {/* Total lessons */}
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.lessons?.length || 0} មេរៀន</span>
            </div>
          </div>

          {/* Progress bar if present */}
          {progressPercent !== undefined && progressPercent > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                <span>វឌ្ឍនភាព៖</span>
                <span className="text-orange-600 dark:text-orange-500 font-bold">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
