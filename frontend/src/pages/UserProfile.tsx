import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { useTrackedPairs, useStopTracking } from '../hooks/useAnalytics';
import { LogOut, Trash2, TrendingUp } from 'lucide-react';

export const UserProfile = () => {
    const navigate = useNavigate();
    const { data: pairs, isLoading } = useTrackedPairs();
    const stopMutation = useStopTracking();

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/');
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Portfolio Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your tracked assets and account</p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </header>

            <section className="glass-panel p-6 rounded-xl">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-primary-600"/> 
                    Active Subscriptions
                </h2>
                
                {isLoading ? (
                     <div className="space-y-3">
                        {[1,2].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
                     </div>
                ) : pairs && pairs.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Pair</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {pairs.map((pair) => (
                                    <tr key={pair._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono font-medium text-slate-900 uppercase">
                                                {pair.coin_id} / {pair.vs_currency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => stopMutation.mutate({ coin_id: pair.coin_id, vs_currency: pair.vs_currency })}
                                                className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-md"
                                                title="Stop Tracking"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        No active pairs. Go to the dashboard to start tracking.
                    </div>
                )}
            </section>
        </div>
    );
};