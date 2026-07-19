import React from 'react';
import { Download, FileText, Trash2, ShieldAlert, FolderOpen, RefreshCw } from 'lucide-react';
import { Document } from '../types';

interface DownloadedItem {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  document: Document;
}

interface DownloadCenterProps {
  downloads: DownloadedItem[];
  onRemoveDownload: (id: string) => void;
  onClearAllDownloads: () => void;
  isDarkMode: boolean;
}

export default function DownloadCenter({ downloads, onRemoveDownload, onClearAllDownloads, isDarkMode }: DownloadCenterProps) {
  const [cachedStatus, setCachedStatus] = React.useState<Record<string, boolean>>({});
  const [openingId, setOpeningId] = React.useState<string | null>(null);

  // Scan cache on mount and when downloads change
  React.useEffect(() => {
    async function checkCachedFiles() {
      if (!('caches' in window)) return;
      try {
        const cache = await caches.open('sabbay-offline-files');
        const status: Record<string, boolean> = {};
        for (const item of downloads) {
          const match = await cache.match(item.document.fileUrl);
          status[item.id] = !!match;
        }
        setCachedStatus(status);
      } catch (e) {
        console.warn('Error checking cache status:', e);
      }
    }
    checkCachedFiles();
  }, [downloads]);

  // Compute total size
  const computeTotalSize = () => {
    let kb = 0;
    downloads.forEach(d => {
      const sizeStr = d.document.fileSize || '0 KB';
      const value = parseFloat(sizeStr);
      if (sizeStr.toUpperCase().includes('MB')) {
        kb += value * 1024;
      } else {
        kb += value;
      }
    });
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
  };

  const handleOpenDocument = async (item: DownloadedItem) => {
    setOpeningId(item.id);
    const fileUrl = item.document.fileUrl;

    if ('caches' in window) {
      try {
        const cache = await caches.open('sabbay-offline-files');
        let cachedResponse = await cache.match(fileUrl);

        // Try on-demand caching if not cached yet
        if (!cachedResponse) {
          try {
            const response = await fetch(fileUrl, { mode: 'cors' });
            if (response.ok) {
              await cache.put(fileUrl, response.clone());
              cachedResponse = response;
              setCachedStatus(prev => ({ ...prev, [item.id]: true }));
            }
          } catch (fetchErr) {
            console.warn('On-demand caching fetch failed:', fetchErr);
          }
        }

        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          const localUrl = URL.createObjectURL(blob);
          const newWindow = window.open(localUrl, '_blank');
          if (!newWindow) {
            window.location.href = localUrl;
          }
          setOpeningId(null);
          return;
        }
      } catch (err) {
        console.warn('Cache API fetch or open error:', err);
      }
    }

    // Fallback direct open
    const newWindow = window.open(fileUrl, '_blank');
    if (!newWindow) {
      window.location.href = fileUrl;
    }
    setOpeningId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Intro Header */}
      <div className={`p-6 rounded-3xl border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div>
          <span className="bg-orange-500/10 text-orange-500 dark:text-orange-400 font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
            មជ្ឈមណ្ឌលផ្ទុកឯកសារ
          </span>
          <h1 className="font-sans font-black text-2xl mt-2">ឯកសារមេរៀនដែលបានទាញយក</h1>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-xl">
            ទីនេះផ្ទុកទៅដោយ សៀវភៅ ឯកសារ PDF លំហាត់អនុវត្ត និងស្លាយមេរៀនដែលអ្នកបានទាញយក។ អ្នកអាចមើល និងបើកសិក្សាឡើងវិញបាន ទោះបីជាគ្មានអ៊ីនធឺណិតក៏ដោយ។
          </p>
        </div>
        
        {downloads.length > 0 && (
          <button
            onClick={onClearAllDownloads}
            className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 dark:text-orange-400 border border-orange-500/20 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>សម្អាតទាំងអស់</span>
          </button>
        )}
      </div>

      {/* Storage Indicator */}
      {downloads.length > 0 && (
        <div className={`p-4 rounded-2xl border mb-6 flex items-center justify-between ${
          isDarkMode ? 'bg-slate-900/30 border-slate-850' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">ទំហំផ្ទុកឯកសារក្រៅបណ្តាញ</p>
              <p className="text-[10px] text-slate-400">ទំហំសរុបដែលបានប្រើប្រាស់ក្នុងទូរស័ព្ទ/កុំព្យូទ័រ</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-mono font-black text-orange-500">{computeTotalSize()}</p>
            <p className="text-[9px] text-emerald-500 font-bold">● អាចបើកក្រៅបណ្តាញបាន</p>
          </div>
        </div>
      )}

      {/* Main List */}
      {downloads.length > 0 ? (
        <div className="space-y-4">
          {downloads.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:scale-[1.01] ${
                isDarkMode ? 'bg-slate-900 border-slate-800/80 hover:border-orange-500/30' : 'bg-white border-slate-200 hover:border-orange-500/30 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-3 rounded-xl text-white font-bold text-xs uppercase shrink-0 ${
                  item.document.fileType === 'PDF' ? 'bg-orange-500' :
                  item.document.fileType === 'Word' ? 'bg-amber-500' :
                  item.document.fileType === 'Slide' ? 'bg-amber-500' : 'bg-teal-500'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate" title={item.document.title}>
                    {item.document.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-orange-500">{item.courseTitle}</span>
                    <span className="text-slate-600 dark:text-slate-700">•</span>
                    <span>{item.lessonTitle}</span>
                    <span className="text-slate-600 dark:text-slate-700">•</span>
                    <span className="font-mono mr-1">{item.document.fileSize || '1.0 MB'}</span>
                    <span className="text-slate-600 dark:text-slate-700">•</span>
                    {cachedStatus[item.id] ? (
                      <span className="text-emerald-500 font-bold">● ក្រៅបណ្តាញ (Cached Offline)</span>
                    ) : (
                      <span className="text-amber-500 font-bold">● មើលផ្ទាល់ (Online)</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  disabled={openingId === item.id}
                  onClick={() => handleOpenDocument(item)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/60 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {openingId === item.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FolderOpen className="w-3.5 h-3.5" />
                  )}
                  <span>បើកមើលឯកសារ</span>
                </button>
                
                <button
                  onClick={() => onRemoveDownload(item.id)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-orange-400' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-orange-500'
                  }`}
                  title="លុបឯកសារចេញ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-16 rounded-3xl border border-dashed ${
          isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="font-sans font-bold text-slate-300">មិនទាន់មានឯកសារទាញយកទេ</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
            នៅពេលអ្នកកំពុងទស្សនាវីដេអូមេរៀននីមួយៗ អ្នកអាចទាញយកឯកសារភ្ជាប់បានដោយការចុចប៊ូតុងទាញយក។ ឯកសារដែលបានទាញយកទាំងអស់នឹងបង្ហាញនៅទីនេះ។
          </p>
        </div>
      )}
    </div>
  );
}
