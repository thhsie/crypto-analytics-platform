import { motion } from 'framer-motion';

interface Props { label: string; value: string | number; prefix?: string; delay?: number }

export const MetricCard = ({ label, value, prefix="", delay=0 }: Props) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass p-6 rounded-2xl border border-slate-200"
  >
    <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">{label}</p>
    <p className="text-3xl font-bold text-slate-800 mt-2">
      {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
    </p>
  </motion.div>
);