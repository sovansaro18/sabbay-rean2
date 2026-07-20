import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X, HelpCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
  confirm: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);

  const addToast = (type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
  };

  const confirm = (options: ConfirmOptions) => {
    setConfirmOptions(options);
  };

  const handleConfirm = () => {
    if (confirmOptions) {
      confirmOptions.onConfirm();
      setConfirmOptions(null);
    }
  };

  const handleCancel = () => {
    if (confirmOptions) {
      if (confirmOptions.onCancel) {
        confirmOptions.onCancel();
      }
      setConfirmOptions(null);
    }
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Render Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border bg-slate-900 border-slate-800 text-slate-100"
            >
              {t.type === 'success' && (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              )}
              {t.type === 'error' && (
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              )}
              {t.type === 'info' && (
                <Info className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 text-xs font-sans font-medium leading-relaxed">
                {t.message}
              </div>

              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmOptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans font-black text-slate-100 text-lg leading-snug">
                    {confirmOptions.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-sans leading-relaxed">
                    {confirmOptions.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-sans font-semibold text-slate-300 transition-all cursor-pointer"
                >
                  {confirmOptions.cancelLabel || 'បោះបង់'}
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-sans font-bold text-white transition-all shadow-md shadow-orange-950/30 cursor-pointer"
                >
                  {confirmOptions.confirmLabel || 'យល់ព្រម'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
