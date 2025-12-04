import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Coins } from 'lucide-react';
import clsx from 'clsx';

// Curated Top Assets (Mapped to CoinGecko IDs)
const ASSETS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', color: '#14F195' },
    { id: 'ripple', symbol: 'XRP', name: 'Ripple', color: '#23292F' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', color: '#0033AD' },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', color: '#E6007A' },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633' },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', color: '#2A5ADA' },
];

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export const AssetSelect = ({ value, onChange }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedAsset = ASSETS.find(a => a.id === value) || ASSETS[0];

    // Close on click outside
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
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-surface-900/50 border border-white/10 hover:border-white/20 text-white py-2.5 px-4 rounded-xl transition-all shadow-sm group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 text-xs font-bold" style={{ color: selectedAsset.color }}>
                        {selectedAsset.symbol[0]}
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1">
                        <span className="text-sm font-bold tracking-tight">{selectedAsset.name}</span>
                        <span className="text-[10px] text-surface-400 font-mono">{selectedAsset.symbol}-USD</span>
                    </div>
                </div>
                <ChevronDown 
                    size={16} 
                    className={clsx("text-surface-500 transition-transform duration-200", isOpen && "rotate-180")} 
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-surface-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] py-1"
                    >
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            <div className="px-3 py-2 text-[10px] font-bold text-surface-500 uppercase tracking-wider bg-surface-950/30">
                                Select Asset
                            </div>
                            {ASSETS.map((asset) => (
                                <button
                                    key={asset.id}
                                    onClick={() => {
                                        onChange(asset.id);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400 group-hover:text-white transition-colors">
                                            <Coins size={14} />
                                        </div>
                                        <div className="text-left">
                                            <p className={clsx("text-sm font-medium", asset.id === value ? "text-brand-400" : "text-white")}>
                                                {asset.name}
                                            </p>
                                            <p className="text-[10px] text-surface-500 font-mono">{asset.symbol}</p>
                                        </div>
                                    </div>
                                    {asset.id === value && <Check size={14} className="text-brand-400" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};