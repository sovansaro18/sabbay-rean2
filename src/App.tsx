import React, { useState, useEffect, useMemo } from 'react';
import { 
  createBrowserRouter, RouterProvider, Outlet, Link, useLocation, useNavigate, useParams, useOutletContext 
} from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { 
  BookOpen, Heart, GraduationCap, Search, Menu, X, Download, User, 
  Settings, Award, Clock, History, LayoutDashboard, Megaphone, CheckCircle, 
  Sparkles, ArrowRight, Eye, Moon, Sun, ShieldAlert, Sparkle, ExternalLink, Trash2, Globe,
  ChevronLeft, ChevronRight, Languages, Cpu, Smartphone, Wifi, WifiOff, Zap
} from 'lucide-react';

import { Course, Lesson, Favorite, CategoryType, Announcement, Comment, UserProfile, LessonProgress, Document } from './types';
import { CATEGORIES, INITIAL_ANNOUNCEMENTS } from './data';
import CourseCard from './components/CourseCard';
import CourseDetail from './components/CourseDetail';
import AdminPanel from './components/AdminPanel';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import DownloadCenter from './components/DownloadCenter';
import { ErrorBoundary } from './components/ErrorBoundary';

// Custom Hooks
import { useAuth } from './hooks/useAuth';
import { useCourses } from './hooks/useCourses';
import { useFavorites } from './hooks/useFavorites';
import { useLessonProgress } from './hooks/useLessonProgress';
import { useToast } from './context/ToastContext';

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

interface DownloadedItem {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  document: Document;
}

// -------------------------------------------------------------
// LAYOUT WRAPPER COMPONENT
// Handles header, sidebar/hamburger drawer, mobile bottom navigation, online status
// -------------------------------------------------------------
function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const { currentUser, logout, isAuthLoading } = useAuth();
  const { courses, isCoursesLoading } = useCourses();
  const { progressList } = useLessonProgress();
  const { favorites } = useFavorites();
  const { toast, confirm } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'kh' | 'en'>('kh');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Statistics & History
  const [historyLogs, setHistoryLogs] = useState<{ id: string; event: string; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem('sabbay_history');
      const defaultLogs = [
        { id: '1', event: 'បានចុះឈ្មោះបង្កើតគណនីសិក្សាក្នុងប្រព័ន្ធ SABBAY REAN', date: new Date().toISOString() }
      ];
      if (saved) return JSON.parse(saved);
      return defaultLogs;
    } catch {
      return [];
    }
  });

  const [downloads, setDownloads] = useState<DownloadedItem[]>(() => {
    try {
      const saved = localStorage.getItem('sabbay_downloads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history logs helper
  const addHistoryLog = (eventText: string) => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      event: eventText,
      date: new Date().toISOString()
    };
    setHistoryLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('sabbay_history', JSON.stringify(updated));
      return updated;
    });
  };

  const isLoadingData = isAuthLoading || isCoursesLoading;

  useEffect(() => {
    if (!isLoadingData) {
      setShowSplash(false);
    }
  }, [isLoadingData]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addHistoryLog('ប្រព័ន្ធអ៊ីនធឺណិតបានភ្ជាប់ឡើងវិញ (Online)');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addHistoryLog('កម្មវិធីកំពុងដំណើរការក្នុងរបៀប Offline (គ្មានអ៊ីនធឺណិត)');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogoutClick = () => {
    confirm({
      title: 'ចាកចេញពីគណនី?',
      message: 'តើអ្នកប្រាកដជាចង់ចាកចេញពីគណនីសិក្សារបស់អ្នកមែនទេ?',
      onConfirm: async () => {
        try {
          await logout();
          addHistoryLog('បានចាកចេញពីគណនីសិក្សាក្នុងប្រព័ន្ធ');
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

  if (showSplash) {
    return <SplashScreen onDismiss={() => setShowSplash(false)} isLoading={isLoadingData} />;
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Extract navigation tabs list for looping
  const mainTabs = [
    { id: 'home', path: '/', label: 'ទំព័រដើម', icon: LayoutDashboard },
    { id: 'courses', path: '/courses', label: 'វគ្គសិក្សា', icon: BookOpen },
    { id: 'search', path: '/search', label: 'ស្វែងរក', icon: Search },
    { id: 'downloads', path: '/downloads', label: 'ទាញយក', icon: Download },
    { id: 'profile', path: '/profile', label: 'ប្រវត្តិរូប', icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm tracking-tighter">
            SR
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1">
              <span>SABBAY REAN</span>
              <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 fill-orange-500" />
            </h1>
            <p className="text-[9px] font-bold text-slate-500">រៀនសប្បាយ ចេះពិតប្រាកដ</p>
          </div>
        </div>

        {/* Desktop navigation menu */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive(tab.path)
                    ? 'bg-orange-600 text-white font-black shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </Link>
            );
          })}

          {currentUser?.isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border ${
                isActive('/admin')
                  ? 'bg-slate-900 border-slate-900 text-white font-black'
                  : 'text-orange-600 border-orange-500/20 hover:bg-orange-500/5'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>គ្រប់គ្រង</span>
            </Link>
          )}
        </nav>

        {/* Right side settings, profile quick access, offline indicator */}
        <div className="flex items-center gap-3">
          {/* Offline/Online Badge */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/5 py-1 px-2.5 rounded-lg border border-emerald-500/10">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">អនឡាញ</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50/80 py-1 px-2.5 rounded-lg border border-slate-200">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Offline (Cache)</span>
              </span>
            )}
          </div>

          {/* User quick avatar */}
          {currentUser ? (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/profile')}>
              <img 
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80'} 
                alt={currentUser.name} 
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              />
              <span className="hidden lg:inline text-xs font-black text-slate-700">{currentUser.name}</span>
            </div>
          ) : (
            <Link 
              to="/profile" 
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              ចូលរៀន
            </Link>
          )}

          {/* Hamburger Menu Toggle (Mobile) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-200 md:hidden cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. Hamburger Drawer (Mobile) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white z-40 flex flex-col md:hidden border-t border-slate-100 animate-fade-in">
          <div className="p-4 space-y-2 flex-1">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all ${
                    isActive(tab.path)
                      ? 'bg-orange-600 text-white font-black'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}

            {currentUser?.isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full p-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all ${
                  isActive('/admin')
                    ? 'bg-slate-950 text-white font-black'
                    : 'text-orange-600 bg-orange-500/5'
                }`}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>គ្រប់គ្រងវគ្គសិក្សា (Admin Panel)</span>
              </Link>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 space-y-3">
            {currentUser ? (
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogoutClick(); }}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-xs cursor-pointer"
              >
                ចាកចេញពីគណនី
              </button>
            ) : (
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-xs"
              >
                ចូលប្រព័ន្ធសិក្សា
              </Link>
            )}
            <button
              onClick={handleClearCache}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-bold cursor-pointer"
            >
              RESET APPLICATION CACHE
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Outlet Container */}
      <main className="flex-grow pb-20 md:pb-8">
        <Outlet context={{ historyLogs, addHistoryLog, downloads, setDownloads }} />
      </main>

      {/* 4. Bottom Mobile Navigation Dock Panel - Flexible and vertically stacked on smaller viewports */}
      <div className="fixed bottom-0 left-0 right-0 z-45 border-t border-slate-150 py-1 md:hidden bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-2 h-15 w-full max-w-md mx-auto gap-0.5">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center shrink-0 transition-all duration-200 cursor-pointer h-full ${
                  active ? 'text-orange-600 font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform ${active ? 'scale-110 text-orange-600' : 'text-slate-500'}`} />
                <span className="truncate max-w-full text-center text-[8px] tracking-tighter leading-tight mt-1 font-sans">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SKELETON LOADING COMPONENTS
// -------------------------------------------------------------
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

function CourseDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse font-sans">
      <div className="h-4 bg-slate-100 rounded-lg w-24" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video w-full rounded-3xl bg-slate-100" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-100 rounded-lg w-2/3" />
            <div className="h-3 bg-slate-100 rounded-lg w-full" />
            <div className="h-3 bg-slate-100 rounded-lg w-5/6" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-100 bg-white space-y-4">
            <div className="h-5 bg-slate-100 rounded-lg w-1/2" />
            <div className="space-y-3">
              <div className="h-10 bg-slate-100/60 rounded-2xl w-full" />
              <div className="h-10 bg-slate-100/60 rounded-2xl w-full" />
              <div className="h-10 bg-slate-100/60 rounded-2xl w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// HOME VIEW COMPONENT
// Renders hero slider, categories, announcements, latest courses catalog
// -------------------------------------------------------------
function HomeView() {
  const { courses, announcements, isCoursesLoading } = useCourses();
  const { progressList } = useLessonProgress();
  const navigate = useNavigate();

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  const getCourseProgressPercent = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.lessons || course.lessons.length === 0) return 0;
    const courseProgress = progressList.filter(p => p.courseId === courseId && p.completed);
    return Math.round((courseProgress.length / course.lessons.length) * 100);
  };

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
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-12 space-y-2 max-w-3xl">
            <span className="px-2.5 py-1 bg-orange-600 text-white rounded-md text-[9px] font-bold uppercase tracking-wider w-fit">
              {HERO_SLIDES[heroIndex].tag}
            </span>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              {HERO_SLIDES[heroIndex].title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 leading-normal line-clamp-2 sm:line-clamp-none font-sans max-w-xl">
              {HERO_SLIDES[heroIndex].desc}
            </p>
            <div className="pt-2">
              <button 
                onClick={() => navigate('/courses')}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-transform duration-200 active:scale-95 shadow-md shadow-orange-950/20"
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
          <div className="p-4 rounded-2xl border border-orange-500/10 bg-orange-500/5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600/10 text-orange-600 flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-black uppercase text-orange-600 tracking-wider">សេចក្តីជូនដំណឹងថ្មីបំផុត</span>
              <h4 className="text-xs font-black text-slate-800 truncate mt-0.5">{announcements[0].title}</h4>
              <p className="text-[11px] text-slate-600 leading-normal font-sans line-clamp-1 sm:line-clamp-none mt-1">{announcements[0].content}</p>
            </div>
          </div>
        </section>
      )}

      {/* Education Category Selection Circles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">ផ្នែកសិក្សាដែលត្រូវរៀន</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const courseCount = courses.filter(c => c.category === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/courses?category=${cat.id}`)}
                className="p-4 rounded-2xl border border-slate-100 hover:border-orange-500/30 bg-slate-50/50 hover:bg-orange-500/5 transition-all cursor-pointer flex flex-col justify-between h-28"
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase tracking-wider ${cat.color}`}>
                  {cat.id.substring(0, 2).toUpperCase()}
                </span>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-950">{cat.label}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{courseCount} វគ្គសិក្សាសកម្ម</p>
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
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">វគ្គសិក្សាកំពុងពេញនិយម</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">មេរៀនល្បីៗដែលត្រូវបានរៀបចំយ៉ាងល្អបំផុត</p>
          </div>
          <button 
            onClick={() => navigate('/courses')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
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
                isDarkMode={false}
              />
            ))
          )}
        </div>
      </section>

      {/* Metrics of Progress / Gamified learning tracker summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">ស្ថិតិនៃការសិក្សារបស់អ្នក</h4>
            <p className="text-xs font-extrabold text-slate-800">បន្តការរៀនសូត្រឱ្យបានទៀងទាត់ដើម្បីទទួលបានជំនាញច្បាស់លាស់!</p>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <span className="text-xl font-black text-orange-600 font-mono">{systemStats.activeLessons}</span>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">មេរៀនចាប់ផ្តើម</p>
            </div>
            <div className="text-center">
              <span className="text-xl font-black text-emerald-600 font-mono">{systemStats.completedLessons}</span>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">មេរៀនរៀនចប់</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// -------------------------------------------------------------
// CATALOG VIEW COMPONENT
// Listing all available courses, search inputs, filtering categories
// -------------------------------------------------------------
function CatalogView() {
  const { courses, isCoursesLoading } = useCourses();
  const { progressList } = useLessonProgress();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLevel, setSearchLevel] = useState<'all' | 'មូលដ្ឋាន' | 'មធ្យម' | 'កម្រិតខ្ពស់'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>(() => {
    const catParam = searchParams.get('category');
    return (catParam as any) || 'all';
  });

  const getCourseProgressPercent = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.lessons || course.lessons.length === 0) return 0;
    const courseProgress = progressList.filter(p => p.courseId === courseId && p.completed);
    return Math.round((courseProgress.length / course.lessons.length) * 100);
  };

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
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">បញ្ជីស្វែងរកមេរៀន និងវគ្គសិក្សា</h2>
        <p className="text-[11px] text-slate-400 mt-1">ជ្រើសរើសមេរៀនដែលត្រូវនឹងចំណង់ចំណូលចិត្ត ឬជំនាញដែលអ្នកចង់ពង្រឹងបន្ថែម។</p>
      </div>

      {/* Filter Options toolbar */}
      <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Text input search */}
          <div className="relative">
            <input
              type="text"
              placeholder="ស្វែងរកតាមចំណងជើង គ្រូបង្រៀន..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Category SELECT */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-700"
          >
            <option value="all">គ្រប់ផ្នែកសិក្សាទាំងអស់ (All categories)</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          {/* Level selector toggle */}
          <select
            value={searchLevel}
            onChange={(e) => setSearchLevel(e.target.value as any)}
            className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-700"
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
              isDarkMode={false}
            />
          ))
        )}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20 text-slate-400 text-xs font-sans border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
          រកមិនឃើញវគ្គសិក្សាណាមួយដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកខាងលើឡើយ។
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// COURSE DETAILS VIEW COMPONENT
// Renders active video, lessons directory list, comments moderation
// -------------------------------------------------------------
function CourseDetailView() {
  const { id } = useParams();
  const { courses, isCoursesLoading } = useCourses();
  const { favorites, toggleFavorite } = useFavorites();
  const { progressList, toggleProgress } = useLessonProgress();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { downloads, setDownloads } = useOutletContext<{
    downloads: DownloadedItem[];
    setDownloads: React.Dispatch<React.SetStateAction<DownloadedItem[]>>;
  }>();

  const course = useMemo(() => {
    return courses.find(c => c.id === id);
  }, [courses, id]);

  const handleAddDownload = (doc: Document, lessonTitle: string) => {
    if (!course) return;
    const isAlreadyDownloaded = downloads.some(d => d.document.id === doc.id);
    if (isAlreadyDownloaded) {
      toast.success('ឯកសារនេះត្រូវបានទាញយករួចរាល់ហើយ!');
      return;
    }

    const newItem: DownloadedItem = {
      id: `download-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      courseId: course.id,
      courseTitle: course.title,
      lessonId: doc.id,
      lessonTitle: lessonTitle,
      document: doc
    };

    const updated = [newItem, ...downloads];
    setDownloads(updated);
    localStorage.setItem('sabbay_downloads', JSON.stringify(updated));
    toast.success('បានទាញយកឯកសារមេរៀនដោយជោគជ័យ!');
  };

  if (isCoursesLoading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <div className="text-center py-24">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">រកមិនឃើញវគ្គសិក្សា</h3>
        <button onClick={() => navigate('/courses')} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer">
          ត្រឡប់ទៅវគ្គសិក្សាវិញ
        </button>
      </div>
    );
  }

  return (
    <CourseDetail
      course={course}
      onBack={() => navigate('/courses')}
      favorites={favorites}
      onToggleFavorite={toggleFavorite}
      onAddDownload={handleAddDownload}
      isDarkMode={false}
      progressList={progressList}
      onToggleProgress={toggleProgress}
      relatedCourses={courses.filter(c => c.category === course.category && c.id !== course.id)}
      onSelectCourse={(c) => navigate(`/courses/${c.id}`)}
    />
  );
}

// -------------------------------------------------------------
// PROFILE / AUTHENTICATION VIEW COMPONENT
// -------------------------------------------------------------
function ProfileView() {
  const { currentUser, isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-slate-500 font-bold uppercase mt-3">កំពុងផ្ទៀងផ្ទាត់គណនី...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen 
        isDarkMode={false} 
        onLoginSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['auth-me'] });
        }}
      />
    );
  }

  return <StudentProfilePanel currentUser={currentUser} />;
}

function StudentProfilePanel({ currentUser }: { currentUser: UserProfile }) {
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
  const [historyLogs, setHistoryLogs] = useState<{ id: string; event: string; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem('sabbay_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
      <div className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="relative shrink-0 self-center sm:self-auto group">
          <img 
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
            alt={currentUser.name} 
            className="w-20 h-20 rounded-full object-cover bg-orange-50 border-4 border-orange-100 shadow-sm" 
          />
        </div>

        <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
            <h2 className="text-lg font-black text-slate-800 truncate">{currentUser.name}</h2>
            {currentUser.isAdmin ? (
              <span className="px-3 py-0.5 rounded-full text-[8px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 self-center uppercase tracking-wider font-sans">
                អ្នកគ្រប់គ្រងវគ្គសិក្សា
              </span>
            ) : (
              <span className="px-3 py-0.5 rounded-full text-[8px] font-bold bg-orange-500/10 text-orange-700 border border-orange-500/20 self-center uppercase tracking-wider font-sans">
                សិស្សរៀន (Student)
              </span>
            )}
          </div>
          
          <p className="text-xs text-slate-600 truncate font-mono">{currentUser.email}</p>
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
        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-center">
          <p className="text-xl font-black text-orange-600 font-mono">{profileStats.coursesStarted}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-bold">វគ្គសិក្សាចាប់ផ្តើម</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-center">
          <p className="text-xl font-black text-emerald-600 font-mono">{profileStats.completedCount}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-bold">មេរៀនដែលរៀនចប់</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-center">
          <p className="text-xl font-black text-amber-600 font-mono">{profileStats.favoritesCount}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-bold">មេរៀនដែលចូលចិត្ត</p>
        </div>
      </div>

      {/* Study Logs */}
      <div className="p-6 rounded-3xl border border-slate-100 bg-white space-y-4">
        <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <History className="w-4 h-4 text-orange-500" />
          <span>ប្រវត្តិនៃការសិក្សា & សកម្មភាព (Study log)</span>
        </h3>

        <div className="space-y-3.5 max-h-[250px] overflow-y-auto">
          {historyLogs.map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-4 text-xs font-sans">
              <div className="space-y-1">
                <p className="font-medium text-slate-800 leading-normal">{log.event}</p>
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
      <div className="p-6 rounded-3xl border border-slate-100 bg-white space-y-4">
        <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Settings className="w-4 h-4 text-orange-500" />
          <span>ការកំណត់ប្រព័ន្ធ</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">ភាសាដំណើរការប្រព័ន្ធ (Language)</p>
              <p className="text-[10px] text-slate-500 mt-0.5">គាំទ្រអក្សរខ្មែរឥតខ្ចោះ</p>
            </div>
            <span className="px-3 py-1.5 bg-orange-600 text-white rounded-xl text-[10px] font-bold">ភាសាខ្មែរ (KH)</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
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

// -------------------------------------------------------------
// SEARCH CATALOG ENGINE VIEW
// -------------------------------------------------------------
function SearchView() {
  const { courses } = useCourses();
  const { progressList } = useLessonProgress();
  const navigate = useNavigate();

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

  const getCourseProgressPercent = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.lessons || course.lessons.length === 0) return 0;
    const courseProgress = progressList.filter(p => p.courseId === courseId && p.completed);
    return Math.round((courseProgress.length / course.lessons.length) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">ស្វែងរកមេរៀន និងវគ្គសិក្សា</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">បញ្ចូលពាក្យគន្លឹះដើម្បីរុករកមេរៀនវគ្គសិក្សាទាំងអស់នៅក្នុងបណ្ណាល័យអប់រំ SABBAY REAN។</p>
        
        {/* Expanded Search Bar */}
        <div className="relative max-w-xl mx-auto pt-3">
          <input
            type="text"
            placeholder="ស្វែងរកតាមចំណងជើង ជំនាញ ឬឈ្មោះលោកគ្រូ/អ្នកគ្រូ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs focus:bg-white focus:border-orange-500 transition-all outline-none"
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
                  : 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-150'
              }`}
            >
              {lvl === 'all' ? 'គ្រប់កម្រិតទាំងអស់' : lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
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
              isDarkMode={false}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <p className="text-center py-16 text-xs text-slate-400">មិនរកឃើញមេរៀនដែលត្រូវនឹងលក្ខខណ្ឌខាងលើឡើយ។</p>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DOWNLOADS / OFFLINE CACHE VIEW
// Renders static documents download center
// -------------------------------------------------------------
function DownloadsView() {
  const [downloads, setDownloads] = useState<DownloadedItem[]>(() => {
    try {
      const saved = localStorage.getItem('sabbay_downloads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleRemoveDownload = (id: string) => {
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
    localStorage.setItem('sabbay_downloads', JSON.stringify(updated));
  };

  const handleClearAllDownloads = () => {
    setDownloads([]);
    localStorage.removeItem('sabbay_downloads');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <DownloadCenter
        downloads={downloads}
        onRemoveDownload={handleRemoveDownload}
        onClearAllDownloads={handleClearAllDownloads}
        isDarkMode={false}
      />
    </div>
  );
}

// -------------------------------------------------------------
// MAIN ENTRY APP ROUTER CONFIGURATION
// -------------------------------------------------------------
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '',
        element: <HomeView />
      },
      {
        path: 'courses',
        element: <CatalogView />
      },
      {
        path: 'courses/:id',
        element: <CourseDetailView />
      },
      {
        path: 'search',
        element: <SearchView />
      },
      {
        path: 'downloads',
        element: <DownloadsView />
      },
      {
        path: 'profile',
        element: <ProfileView />
      },
      {
        path: 'admin/*',
        element: <AdminPanel isDarkMode={false} />
      }
    ]
  }
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </ToastProvider>
    </QueryClientProvider>
  );
}
