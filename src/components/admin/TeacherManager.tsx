import React, { useMemo } from 'react';
import { Award, Star, BookOpen } from 'lucide-react';
import { Course } from '../../types';

interface TeacherManagerProps {
  courses: Course[];
  isDarkMode: boolean;
}

interface TeacherDetail {
  name: string;
  specialty: string;
  avatar: string;
  rating: number;
  courseCount: number;
}

export default function TeacherManager({ courses, isDarkMode }: TeacherManagerProps) {
  // Compute true instructors dynamically from MongoDB courses list
  const instructors = useMemo(() => {
    const map = new Map<string, TeacherDetail>();

    courses.forEach(c => {
      if (!c.author) return;
      const author = c.author.trim();
      
      const categoryLabel = c.category === 'computer' ? 'កុំព្យូទ័រ & ព័ត៌មានវិទ្យា (IT)' :
                            c.category === 'chinese' ? 'សាស្ត្រាចារ្យភាសាចិន' :
                            c.category === 'english' ? 'សាស្ត្រាចារ្យភាសាអង់គ្លេស' : 'ការអប់រំទូទៅ';

      if (!map.has(author)) {
        // Generate consistent design-friendly avatars
        const genderPrefix = author.startsWith('អ្នកគ្រូ') ? 'female' : 'male';
        const seedId = Math.abs(author.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) % 100;
        const avatarUrl = genderPrefix === 'female'
          ? `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`
          : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`;

        map.set(author, {
          name: author,
          specialty: categoryLabel,
          avatar: avatarUrl,
          rating: c.rating || 5.0,
          courseCount: 1
        });
      } else {
        const existing = map.get(author)!;
        existing.courseCount++;
        // Keep average rating
        existing.rating = Number(((existing.rating + (c.rating || 5.0)) / 2).toFixed(2));
      }
    });

    return Array.from(map.values());
  }, [courses]);

  return (
    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="mb-6">
        <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-wider">សាស្ត្រាចារ្យ និងគ្រូជំនាញ (Active Instructors)</h3>
        <p className="text-slate-400 text-xs mt-1">បញ្ជីសាស្ត្រាចារ្យទាំងអស់ដែលកំពុងបង្រៀនយ៉ាងសកម្មនៅលើប្រព័ន្ធ SABBAY REAN។</p>
      </div>

      <div className="space-y-4">
        {instructors.map((teacher, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-950/20 rounded-2xl border border-slate-200/40 dark:border-slate-850">
            <div className="flex items-center gap-4">
              <img src={teacher.avatar} alt={teacher.name} className="w-12 h-12 rounded-full object-cover bg-slate-850 border border-slate-800" />
              <div>
                <h4 className="text-xs font-black text-slate-200 dark:text-slate-100">{teacher.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{teacher.specialty}</span>
                </p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1.5">
              <span className="text-[11px] font-mono font-bold text-orange-500 bg-orange-500/5 px-2.5 py-1 rounded-lg border border-orange-500/10 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{teacher.courseCount} វគ្គសិក្សា</span>
              </span>
              <span className="text-[11px] text-amber-500 font-mono font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>★ {teacher.rating} rating</span>
              </span>
            </div>
          </div>
        ))}

        {instructors.length === 0 && (
          <p className="text-center py-12 text-xs text-slate-500">មិនទាន់មានគ្រូបង្រៀនចុះបញ្ជីនៅឡើយទេ។</p>
        )}
      </div>
    </div>
  );
}
