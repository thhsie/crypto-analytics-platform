import { useState } from 'react';
import { useAnalytics, useTrackPair, useTrackedPairs } from '../hooks/useAnalytics';
import { MetricCard } from '../components/MetricCard';
import { MainChart } from '../components/MainChart'; // Reuse previous chart logic
import { Plus, Check, RefreshCw, BarChart2 } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export const Dashboard = () => {
    const [coin, setCoin] = useState('bitcoin');
    const [days, setDays] = useState(7);
    
    const { data, isLoading, isRefetching } = useAnalytics(coin, 'usd', days);
    const { data: trackedPairs } = useTrackedPairs();
    const trackMutation = useTrackPair();
    
    const latest = data?.[data.length-1];
    const isTracking = trackedPairs?.some((p: any) => p.coin_id === coin);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BarChart2 className="text-primary-600" /> Market Intelligence
                    </h1>
                    <p className="text-sm text-slate-500">Real-time data streaming</p>
                </div>
                
                <div className="bg-white border border-slate-200 p-1 rounded-lg flex shadow-sm">
                    {[1, 7, 30].map(d => (
                        <button key={d} onClick={() => setDays(d)}
                            className={clsx(
                                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                                days === d ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50"
                            )}>
                            {d}D
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Bar */}
            <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asset</span>
                    <select 
                        value={coin} onChange={(e) => setCoin(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold py-2 pl-3 pr-8 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer hover:border-slate-300"
                    >
                        <option value="bitcoin">Bitcoin (BTC)</option>
                        <option value="ethereum">Ethereum (ETH)</option>
                        <option value="solana">Solana (SOL)</option>
                        <option value="ripple">Ripple (XRP)</option>
                    </select>
                </div>
                
                <div className="flex items-center gap-3">
                   {isRefetching && <RefreshCw size={14} className="animate-spin text-primary-500" />}
                   <button
                        onClick={() => trackMutation.mutate({ coin_id: coin, vs_currency: 'usd' })}
                        disabled={isTracking || trackMutation.isPending}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            isTracking 
                                ? "bg-green-50 text-green-700 border border-green-200 cursor-default" 
                                : "bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20 active:translate-y-0.5"
                        )}
                   >
                       {isTracking ? <><Check size={16} /> Tracked</> : <><Plus size={16} /> Track Asset</>}
                   </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard label="Last Price" value={latest?.price || 0} prefix="$" loading={isLoading} delay={0.1} />
                <MetricCard label="24h Volume" value={latest?.volume || 0} prefix="$" loading={isLoading} delay={0.2} />
                <MetricCard label="Signal" value={isLoading ? "-" : "Neutral"} loading={isLoading} delay={0.3} />
            </div>

            {/* Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass-panel p-6 rounded-xl min-h-[450px] relative"
            >
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
                        Initializing Data Stream...
                    </div>
                ) : data && <MainChart data={data} />}
            </motion.div>
        </div>
    );
};