import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useAnalytics, useTrackPair, useTrackedPairs } from '../hooks/useAnalytics';
import { MetricCard } from '../components/MetricCard';
import { MainChart } from '../components/MainChart';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AssetSelect } from '../components/AssetSelect';
import { Plus, Check, RefreshCw, BarChart2 } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [coin, setCoin] = useState('bitcoin');
    const [days, setDays] = useState(7);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const { showToast } = useToast();
    
    // Auth Guard
    useEffect(() => {
        const unsub = auth.onAuthStateChanged(u => !u && navigate('/login'));
        return () => unsub();
    }, [navigate]);

    const { data, isLoading, isRefetching } = useAnalytics(coin, 'usd', days);
    const { data: trackedPairs } = useTrackedPairs();
    const trackMutation = useTrackPair();
    
    const latest = data?.[data.length-1];
    const isTracking = trackedPairs?.some((p: any) => p.coin_id === coin);

    // --- LOGIC: Calculate Signal based on Simple Moving Average (SMA) ---
    const marketSignal = useMemo(() => {
        if (!data || data.length === 0) return { text: "-", color: "" };

        const currentPrice = data[data.length - 1].price;
        
        // Calculate SMA (Average of visible data points)
        const sum = data.reduce((acc, curr) => acc + curr.price, 0);
        const average = sum / data.length;
        
        // Calculate difference percentage
        const diffPercent = ((currentPrice - average) / average) * 100;

        // Determine Signal
        if (diffPercent > 5) return { text: "Strong Buy", color: "text-emerald-500" };
        if (diffPercent > 0) return { text: "Buy", color: "text-emerald-400" };
        if (diffPercent < -5) return { text: "Strong Sell", color: "text-red-500" };
        if (diffPercent < 0) return { text: "Sell", color: "text-red-400" };
        
        return { text: "Neutral", color: "text-surface-400" };
    }, [data]);

    const signalTooltip = `ALGORITHM: Simple Moving Average (SMA)

We calculate the average price over the selected timeframe (e.g. 7 Days) and compare it to the current price.

    • Strong Buy: Price is > 5% above average
    • Buy: Price is > 0% above average
    • Sell: Price is below average
    • Strong Sell: Price is > 5% below average

This identifies if the asset is overbought or oversold relative to its recent baseline.`;
    // ------------------------------------------------------------------

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                        <BarChart2 className="text-brand-500" /> 
                        Market Information
                    </h1>
                    <p className="text-sm text-surface-400 mt-1 font-medium pl-1">
                        Live market data updates
                    </p>
                </div>
                
                {/* Time Range Selector */}
                <div className="bg-surface-900/50 border border-white/5 p-1 rounded-xl flex shadow-sm">
                    {[1, 7, 30, 90].map(d => (
                        <button key={d} onClick={() => setDays(d)}
                            className={clsx(
                                "px-5 py-1.5 text-xs font-bold rounded-lg transition-all font-mono",
                                days === d 
                                    ? "bg-brand-500/10 text-brand-400 shadow-sm border border-brand-500/20" 
                                    : "text-surface-500 hover:text-surface-200 hover:bg-white/5"
                            )}>
                            {d}D
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Bar */}
            <div className="relative z-20 glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Custom Dropdown */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest pl-1">Target Asset</span>
                        <AssetSelect value={coin} onChange={setCoin} />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest pl-1">Data Source</span>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-900/50 border border-white/5 text-sm font-mono text-surface-300">
                            <span className={clsx("w-2 h-2 rounded-full", isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500")}></span>
                            {isLoading ? "SYNCING" : "LIVE"}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 self-end md:self-center">
                   {isRefetching && <RefreshCw size={16} className="animate-spin text-brand-500" />}
                   
                   <button
                        onClick={() => !isTracking && setIsConfirmOpen(true)}
                        disabled={isTracking || trackMutation.isPending}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all border",
                            isTracking 
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 cursor-default" 
                                : "bg-brand-600 text-white border-brand-600 hover:bg-brand-500 hover:border-brand-500 shadow-lg shadow-brand-900/20 active:translate-y-0.5"
                        )}
                   >
                       {isTracking ? <><Check size={18} /> Tracking </> : <><Plus size={18} /> Track Asset</>}
                   </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <MetricCard 
                    label="Last Price" 
                    value={latest?.price || 0} 
                    prefix="$" 
                    type="currency"
                    loading={isLoading} 
                />
                <MetricCard 
                    label="24h Volume" 
                    value={latest?.volume || 0} 
                    prefix="$" 
                    type="compact"
                    loading={isLoading} 
                />
                <MetricCard 
                    label="Trend Signal" 
                    value={marketSignal.text} 
                    valueColor={marketSignal.color}
                    loading={isLoading}
                    tooltip={signalTooltip}
                />
            </div>

            {/* Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="relative z-0 glass-panel p-1 rounded-2xl relative min-h-[450px]"
            >
                <div className="p-6">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-surface-400 text-sm font-medium gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-r-2 border-brand-500 border-transparent"></div>
                            <span className="font-mono text-xs tracking-widest opacity-70">INITIALIZING FEED...</span>
                        </div>
                    ) : data && <MainChart data={data} />}
                </div>
            </motion.div>

            {/* Track Modal */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                    trackMutation.mutate(
                        { coin_id: coin, vs_currency: 'usd' }, 
                        {
                            onSuccess: () => {
                                showToast(`Now tracking ${coin.toUpperCase()}`, 'success');
                                setIsConfirmOpen(false);
                            },
                            onError: () => {
                                showToast('Failed to start tracking. Server might be busy.', 'error');
                            }
                        }
                    );
                }}
                title={`Track ${coin.toUpperCase()}?`}
                message={`This will start a persistent background worker to poll ${coin} data every 5 minutes. Historical data will be backfilled automatically.`}
                confirmText="Start Tracking"
            />
        </div>
    );
};