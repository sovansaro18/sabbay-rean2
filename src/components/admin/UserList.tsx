import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Trash2, User, Mail, Calendar } from 'lucide-react';
import { UserProfile } from '../../types';
import { useToast } from '../../context/ToastContext';

interface UserListProps {
  users: UserProfile[];
  onUpdateUser: (id: string, userData: Partial<UserProfile>) => Promise<any>;
  onDeleteUser: (id: string) => Promise<any>;
  isDarkMode: boolean;
}

export default function UserList({
  users,
  onUpdateUser,
  onDeleteUser,
  isDarkMode
}: UserListProps) {
  const { toast, confirm } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search term
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  const handleToggleAdmin = (user: UserProfile) => {
    const actionText = user.isAdmin ? 'ដកហូតសិទ្ធិជា Admin?' : 'តែងតាំងជា Admin?';
    const messageText = user.isAdmin
      ? `តើអ្នកប្រាកដជាចង់ដកហូតសិទ្ធិជា Admin ពីគណនី "${user.name}" មែនទេ?`
      : `តើអ្នកប្រាកដជាចង់តែងតាំងគណនី "${user.name}" ឱ្យក្លាយជា Admin មែនទេ?`;

    confirm({
      title: actionText,
      message: messageText,
      onConfirm: async () => {
        try {
          await onUpdateUser(user.id, { isAdmin: !user.isAdmin });
          toast.success('បានផ្លាស់ប្តូរសិទ្ធិគណនីដោយជោគជ័យ!');
        } catch (err) {
          toast.error('ការកែសម្រួលសិទ្ធិបរាជ័យ!');
        }
      },
    });
  };

  const handleDeleteUserClick = (user: UserProfile) => {
    confirm({
      title: 'លុបគណនីសិស្ស?',
      message: `តើអ្នកប្រាកដជាចង់លុបគណនី "${user.name}" មែនទេ? រាល់វឌ្ឍនភាពសិក្សារបស់សិស្សម្នាក់នេះនឹងត្រូវលុបចោលទាំងស្រុង។`,
      onConfirm: async () => {
        try {
          await onDeleteUser(user.id);
          toast.success('បានលុបគណនីសិស្សដោយជោគជ័យ!');
        } catch (err) {
          toast.error('មិនអាចលុបគណនីសិស្សនេះបានទេ!');
        }
      },
    });
  };

  return (
    <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-wider">បញ្ជីឈ្មោះគណនីសិស្សដែលបានចុះឈ្មោះ</h3>
          <p className="text-[11px] text-slate-400 mt-1">គ្រប់គ្រងសិទ្ធិ និងគណនីរបស់អ្នកសិក្សាទាំងអស់ដែលបានចុះឈ្មោះក្នុងប្រព័ន្ធ។</p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះ ឬអុីមែល..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border ${
              isDarkMode ? 'bg-slate-950 border-slate-850 text-slate-100 placeholder-slate-500' : 'bg-slate-50 border-slate-200 placeholder-slate-400'
            }`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="space-y-3.5">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/20 rounded-2xl border border-slate-200/40 dark:border-slate-850 gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover bg-slate-850 border border-slate-800" />
                ) : (
                  <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center font-bold text-xs border border-orange-500/20">
                    <User className="w-5 h-5" />
                  </div>
                )}
                {user.isAdmin && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-[8px] text-white font-extrabold px-1 rounded-md border border-slate-900">
                    ADMIN
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-200 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{user.name}</span>
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{user.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-550" />
                    <span>បានចូលរួម៖ {new Date(user.createdAt || Date.now()).toLocaleDateString('km-KH')}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-850/60 w-full sm:w-auto justify-end">
              {/* Promotion / Demotion admin button */}
              <button
                onClick={() => handleToggleAdmin(user)}
                title={user.isAdmin ? 'ដកហូតសិទ្ធិ Admin' : 'តែងតាំងជា Admin'}
                className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-bold cursor-pointer transition-colors ${
                  user.isAdmin
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/10'
                    : 'bg-slate-950/40 hover:bg-slate-950 text-slate-300 border-slate-850'
                }`}
              >
                {user.isAdmin ? (
                  <>
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span className="sm:hidden">ដកហូតសិទ្ធិ</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="sm:hidden">តែងតាំង</span>
                  </>
                )}
              </button>

              {/* Deletion button */}
              <button
                onClick={() => handleDeleteUserClick(user)}
                className="p-2 bg-slate-950/40 hover:bg-orange-500/10 text-slate-500 hover:text-orange-500 rounded-xl border border-slate-850 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <p className="text-center py-12 text-xs text-slate-500">រកមិនឃើញគណនីសិស្សដែលស្វែងរកឡើយ។</p>
        )}
      </div>
    </div>
  );
}
