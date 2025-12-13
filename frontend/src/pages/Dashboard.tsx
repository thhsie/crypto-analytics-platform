import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, Check, Plus, RefreshCw, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';

// Config & Hooks
import { auth } from '../config/firebase';
import { useAnalytics, useTrackPair, useTrackedPairs, useStopTracking } from '../hooks/useAnalytics';
import { useToast } from '../context/ToastContext';

// Components
import { MetricCard } from '../components/MetricCard';
import { MainChart } from '../components/MainChart';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AssetSelect } from '../components/AssetSelect';

export const Dashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    // Local State
    const [coin, setCoin] = useState('bitcoin');
    const [days, setDays] = useState(7);
    const [actionModal, setActionModal] = useState<'track' | 'stop' | null>(null);

    // Auth Guard
    useEffect(() => {
        const unsub = auth.onAuthStateChanged(u => !u && navigate('/login'));
        return () => unsub();
    }, [navigate]);

    // Data Hooks
    const { data: analyticsResponse, isLoading, isRefetching } = useAnalytics(coin, 'usd', days);
    const { data: trackedPairs } = useTrackedPairs();
    const trackMutation = useTrackPair();
    const stopMutation = useStopTracking();

    // Derived State
    const chartData = analyticsResponse?.data || [];
    const isSyncing = analyticsResponse?.status === 'syncing';
    const latest = chartData.length > 0 ? chartData[chartData.length - 1] : null;
    const isTracking = trackedPairs?.some((p) => p.coin_id === coin);

    // Market Signal Logic (SMA)
    const marketSignal = useMemo(() => {
        if (!chartData || chartData.length === 0) return { text: "-", color: "" };

        const currentPrice = chartData[chartData.length - 1].price;
        const sum = chartData.reduce((acc, curr) => acc + curr.price, 0);
        const average = sum / chartData.length;
        const diffPercent = ((currentPrice - average) / average) * 100;

        if (diffPercent > 5) return { text: "Strong Buy", color: "text-emerald-500" };
        if (diffPercent > 0) return { text: "Buy", color: "text-emerald-400" };
        if (diffPercent < -5) return { text: "Strong Sell", color: "text-red-500" };
        if (diffPercent < 0) return { text: "Sell", color: "text-red-400" };
        
        return { text: "Neutral", color: "text-surface-400" };
    }, [chartData]);

    const signalTooltip = `ALGORITHM: Simple Moving Average (SMA)\n\nWe calculate the average price over the selected timeframe (e.g., ${days} Days) and compare it to the current price.\n\n• Strong Buy: Price is > 5% above average\n• Buy: Price is > 0% above average\n• Sell: Price is below average\n• Strong Sell: Price is > 5% below average\n\nThis identifies if the asset is overbought or oversold relative to its recent baseline.`;

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
                            <span className={clsx("w-2 h-2 rounded-full", (isLoading || isSyncing) ? "bg-amber-500 animate-pulse" : "bg-emerald-500")}></span>
                            {(isLoading || isSyncing) ? "SYNCING" : "LIVE"}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 self-end md:self-center">
                   {isRefetching && <RefreshCw size={16} className="animate-spin text-brand-500" />}
                   
                   {/* Action Button */}
                   <button
                        onClick={() => setActionModal(isTracking ? 'stop' : 'track')}
                        disabled={trackMutation.isPending || stopMutation.isPending}
                        className={clsx(
                            "relative group flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold transition-all border min-w-[160px]",
                            isTracking 
                                // STATE: TRACKING -> Green Default / Red Hover
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400" 
                                // STATE: NOT TRACKING -> Brand Blue
                                : "bg-brand-600 text-white border-brand-600 hover:bg-brand-500 hover:border-brand-500 shadow-lg shadow-brand-900/20 active:translate-y-0.5"
                        )}
                   >
                       {(trackMutation.isPending || stopMutation.isPending) ? (
                           <span className="flex items-center gap-2 opacity-70 cursor-wait">
                               <RefreshCw size={18} className="animate-spin" /> Processing
                           </span>
                       ) : isTracking ? (
                           <>
                               <span className="flex items-center gap-2 group-hover:hidden animate-fade-in">
                                   <Check size={18} /> Active Tracking
                               </span>
                               <span className="hidden group-hover:flex items-center gap-2 animate-fade-in">
                                   <X size={18} /> Stop Tracking
                               </span>
                           </>
                       ) : (
                           <span className="flex items-center gap-2">
                               <Plus size={18} /> Track Asset
                           </span>
                       )}
                   </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <MetricCard 
                    label="Last Price" 
                    value={latest?.price || 0} 
                    prefix="$" 
                    type="currency"
                    loading={isLoading && !latest} 
                    delay={0.1} 
                />
                <MetricCard 
                    label="24h Volume" 
                    value={latest?.volume || 0} 
                    prefix="$" 
                    type="compact"
                    loading={isLoading && !latest} 
                    delay={0.2} 
                />
                <MetricCard 
                    label="Trend Signal" 
                    value={(!latest && isLoading) ? "-" : marketSignal.text} 
                    valueColor={marketSignal.color}
                    loading={isLoading && !latest} 
                    delay={0.3} 
                    tooltip={signalTooltip}
                />
            </div>

            {/* Chart Section */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="relative z-0 glass-panel p-1 rounded-2xl relative min-h-[450px]"
            >
                {/* Backfill Badge (Smart Sync Indicator) */}
                {isSyncing && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg text-xs font-bold animate-pulse backdrop-blur-md">
                        <Loader2 size={14} className="animate-spin" />
                        BACKFILLING HISTORY...
                    </div>
                )}

                <div className="p-6">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-surface-400 text-sm font-medium gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-r-2 border-brand-500 border-transparent"></div>
                            <span className="font-mono text-xs tracking-widest opacity-70">INITIALIZING FEED...</span>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-surface-400 text-sm font-medium gap-3">
                            <Loader2 size={32} className="animate-spin text-brand-500" />
                            <span className="font-mono text-xs tracking-widest opacity-70">
                                INITIALIZING DATA TRACKING...
                            </span>
                        </div>
                    ) : (
                        <MainChart data={chartData} />
                    )}
                </div>
            </motion.div>

            {/* Unified Action Modal */}
            <ConfirmDialog
                isOpen={!!actionModal}
                onClose={() => setActionModal(null)}
                isDestructive={actionModal === 'stop'}
                title={actionModal === 'stop' ? `Stop ${coin.toUpperCase()}?` : `Track ${coin.toUpperCase()}?`}
                message={actionModal === 'stop' 
                    ? `This will stop the background data collection for ${coin}. The data will remain in the database until it expires.`
                    : `This will start a persistent background worker to poll ${coin} data every 5 minutes. Historical data will be backfilled automatically.`
                }
                confirmText={actionModal === 'stop' ? "Stop Tracking" : "Start Tracking"}
                onConfirm={() => {
                    if (actionModal === 'stop') {
                        stopMutation.mutate(
                            { coin_id: coin, vs_currency: 'usd' }, 
                            {
                                onSuccess: () => { 
                                    showToast(`Stopped tracking ${coin.toUpperCase()}`, 'success'); 
                                    setActionModal(null); 
                                },
                                onError: () => showToast("Failed to stop tracking", 'error')
                            }
                        );
                    } else {
                        trackMutation.mutate(
                            { coin_id: coin, vs_currency: 'usd' }, 
                            {
                                onSuccess: () => { 
                                    showToast(`Now tracking ${coin.toUpperCase()}`, 'success'); 
                                    setActionModal(null); 
                                },
                                onError: (err: any) => {
                                    const statusCode = err.response?.status;
                                    const backendMsg = err.response?.data?.detail;

                                    if (statusCode === 429) {
                                        showToast("⏳ Too fast! CoinGecko is cooling down. Wait 60s.", 'error');
                                    } else if (statusCode === 404) {
                                        showToast(`❌ Asset '${coin}' not found. Check spelling.`, 'error');
                                    } else {
                                        // Fallback to backend message or generic error
                                        showToast(backendMsg || "Failed to start stream", 'error');
                                    }
                                }
                            }
                        );
                    }
                }}
            />
        </div>
    );
};