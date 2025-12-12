import { useTrackedPairs, useStopTracking } from '../hooks/useAnalytics';
import { Trash2, TrendingUp, Shield, Activity } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const UserProfile = () => {
    const [deleteTarget, setDeleteTarget] = useState<{coin_id: string, vs_currency: string} | null>(null);
    const { data: pairs, isLoading } = useTrackedPairs();
    const stopMutation = useStopTracking();

    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight font-display">Portfolio Settings</h1>
                    <p className="text-surface-400 mt-2 font-medium">Manage your active data subscriptions</p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 text-brand-400 rounded-full text-xs font-bold border border-brand-500/20 tracking-wider">
                    <Shield size={14} /> DEMO ACCOUNT
                </div>
            </header>

            <section className="glass-panel p-8 rounded-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3 font-display">
                        <TrendingUp size={22} className="text-brand-500"/> 
                        Active Streams
                    </h2>
                    <span className="text-xs font-bold text-surface-500 uppercase tracking-widest bg-surface-950/50 px-3 py-1 rounded-lg border border-white/5">
                        {pairs?.length || 0} Assets
                    </span>
                </div>
                
                {isLoading ? (
                     <div className="space-y-4">
                        {[1,2,3].map(i => <div key={i} className="h-16 bg-surface-900/50 rounded-xl animate-pulse border border-white/5" />)}
                     </div>
                ) : pairs && pairs.length > 0 ? (
                    <>
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-hidden rounded-xl border border-white/5 bg-surface-950/20">
                            <table className="min-w-full divide-y divide-white/5">
                                <thead className="bg-surface-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-surface-500 uppercase tracking-widest font-sans">Asset Pair</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-surface-500 uppercase tracking-widest font-sans">Status</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-bold text-surface-500 uppercase tracking-widest font-sans">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pairs.map((pair) => (
                                        <tr key={pair._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400 group-hover:text-white transition-colors">
                                                        <Activity size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-display font-bold text-white text-sm">
                                                            {pair.coin_id.charAt(0).toUpperCase() + pair.coin_id.slice(1)}
                                                        </div>
                                                        <div className="font-mono text-xs text-surface-500 uppercase mt-0.5">
                                                            {pair.vs_currency}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wide uppercase">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Streaming
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => setDeleteTarget({ coin_id: pair.coin_id, vs_currency: pair.vs_currency })}
                                                    className="text-surface-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg group-hover:scale-105"
                                                    title="Stop Tracking"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    {/* Mobile View */}
                        <div className="md:hidden space-y-3">
                            {pairs.map((pair) => (
                                <div key={pair._id} className="bg-surface-950/40 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400">
                                            <Activity size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">
                                                {pair.coin_id.toUpperCase()}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono text-surface-500 uppercase">{pair.vs_currency}</span>
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                                                    LIVE
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDeleteTarget({ coin_id: pair.coin_id, vs_currency: pair.vs_currency })}
                                        className="p-2 text-surface-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-6 bg-surface-900/20 rounded-xl border border-dashed border-white/10 text-center">
                        <div className="w-16 h-16 bg-surface-800/50 rounded-full flex items-center justify-center mb-4">
                            <Activity size={32} className="text-surface-600" />
                        </div>
                        <p className="text-surface-400 font-medium mb-1">No active data streams found.</p>
                        <p className="text-surface-600 text-sm mb-6 max-w-sm">Start tracking assets from the dashboard to see them listed here.</p>
                        <button onClick={() => window.location.href = '/dashboard'} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-900/20">
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </section>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) stopMutation.mutate(deleteTarget);
                }}
                title="Stop Data Stream?"
                message={`Are you sure you want to stop tracking ${deleteTarget?.coin_id.toUpperCase()}? This will terminate the background worker for this asset.`}
                confirmText="Stop Tracking"
                isDestructive={true}
            />
        </div>
    );
};