import React, { useState } from 'react';
import { Course, Category } from '../../types';
import { useCategories } from '../../hooks/useCourses';
import { Plus, Trash2, Edit2, Check, X, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CategoryManagerProps {
  courses: Course[];
  isDarkMode: boolean;
}

const COLOR_PRESETS = [
  { value: 'bg-orange-500/10 text-orange-600 border-orange-500/20', label: 'ពណ៌ទឹកក្រូច' },
  { value: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'ពណ៌ក្រហម' },
  { value: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'ពណ៌ខៀវ' },
  { value: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', label: 'ពណ៌បៃតង' },
  { value: 'bg-purple-500/10 text-purple-600 border-purple-500/20', label: 'ពណ៌ស្វាយ' },
  { value: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'ពណ៌លឿងទុំ' },
];

export default function CategoryManager({ courses, isDarkMode }: CategoryManagerProps) {
  const { categories, createCategory, updateCategory, deleteCategory, isCategoriesLoading } = useCategories();
  const { toast, confirm } = useToast();

  // Create form states
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newLabelEn, setNewLabelEn] = useState('');
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0].value);
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editLabelEn, setEditLabelEn] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newLabel || !newLabelEn) {
      toast.error('សូមបំពេញព័ត៌មានអោយបានគ្រប់គ្រាន់!');
      return;
    }

    const cleanId = newId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanId) {
      toast.error('អត្តសញ្ញាណ (ID) ត្រូវតែជាអក្សរឡាតាំងតូចៗ!');
      return;
    }

    try {
      await createCategory({
        id: cleanId,
        label: newLabel.trim(),
        labelEn: newLabelEn.trim(),
        color: newColor,
      });
      toast.success('បានបង្កើតប្រភេទវគ្គសិក្សាថ្មីដោយជោគជ័យ!');
      setNewId('');
      setNewLabel('');
      setNewLabelEn('');
      setNewColor(COLOR_PRESETS[0].value);
      setShowAddForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'មានបញ្ហាក្នុងការបង្កើតប្រភេទ!');
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditLabelEn(cat.labelEn);
    setEditColor(cat.color);
  };

  const handleSaveEdit = async (catId: string) => {
    if (!editLabel || !editLabelEn) {
      toast.error('សូមបំពេញឈ្មោះប្រភេទ!');
      return;
    }

    try {
      await updateCategory({
        id: catId,
        categoryData: {
          label: editLabel.trim(),
          labelEn: editLabelEn.trim(),
          color: editColor,
        },
      });
      toast.success('បានកែសម្រួលប្រភេទដោយជោគជ័យ!');
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'មានបញ្ហាក្នុងការកែសម្រួល!');
    }
  };

  const handleDelete = (catId: string) => {
    const courseCount = courses.filter((c) => c.category === catId).length;
    if (courseCount > 0) {
      toast.error(`មិនអាចលុបប្រភេទនេះបានទេ ព្រោះមានវគ្គសិក្សាចំនួន ${courseCount} កំពុងប្រើប្រាស់វា!`);
      return;
    }
    confirm({
      title: 'លុបប្រភេទវគ្គសិក្សា?',
      message: 'តើអ្នកពិតជាចង់លុបប្រភេទវគ្គសិក្សានេះមែនទេ?',
      onConfirm: async () => {
        try {
          await deleteCategory(catId);
          toast.success('បានលុបប្រភេទវគ្គសិក្សាដោយជោគជ័យ!');
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'មានបញ្ហាក្នុងការលុបប្រភេទ!');
        }
      }
    });
  };

  return (
    <div className={`p-6 rounded-3xl border font-sans ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-wider mb-2">
            គ្រប់គ្រងប្រភេទនៃការអប់រំ (Category Manager)
          </h3>
          <p className="text-slate-400 text-xs">
            ផ្នែកសិក្សានិមួយៗត្រូវបានកែសម្រួលដើម្បីរៀបចំវគ្គសិក្សាកាន់តែមានសណ្តាប់ធ្នាប់។
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'បិទផ្ទាំង' : 'បន្ថែមប្រភេទថ្មី'}</span>
        </button>
      </div>

      {/* Add New Category Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 space-y-4 animate-fade-in text-xs">
          <h4 className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>បញ្ចូលប្រភេទសិក្សាថ្មី</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-500">ID ប្រភេទ (ឡាតាំងតូច ឧ៖ code)</label>
              <input
                type="text"
                required
                placeholder="ឧ៖ physics"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                className="w-full rounded-xl border p-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-500">ឈ្មោះជាភាសាខ្មែរ</label>
              <input
                type="text"
                required
                placeholder="ឧ៖ រូបវិទ្យាថ្នាក់ទី១២"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full rounded-xl border p-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-500">ឈ្មោះជាភាសាអង់គ្លេស</label>
              <input
                type="text"
                required
                placeholder="ឧ៖ Physics Grade 12"
                value={newLabelEn}
                onChange={(e) => setNewLabelEn(e.target.value)}
                className="w-full rounded-xl border p-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-500">ស្ទីលពណ៌បង្ហាញ (Color preset)</label>
              <select
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full rounded-xl border p-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500 font-mono"
              >
                {COLOR_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                រក្សាទុកប្រភេទថ្មី
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {isCategoriesLoading ? (
          <div className="text-center py-6">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] text-slate-500 mt-2">កំពុងទាញយកប្រភេទ...</p>
          </div>
        ) : categories.length > 0 ? (
          categories.map((cat) => {
            const courseCount = courses.filter((c) => c.category === cat.id).length;
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/65 dark:border-slate-850 gap-4"
              >
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 text-xs">
                    <input
                      type="text"
                      placeholder="ខ្មែរ"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="rounded-lg border p-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="English"
                      value={editLabelEn}
                      onChange={(e) => setEditLabelEn(e.target.value)}
                      className="rounded-lg border p-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800"
                    />
                    <select
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="rounded-lg border p-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 font-mono text-[10px]"
                    >
                      {COLOR_PRESETS.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`px-2.5 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider shrink-0 ${cat.color}`}>
                      {cat.id}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                        {cat.label}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        English: {cat.labelEn}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-orange-500 bg-orange-500/5 px-2.5 py-1 rounded-full border border-orange-500/10">
                    {courseCount} វគ្គសិក្សា
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-xl transition-colors cursor-pointer border-none"
                        title="រក្សាទុក"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl transition-colors cursor-pointer border-none"
                        title="បោះបង់"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 bg-slate-150 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition-colors cursor-pointer border-none"
                        title="កែសម្រួល"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 rounded-xl transition-colors cursor-pointer border-none"
                        title="លុប"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            មិនទាន់មានប្រភេទវគ្គសិក្សាបញ្ចូលឡើយ។
          </div>
        )}
      </div>
    </div>
  );
}
