import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDestructive = false }: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-surface-950/40 backdrop-blur-sm dark:bg-black/60"
          />
          
          {/* Dialog */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="pointer-events-auto w-full max-w-md bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white">{title}</h3>
                </div>
                <button onClick={onClose} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <p className="mt-4 text-surface-500 dark:text-surface-400 leading-relaxed text-sm">
                {message}
              </p>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-bold text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onConfirm(); onClose(); }}
                  className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm ${
                    isDestructive 
                      ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' 
                      : 'bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};