import { motion } from 'framer-motion';

interface Props { label: string; value: string | number; prefix?: string; delay?: number; loading?: boolean }

export const MetricCard = ({ label, value, prefix="", delay=0, loading=false }: Props) => {
  if (loading) {
    return (
      <div className="glass p-6 rounded-2xl border border-white/40 h-[104px] animate-pulse">
        <div className="h-3 w-1/3 bg-slate-200 rounded mb-4"></div>
        <div className="h-8 w-2/3 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-shadow"
    >
      <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-slate-400 font-medium text-lg">{prefix}</span>
        <span className="text-3xl font-bold text-slate-800 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
    </motion.div>
  );
};