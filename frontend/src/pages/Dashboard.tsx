import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMockAnalytics } from '../mocks/analytics';
import { MetricCard } from '../components/MetricCard';
import { MainChart } from '../components/MainChart';
import { motion } from 'framer-motion';
import { LineChart, Calendar } from 'lucide-react';

export const Dashboard = () => {
  const [coin, setCoin] = useState('bitcoin');
  const [days, setDays] = useState(7);
  const { data, isLoading } = useQuery({ queryKey: ['mock', coin, days], queryFn: () => fetchMockAnalytics(coin, days) });

  const latest = data?.[data.length-1];

  return (
    <div className="min-h-screen bg-surface-50 p-8 font-sans text-slate-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center glass p-6 rounded-3xl gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 p-2 rounded-xl text-white"><LineChart size={24} /></div>
            <h1 className="text-2xl font-bold tracking-tight">Market<span className="text-brand-600">Flow</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <select value={coin} onChange={e => setCoin(e.target.value)} className="bg-surface-100 border-none rounded-xl py-2 px-4 font-semibold focus:ring-2 focus:ring-brand-500 cursor-pointer hover:bg-surface-200 transition">
                <option value="bitcoin">Bitcoin (USD)</option>
                <option value="ethereum">Ethereum (USD)</option>
            </select>
            <div className="flex bg-surface-100 rounded-xl p-1 gap-1">
                {[1, 7, 30].map(d => (
                    <button key={d} onClick={() => setDays(d)} className={`px-4 py-1.5 text-sm rounded-lg transition-all font-medium ${days===d ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}>{d}D</button>
                ))}
            </div>
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard label="Current Price" value={latest?.price || 0} prefix="$" delay={0.1} />
          <MetricCard label="24h Volume" value={latest?.volume || 0} prefix="$" delay={0.2} />
          <MetricCard label="System Status" value="Mock Data" delay={0.3} />
        </div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass p-8 rounded-3xl relative min-h-[500px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">Loading Market Data...</div>
          ) : data && <MainChart data={data} />}
        </motion.div>

      </motion.div>
    </div>
  );
};