import React, { useMemo } from 'react';
import { BookOpen, Video, FileText, Users, MessageSquare, TrendingUp, BarChart2, Star } from 'lucide-react';
import { Course, Comment, UserProfile } from '../../types';

interface DashboardOverviewProps {
  courses: Course[];
  users: UserProfile[];
  allComments: Comment[];
  isDarkMode: boolean;
}

export default function DashboardOverview({ courses, users, allComments, isDarkMode }: DashboardOverviewProps) {
  // Compute true live statistics
  const totalCourses = courses.length;
  const totalUsers = users.length;
  const totalComments = allComments.length;

  const totalLessonsCount = useMemo(() => {
    return courses.reduce((acc, cur) => acc + (cur.lessons?.length || 0), 0);
  }, [courses]);

  const totalDocumentsCount = useMemo(() => {
    return courses.reduce((acc, cur) => {
      let lDocs = 0;
      cur.lessons?.forEach(l => {
        lDocs += l.documents?.length || 0;
      });
      return acc + lDocs;
    }, 0);
  }, [courses]);

  // Aggregate Category Stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = { chinese: 0, english: 0, computer: 0, general: 0 };
    courses.forEach(c => {
      if (stats[c.category] !== undefined) {
        stats[c.category]++;
      }
    });
    return stats;
  }, [courses]);

  // Find highest rated course
  const topCourse = useMemo(() => {
    if (courses.length === 0) return null;
    return [...courses].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  }, [courses]);

  return (
    <div className="space-y-8 font-sans">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric Card: Courses */}
        <div className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">វគ្គសិក្សាសរុប</p>
            <h3 className="text-xl font-black mt-0.5">{totalCourses}</h3>
          </div>
        </div>

        {/* Metric Card: Lessons */}
        <div className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">មេរៀនវីដេអូ</p>
            <h3 className="text-xl font-black mt-0.5">{totalLessonsCount}</h3>
          </div>
        </div>

        {/* Metric Card: Documents */}
        <div className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ឯកសារជំនួយ</p>
            <h3 className="text-xl font-black mt-0.5">{totalDocumentsCount}</h3>
          </div>
        </div>

        {/* Metric Card: Users */}
        <div className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">សិស្សសរុប</p>
            <h3 className="text-xl font-black mt-0.5">{totalUsers}</h3>
          </div>
        </div>

      </div>

      {/* Advanced Analytic Overview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Category Breakdown Chart */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-orange-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">ស្ថិតិវគ្គសិក្សាតាមផ្នែក</h4>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(categoryStats).map(([cat, count]) => {
              const val = count as number;
              const percentage = totalCourses > 0 ? (val / totalCourses) * 100 : 0;
              const catNames: Record<string, string> = {
                chinese: 'ភាសាចិន (Chinese)',
                english: 'ភាសាអង់គ្លេស (English)',
                computer: 'កុំព្យូទ័រ & បច្ចេកវិទ្យា',
                general: 'ការអប់រំទូទៅ (General Ed)'
              };
              const catColors: Record<string, string> = {
                chinese: 'bg-orange-500',
                english: 'bg-emerald-500',
                computer: 'bg-purple-500',
                general: 'bg-cyan-500'
              };

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 dark:text-slate-200">{catNames[cat]}</span>
                    <span className="font-mono font-bold text-slate-400">{count} វគ្គ ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950/40 rounded-full overflow-hidden border border-slate-850">
                    <div 
                      className={`h-full ${catColors[cat]} transition-all duration-1000`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Highlights & Quick Stats */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">ចំណុចលេចធ្លោប្រចាំថ្ងៃ</h4>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">វគ្គសិក្សាមានការវាយតម្លៃខ្ពស់បំផុត</p>
                  <p className="text-xs font-bold text-slate-200 mt-0.5 truncate max-w-[200px]">
                    {topCourse ? topCourse.title : 'មិនទាន់មាន'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">មតិយោបល់របស់សិស្ស</p>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">
                    {totalComments} មតិយោបល់ដែលបានបង្កើត
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-850 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>ស្ថានភាពម៉ាស៊ីនបម្រើ</span>
            <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              សកម្ម (Active)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
