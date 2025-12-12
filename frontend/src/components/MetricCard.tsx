import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import clsx from 'clsx';
import { formatCurrency, formatCompact } from '../utils/format';

interface Props { 
    label: string; 
    value: string | number; 
    prefix?: string; 
    delay?: number; 
    loading?: boolean;
    valueColor?: string;
    tooltip?: string;
    type?: 'currency' | 'compact' | 'text';
}

export const MetricCard = ({ 
  label, 
  value, 
  prefix="", 
  delay=0, 
  loading=false, 
  valueColor,
  tooltip,
  type = 'text'
}: Props) => {
  
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isTooltipVisible) return;

    const handleScroll = () => setTooltipVisible(false);
    
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isTooltipVisible]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
        top: rect.top - 12, 
        left: rect.left + (rect.width / 2) 
    });
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  let displayValue = value;
  if (typeof value === 'number') {
     if (type === 'currency') displayValue = formatCurrency(value);
     if (type === 'compact') displayValue = formatCompact(value);
  }

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
      className="glass-panel p-6 rounded-xl hover:border-brand-500/30 transition-all duration-200 group border-surface-200 dark:border-surface-800"
    >
      <div className="flex items-center gap-2 mb-1">
        <p className="text-surface-500 dark:text-surface-400 text-xs font-bold tracking-wider uppercase group-hover:text-brand-400 transition-colors">
          {label}
        </p>
        
        {tooltip && (
          <>
            <Info 
                size={12} 
                className="text-surface-600 cursor-help hover:text-brand-400 transition-colors"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />
            
            {isTooltipVisible && createPortal(
                <div 
                    className="fixed z-[9999] pointer-events-none"
                    style={{ 
                        top: tooltipPos.top, 
                        left: tooltipPos.left,
                        transform: 'translate(-50%, -100%)',
                        width: 'max-content',
                        maxWidth: '250px'
                    }}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-surface-950/70 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-3 text-left relative"
                    >
                        <div className="text-[10px] leading-relaxed text-surface-200 font-medium whitespace-pre-wrap">
                            {tooltip}
                        </div>
                        
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] w-3 h-3 bg-surface-950/70 border-r border-b border-white/10 transform rotate-45 backdrop-blur-md"></div>
                    </motion.div>
                </div>,
                document.body
            )}
          </>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-surface-400 dark:text-surface-500 font-medium text-lg">{prefix}</span>
        <span className={clsx(
            "text-3xl font-bold tabular tracking-tight truncate",
            valueColor ? valueColor : "text-surface-900 dark:text-white"
        )}>
          {displayValue}
        </span>
      </div>
    </motion.div>
  );
};