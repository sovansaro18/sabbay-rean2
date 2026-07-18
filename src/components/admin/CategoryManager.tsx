import React from 'react';
import { CATEGORIES } from '../../data';
import { Course } from '../../types';

interface CategoryManagerProps {
  courses: Course[];
  isDarkMode: boolean;
}

export default function CategoryManager({ courses, isDarkMode }: CategoryManagerProps) {
  return (
    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-wider mb-2">គ្រប់គ្រងប្រភេទនៃការអប់រំ (Category list)</h3>
      <p className="text-slate-400 text-xs mb-6">ផ្នែកសិក្សានិមួយៗត្រូវបានកែសម្រួលដើម្បីរៀបចំវគ្គសិក្សាកាន់តែមានសណ្តាប់ធ្នាប់។</p>

      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const courseCount = courses.filter(c => c.category === cat.id).length;
          return (
            <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-950/20 rounded-2xl border border-slate-200/40 dark:border-slate-850">
              <div className="flex items-center gap-3">
                <div className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold tracking-wider ${cat.color}`}>
                  {cat.id.toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-200 dark:text-slate-100">{cat.label}</p>
                  <p className="text-[10px] text-slate-400">English label: {cat.labelEn}</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-orange-500 bg-orange-500/5 px-3 py-1 rounded-full border border-orange-500/10">
                  {courseCount} វគ្គសិក្សា
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
