import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useAnalytics, useTrackPair, useTrackedPairs } from '../hooks/useAnalytics';
import { MetricCard } from '../components/MetricCard';
import { MainChart } from '../components/MainChart';
import { motion } from 'framer-motion';
import { Check, Plus, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [coin, setCoin] = useState('bitcoin');
    const [days, setDays] = useState(7);
    
    useEffect(() => {
        // Simple auth check redirection
        const unsub = auth.onAuthStateChanged(u => !u && navigate('/login'));
        return () => unsub();
    }, [navigate]);

    const { data, isLoading, isRefetching } = useAnalytics(coin, 'usd', days);
    const { data: trackedPairs } = useTrackedPairs();
    const trackMutation = useTrackPair();
    
    const latest = data?.[data.length-1];
    const isTracking = trackedPairs?.some((p: any) => p.coin_id === coin);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Bar: Title & Global Context */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Market Overview</h1>
                    <p className="text-slate-500 mt-1">Real-time insights and portfolio tracking</p>
                </div>
                
                {/* Time Range Selector */}
                <div className="bg-white/60 backdrop-blur-md p-1 rounded-xl border border-white/50 flex shadow-sm">
                    {[1, 7, 30, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={clsx(
                                "px-4 py-1.5 text-sm font-semibold rounded-lg transition-all",
                                days === d 
                                    ? "bg-white text-brand-600 shadow-md transform scale-105" 
                                    : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                            )}
                        >
                            {d}D
                        </button>
                    ))}
                </div>
            </div>

            {/* Controls & Tracking Bar */}
            <div className="glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold text-slate-500">Asset:</label>
                    <div className="relative">
                        <select 
                            value={coin} 
                            onChange={(e) => setCoin(e.target.value)} 
                            className="appearance-none bg-surface-100 border border-slate-200 text-slate-900 font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 hover:bg-surface-200 transition-colors cursor-pointer"
                        >
                            <option value="bitcoin">Bitcoin (BTC)</option>
                            <option value="ethereum">Ethereum (ETH)</option>
                            <option value="solana">Solana (SOL)</option>
                            <option value="ripple">XRP</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isRefetching && <RefreshCw size={18} className="text-brand-500 animate-spin mr-2" />}
                    
                    <button
                        onClick={() => trackMutation.mutate({ coin_id: coin, vs_currency: 'usd' })}
                        disabled={isTracking || trackMutation.isPending}
                        className={clsx(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/10",
                            isTracking 
                                ? "bg-green-100 text-green-700 border border-green-200 cursor-default" 
                                : "bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand-500/25 active:scale-95"
                        )}
                    >
                        {isTracking ? (
                            <> <Check size={18} /> Tracking Active </>
                        ) : (
                            <> <Plus size={18} /> {trackMutation.isPending ? 'Saving...' : 'Track Asset'} </>
                        )}
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                    label="Current Price" 
                    value={latest?.price || 0} 
                    prefix="$" 
                    loading={isLoading}
                    delay={0.1} 
                />
                <MetricCard 
                    label="24h Volume" 
                    value={latest?.volume || 0} 
                    prefix="$" 
                    loading={isLoading}
                    delay={0.2} 
                />
                <MetricCard 
                    label="24h High (Est)" 
                    value={data ? Math.max(...data.map(d => d.price)).toFixed(0) : 0} 
                    prefix="$"
                    loading={isLoading}
                    delay={0.3} 
                />
            </div>

            {/* Main Chart Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass p-8 rounded-3xl min-h-[500px] border border-white/60 relative"
            >
                <div className="absolute top-8 right-8 z-10 flex gap-2">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                    </span>
                    <span className="text-xs font-medium text-brand-700">Live API</span>
                </div>

                {isLoading ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
                        <p>Syncing market data...</p>
                     </div>
                ) : (
                    data && <MainChart data={data} />
                )}
            </motion.div>
        </div>
    );
};