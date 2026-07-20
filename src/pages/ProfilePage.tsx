import React, { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { History, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLessonProgress } from '../hooks/useLessonProgress';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../context/ToastContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import AuthScreen from '../components/AuthScreen';
import { UserProfile } from '../types';

function StudentProfilePanel({ currentUser, isDarkMode }: { currentUser: UserProfile; isDarkMode: boolean }) {
  const { logout } = useAuth();
  const { progressList } = useLessonProgress();
  const { favorites } = useFavorites();
  const { toast, confirm } = useToast();
  const navigate = useNavigate();

  // Statistics
  const profileStats = useMemo(() => {
    const coursesStarted = new Set(progressList.map(p => p.courseId)).size;
    const completedCount = progressList.filter(p => p.completed).length;
    const favoritesCount = favorites.length;
    return { coursesStarted, completedCount, favoritesCount };
  }, [progressList, favorites]);

  // Load history logs from localStorage
  const [historyLogs] = useLocalStorage<{ id: string; event: string; date: string }[]>('sabbay_history', []);

  const handleLogoutClick = () => {
    confirm({
      title: 'ចាកចេញពីគណនី?',
      message: 'តើអ្នកប្រាកដជាចង់ចាកចេញពីគណនីសិក្សារបស់អ្នកមែនទេ?',
      onConfirm: async () => {
        try {
          await logout();
          toast.success('បានចាកចេញពីប្រព័ន្ធដោយជោគជ័យ!');
          navigate('/profile');
        } catch {
          toast.error('មានបញ្ហាក្នុងការចាកចេញ!');
        }
      }
    });
  };

  const handleClearCache = () => {
    confirm({
      title: 'សម្អាតទិន្នន័យសិក្សា?',
      message: 'តើអ្នកចង់សម្អាត cache ទាំងអស់របស់កម្មវិធីមែនទេ? សកម្មភាពនេះនឹងលុបរាល់ប្រវត្តិ និងកំណត់ត្រាទាំងអស់របស់សិស្ស។',
      onConfirm: () => {
        localStorage.clear();
        toast.success('បានសម្អាតរាល់ទិន្នន័យដោយជោគជ័យ!');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in font-sans">
      {/* Profile Card */}
      <div className={`relative overflow-hidden rounded-3xl border transition-all p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 ${
        isDarkMode ? 'border-slate-800 bg-slate-900/40 text-slate-100' : 'border-orange-200/60 bg-white text-slate-900'
      }`}>
        <div className="relative shrink-0 self-center sm:self-auto group">
          <img 
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
            alt={currentUser.name} 
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full object-cover bg-orange-50 border-4 border-orange-100 shadow-sm" 
          />
        </div>

        <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
            <h2 className={`text-lg font-black truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{currentUser.name}</h2>
            {currentUser.isAdmin ? (
              <span className="px-3 py-0.5 rounded-full text-[8px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 self-center uppercase tracking-wider">
                អ្នកគ្រប់គ្រងវគ្គសិក្សា
              </span>
            ) : (
              <span className="px-3 py-0.5 rounded-full text-[8px] font-bold bg-orange-500/10 text-orange-700 border border-orange-200/50 self-center uppercase tracking-wider">
                សិស្សរៀន (Student)
              </span>
            )}
          </div>
          
          <p className={`text-xs truncate font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{currentUser.email}</p>
          <p className="text-[10px] text-slate-500 font-mono">លេខសម្គាល់គណនី៖ {currentUser.id}</p>
        </div>

        <button
          onClick={handleLogoutClick}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors self-center shrink-0 shadow-sm"
        >
          ចាកចេញពីគណនី
        </button>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'}`}>
          <p className="text-xl font-black text-orange-600 font-mono">{profileStats.coursesStarted}</p>
          <p className={`text-[10px] mt-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>វគ្គសិក្សាចាប់ផ្តើម</p>
        </div>
        <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'}`}>
          <p className="text-xl font-black text-emerald-600 font-mono">{profileStats.completedCount}</p>
          <p className={`text-[10px] mt-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>មេរៀនដែលរៀនចប់</p>
        </div>
        <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'}`}>
          <p className="text-xl font-black text-amber-600 font-mono">{profileStats.favoritesCount}</p>
          <p className={`text-[10px] mt-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>មេរៀនដែលចូលចិត្ត</p>
        </div>
      </div>

      {/* Study Logs */}
      <div className={`p-6 rounded-3xl border space-y-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white'}`}>
        <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <History className="w-4 h-4 text-orange-500" />
          <span>ប្រវត្តិនៃការសិក្សា & សកម្មភាព (Study log)</span>
        </h3>

        <div className="space-y-3.5 max-h-[250px] overflow-y-auto">
          {historyLogs.map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-4 text-xs font-sans">
              <div className="space-y-1">
                <p className={`font-medium leading-normal ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{log.event}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.date).toLocaleDateString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {historyLogs.length === 0 && (
            <p className="text-center py-6 text-xs text-slate-400">មិនទាន់មានប្រវត្តិសកម្មភាពណាមួយនៅឡើយទេ។</p>
          )}
        </div>
      </div>

      {/* Settings Options */}
      <div className={`p-6 rounded-3xl border space-y-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-white'}`}>
        <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Settings className="w-4 h-4 text-orange-500" />
          <span>ការកំណត់ប្រព័ន្ធ</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/80 border-slate-100'}`}>
            <div>
              <p className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>ភាសាដំណើរការប្រព័ន្ធ (Language)</p>
              <p className="text-[10px] text-slate-500 mt-0.5">គាំទ្រអក្សរខ្មែរឥតខ្ចោះ</p>
            </div>
            <span className="px-3 py-1.5 bg-orange-600 text-white rounded-xl text-[10px] font-bold">ភាសាខ្មែរ (KH)</span>
          </div>

          <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/80 border-slate-100'}`}>
            <div>
              <p className="font-bold text-orange-600">សម្អាតទិន្នន័យសិក្សា (Clear cache)</p>
              <p className="text-[10px] text-slate-500 mt-0.5">លុបរាល់ប្រវត្តិ និងកំណត់ត្រាទាំងអស់</p>
            </div>
            <button
              onClick={handleClearCache}
              className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border border-orange-200/50 rounded-xl font-bold cursor-pointer transition-colors"
            >
              CLEAR ALL Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { currentUser, isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-sans">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-slate-500 font-bold uppercase mt-3">កំពុងផ្ទៀងផ្ទាត់គណនី...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen 
        isDarkMode={isDarkMode} 
        onLoginSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['auth-me'] });
        }}
      />
    );
  }

  return <StudentProfilePanel currentUser={currentUser} isDarkMode={isDarkMode} />;
}
