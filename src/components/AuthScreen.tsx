import React, { useState } from 'react';
import { Shield, Mail, Lock, User, Check, ArrowRight, Chrome } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  isDarkMode: boolean;
}

type AuthMode = 'login' | 'register' | 'forgot';

export default function AuthScreen({ onLoginSuccess, isDarkMode }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      if (!email || !password) {
        setError('សូមបំពេញអ៊ីមែល និងលេខសម្ងាត់របស់អ្នក!');
        return;
      }
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || 'អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!');
          return;
        }
        
        localStorage.setItem('sabbay_user', JSON.stringify(data));
        onLoginSuccess(data);
      } catch (err) {
        setError('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើ!');
      }
    } else if (mode === 'register') {
      if (!name || !email || !password) {
        setError('សូមបំពេញព័ត៌មានទាំងអស់ឲ្យបានត្រឹមត្រូវ!');
        return;
      }
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || 'ការចុះឈ្មោះមិនបានជោគជ័យ!');
          return;
        }
        
        localStorage.setItem('sabbay_user', JSON.stringify(data));
        setSuccess('ចុះឈ្មោះដោយជោគជ័យ! កំពុងចូលប្រព័ន្ធ...');
        setTimeout(() => onLoginSuccess(data), 1000);
      } catch (err) {
        setError('មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើ!');
      }
    } else {
      if (!email) {
        setError('សូមបំពេញអ៊ីមែលរបស់អ្នកដើម្បីសង្គ្រោះគណនី!');
        return;
      }
      setSuccess('តំណសង្គ្រោះលេខសម្ងាត់ត្រូវបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នកហើយ!');
    }
  };

  const handleOAuthLogin = (platform: 'google' | 'facebook') => {
    // Generate mock profile for OAuth platforms, or handle gracefully
    const name = platform === 'google' ? 'សមាជិក Google' : 'សមាជិក Facebook';
    const email = platform === 'google' ? 'google.user@gmail.com' : 'fb.user@facebook.com';
    const avatar = platform === 'google' 
      ? 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
      
    const user: UserProfile = {
      id: `oauth-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      avatarUrl: avatar,
      isAdmin: false
    };
    localStorage.setItem('sabbay_user', JSON.stringify(user));
    onLoginSuccess(user);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background Ornaments */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className={`w-full max-w-md p-8 rounded-3xl border transition-all relative z-10 ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800 shadow-2xl' : 'bg-white border-slate-200/80 shadow-xl'
      }`}>
        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md shadow-orange-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-sans font-black text-2xl tracking-wide">
            {mode === 'login' ? 'ចូលគណនីរបស់អ្នក' : mode === 'register' ? 'ចុះឈ្មោះគណនីថ្មី' : 'សង្គ្រោះលេខសម្ងាត់'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-sans">
            {mode === 'login' ? 'សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីចូលរៀន' : mode === 'register' ? 'ចូលរួមជាមួយសាលារៀន SABBAY REAN' : 'បំពេញអ៊ីមែលដើម្បីទទួលបានតំណភ្ជាប់សង្គ្រោះ'}
          </p>
        </div>

        {/* Display messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-xs font-sans bg-orange-500/10 border border-orange-500/20 text-orange-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl text-xs font-sans bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400">ឈ្មោះពេញរបស់អ្នក</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="សុខ ពិសិដ្ឋ"
                  className={`block w-full rounded-xl border px-10 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">អាសយដ្ឋានអ៊ីមែល</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@masterit.com"
                className={`block w-full rounded-xl border px-10 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-400">លេខសម្ងាត់</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-orange-500 hover:underline font-sans cursor-pointer"
                  >
                    ភ្លេចលេខសម្ងាត់?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full rounded-xl border px-10 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-900/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{mode === 'login' ? 'ចូលគណនី' : mode === 'register' ? 'បង្កើតគណនី និងចុះឈ្មោះ' : 'ផ្ញើការណែនាំសង្គ្រោះ'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>



        {/* OAuth Buttons */}
        {mode === 'login' && (
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="relative flex justify-center text-xs">
              <span className={`px-2 z-10 font-sans text-slate-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>ឬបន្តជាមួយ</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleOAuthLogin('google')}
                className={`py-2.5 px-4 border rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isDarkMode ? 'border-slate-800 hover:bg-slate-800/40 text-slate-200' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Chrome className="w-4 h-4 text-orange-500" />
                <span>Google</span>
              </button>
              <button
                onClick={() => handleOAuthLogin('google')} // We simulate either as clean user profiles
                className={`py-2.5 px-4 border rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isDarkMode ? 'border-slate-800 hover:bg-slate-800/40 text-slate-200' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="w-4 h-4 font-black text-orange-600 text-center text-sm leading-none flex items-center justify-center">f</span>
                <span>Facebook</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Switch Mode */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              មិនទាន់មានគណនីមែនទេ?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-orange-500 font-bold hover:underline cursor-pointer"
              >
                ចុះឈ្មោះឥតគិតថ្លៃ
              </button>
            </p>
          ) : (
            <p>
              មានគណនីរួចហើយមែនទេ?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-orange-500 font-bold hover:underline cursor-pointer"
              >
                ចូលគណនីវិញ
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
