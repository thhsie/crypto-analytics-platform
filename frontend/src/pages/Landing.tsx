import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-surface-50 pt-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
            The Market, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-teal-400">
              Without the Noise.
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop tab-switching. Get clarity. Track your favorite crypto pairs in one calm, real-time interface designed for focus.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-brand-500/20 hover:bg-brand-700 hover:scale-105 transition-all"
          >
            Get Started <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        {[
          { icon: <BarChart3 />, title: "Real-time Analytics", desc: "Live price and volume data streaming directly to your dashboard." },
          { icon: <Zap />, title: "Instant Updates", desc: "5-minute granularity updates ensure you never miss a market move." },
          { icon: <ShieldCheck />, title: "Secure & Private", desc: "Your portfolio settings follow you securely across devices." }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="glass p-8 rounded-3xl text-left hover:border-brand-200 transition-colors"
          >
            <div className="bg-brand-50 w-12 h-12 rounded-xl flex items-center justify-center text-brand-600 mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-slate-500">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};