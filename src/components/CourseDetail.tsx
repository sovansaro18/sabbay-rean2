import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Play, FileText, CheckCircle, Heart, Share2, 
  ArrowRight, Award, User, Download, ExternalLink, RefreshCw, 
  BookOpen, Star, Sparkles, MessageSquare, Plus, Clock, Eye, 
  ChevronRight, Bookmark, Settings, HelpCircle, Monitor, Maximize2,
  Pause, Volume2, VolumeX
} from 'lucide-react';
import { Course, Lesson, Document, Favorite, Comment, LessonProgress } from '../types';

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
  onSelectCourse
}: CourseDetailProps) {
  const lessons = [...(course.lessons || [])].sort((a, b) => a.order - b.order);
  
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
    lessons.length > 0 ? lessons[0] : null
  );

  // Active Tab for lesson info
  const [activeInfoTab, setActiveInfoTab] = useState<'details' | 'notes' | 'comments' | 'resources'>('details');

  // Video Settings States
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [videoQuality, setVideoQuality] = useState<string>('720p');
  const [autoNext, setAutoNext] = useState<boolean>(true);
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Custom Player States for Direct (Cloudinary) Videos
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
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

  // Local comments state
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const saved = localStorage.getItem('sabbay_comments');
      const defaultComments: Comment[] = [
        {
          id: 'c-1',
          courseId: course.id,
          lessonId: lessons[0]?.id || '',
          userName: 'ភា រិទ្ធ',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          content: 'មេរៀននេះពន្យល់បានច្បាស់ល្អណាស់បាទ! ខ្ញុំយល់ពីក្បួនគ្រឹះបានច្រើន។',
          createdAt: '2026-07-16T10:30:00.000Z'
        },
        {
          id: 'c-2',
          courseId: course.id,
          lessonId: lessons[0]?.id || '',
          userName: 'ណារ៉េត សុខា',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          content: 'ឯកសារភ្ជាប់ PDF មានប្រយោជន៍ណាស់លោកគ្រូ សង្ខេបបានខ្លីខ្លឹម!',
          createdAt: '2026-07-15T15:45:00.000Z'
        }
      ];
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          return parsed.map((item, index) => {
            let id = item.id;
            if (!id || seen.has(id)) {
              id = `comm-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`;
            }
            seen.add(id);
            return { ...item, id };
          });
        }
      }
      return defaultComments;
    } catch {
      return [];
    }
  });
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

  // Extract YouTube ID
  const getYouTubeEmbedId = (url: string): string => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const isDirectVideo = (url: string) => {
    if (!url) return false;
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('cloudinary.com') || url.includes('/video/upload/');
  };

  // Sync playback rate with state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, selectedLesson]);

  // Reset video player state when selected lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [selectedLesson]);

  // Handle Fullscreen escape change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => console.log('Playback error:', err));
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
    if (vol > 0) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isFavorite = (lessonId: string) => {
    return favorites.some(fav => fav.courseId === course.id && fav.lessonId === lessonId);
  };

  const isCompleted = (lessonId: string) => {
    return progressList.some(p => p.courseId === course.id && p.lessonId === lessonId && p.completed);
  };

  const handleNextLesson = () => {
    if (!selectedLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex < lessons.length - 1) {
      setSelectedLesson(lessons[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (!selectedLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex > 0) {
      setSelectedLesson(lessons[currentIndex - 1]);
    }
  };

  const hasNextLesson = () => {
    if (!selectedLesson) return false;
    const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
    return currentIndex < lessons.length - 1;
  };

  const hasPrevLesson = () => {
    if (!selectedLesson) return false;
    const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
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
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedLesson) return;

    const userStr = localStorage.getItem('sabbay_user');
    const user = userStr ? JSON.parse(userStr) : { name: 'ភ្ញៀវ (Guest)', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' };

    const newComment: Comment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      courseId: course.id,
      lessonId: selectedLesson.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      content: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem('sabbay_comments', JSON.stringify(updated));
    setNewCommentText('');
  };

  // Filter comments for current selected lesson
  const currentLessonComments = comments.filter(c => c.courseId === course.id && c.lessonId === (selectedLesson?.id || ''));

  return (
    <div className="min-h-screen pb-16 transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top sticky path */}
      <div className="border-b px-4 py-3 sticky top-16 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-850">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ត្រឡប់ទៅផ្ទាំងដើម</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-slate-400 font-sans">
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
                
                {/* Video Player Wrap */}
                {isDirectVideo(selectedLesson.videoUrl) ? (
                  <div 
                    ref={videoContainerRef}
                    className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner group select-none"
                  >
                    <video
                      ref={videoRef}
                      src={selectedLesson.videoUrl}
                      className="absolute inset-0 w-full h-full object-contain cursor-pointer"
                      playsInline
                      onClick={togglePlay}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={() => {
                        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                      }}
                      onDurationChange={() => {
                        if (videoRef.current) setDuration(videoRef.current.duration);
                      }}
                      onEnded={() => {
                        setIsPlaying(false);
                        if (autoNext) {
                          handleNextLesson();
                        }
                      }}
                    />
                    
                    {/* Floating Center Play/Pause button on screen */}
                    <div 
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-auto"
                    >
                      <div className={`p-5 rounded-full bg-black/60 text-white backdrop-blur-xs transition-all duration-300 transform ${
                        isPlaying ? 'scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100' : 'scale-100 opacity-100'
                      }`}>
                        {isPlaying ? <Pause className="w-8 h-8 fill-white text-white" /> : <Play className="w-8 h-8 fill-white text-white translate-x-0.5" />}
                      </div>
                    </div>

                    {/* CUSTOM VIDEO CONTROLS OVERLAY AT THE BOTTOM */}
                    <div 
                      onClick={(e) => e.stopPropagation()} // Prevent triggering play/pause when clicking controls
                      className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 z-20 pointer-events-auto"
                    >
                      {/* Progress Bar / Scrubber */}
                      <div className="flex items-center gap-3 relative w-full">
                        <input
                          type="range"
                          min={0}
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleSeekChange}
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-orange-600 bg-white/30 hover:h-2 transition-all outline-hidden"
                          style={{
                            background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(currentTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.3) ${(currentTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.3) 100%)`
                          }}
                        />
                      </div>

                      {/* Control Buttons Row */}
                      <div className="flex items-center justify-between text-white text-xs gap-2">
                        {/* Left Side: Play, Time, Volume */}
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                          <button
                            onClick={togglePlay}
                            className="p-1 hover:text-orange-500 transition-colors cursor-pointer animate-none bg-transparent border-none text-white font-sans flex items-center justify-center shrink-0"
                            title={isPlaying ? "ផ្អាក" : "ចាក់"}
                          >
                            {isPlaying ? <Pause className="w-4 h-4 fill-current text-white" /> : <Play className="w-4 h-4 fill-current text-white" />}
                          </button>

                          {/* Time Indicator */}
                          <div className="font-mono text-[10px] sm:text-[11px] text-slate-200 whitespace-nowrap">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </div>

                          {/* Volume section (Hidden on mobile for cleaner spacing) */}
                          <div className="hidden sm:flex items-center gap-1 group/volume shrink-0">
                            <button
                              onClick={toggleMute}
                              className="p-1 hover:text-orange-500 transition-colors cursor-pointer bg-transparent border-none text-white flex items-center justify-center"
                              title={isMuted ? "បើកសំឡេង" : "បិទសំឡេង"}
                            >
                              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                            </button>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.05}
                              value={isMuted ? 0 : volume}
                              onChange={handleVolumeChange}
                              className="hidden sm:block w-12 md:w-16 h-1 rounded-lg appearance-none cursor-pointer accent-orange-600 bg-white/30 hover:bg-white/40 outline-hidden transition-all"
                              style={{
                                background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.3) 100%)`
                              }}
                            />
                          </div>
                        </div>

                        {/* Right Side: Speed badge, PIP, Fullscreen */}
                        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                          <div className="flex items-center gap-1 bg-white/10 px-1.5 sm:px-2 py-0.5 rounded-lg border border-white/10">
                            <span className="hidden sm:inline-block text-[10px] text-slate-300 font-sans">ល្បឿន៖</span>
                            <select
                              value={playbackSpeed}
                              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                              className="bg-transparent text-[10px] text-white font-bold font-mono outline-hidden cursor-pointer border-none p-0 focus:ring-0 [&>option]:bg-slate-900 [&>option]:text-white"
                            >
                              <option value="0.5">0.5x</option>
                              <option value="1">1.0x</option>
                              <option value="1.25">1.25x</option>
                              <option value="1.5">1.5x</option>
                              <option value="2">2.0x</option>
                            </select>
                          </div>

                          <button
                            onClick={() => {
                              setIsPipActive(!isPipActive);
                              if (videoRef.current) {
                                if (document.pictureInPictureElement) {
                                  document.exitPictureInPicture();
                                } else {
                                  videoRef.current.requestPictureInPicture().catch(e => {
                                    console.log('PIP error:', e);
                                  });
                                }
                              }
                            }}
                            className={`hidden sm:flex p-1 hover:text-orange-500 transition-colors cursor-pointer bg-transparent border-none items-center justify-center shrink-0 ${isPipActive ? 'text-orange-500' : 'text-white'}`}
                            title="Picture in Picture"
                          >
                            <Monitor className="w-4 h-4 text-white" />
                          </button>

                          <button
                            onClick={toggleFullscreen}
                            className="p-1 hover:text-orange-500 transition-colors cursor-pointer bg-transparent border-none text-white flex items-center justify-center shrink-0"
                            title="ពេញអេក្រង់"
                          >
                            <Maximize2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner group">
                    <iframe
                      title={selectedLesson.title}
                      src={`https://www.youtube.com/embed/${getYouTubeEmbedId(selectedLesson.videoUrl)}?autoplay=1&enablejsapi=1`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    
                    {/* Floating Mock Quality and Speed Badges */}
                    <div className="absolute top-3 right-3 flex gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-xs">
                        {videoQuality}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-xs">
                        {playbackSpeed}x
                      </span>
                    </div>
                  </div>
                )}

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
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>១,២០០ ដង</span>
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
                        <Heart className={`w-3.5 h-3.5 ${isFavorite(selectedLesson.id) ? 'fill-orange-500 text-orange-500' : ''}`} />
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

                {/* Sub-Tabs Reorganized into a Neat Grid with Icons */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-100/80 dark:bg-slate-950/40 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
                  <button
                    onClick={() => setActiveInfoTab('details')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeInfoTab === 'details'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">ព័ត៌មានលម្អិត</span>
                    <span className="sm:hidden">ព័ត៌មាន</span>
                  </button>
                  <button
                    onClick={() => setActiveInfoTab('notes')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeInfoTab === 'notes'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">កត់ត្រាខ្លីៗ ({currentNoteText ? 'មាន' : 'គ្មាន'})</span>
                    <span className="sm:hidden">កត់ត្រា</span>
                  </button>
                  <button
                    onClick={() => setActiveInfoTab('comments')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeInfoTab === 'comments'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">ការពិភាក្សា ({currentLessonComments.length})</span>
                    <span className="sm:hidden">ពិភាក្សា ({currentLessonComments.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveInfoTab('resources')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeInfoTab === 'resources'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">ឯកសារភ្ជាប់ ({selectedLesson.documents?.length || 0})</span>
                    <span className="sm:hidden">ឯកសារ ({selectedLesson.documents?.length || 0})</span>
                  </button>
                </div>

                {/* Tab content */}
                <div className="mt-6">
                  {/* Details Tab */}
                  {activeInfoTab === 'details' && (
                    <div className="space-y-4 font-sans text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      <p className="font-medium">{selectedLesson.description}</p>
                      
                      {selectedLesson.notes && (
                        <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 text-xs text-orange-800 dark:text-orange-400 mt-2 space-y-1">
                          <h4 className="font-bold flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <span>កំណត់ចំណាំសំខាន់របស់គ្រូ៖</span>
                          </h4>
                          <p className="whitespace-pre-line">{selectedLesson.notes}</p>
                        </div>
                      )}

                      {/* Course Outcomes Section */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">តម្រូវការសិក្សា៖</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                          {course.requirements?.map((req, i) => <li key={i}>{req}</li>) || (
                            <li>មានកុំព្យូទ័រ ឬទូរស័ព្ទដៃដែលភ្ជាប់អ៊ីនធឺណិត។</li>
                          )}
                        </ul>
                      </div>

                      <div className="pt-2 space-y-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">លទ្ធផលដែលទទួលបាន៖</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                          {course.learningOutcomes?.map((out, i) => <li key={i}>{out}</li>) || (
                            <li>យល់ដឹងពីក្បួនគ្រឹះជាក់ស្តែង និងអាចអនុវត្តការងារបាន។</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Notes Tab */}
                  {activeInfoTab === 'notes' && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">កំណត់ត្រាផ្ទាល់ខ្លួនរបស់អ្នក (Notes)</label>
                        <textarea
                          rows={4}
                          value={currentNoteText}
                          onChange={(e) => setCurrentNoteText(e.target.value)}
                          placeholder="សរសេរចំណាំ ឬគន្លឹះសំខាន់ៗដែលទទួលបានពីវីដេអូមេរៀននេះ..."
                          className="block w-full rounded-xl border p-3.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-sans bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <button
                        onClick={handleSaveNote}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
                      >
                        រក្សាទុកកំណត់ត្រា
                      </button>
                    </div>
                  )}

                  {/* Comments Tab */}
                  {activeInfoTab === 'comments' && (
                    <div className="space-y-6">
                      <form onSubmit={handleAddComment} className="flex gap-2">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="សរសេរសំណួរ ឬបញ្ចេញមតិយោបល់របស់អ្នក..."
                          className="flex-1 rounded-xl border px-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-sans bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-900 dark:text-slate-100"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-xs"
                        >
                          ផ្ញើ
                        </button>
                      </form>

                      {/* Comments list */}
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {currentLessonComments.length > 0 ? (
                          currentLessonComments.map((com) => (
                            <div 
                              key={com.id} 
                              className="p-3.5 rounded-2xl border flex items-start gap-3 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-850"
                            >
                              <img
                                src={com.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                                alt={com.userName}
                                className="w-8 h-8 rounded-full bg-slate-850 shrink-0 object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{com.userName}</h4>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {new Date(com.createdAt).toLocaleDateString('km-KH')}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-sans leading-normal whitespace-pre-line">{com.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-500 text-xs font-sans">
                            មិនទាន់មានការពិភាក្សានៅឡើយទេ។ សូមសរសេរជាសំណួរដំបូងបង្អស់!
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Resources Tab */}
                  {activeInfoTab === 'resources' && (
                    <div className="space-y-3">
                      {selectedLesson.documents && selectedLesson.documents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedLesson.documents.map((doc) => (
                            <div 
                              key={doc.id}
                              className="flex items-center justify-between p-3.5 rounded-2xl border bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-900/40"
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className={`p-2.5 rounded-xl text-white font-bold text-[9px] uppercase shrink-0 ${
                                  doc.fileType === 'PDF' ? 'bg-orange-500' :
                                  doc.fileType === 'Word' ? 'bg-amber-500' :
                                  doc.fileType === 'Slide' ? 'bg-amber-500' : 'bg-gray-500'
                                }`}>
                                  {doc.fileType}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">{doc.title}</p>
                                  {doc.fileSize && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{doc.fileSize}</p>}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => {
                                  onAddDownload(doc, selectedLesson.title);
                                }}
                                className="p-2 rounded-xl border transition-all cursor-pointer border-slate-200 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 shadow-2xs"
                                title="ទាញយកមេរៀន"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-500 text-xs font-sans">
                          មិនទាន់មានឯកសារភ្ជាប់សម្រាប់មេរៀននេះឡើយ។
                        </div>
                      )}
                    </div>
                  )}
                </div>

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
                <p className="text-sm text-slate-400 font-sans">មិនទាន់មានមេរៀនបញ្ចូលឡើយ។</p>
              </div>
            )}
          </div>

          {/* Right Sidebar: Sequential Lesson List and Course Info */}
          <div className="space-y-6">
            {/* Course Thumbnail Card */}
            <div className="p-4 rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="aspect-video w-full rounded-2xl overflow-hidden relative mb-4 bg-slate-950/20">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  referrerPolicy="no-referrer"
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="font-sans font-extrabold text-base leading-snug text-slate-900 dark:text-white">{course.title}</h3>
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
                  <strong className="text-slate-700 dark:text-slate-300 font-mono">{course.lastUpdated || '2026-07-16'}</strong>
                </div>
              </div>
            </div>

            {/* Lessons Sequential Index */}
            <div className="rounded-3xl border overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
                <h4 className="font-sans font-bold text-xs flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>បញ្ជីមេរៀនទាំងអស់ ({lessons.length})</span>
                  <span className="text-[10px] bg-orange-500/15 text-orange-600 dark:text-orange-500 border border-orange-500/20 py-0.5 px-2 rounded-full font-bold font-sans">តាមលំដាប់លំដោយ</span>
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
                        <p className={`text-xs font-bold leading-tight ${isActive ? 'text-orange-600 dark:text-orange-400 font-extrabold' : 'text-slate-800 dark:text-slate-200'}`}>
                          {lesson.title}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 font-mono">
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
                <h4 className="font-sans font-bold text-xs text-slate-500 uppercase tracking-wider">វគ្គសិក្សាពាក់ព័ន្ធគំរូ</h4>
                <div className="space-y-3">
                  {relatedCourses.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectCourse?.(rel)}
                      className="p-3 rounded-2xl border flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs"
                    >
                      <img
                        src={rel.thumbnail}
                        alt={rel.title}
                        className="w-16 h-12 rounded-lg object-cover bg-slate-950/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{rel.title}</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{rel.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
