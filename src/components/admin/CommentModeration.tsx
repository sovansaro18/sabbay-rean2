import React from 'react';
import { Trash2, MessageSquare, Calendar } from 'lucide-react';
import { Comment, Course } from '../../types';
import { useToast } from '../../context/ToastContext';

interface CommentModerationProps {
  comments: Comment[];
  courses: Course[];
  onDeleteComment: (id: string) => Promise<any>;
  isDarkMode: boolean;
}

export default function CommentModeration({
  comments,
  courses,
  onDeleteComment,
  isDarkMode
}: CommentModerationProps) {
  const { toast, confirm } = useToast();

  const handleDeleteClick = (id: string) => {
    confirm({
      title: 'លុបមតិយោបល់?',
      message: 'តើអ្នកពិតជាចង់លុបមតិយោបល់នេះមែនទេ?',
      onConfirm: async () => {
        try {
          await onDeleteComment(id);
          toast.success('បានលុបមតិយោបល់ដោយជោគជ័យ!');
        } catch (err) {
          toast.error('មិនអាចលុបមតិយោបល់នេះបានទេ!');
        }
      }
    });
  };

  return (
    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-4 h-4 text-orange-500" />
        <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-wider">គ្រប់គ្រង និងសម្របសម្រួលមតិយោបល់សិក្សារបស់សិស្ស</h3>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {comments.map((com) => {
          const relativeCourse = courses.find(c => c.id === com.courseId);
          return (
            <div key={com.id} className="p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-slate-950/10 flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <img src={com.userAvatar} alt={com.userName} className="w-8 h-8 rounded-full bg-slate-850 border border-slate-800 shrink-0 object-cover" />
                <div>
                  <div className="flex flex-wrap items-center gap-x-2">
                    <h4 className="text-xs font-bold text-slate-200 dark:text-slate-100">{com.userName}</h4>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-600" />
                      <span>{new Date(com.createdAt).toLocaleDateString('km-KH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 font-sans leading-relaxed">{com.content}</p>
                  
                  {relativeCourse && (
                    <div className="mt-2 text-[9px] font-sans font-bold text-orange-500 bg-orange-500/5 border border-orange-500/10 py-0.5 px-2.5 rounded-lg w-fit">
                      វគ្គសិក្សា៖ {relativeCourse.title}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDeleteClick(com.id)}
                className="p-2 bg-slate-950/60 hover:bg-orange-500/10 text-slate-500 hover:text-orange-500 rounded-xl border border-slate-850 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {comments.length === 0 && (
          <p className="text-center py-12 text-xs text-slate-500 font-sans">មិនទាន់មានមតិយោបល់ណាមួយឡើយ។</p>
        )}
      </div>
    </div>
  );
}
