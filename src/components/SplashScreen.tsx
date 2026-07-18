import React, { useEffect, useState } from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onDismiss: () => void;
  isLoading: boolean;
}

export default function SplashScreen({ onDismiss, isLoading }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) {
            return prev + Math.floor(Math.random() * 5) + 3;
          }
          return 90;
        });
      }, 120);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const timer = setTimeout(() => {
        onDismiss();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onDismiss]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between py-12 px-6 overflow-hidden">
      {/* Background Decorative Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top section: Skip Button */}
      <div className="w-full flex justify-end relative z-10">
        <button
          onClick={onDismiss}
          className="px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>រំលង (Skip)</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Center section: Logo & App Name */}
      <div className="flex flex-col items-center text-center max-w-sm relative z-10">
        <div className="relative mb-6">
          <div className="absolute -inset-1.5 bg-linear-to-r from-orange-600 to-amber-600 rounded-3xl blur-md opacity-70 animate-pulse" />
          <div className="relative w-20 h-20 bg-linear-to-br from-orange-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/20">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="font-sans font-black text-3xl text-white tracking-wide">
          SABBAY REAN
        </h1>
        <p className="font-sans text-sm font-bold uppercase text-orange-400 mt-1.5 tracking-widest">
          E-Learning Platform
        </p>
        
        <p className="text-xs text-slate-400 mt-4 leading-relaxed font-sans max-w-[280px]">
          វេទិកាសិក្សាជំនាញភាសា និងបច្ចេកវិទ្យាឈានមុខគេក្នុងប្រទេសកម្ពុជា
        </p>
      </div>

      {/* Bottom section: Progress indicator & Version */}
      <div className="w-full max-w-xs flex flex-col items-center gap-4 relative z-10">
        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-900">
          <div 
            className="h-full bg-linear-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between w-full text-[10px] text-slate-500 font-mono">
          <span>ស្វែងរកមេរៀន...</span>
          <span>{progress}%</span>
        </div>

        <div className="text-[10px] text-slate-600 font-sans mt-2">
          v1.0.0 (Khmer Supported)
        </div>
      </div>
    </div>
  );
}
