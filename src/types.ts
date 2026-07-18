export type CategoryType = 
  | 'chinese' 
  | 'english' 
  | 'computer' 
  | 'general';

export interface Category {
  id: CategoryType;
  label: string; // Khmer label
  labelEn: string; // English label
  iconName: string; // Lucide icon name
  color: string; // CSS color classes
}

export interface Document {
  id: string;
  title: string;
  fileUrl: string;
  fileType: 'PDF' | 'Word' | 'Slide' | 'Link';
  fileSize?: string;
  downloadedAt?: string; // If downloaded locally in client
}

export interface Comment {
  id: string;
  courseId: string;
  lessonId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube video URL or ID
  duration: string;
  order: number;
  documents: Document[];
  notes?: string;
  resources?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  thumbnail: string;
  level: 'មូលដ្ឋាន' | 'មធ្យម' | 'កម្រិតខ្ពស់'; // Beginner, Intermediate, Advanced in Khmer
  author: string;
  lessons: Lesson[];
  studentCount?: number;
  rating?: number;
  requirements?: string[];
  learningOutcomes?: string[];
  lastUpdated?: string;
}

export interface Favorite {
  courseId: string;
  lessonId: string;
  savedAt: string;
}

export interface LessonProgress {
  courseId: string;
  lessonId: string;
  completed: boolean;
  lastWatchedPosition: number; // in seconds
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'system' | 'new_course' | 'maintenance';
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'announcement' | 'new_course' | 'system';
}

export interface AppSettings {
  darkMode: boolean;
  language: 'kh' | 'en';
  notificationEnabled: boolean;
  playbackSpeedDefault: number;
  videoQuality: 'auto' | '1080p' | '720p' | '480p';
}
