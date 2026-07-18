import React, { useState } from 'react';
import { Plus, Edit, Trash2, ChevronRight, Video, FileText, ListOrdered, X, ArrowLeft } from 'lucide-react';
import { Course, Lesson, Document, CategoryType } from '../../types';
import { CATEGORIES } from '../../data';
import { useToast } from '../../context/ToastContext';

interface CourseManagerProps {
  courses: Course[];
  onCreateCourse: (course: Course) => Promise<any>;
  onUpdateCourse: (id: string, course: Course) => Promise<any>;
  onDeleteCourse: (id: string) => Promise<any>;
  isDarkMode: boolean;
}

export default function CourseManager({
  courses,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  isDarkMode
}: CourseManagerProps) {
  const { toast, confirm } = useToast();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreatingNewCourse, setIsCreatingNewCourse] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'lessons'>('info');

  // Course Form States
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCategory, setCourseCategory] = useState<CategoryType>('computer');
  const [courseThumbnail, setCourseThumbnail] = useState('');
  const [courseLevel, setCourseLevel] = useState<'មូលដ្ឋាន' | 'មធ្យម' | 'កម្រិតខ្ពស់'>('មូលដ្ឋាន');
  const [courseAuthor, setCourseAuthor] = useState('');

  // Lesson Form States
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isCreatingNewLesson, setIsCreatingNewLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonOrder, setLessonOrder] = useState<number>(1);
  const [lessonDocs, setLessonDocs] = useState<Document[]>([]);

  // Document input states
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<'PDF' | 'Word' | 'Slide' | 'Link'>('PDF');
  const [docUrl, setDocUrl] = useState('');

  const PRESET_THUMBNAILS = [
    { label: 'Python/Programming', url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=600' },
    { label: 'Office/Excel', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600' },
    { label: 'AI/Tech', url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=600' },
    { label: 'Graphic/Arts', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600' },
    { label: 'Languages/Ed', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600' }
  ];

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsCreatingNewCourse(false);
    setActiveTab('info');
    
    setCourseTitle(course.title);
    setCourseDesc(course.description);
    setCourseCategory(course.category);
    setCourseThumbnail(course.thumbnail);
    setCourseLevel(course.level);
    setCourseAuthor(course.author);

    setSelectedLesson(null);
    setIsCreatingNewLesson(false);
  };

  const handleTriggerNewCourse = () => {
    setSelectedCourse(null);
    setIsCreatingNewCourse(true);
    setActiveTab('info');

    setCourseTitle('');
    setCourseDesc('');
    setCourseCategory('computer');
    setCourseThumbnail(PRESET_THUMBNAILS[0].url);
    setCourseLevel('មូលដ្ឋាន');
    setCourseAuthor('គ្រូជំនាញ SABBAY REAN');

    setSelectedLesson(null);
    setIsCreatingNewLesson(false);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseDesc.trim()) {
      toast.error('សូមបំពេញចំណងជើង និងការពិពណ៌នាវគ្គសិក្សា!');
      return;
    }

    const payload: Course = selectedCourse
      ? {
          ...selectedCourse,
          title: courseTitle,
          description: courseDesc,
          category: courseCategory,
          thumbnail: courseThumbnail,
          level: courseLevel,
          author: courseAuthor,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      : {
          id: `course-${Date.now()}`,
          title: courseTitle,
          description: courseDesc,
          category: courseCategory,
          thumbnail: courseThumbnail,
          level: courseLevel,
          author: courseAuthor,
          lessons: [],
          studentCount: 0,
          rating: 5.0,
          requirements: ['កុំព្យូទ័រផ្ទាល់ខ្លួនសម្រាប់ការអនុវត្ត', 'ការតាំងចិត្តរៀនសូត្រ'],
          learningOutcomes: ['យល់ច្បាស់ពីមេរៀនគ្រឹះ និងអាចយកទៅប្រើប្រាស់បាន'],
          lastUpdated: new Date().toISOString().split('T')[0]
        };

    try {
      if (selectedCourse) {
        await onUpdateCourse(selectedCourse.id, payload);
        toast.success('បានធ្វើបច្ចុប្បន្នភាពវគ្គសិក្សាដោយជោគជ័យ!');
        setSelectedCourse(payload);
      } else {
        const created = await onCreateCourse(payload);
        toast.success('បានបង្កើតវគ្គសិក្សាថ្មីដោយជោគជ័យ!');
        setIsCreatingNewCourse(false);
        if (created) setSelectedCourse(created);
      }
    } catch (err: any) {
      toast.error(err.message || 'មានបញ្ហាក្នុងការរក្សាទុកវគ្គសិក្សា!');
    }
  };

  const handleDeleteCourseClick = (courseId: string) => {
    confirm({
      title: 'លុបវគ្គសិក្សា?',
      message: 'តើអ្នកប្រាកដជាចង់លុបវគ្គសិក្សានេះមែនទេ? រាល់មេរៀនទាំងអស់នឹងត្រូវលុបជាអចិន្ត្រៃយ៍។',
      onConfirm: async () => {
        try {
          await onDeleteCourse(courseId);
          toast.success('បានលុបវគ្គសិក្សាដោយជោគជ័យ!');
          setSelectedCourse(null);
        } catch (err) {
          toast.error('មិនអាចលុបវគ្គសិក្សានេះបានទេ!');
        }
      }
    });
  };

  // LESSON MANAGEMENT
  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsCreatingNewLesson(false);

    setLessonTitle(lesson.title);
    setLessonDesc(lesson.description);
    setLessonVideoUrl(lesson.videoUrl);
    setLessonDuration(lesson.duration);
    setLessonOrder(lesson.order);
    setLessonDocs(lesson.documents || []);
  };

  const handleTriggerNewLesson = () => {
    setSelectedLesson(null);
    setIsCreatingNewLesson(true);

    const nextOrder = selectedCourse && selectedCourse.lessons 
      ? selectedCourse.lessons.length + 1 
      : 1;

    setLessonTitle('');
    setLessonDesc('');
    setLessonVideoUrl('');
    setLessonDuration('15:00');
    setLessonOrder(nextOrder);
    setLessonDocs([]);
  };

  const handleAddDocument = () => {
    if (!docTitle.trim()) {
      toast.error('សូមបំពេញឈ្មោះឯកសារ!');
      return;
    }
    const newDoc: Document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: docTitle.endsWith('.pdf') || docType !== 'PDF' ? docTitle : `${docTitle}.pdf`,
      fileUrl: docUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: docType,
      fileSize: '1.2 MB'
    };
    setLessonDocs([...lessonDocs, newDoc]);
    setDocTitle('');
    setDocUrl('');
    toast.success('បានភ្ជាប់ឯកសារជំនួយ!');
  };

  const handleRemoveDocument = (docId: string) => {
    setLessonDocs(lessonDocs.filter(d => d.id !== docId));
    toast.info('បានលុបឯកសារភ្ជាប់!');
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    if (!lessonTitle.trim() || !lessonVideoUrl.trim()) {
      toast.error('សូមបំពេញចំណងជើង និងតំណភ្ជាប់វីដេអូ!');
      return;
    }

    const lessonPayload: Lesson = selectedLesson
      ? {
          ...selectedLesson,
          title: lessonTitle,
          description: lessonDesc,
          videoUrl: lessonVideoUrl,
          duration: lessonDuration,
          order: lessonOrder,
          documents: lessonDocs
        }
      : {
          id: `lesson-${Date.now()}`,
          courseId: selectedCourse.id,
          title: lessonTitle,
          description: lessonDesc,
          videoUrl: lessonVideoUrl,
          duration: lessonDuration,
          order: lessonOrder,
          documents: lessonDocs
        };

    let updatedLessons = [...(selectedCourse.lessons || [])];
    if (selectedLesson) {
      updatedLessons = updatedLessons.map(l => l.id === selectedLesson.id ? lessonPayload : l);
    } else {
      updatedLessons.push(lessonPayload);
    }

    updatedLessons.sort((a, b) => a.order - b.order);

    const updatedCourse = {
      ...selectedCourse,
      lessons: updatedLessons
    };

    try {
      await onUpdateCourse(selectedCourse.id, updatedCourse);
      toast.success(selectedLesson ? 'បានកែសម្រួលមេរៀនដោយជោគជ័យ!' : 'បានបន្ថែមមេរៀនថ្មីដោយជោគជ័យ!');
      setSelectedCourse(updatedCourse);
      setSelectedLesson(lessonPayload);
      setIsCreatingNewLesson(false);
    } catch (err) {
      toast.error('មានបញ្ហាក្នុងការរក្សាទុកមេរៀន!');
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!selectedCourse) return;
    confirm({
      title: 'លុបមេរៀន?',
      message: 'តើអ្នកប្រាកដជាចង់លុបមេរៀននេះមែនទេ?',
      onConfirm: async () => {
        const updatedLessons = (selectedCourse.lessons || []).filter(l => l.id !== lessonId);
        const updatedCourse = { ...selectedCourse, lessons: updatedLessons };
        try {
          await onUpdateCourse(selectedCourse.id, updatedCourse);
          toast.success('បានលុបមេរៀនដោយជោគជ័យ!');
          setSelectedCourse(updatedCourse);
          setSelectedLesson(null);
        } catch (err) {
          toast.error('មិនអាចលុបមេរៀនបានទេ!');
        }
      }
    });
  };

  return (
    <div className="font-sans space-y-6">
      {!selectedCourse && !isCreatingNewCourse ? (
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-wider">គ្រប់គ្រងវគ្គសិក្សា</h3>
              <p className="text-[11px] text-slate-400 mt-1">បង្កើត កែសម្រួល ឬលុបវគ្គសិក្សា និងបន្ថែមខ្លឹមសារវីដេអូមេរៀនសម្រាប់សិស្ស។</p>
            </div>
            <button
              onClick={handleTriggerNewCourse}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-950/20"
            >
              <Plus className="w-4 h-4" />
              <span>វគ្គសិក្សាថ្មី</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-950 border-slate-850 hover:border-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>
                  <img src={course.thumbnail} alt={course.title} className="w-full h-32 rounded-xl object-cover bg-slate-800 mb-3" />
                  <span className="text-[9px] font-bold uppercase text-orange-500 bg-orange-500/5 py-0.5 px-2 rounded-full border border-orange-500/10">
                    {course.category.toUpperCase()}
                  </span>
                  <h4 className="text-xs font-black text-slate-100 dark:text-slate-100 mt-2 line-clamp-2 h-8">{course.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{course.lessons?.length || 0} មេរៀន • {course.level}</p>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-850">
                  <button
                    onClick={() => handleSelectCourse(course)}
                    className="flex-1 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/10 hover:border-orange-500/20 text-[11px] font-bold rounded-xl cursor-pointer"
                  >
                    គ្រប់គ្រង
                  </button>
                  <button
                    onClick={() => handleDeleteCourseClick(course.id)}
                    className="p-1.5 text-slate-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors border border-transparent hover:border-orange-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <button
            onClick={() => {
              setSelectedCourse(null);
              setIsCreatingNewCourse(false);
            }}
            className="mb-6 flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ត្រឡប់ទៅបញ្ជីរៀបចំវគ្គសិក្សាវិញ</span>
          </button>

          <div className="flex items-center gap-3 border-b border-slate-850 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2.5 text-xs font-black border-b-2 transition-all ${
                activeTab === 'info' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400'
              }`}
            >
              ព័ត៌មានវគ្គសិក្សា (Info)
            </button>
            {selectedCourse && (
              <button
                onClick={() => setActiveTab('lessons')}
                className={`pb-2.5 text-xs font-black border-b-2 transition-all ${
                  activeTab === 'lessons' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400'
                }`}
              >
                បញ្ជីរៀបចំមេរៀន ({selectedCourse.lessons?.length || 0})
              </button>
            )}
          </div>

          {activeTab === 'info' && (
            <form onSubmit={handleSaveCourse} className="space-y-4 max-w-2xl">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">ចំណងជើងវគ្គសិក្សា</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className={`block w-full rounded-xl border p-2.5 text-xs font-sans ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400">ផ្នែកសិក្សា (Category)</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value as any)}
                    className={`block w-full rounded-xl border p-2.5 text-xs font-sans ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400">កម្រិតសិក្សា (Level)</label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as any)}
                    className={`block w-full rounded-xl border p-2.5 text-xs font-sans ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="មូលដ្ឋាន">មូលដ្ឋាន</option>
                    <option value="មធ្យម">មធ្យម</option>
                    <option value="កម្រិតខ្ពស់">កម្រិតខ្ពស់</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400">សាស្ត្រាចារ្យ/អ្នកបង្រៀន</label>
                  <input
                    type="text"
                    value={courseAuthor}
                    onChange={(e) => setCourseAuthor(e.target.value)}
                    className={`block w-full rounded-xl border p-2.5 text-xs font-sans ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">ការពិពណ៌នាវគ្គសិក្សា</label>
                <textarea
                  rows={4}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className={`block w-full rounded-xl border p-2.5 text-xs font-sans ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">រូបភាពតំណាង (Thumbnail URL)</label>
                <input
                  type="text"
                  value={courseThumbnail}
                  onChange={(e) => setCourseThumbnail(e.target.value)}
                  className={`block w-full rounded-xl border p-2.5 text-xs font-mono ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_THUMBNAILS.map((th, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCourseThumbnail(th.url)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950/40 hover:bg-slate-950 text-[10px] text-slate-300 border border-slate-850 cursor-pointer"
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-orange-950/20"
              >
                រក្សាទុកព័ត៌មានវគ្គសិក្សា
              </button>
            </form>
          )}

          {activeTab === 'lessons' && selectedCourse && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-3 border-r border-slate-850 pr-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-bold text-slate-400">លំដាប់មេរៀន</h4>
                  <button
                    onClick={handleTriggerNewLesson}
                    className="p-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/10 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                  {selectedCourse.lessons?.map((les) => (
                    <button
                      key={les.id}
                      onClick={() => handleSelectLesson(les)}
                      className={`w-full p-2.5 text-left rounded-xl border transition-all text-xs font-sans flex items-center justify-between cursor-pointer ${
                        selectedLesson?.id === les.id
                          ? 'bg-orange-500/10 border-orange-500 text-orange-450'
                          : isDarkMode ? 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-900/40' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">មេរៀន {les.order}៖ {les.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-550 shrink-0" />
                    </button>
                  ))}

                  {(!selectedCourse.lessons || selectedCourse.lessons.length === 0) && (
                    <p className="text-[10px] text-slate-500 text-center py-6">មិនទាន់មានមេរៀននៅឡើយទេ។</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                {isCreatingNewLesson || selectedLesson ? (
                  <form onSubmit={handleSaveLesson} className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-850">
                      {isCreatingNewLesson ? 'បញ្ចូលមេរៀនថ្មី' : `កែប្រែមេរៀនលំដាប់ទី៖ ${selectedLesson?.order}`}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-2">
                        <label className="block text-xs font-bold text-slate-400">ចំណងជើងវីដេអូមេរៀន</label>
                        <input
                          type="text"
                          value={lessonTitle}
                          onChange={(e) => setLessonTitle(e.target.value)}
                          placeholder="ឧ. មេរៀនទី ១៖ ការណែនាំអំពីមូលដ្ឋានគ្រឹះ"
                          className={`block w-full rounded-xl border p-2.5 text-xs font-sans ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-400">តំណភ្ជាប់វីដេអូ YouTube ID ឬ URL</label>
                        <input
                          type="text"
                          value={lessonVideoUrl}
                          onChange={(e) => setLessonVideoUrl(e.target.value)}
                          className={`block w-full rounded-xl border p-2.5 text-xs font-mono ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-400">រយៈពេល (នាទី)</label>
                          <input
                            type="text"
                            value={lessonDuration}
                            onChange={(e) => setLessonDuration(e.target.value)}
                            className={`block w-full rounded-xl border p-2.5 text-xs font-mono text-center ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-400">លំដាប់លំដោយ</label>
                          <input
                            type="number"
                            value={lessonOrder}
                            onChange={(e) => setLessonOrder(Number(e.target.value))}
                            className={`block w-full rounded-xl border p-2.5 text-xs font-mono text-center ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400">ខ្លឹមសារសង្ខេបមេរៀន</label>
                      <textarea
                        rows={3}
                        value={lessonDesc}
                        onChange={(e) => setLessonDesc(e.target.value)}
                        className={`block w-full rounded-xl border p-2.5 text-xs font-sans ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-850 space-y-3">
                      <h5 className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>ភ្ជាប់ឯកសារ PDF / ឯកសារជំនួយ ({lessonDocs.length})</span>
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="ឈ្មោះឯកសារ PDF"
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          className={`rounded-lg border px-3 py-1.5 text-[11px] ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                        <div className="flex gap-2">
                          <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value as any)}
                            className={`rounded-lg border px-2 py-1 text-[11px] ${
                              isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <option value="PDF">PDF</option>
                            <option value="Word">Word</option>
                            <option value="Slide">Slide</option>
                            <option value="Link">Link</option>
                          </select>
                          <button
                            type="button"
                            onClick={handleAddDocument}
                            className="px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            ភ្ជាប់
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                        {lessonDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                            <span className="truncate">{doc.title} ({doc.fileType})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(doc.id)}
                              className="text-orange-400 hover:text-orange-300 cursor-pointer font-bold"
                            >
                              លុប
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-orange-950/20"
                      >
                        {isCreatingNewLesson ? 'បន្ថែមមេរៀន' : 'រក្សាទុកការកែប្រែមេរៀន'}
                      </button>
                      
                      {!isCreatingNewLesson && (
                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(selectedLesson!.id)}
                          className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 font-bold rounded-xl text-xs cursor-pointer border border-orange-500/10"
                        >
                          លុបមេរៀននេះ
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-20 text-xs text-slate-500 font-sans">
                    សូមជ្រើសរើសមេរៀនពីបញ្ជីខាងឆ្វេង ឬចុចសញ្ញាបូកដើម្បីបន្ថែមមេរៀនថ្មី។
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
