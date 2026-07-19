import { Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'chinese', label: 'ភាសាចិន (Chinese)', labelEn: 'Chinese', iconName: 'Globe', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30' },
  { id: 'english', label: 'ភាសាអង់គ្លេស (English)', labelEn: 'English', iconName: 'Languages', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
  { id: 'computer', label: 'កុំព្យូទ័រ (Computer)', labelEn: 'Computer', iconName: 'Cpu', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30' },
  { id: 'general', label: 'ការអប់រំទូទៅ (General Ed)', labelEn: 'General Education', iconName: 'BookOpen', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30' }
];
