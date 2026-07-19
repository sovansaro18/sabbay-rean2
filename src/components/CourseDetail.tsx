import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Course, Lesson, Document, Favorite, LessonProgress } from '../types';
import { useCourses, useLessonComments } from '../hooks/useCourses';
import { useAuth } from '../hooks/useAuth';
import VideoPlayer from './VideoPlayer';
import LessonSidebar from './LessonSidebar';
import LessonTabs from './LessonTabs';

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  favorites: Favorite[];
  onToggleFavorite: (courseId: string, lessonId: string) => void;
  onAddDownload: (doc: Document, lessonTitle: string) => void;
  isDarkMode: boolean;
  progressList: LessonProgress[];
  onToggleProgress: (courseId: string, lessonId: string) => void;
  relatedCourses?: Course[];
  onSelectCourse?: (course: Course) => void;
}

export default function CourseDetail({
  course,
  onBack,
  favorites,
  onToggleFavorite,
  onAddDownload,
  isDarkMode,
  progressList,
  onToggleProgress,
  relatedCourses = [],
  onSelectCourse,
}: CourseDetailProps) {
  const lessons = [...(course.lessons || [])].sort((a, b) => a.order - b.order);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
    lessons.length > 0 ? lessons[0] : null
  );

  // Active Tab for lesson info
  const [activeInfoTab, setActiveInfoTab] = useState<'details' | 'notes' | 'comments' | 'resources'>(
    'details'
  );

  // Video Settings States
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [videoQuality] = useState<string>('720p');
  const [autoNext] = useState<boolean>(true);
  const [isPipActive, setIsPipActive] = useState<boolean>(false);

  // Custom Player Refs & States
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Bookmark / Notes states
  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('sabbay_lesson_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [currentNoteText, setCurrentNoteText] = useState('');

  // Lesson comments and actions using API-connected queries/mutations
  const { currentUser } = useAuth();
  const { createComment, deleteComment } = useCourses();
  const { comments: serverComments = [] } = useLessonComments(
    course.id,
    selectedLesson?.id || ''
  );
  const [newCommentText, setNewCommentText] = useState('');

  // Sync state if course changes
  useEffect(() => {
    if (lessons.length > 0) {
      setSelectedLesson(lessons[0]);
    } else {
      setSelectedLesson(null);
    }
  }, [course]);

  // Sync note input when lesson changes
  useEffect(() => {
    if (selectedLesson) {
      setCurrentNoteText(lessonNotes[selectedLesson.id] || '');
    }
  }, [selectedLesson, lessonNotes]);

  // Reset video player state when selected lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [selectedLesson]);

  const isFavorite = (lessonId: string) => {
    return favorites.some((fav) => fav.courseId === course.id && fav.lessonId === lessonId);
  };

  const isCompleted = (lessonId: string) => {
    return progressList.some(
      (p) => p.courseId === course.id && p.lessonId === lessonId && p.completed
    );
  };

  const handleNextLesson = () => {
    if (!selectedLesson) return;
    const currentIndex = lessons.findIndex((l) => l.id === selectedLesson.id);
    if (currentIndex < lessons.length - 1) {
      setSelectedLesson(lessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (!selectedLesson) return;
    const currentIndex = lessons.findIndex((l) => l.id === selectedLesson.id);
    if (currentIndex > 0) {
      setSelectedLesson(lessons[currentIndex - 1]);
    }
  };

  const hasNextLesson = () => {
    if (!selectedLesson) return false;
    const currentIndex = lessons.findIndex((l) => l.id === selectedLesson.id);
    return currentIndex < lessons.length - 1;
  };

  const hasPrevLesson = () => {
    if (!selectedLesson) return false;
    const currentIndex = lessons.findIndex((l) => l.id === selectedLesson.id);
    return currentIndex > 0;
  };

  // Handle saving note
  const handleSaveNote = () => {
    if (!selectedLesson) return;
    const updated = { ...lessonNotes, [selectedLesson.id]: currentNoteText };
    setLessonNotes(updated);
    localStorage.setItem('sabbay_lesson_notes', JSON.stringify(updated));
    alert('រក្សាទុកកំណត់ត្រាដោយជោគជ័យ!');
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedLesson) return;

    try {
      await createComment({
        courseId: course.id,
        lessonId: selectedLesson.id,
        content: newCommentText.trim(),
      });
      setNewCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert(
        'មិនអាចបញ្ជូនមតិយោបល់បានឡើយ៖ ' +
          (err instanceof Error ? err.message : 'សាកល្បងម្ដងទៀត')
      );
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបមតិយោបល់នេះមែនទេ?')) return;
    try {
      await deleteComment({
        id: commentId,
        courseId: course.id,
        lessonId: selectedLesson?.id,
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert(
        'មិនអាចលុបមតិយោបល់បានឡើយ៖ ' +
          (err instanceof Error ? err.message : 'សាកល្បងម្ដងទៀត')
      );
    }
  };

  return (
    <div className="min-h-screen pb-16 transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top sticky path */}
      <div className="border-b px-4 py-3 sticky top-16 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-850">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors cursor-pointer border-none bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ត្រឡប់ទៅផ្ទាំងដើម</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-slate-400">
              វគ្គសិក្សា៖ <strong className="text-slate-700 dark:text-slate-300">{course.title}</strong>
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 uppercase tracking-wider">
              {course.level}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Video Player and Tabs */}
          <div className="lg:col-span-2 space-y-6">
            {selectedLesson ? (
              <div className="rounded-3xl border overflow-hidden p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                {/* Custom/YouTube Video Player Component */}
                <VideoPlayer
                  selectedLesson={selectedLesson}
                  videoRef={videoRef}
                  videoContainerRef={videoContainerRef}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  currentTime={currentTime}
                  setCurrentTime={setCurrentTime}
                  duration={duration}
                  setDuration={setDuration}
                  volume={volume}
                  setVolume={setVolume}
                  isMuted={isMuted}
                  setIsMuted={setIsMuted}
                  isFullscreen={isFullscreen}
                  setIsFullscreen={setIsFullscreen}
                  playbackSpeed={playbackSpeed}
                  setPlaybackSpeed={setPlaybackSpeed}
                  isPipActive={isPipActive}
                  setIsPipActive={setIsPipActive}
                  autoNext={autoNext}
                  handleNextLesson={handleNextLesson}
                  videoQuality={videoQuality}
                />

                {/* Lesson Header Title */}
                <div className="mt-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <h2 className="font-sans font-black text-xl sm:text-2xl leading-snug text-slate-900 dark:text-white">
                        {selectedLesson.title}
                      </h2>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-sans font-medium">
                        <span className="font-bold text-orange-600 dark:text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                          លំដាប់ទី {selectedLesson.order}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>រយៈពេល៖ {selectedLesson.duration} នាទី</span>
                        </span>

                      </div>
                    </div>

                    {/* Lesson Core Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      <button
                        onClick={() => onToggleFavorite(course.id, selectedLesson.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isFavorite(selectedLesson.id)
                            ? 'bg-orange-500/10 text-orange-600 border-orange-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isFavorite(selectedLesson.id) ? 'fill-orange-500 text-orange-500' : ''
                          }`}
                        />
                        <span>{isFavorite(selectedLesson.id) ? 'បានចូលចិត្ត' : 'ចូលចិត្ត'}</span>
                      </button>

                      <button
                        onClick={() => onToggleProgress(course.id, selectedLesson.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isCompleted(selectedLesson.id)
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-orange-600 text-white border-orange-500 hover:bg-orange-700'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{isCompleted(selectedLesson.id) ? 'រៀនរួចរាល់' : 'សម្គាល់ថាបានរៀន'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lesson Info Tab Container Component */}
                <LessonTabs
                  course={course}
                  selectedLesson={selectedLesson}
                  activeInfoTab={activeInfoTab}
                  setActiveInfoTab={setActiveInfoTab}
                  currentNoteText={currentNoteText}
                  setCurrentNoteText={setCurrentNoteText}
                  handleSaveNote={handleSaveNote}
                  newCommentText={newCommentText}
                  setNewCommentText={setNewCommentText}
                  handleAddComment={handleAddComment}
                  currentLessonComments={serverComments}
                  currentUser={currentUser}
                  handleDeleteComment={handleDeleteComment}
                  onAddDownload={onAddDownload}
                />

                {/* Bottom Navigation for Next/Prev Lessons */}
                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={handlePrevLesson}
                    disabled={!hasPrevLesson()}
                    className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      hasPrevLesson()
                        ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer shadow-2xs'
                        : 'border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>ថយក្រោយ</span>
                  </button>

                  <button
                    onClick={handleNextLesson}
                    disabled={!hasNextLesson()}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      hasNextLesson()
                        ? 'bg-orange-600 text-white border-orange-500 hover:bg-orange-700 cursor-pointer shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border-transparent'
                    }`}
                  >
                    <span>មេរៀនបន្ទាប់</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-sm text-slate-400 font-sans">មិនទាន់មានមេរៀនបញ្ចូលឡើយ。</p>
              </div>
            )}
          </div>

          {/* Right Sidebar: Sequential Lesson List and Course Info */}
          <div className="space-y-6">
            <LessonSidebar
              course={course}
              lessons={lessons}
              selectedLesson={selectedLesson}
              setSelectedLesson={setSelectedLesson}
              isCompleted={isCompleted}
              relatedCourses={relatedCourses}
              onSelectCourse={onSelectCourse}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
