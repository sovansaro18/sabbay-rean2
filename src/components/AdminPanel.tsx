import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Library, Users, Megaphone, MessageSquare, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCourses } from '../hooks/useCourses';

// Subcomponents
import DashboardOverview from './admin/DashboardOverview';
import CourseManager from './admin/CourseManager';
import CategoryManager from './admin/CategoryManager';
import TeacherManager from './admin/TeacherManager';
import AnnouncementManager from './admin/AnnouncementManager';
import CommentModeration from './admin/CommentModeration';
import UserList from './admin/UserList';

type AdminSection = 'dashboard' | 'courses' | 'categories' | 'teachers' | 'announcements' | 'comments' | 'users';

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="p-6 rounded-3xl bg-slate-100 h-28 w-full" />
      
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-50 bg-white space-y-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100/80" />
            <div className="h-3 bg-slate-100/70 rounded-lg w-1/2" />
            <div className="h-5 bg-slate-100/60 rounded-lg w-1/3" />
          </div>
        ))}
      </div>

      {/* Charts & Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-50 bg-white space-y-4">
          <div className="h-5 bg-slate-100/80 rounded-lg w-1/3" />
          <div className="h-44 bg-slate-100/50 rounded-2xl w-full" />
        </div>
        <div className="p-6 rounded-3xl border border-slate-50 bg-white space-y-4">
          <div className="h-5 bg-slate-100/80 rounded-lg w-1/2" />
          <div className="space-y-3">
            <div className="h-10 bg-slate-100/40 rounded-2xl w-full" />
            <div className="h-10 bg-slate-100/40 rounded-2xl w-full" />
            <div className="h-10 bg-slate-100/40 rounded-2xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  
  // React Query server state hooks
  const { currentUser, users, updateUser, deleteUser, isUsersLoading } = useAuth();
  const {
    courses,
    isCoursesLoading,
    createCourse,
    updateCourse,
    deleteCourse,
    announcements,
    isAnnouncementsLoading,
    createAnnouncement,
    deleteAnnouncement,
    allComments,
    isAllCommentsLoading,
    deleteComment
  } = useCourses();

  // If loading critical auth status or if unauthorized
  if (!currentUser?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">ការអនុញ្ញាតត្រូវបានបដិសេធ</h3>
        <p className="text-slate-500 text-xs text-center mt-1.5 max-w-sm">
          អ្នកមិនមានសិទ្ធិចូលទៅកាន់ផ្នែកគ្រប់គ្រងប្រព័ន្ធនេះទេ។ សូមចូលគណនីដែលមានសិទ្ធិជា Administrator។
        </p>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'ផ្ទាំងគ្រប់គ្រង (Dashboard)', icon: LayoutDashboard },
    { id: 'courses', label: 'គ្រប់គ្រងវគ្គសិក្សា (Courses)', icon: BookOpen },
    { id: 'categories', label: 'ប្រភេទការសិក្សា (Categories)', icon: Library },
    { id: 'teachers', label: 'សាស្ត្រាចារ្យ (Teachers)', icon: Users },
    { id: 'announcements', label: 'សេចក្តីប្រកាស (Announcements)', icon: Megaphone },
    { id: 'comments', label: 'សម្របសម្រួលមតិ (Comments)', icon: MessageSquare },
    { id: 'users', label: 'គណនីសិស្ស (Students)', icon: Users },
  ] as const;

  const renderContent = () => {
    if (isCoursesLoading || isUsersLoading || isAnnouncementsLoading || isAllCommentsLoading) {
      return <AdminDashboardSkeleton />;
    }

    switch (adminSection) {
      case 'dashboard':
        return (
          <DashboardOverview
            courses={courses}
            users={users}
            allComments={allComments}
            isDarkMode={isDarkMode}
          />
        );
      case 'courses':
        return (
          <CourseManager
            courses={courses}
            onCreateCourse={createCourse}
            onUpdateCourse={async (id, courseData) => {
              await updateCourse({ id, courseData });
            }}
            onDeleteCourse={deleteCourse}
            isDarkMode={isDarkMode}
          />
        );
      case 'categories':
        return (
          <CategoryManager
            courses={courses}
            isDarkMode={isDarkMode}
          />
        );
      case 'teachers':
        return (
          <TeacherManager
            courses={courses}
            isDarkMode={isDarkMode}
          />
        );
      case 'announcements':
        return (
          <AnnouncementManager
            announcements={announcements}
            onCreateAnnouncement={createAnnouncement}
            onDeleteAnnouncement={deleteAnnouncement}
            isDarkMode={isDarkMode}
          />
        );
      case 'comments':
        return (
          <CommentModeration
            comments={allComments}
            courses={courses}
            onDeleteComment={async (id) => {
              await deleteComment({ id });
            }}
            isDarkMode={isDarkMode}
          />
        );
      case 'users':
        return (
          <UserList
            users={users}
            onUpdateUser={async (id, userData) => {
              await updateUser({ id, ...userData });
            }}
            onDeleteUser={deleteUser}
            isDarkMode={isDarkMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side Sidebar: Section Menu Items */}
        <div className="lg:col-span-1 space-y-2">
          <div className="p-4 bg-orange-600 rounded-3xl text-white flex items-center gap-3 shadow-md shadow-orange-950/20">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider">គ្រប់គ្រងប្រព័ន្ធ</h2>
              <p className="text-[9px] font-medium opacity-80">Administrator Console</p>
            </div>
          </div>

          <div className={`p-4 rounded-3xl border space-y-1 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminSection(item.id)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all text-left cursor-pointer ${
                    adminSection === item.id
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-950/10'
                      : isDarkMode ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-950/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side Content Pane: Dynamic Sub-sections */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>

      </div>
    </div>
  );
}
