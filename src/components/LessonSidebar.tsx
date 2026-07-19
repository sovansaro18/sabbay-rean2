import React from 'react';
import { Play, CheckCircle } from 'lucide-react';
import { Course, Lesson } from '../types';

interface LessonSidebarProps {
  course: Course;
  lessons: Lesson[];
  selectedLesson: Lesson | null;
  setSelectedLesson: (lesson: Lesson) => void;
  isCompleted: (lessonId: string) => boolean;
  relatedCourses?: Course[];
  onSelectCourse?: (course: Course) => void;
}

export default function LessonSidebar({
  course,
  lessons,
  selectedLesson,
  setSelectedLesson,
  isCompleted,
  relatedCourses = [],
  onSelectCourse,
}: LessonSidebarProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* Course Thumbnail Card */}
      <div className="p-4 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 shadow-sm">
        <div className="aspect-video w-full rounded-2xl overflow-hidden relative mb-4 bg-slate-950/20">
          <img
            src={course.thumbnail}
            alt={course.title}
            referrerPolicy="no-referrer"
            className="object-cover w-full h-full"
          />
        </div>
        <h3 className="font-sans font-extrabold text-base leading-snug text-slate-900 dark:text-white">
          {course.title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-sans line-clamp-3 leading-relaxed">
          {course.description}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>រៀបរៀងដោយ៖</span>
            <strong className="text-slate-700 dark:text-slate-300">{course.author}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>កាលបរិច្ឆេទអាប់ដេត៖</span>
            <strong className="text-slate-700 dark:text-slate-300 font-mono">
              {course.lastUpdated || '2026-07-16'}
            </strong>
          </div>
        </div>
      </div>

      {/* Lessons Sequential Index */}
      <div className="rounded-3xl border overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
          <h4 className="font-sans font-bold text-xs flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span>បញ្ជីមេរៀនទាំងអស់ ({lessons.length})</span>
            <span className="text-[10px] bg-orange-500/15 text-orange-600 dark:text-orange-500 border border-orange-500/20 py-0.5 px-2 rounded-full font-bold">
              តាមលំដាប់លំដោយ
            </span>
          </h4>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[350px] overflow-y-auto">
          {lessons.map((lesson) => {
            const isActive = selectedLesson?.id === lesson.id;
            const isComp = isCompleted(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className={`w-full p-3.5 flex items-start text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-500/10 dark:bg-orange-950/20 border-l-4 border-orange-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-950/60'
                }`}
              >
                <div className="mr-2.5 mt-1 shrink-0">
                  {isActive ? (
                    <div className="p-1 bg-orange-600 text-white rounded-full">
                      <Play className="w-2.5 h-2.5 fill-white" />
                    </div>
                  ) : (
                    <div className="p-1 bg-slate-100 dark:bg-slate-950 rounded-full text-slate-400 dark:text-slate-500">
                      <Play className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isActive
                        ? 'text-orange-600 dark:text-orange-400 font-extrabold'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {lesson.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    មេរៀនទី {lesson.order} • {lesson.duration} នាទី
                  </p>
                </div>

                {isComp && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 ml-2 shrink-0 self-center" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Related Courses Section */}
      {relatedCourses.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-sans font-bold text-xs text-slate-500 uppercase tracking-wider">
            វគ្គសិក្សាពាក់ព័ន្ធគំរូ
          </h4>
          <div className="space-y-3">
            {relatedCourses.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectCourse?.(rel)}
                className="p-3 rounded-2xl border flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 shadow-2xs hover:shadow-xs"
              >
                <img
                  src={rel.thumbnail}
                  alt={rel.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-12 rounded-lg object-cover bg-slate-950/10 shrink-0"
                />
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {rel.title}
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {rel.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
