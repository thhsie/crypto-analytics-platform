import { motion } from 'framer-motion';
import clsx from 'clsx';

interface Props { 
    label: string; 
    value: string | number; 
    prefix?: string; 
    delay?: number; 
    loading?: boolean;
    valueColor?: string;
}

export const MetricCard = ({ label, value, prefix="", delay=0, loading=false, valueColor }: Props) => {
  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-2xl h-[104px] animate-pulse border-surface-200 dark:border-surface-800">
        <div className="h-3 w-1/3 bg-surface-200 dark:bg-surface-800 rounded mb-4"></div>
        <div className="h-8 w-2/3 bg-surface-200 dark:bg-surface-800 rounded"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel p-6 rounded-xl hover:border-brand-500/30 dark:hover:border-brand-400/30 transition-colors group border-surface-200 dark:border-surface-800"
    >
      <p className="text-surface-500 dark:text-surface-400 text-xs font-bold tracking-wider uppercase mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-surface-400 dark:text-surface-500 font-medium text-lg">{prefix}</span>
        <span className={clsx(
            "text-3xl font-bold tabular tracking-tight",
            valueColor ? valueColor : "text-surface-900 dark:text-white"
        )}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
    </motion.div>
  );
};