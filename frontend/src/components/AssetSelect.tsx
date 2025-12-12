import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Coins, Search } from 'lucide-react';
import clsx from 'clsx';
import { useCoinList } from '../hooks/useAnalytics';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export const AssetSelect = ({ value, onChange }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    
    const { data: assets, isLoading } = useCoinList();

    // Fallback if loading or error
    const displayAssets = assets || [{ id: value, symbol: '...', name: 'Loading...', image: '' }];
    const selectedAsset = displayAssets.find(a => a.id === value) || displayAssets[0];

    const filteredAssets = displayAssets.filter(a => 
        a.name.toLowerCase().includes(search.toLowerCase()) || 
        a.symbol.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-64" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-surface-900/50 border border-white/10 hover:border-white/20 text-white py-2.5 px-4 rounded-xl transition-all shadow-sm group"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {selectedAsset.image ? (
                        <img src={selectedAsset.image} alt={selectedAsset.symbol} className="w-6 h-6 rounded-full" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-[10px] font-bold text-brand-400">
                            {selectedAsset.symbol?.[0]}
                        </div>
                    )}
                    <div className="flex flex-col items-start leading-none gap-1 truncate">
                        <span className="text-sm font-bold tracking-tight truncate">{selectedAsset.name}</span>
                        <span className="text-[10px] text-surface-400 font-mono">{selectedAsset.symbol}-USD</span>
                    </div>
                </div>
                <ChevronDown size={16} className={clsx("text-surface-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-surface-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] py-1"
                    >
                        {/* Search Bar */}
                        <div className="px-3 py-2 border-b border-white/5">
                             <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-500"/>
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Search asset..." 
                                    className="w-full bg-surface-950/50 border border-white/5 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white placeholder:text-surface-600 focus:outline-none focus:border-brand-500/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                             </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="p-4 text-center text-xs text-surface-500">Loading assets...</div>
                            ) : (
                                filteredAssets.map((asset) => (
                                    <button
                                        key={asset.id}
                                        onClick={() => { onChange(asset.id); setIsOpen(false); setSearch(""); }}
                                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {asset.image ? (
                                                <img src={asset.image} className="w-6 h-6 rounded-full grayscale group-hover:grayscale-0 transition-all" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400">
                                                    <Coins size={14} />
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <p className={clsx("text-sm font-medium", asset.id === value ? "text-brand-400" : "text-white")}>
                                                    {asset.name}
                                                </p>
                                                <p className="text-[10px] text-surface-500 font-mono">{asset.symbol}</p>
                                            </div>
                                        </div>
                                        {asset.id === value && <Check size={14} className="text-brand-400" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};