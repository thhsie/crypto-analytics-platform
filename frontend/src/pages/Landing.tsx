import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Lock, Zap, ChevronRight } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen font-sans selection:bg-brand-500/30 selection:text-brand-100">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-900/50 border border-white/10 text-xs font-mono font-bold text-brand-400 mb-8 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              READY TO GO
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
              Trusted <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
                Market Information.
              </span>
            </h1>
            
            <p className="text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Eliminate noise. A dedicated terminal for tracking crypto assets with 
              idempotent data pipelines and real-time visualization.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-white px-8 font-bold text-surface-950 shadow-xl shadow-white/10 transition-all duration-300 hover:scale-[1.02] focus:outline-none"
              >
                <span className="mr-2">Get Started</span>
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              
              <a href="https://github.com/thhsie/crypto-analytics-platform" className="px-8 py-3 rounded-xl border border-white/10 text-surface-300 font-bold hover:bg-white/5 transition-colors">
                View Documentation
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <div className="border-b border-white/5 bg-surface-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {[
                { label: 'Latency', val: '< 60ms' },
                { label: 'Integrity', val: 'Idempotent' },
                { label: 'Data Source', val: 'CoinGecko' },
                { label: 'Update Cycle', val: '5 Min' },
            ].map((stat, i) => (
                <div key={i} className="py-6 text-center">
                    <p className="text-xs font-mono text-surface-500 uppercase tracking-wider font-bold">{stat.label}</p>
                    <p className="text-lg font-bold text-white mt-1 tabular">{stat.val}</p>
                </div>
            ))}
        </div>
      </div>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: <BarChart3 className="text-brand-400" />, 
              title: "Granular Analytics", 
              desc: "High-fidelity charting with automated polling and caching via TanStack Query." 
            },
            { 
              icon: <Zap className="text-amber-400" />, 
              title: "Idempotent Data", 
              desc: "Backend pipelines ensure zero-duplicate data ingestion regardless of network retries." 
            },
            { 
              icon: <Lock className="text-emerald-400" />, 
              title: "Secure Architecture", 
              desc: "Firebase Authentication paired with JWT middleware protection on all API endpoints." 
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="glass-panel p-8 rounded-2xl hover:border-brand-500/20 hover:shadow-2xl hover:shadow-brand-900/20 transition-all group"
            >
              <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-surface-400 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      <footer className="py-10 border-t border-white/5 text-center text-surface-500 text-sm font-medium">
        <p>© 2025 Crypto Analytics Platform. Technical Test Build.</p>
      </footer>
    </div>
  );
};