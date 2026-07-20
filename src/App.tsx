import React, { useState, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider, useToast } from './context/ToastContext';
import {
  BookOpen,
  Home,
  Search,
  Menu,
  X,
  Download,
  User,
  Award,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

import { DownloadedItem } from './types';
import AdminPanel from './components/AdminPanel';
import SplashScreen from './components/SplashScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

// Custom Hooks
import { useAuth } from './hooks/useAuth';
import { useCourses } from './hooks/useCourses';
import { useLessonProgress } from './hooks/useLessonProgress';
import { useLocalStorage } from './hooks/useLocalStorage';

// Pages
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import CourseDetailPage from './pages/CourseDetailPage';
import SearchPage from './pages/SearchPage';
import DownloadsPage from './pages/DownloadsPage';
import ProfilePage from './pages/ProfilePage';

// -------------------------------------------------------------
// LAYOUT WRAPPER COMPONENT
// Handles header, sidebar/hamburger drawer, mobile bottom navigation, online status
// -------------------------------------------------------------
function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const { currentUser, logout, isAuthLoading } = useAuth();
  const { isCoursesLoading } = useCourses();
  const { progressList } = useLessonProgress();
  const { toast, confirm } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('sabbay_darkmode', false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Statistics & History
  const [historyLogs, setHistoryLogs] = useLocalStorage<{ id: string; event: string; date: string }[]>('sabbay_history', [
    {
      id: '1',
      event: 'បានចុះឈ្មោះបង្កើតគណនីសិក្សាក្នុងប្រព័ន្ធ SABBAY REAN',
      date: new Date().toISOString(),
    },
  ]);

  const [downloads, setDownloads] = useLocalStorage<DownloadedItem[]>('sabbay_downloads', []);

  // Save history logs helper
  const addHistoryLog = (eventText: string) => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      event: eventText,
      date: new Date().toISOString(),
    };
    setHistoryLogs((prev) => [newLog, ...prev]);
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
      },
    });
  };

  const handleClearCache = () => {
    confirm({
      title: 'សម្អាតទិន្នន័យសិក្សា?',
      message:
        'តើអ្នកចង់សម្អាត cache ទាំងអស់របស់កម្មវិធីមែនទេ? សកម្មភាពនេះនឹងលុបរាល់ប្រវត្តិ និងកំណត់ត្រាទាំងអស់របស់សិស្ស។',
      onConfirm: () => {
        localStorage.clear();
        toast.success('បានសម្អាតរាល់ទិន្នន័យដោយជោគជ័យ!');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      },
    });
  };

  if (showSplash) {
    return <SplashScreen onDismiss={() => setShowSplash(false)} isLoading={isLoadingData} />;
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const mainTabs = [
    { id: 'home', path: '/', label: 'ទំព័រដើម', icon: Home },
    { id: 'courses', path: '/courses', label: 'វគ្គសិក្សា', icon: BookOpen },
    { id: 'search', path: '/search', label: 'ស្វែងរក', icon: Search },
    { id: 'downloads', path: '/downloads', label: 'ទាញយក', icon: Download },
    { id: 'profile', path: '/profile', label: 'ប្រវត្តិរូប', icon: User },
  ] as const;

  return (
    <div
      className={`min-h-screen font-sans flex flex-col selection:bg-orange-500 selection:text-white transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Header Navigation Bar */}
      <header
        className={`sticky top-0 z-50 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-900/80 border-b border-slate-800' : 'bg-white border-b border-slate-100/80'
        }`}
      >
        <div className="flex flex-col cursor-pointer justify-center select-none" onClick={() => navigate('/')}>
          <h1
            className={`text-xs font-black uppercase tracking-wider ${
              isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            SABBAY REAN
          </h1>
          <p className={`text-[9px] font-bold mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            រៀនសប្បាយ ចេះពិតប្រាកដ
          </p>
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
                    : isDarkMode
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-slate-50'
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
                  ? isDarkMode
                    ? 'bg-slate-100 border-slate-100 text-slate-950 font-black'
                    : 'bg-slate-900 border-slate-900 text-white font-black'
                  : 'text-orange-600 border-orange-500/20 hover:bg-orange-500/5'
              }`}
            >
              <span>គ្រប់គ្រង</span>
            </Link>
          )}
        </nav>

        {/* Right side settings, profile quick access, offline indicator */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-full border cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 hover:scale-105 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 hover:border-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile / Login Link */}
          {currentUser ? (
            <div 
              className="flex items-center gap-2 cursor-pointer p-0.5 pr-2 sm:pr-3 rounded-full border transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/40 border-slate-200/60 dark:border-slate-800"
              onClick={() => navigate('/profile')}
            >
              <img
                src={
                  currentUser.avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80'
                }
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full border border-slate-150 dark:border-slate-700 object-cover shrink-0"
              />
              <span
                className={`hidden lg:inline text-xs font-black ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {currentUser.name}
              </span>
            </div>
          ) : (
            <Link
              to="/profile"
              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-xs tracking-wider transition-all hover:scale-102 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              ចូលរៀន
            </Link>
          )}

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-xl md:hidden cursor-pointer border transition-all duration-150 ${
              isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {/* Hamburger Drawer (Mobile) */}
      {isMobileMenuOpen && (
        <div
          className={`fixed inset-0 top-16 z-40 flex flex-col md:hidden border-t animate-fade-in ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'
          }`}
        >
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
                      : isDarkMode
                      ? 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
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
                  isActive('/admin') ? 'bg-slate-950 text-white font-black' : 'text-orange-600 bg-orange-500/5'
                }`}
              >
                <span>គ្រប់គ្រងវគ្គសិក្សា (Admin Panel)</span>
              </Link>
            )}
          </div>

          <div className={`p-4 border-t space-y-3 ${isDarkMode ? 'border-slate-850' : 'border-slate-100'}`}>
            {currentUser ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogoutClick();
                }}
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
              className={`w-full py-2 rounded-2xl text-[10px] font-bold cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-900 hover:bg-slate-850 text-slate-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              RESET APPLICATION CACHE
            </button>
          </div>
        </div>
      )}

      {/* Main Outlet Container */}
      <main className="flex-grow pb-20 md:pb-8">
        <Outlet context={{ historyLogs, addHistoryLog, downloads, setDownloads, isDarkMode }} />
      </main>

      {/* Bottom Mobile Navigation Dock Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-45 border-t py-1 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.03)] ${
          isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-150'
        }`}
      >
        <div className="flex items-center justify-between px-2 h-15 w-full max-w-md mx-auto gap-0.5">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center shrink-0 transition-all duration-200 cursor-pointer h-full ${
                  active
                    ? 'text-orange-600 font-black'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    active ? 'scale-110 text-orange-600' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                />
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

// Centralized Router Configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'courses',
        element: <CatalogPage />,
      },
      {
        path: 'courses/:id',
        element: <CourseDetailPage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'downloads',
        element: <DownloadsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'admin/*',
        element: <AdminPanel />,
      },
    ],
  },
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
