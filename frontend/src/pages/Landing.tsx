import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Lock, Zap, ChevronRight } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-slate-200 bg-white">
        {/* Technical Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-600 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              SYSTEM OPERATIONAL
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
              Institutional-Grade <br />
              <span className="text-primary-600">Market Intelligence.</span>
            </h1>
            
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Eliminate noise. A dedicated terminal for tracking crypto assets with 
              idempotent data pipelines and real-time visualization.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-slate-900 px-8 font-medium text-white shadow-lg transition-all duration-300 hover:bg-slate-800 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                <span className="mr-2">Initialize Terminal</span>
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              
              <a href="https://github.com/your-repo" target="_blank" rel="noreferrer" className="px-8 py-3 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                View Documentation
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
            {[
                { label: 'Latency', val: '< 60ms' },
                { label: 'Uptime', val: '99.9%' },
                { label: 'Data Source', val: 'CoinGecko' },
                { label: 'Update Cycle', val: '5 Min' },
            ].map((stat, i) => (
                <div key={i} className="py-6 text-center">
                    <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">{stat.val}</p>
                </div>
            ))}
        </div>
      </div>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: <BarChart3 className="text-primary-600" />, 
              title: "Granular Analytics", 
              desc: "High-fidelity charting with automated polling and caching via TanStack Query." 
            },
            { 
              icon: <Zap className="text-amber-500" />, 
              title: "Idempotent Data", 
              desc: "Backend pipelines ensure zero-duplicate data ingestion regardless of network retries." 
            },
            { 
              icon: <Lock className="text-emerald-500" />, 
              title: "Secure Architecture", 
              desc: "Firebase Authentication paired with JWT middleware protection on all API endpoints." 
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:border-primary-200 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary-50 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      <footer className="py-10 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2025 Crypto Analytics Platform. Technical Test Build.</p>
      </footer>
    </div>
  );
};