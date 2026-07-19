import React from 'react';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Download,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Course, Lesson, Document, Comment } from '../types';

interface LessonTabsProps {
  course: Course;
  selectedLesson: Lesson;
  activeInfoTab: 'details' | 'notes' | 'comments' | 'resources';
  setActiveInfoTab: (tab: 'details' | 'notes' | 'comments' | 'resources') => void;
  currentNoteText: string;
  setCurrentNoteText: (text: string) => void;
  handleSaveNote: () => void;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  handleAddComment: (e: React.FormEvent) => void;
  currentLessonComments: Comment[];
  currentUser: any;
  handleDeleteComment: (commentId: string) => void;
  onAddDownload: (doc: Document, lessonTitle: string) => void;
}

export default function LessonTabs({
  course,
  selectedLesson,
  activeInfoTab,
  setActiveInfoTab,
  currentNoteText,
  setCurrentNoteText,
  handleSaveNote,
  newCommentText,
  setNewCommentText,
  handleAddComment,
  currentLessonComments,
  currentUser,
  handleDeleteComment,
  onAddDownload,
}: LessonTabsProps) {
  return (
    <div className="font-sans">
      {/* Sub-Tabs Reorganized into a Neat Grid with Icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-100/80 dark:bg-slate-950/40 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
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
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
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
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">តម្រូវការសិក្សា៖</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                {course.requirements?.map((req, i) => (
                  <li key={i}>{req}</li>
                )) || <li>មានកុំព្យូទ័រ ឬទូរស័ព្ទដៃដែលភ្ជាប់អ៊ីនធឺណិត។</li>}
              </ul>
            </div>

            <div className="pt-2 space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">លទ្ធផលដែលទទួលបាន៖</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                {course.learningOutcomes?.map((out, i) => (
                  <li key={i}>{out}</li>
                )) || <li>យល់ដឹងពីក្បួនគ្រឹះជាក់ស្តែង និងអាចអនុវត្តការងារបាន។</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeInfoTab === 'notes' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                កំណត់ត្រាផ្ទាល់ខ្លួនរបស់អ្នក (Notes)
              </label>
              <textarea
                rows={4}
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                placeholder="សរសេរចំណាំ ឬគន្លឹះសំខាន់ៗដែលទទួលបានពីវីដេអូមេរៀននេះ..."
                className="block w-full rounded-xl border p-3.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-900 dark:text-slate-100"
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
                className="flex-1 rounded-xl border px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-900 dark:text-slate-100"
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
                      src={
                        com.userAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                      }
                      alt={com.userName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full bg-slate-800 shrink-0 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                          {com.userName}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(com.createdAt).toLocaleDateString('km-KH')}
                          </span>
                          {(currentUser?.isAdmin || currentUser?.name === com.userName) && (
                            <button
                              onClick={() => handleDeleteComment(com.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                              title="លុបមតិយោបល់"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-sans leading-normal whitespace-pre-line">
                        {com.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
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
                      <div
                        className={`p-2.5 rounded-xl text-white font-bold text-[9px] uppercase shrink-0 ${
                          doc.fileType === 'PDF'
                            ? 'bg-orange-500'
                            : doc.fileType === 'Word'
                            ? 'bg-amber-500'
                            : doc.fileType === 'Slide'
                            ? 'bg-amber-500'
                            : 'bg-gray-500'
                        }`}
                      >
                        {doc.fileType}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                          {doc.title}
                        </p>
                        {doc.fileSize && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {doc.fileSize}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onAddDownload(doc, selectedLesson.title);
                      }}
                      className="p-2 rounded-xl border transition-all cursor-pointer border-slate-200 dark:border-slate-850 hover:bg-slate-100/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 shadow-2xs"
                      title="ទាញយកមេរៀន"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                មិនទាន់មានឯកសារភ្ជាប់សម្រាប់មេរៀននេះឡើយ។
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
