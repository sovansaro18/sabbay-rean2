import React, { useState } from 'react';
import { Plus, Trash2, Megaphone, Calendar, Tag } from 'lucide-react';
import { Announcement } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AnnouncementManagerProps {
  announcements: Announcement[];
  onCreateAnnouncement: (data: Omit<Announcement, 'id' | 'date'>) => Promise<any>;
  onDeleteAnnouncement: (id: string) => Promise<any>;
  isDarkMode: boolean;
}

export default function AnnouncementManager({
  announcements,
  onCreateAnnouncement,
  onDeleteAnnouncement,
  isDarkMode
}: AnnouncementManagerProps) {
  const { toast, confirm } = useToast();

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCat, setAnnCat] = useState<'system' | 'new_course' | 'maintenance'>('system');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      toast.error('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!');
      return;
    }

    try {
      await onCreateAnnouncement({
        title: annTitle,
        content: annContent,
        category: annCat
      });
      toast.success('បានបង្កើតសេចក្តីប្រកាសដោយជោគជ័យ!');
      setAnnTitle('');
      setAnnContent('');
    } catch (err) {
      toast.error('មិនអាចបង្កើតសេចក្តីប្រកាសបានទេ!');
    }
  };

  const handleDeleteClick = (id: string) => {
    confirm({
      title: 'លុបសេចក្តីប្រកាស?',
      message: 'តើអ្នកប្រាកដជាចង់លុបសេចក្តីប្រកាសព័ត៌មាននេះមែនទេ?',
      onConfirm: async () => {
        try {
          await onDeleteAnnouncement(id);
          toast.success('បានលុបសេចក្តីប្រកាស!');
        } catch (err) {
          toast.error('មិនអាចលុបសេចក្តីប្រកាសបានទេ!');
        }
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
      
      {/* Create Announcement Form */}
      <div className={`p-5 rounded-3xl border md:col-span-1 h-fit ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4 text-orange-500" />
          <h4 className="font-sans font-black text-xs text-slate-400 uppercase tracking-wider">បង្កើតសេចក្តីប្រកាសថ្មី</h4>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">ចំណងជើងសេចក្តីប្រកាស</label>
            <input
              type="text"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="ឧ. ការផ្លាស់ប្តូរប្រព័ន្ធសិក្សា"
              className={`block w-full rounded-xl border p-2.5 text-xs font-sans ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">ខ្លឹមសារលម្អិត</label>
            <textarea
              rows={4}
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="សរសេរព័ត៌មានលម្អិតនៅទីនេះ..."
              className={`block w-full rounded-xl border p-2.5 text-xs font-sans ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">ប្រភេទប្រកាស (Level)</label>
            <select
              value={annCat}
              onChange={(e) => setAnnCat(e.target.value as any)}
              className={`block w-full rounded-xl border p-2.5 text-xs font-sans ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="system">សេចក្តីជូនដំណឹងទូទៅ (System)</option>
              <option value="new_course">វគ្គសិក្សាថ្មី (New Course)</option>
              <option value="maintenance">ការថែទាំម៉ាស៊ីន (Maintenance)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-orange-950/20"
          >
            ផ្សព្វផ្សាយជាសាធារណៈ
          </button>
        </form>
      </div>

      {/* Render Current Announcements */}
      <div className={`p-5 rounded-3xl border md:col-span-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h4 className="font-sans font-black text-xs text-slate-400 uppercase tracking-wider mb-4">សេចក្តីប្រកាសបច្ចុប្បន្ន ({announcements.length})</h4>
        
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {announcements.map((ann) => (
            <div key={ann.id} className="p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-slate-950/10 flex justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    ann.category === 'maintenance' ? 'bg-orange-500/10 text-orange-450 border-orange-550/20' :
                    ann.category === 'new_course' ? 'bg-emerald-500/10 text-emerald-450 border-emerald-550/20' :
                    'bg-slate-500/10 text-slate-450 border-slate-550/20'
                  }`}>
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    <span>{ann.date}</span>
                  </span>
                </div>
                <h5 className="text-xs font-black text-slate-200 dark:text-slate-100">{ann.title}</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{ann.content}</p>
              </div>

              <button
                onClick={() => handleDeleteClick(ann.id)}
                className="p-2 bg-slate-950/60 hover:bg-orange-500/10 text-slate-500 hover:text-orange-500 rounded-xl h-fit border border-slate-850 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {announcements.length === 0 && (
            <p className="text-center py-12 text-xs text-slate-550">មិនទាន់មានការប្រកាសណាមួយនៅឡើយទេ។</p>
          )}
        </div>
      </div>
    </div>
  );
}
