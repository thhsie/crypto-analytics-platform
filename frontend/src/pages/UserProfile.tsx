import { useState } from 'react';
import { useTrackedPairs, useStopTracking } from '../hooks/useAnalytics';
import { Trash2, TrendingUp, Shield, Activity, Square, CheckSquare } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import clsx from 'clsx';

export const UserProfile = () => {
    // State
    const [deleteTarget, setDeleteTarget] = useState<{coin_id: string, vs_currency: string} | null>(null);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Hooks
    const { data: pairs, isLoading } = useTrackedPairs();
    const stopMutation = useStopTracking();
    const { showToast } = useToast();

    // Handlers
    const toggleSelect = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    const toggleAll = () => {
        if (!pairs) return;
        if (selected.size === pairs.length) setSelected(new Set());
        else setSelected(new Set(pairs.map(p => p._id)));
    };

    const handleBulkDelete = async () => {
        if (!pairs) return;
        const toDelete = pairs.filter(p => selected.has(p._id));
        
        let successCount = 0;
        for (const p of toDelete) {
            try {
                await stopMutation.mutateAsync({ coin_id: p.coin_id, vs_currency: p.vs_currency });
                successCount++;
            } catch (e) { 
                console.error(e); 
            }
        }
        
        showToast(`Stopped ${successCount} feed(s)`, 'success');
        setSelected(new Set());
        setIsBulkDeleteOpen(false);
    };

    const handleSingleDelete = () => {
        if (deleteTarget) {
            stopMutation.mutate(deleteTarget, {
                onSuccess: () => {
                    showToast(`Stopped tracking ${deleteTarget.coin_id}`, 'success');
                    setDeleteTarget(null);
                },
                onError: () => showToast("Failed to stop tracking", 'error')
            });
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-10 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight font-display">Portfolio Settings</h1>
                    <p className="text-surface-400 mt-2 font-medium">Manage your active data tracking</p>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Bulk Delete Button */}
                    {selected.size > 0 && (
                        <button 
                            onClick={() => setIsBulkDeleteOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-bold transition-all animate-fade-in"
                        >
                            <Trash2 size={16} /> Stop Selected ({selected.size})
                        </button>
                    )}
                    
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 text-brand-400 rounded-full text-xs font-bold border border-brand-500/20 tracking-wider">
                        <Shield size={14} /> DEMO ACCOUNT
                    </div>
                </div>
            </header>

            <section className="glass-panel p-6 md:p-8 rounded-2xl min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3 font-display">
                        <TrendingUp size={22} className="text-brand-500"/> 
                        Active Feeds
                    </h2>
                    <span className="text-xs font-bold text-surface-500 uppercase tracking-widest bg-surface-950/50 px-3 py-1 rounded-lg border border-white/5">
                        {pairs?.length || 0} Asset(s)
                    </span>
                </div>
                
                {isLoading ? (
                     <div className="space-y-4">
                        {[1,2,3].map(i => <div key={i} className="h-16 bg-surface-900/50 rounded-xl animate-pulse border border-white/5" />)}
                     </div>
                ) : pairs && pairs.length > 0 ? (
                    <>
                        {/* DESKTOP VIEW (Table) */}
                        <div className="hidden md:block overflow-hidden rounded-xl border border-white/5 bg-surface-950/20">
                            <table className="min-w-full divide-y divide-white/5">
                                <thead className="bg-surface-900/50">
                                    <tr>
                                        <th className="px-6 py-4 w-10">
                                            <button onClick={toggleAll} className="text-surface-500 hover:text-white transition-colors">
                                                {pairs.length > 0 && selected.size === pairs.length 
                                                    ? <CheckSquare size={20} className="text-brand-500" /> 
                                                    : <Square size={20} />}
                                            </button>
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-surface-500 uppercase tracking-widest font-sans">Asset Pair</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-surface-500 uppercase tracking-widest font-sans">Status</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-bold text-surface-500 uppercase tracking-widest font-sans">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pairs.map((pair) => (
                                        <tr key={pair._id} className={clsx("transition-colors group", selected.has(pair._id) ? "bg-brand-500/5" : "hover:bg-white/5")}>
                                            <td className="px-6 py-5">
                                                <button onClick={() => toggleSelect(pair._id)} className="text-surface-500 hover:text-white transition-colors">
                                                    {selected.has(pair._id) 
                                                        ? <CheckSquare size={20} className="text-brand-500" /> 
                                                        : <Square size={20} />}
                                                </button>
                                            </td>
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
                                                {/* FIX: Only show Trash if NO selection is active */}
                                                <button
                                                    onClick={() => setDeleteTarget({ coin_id: pair.coin_id, vs_currency: pair.vs_currency })}
                                                    className={clsx(
                                                        "text-surface-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg group-hover:scale-105",
                                                        selected.size > 0 && "invisible pointer-events-none"
                                                    )}
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

                        {/* MOBILE VIEW (Cards) */}
                        <div className="md:hidden space-y-3">
                            <div className="flex items-center justify-between px-1 mb-2">
                                <button onClick={toggleAll} className="flex items-center gap-2 text-xs font-bold text-surface-400">
                                    {pairs.length > 0 && selected.size === pairs.length 
                                        ? <CheckSquare size={16} className="text-brand-500" /> 
                                        : <Square size={16} />}
                                    Select All
                                </button>
                            </div>
                            
                            {pairs.map((pair) => (
                                <div key={pair._id} className={clsx("bg-surface-950/40 border rounded-xl p-4 flex items-center justify-between transition-colors", selected.has(pair._id) ? "border-brand-500/30 bg-brand-500/5" : "border-white/5")}>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => toggleSelect(pair._id)} className="text-surface-500 hover:text-white">
                                            {selected.has(pair._id) 
                                                ? <CheckSquare size={20} className="text-brand-500" /> 
                                                : <Square size={20} />}
                                        </button>
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
                                                    TRACKING
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* FIX: Hide on mobile too if selection active */}
                                    {selected.size === 0 && (
                                        <button
                                            onClick={() => setDeleteTarget({ coin_id: pair.coin_id, vs_currency: pair.vs_currency })}
                                            className="p-2 text-surface-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-6 bg-surface-900/20 rounded-xl border border-dashed border-white/10 text-center">
                        <div className="w-16 h-16 bg-surface-800/50 rounded-full flex items-center justify-center mb-4">
                            <Activity size={32} className="text-surface-600" />
                        </div>
                        <p className="text-surface-400 font-medium mb-1">No active data tracking found.</p>
                        <p className="text-surface-600 text-sm mb-6 max-w-sm">Start tracking assets from the dashboard to see them listed here.</p>
                        <button onClick={() => window.location.href = '/dashboard'} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-900/20">
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </section>

            {/* Single Delete Modal */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleSingleDelete}
                title="Stop Data Collection?"
                message={`Are you sure you want to stop tracking ${deleteTarget?.coin_id.toUpperCase()}? This will terminate the background worker for this asset.`}
                confirmText="Stop Tracking"
                isDestructive={true}
            />

            {/* Bulk Delete Modal */}
            <ConfirmDialog
                isOpen={isBulkDeleteOpen}
                onClose={() => setIsBulkDeleteOpen(false)}
                onConfirm={handleBulkDelete}
                title={`Stop ${selected.size} Feed(s)?`}
                message="This will stop data collection for all selected assets. You can re-enable them from the dashboard at any time."
                confirmText="Stop All"
                isDestructive={true}
            />
        </div>
    );
};