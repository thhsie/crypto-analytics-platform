import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) navigate('/dashboard');
  }, [navigate]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-10 rounded-3xl max-w-md w-full text-center relative z-10 border-white/10"
      >
        <div className="mx-auto w-14 h-14 bg-surface-800 rounded-2xl flex items-center justify-center text-brand-400 mb-6 shadow-lg shadow-black/20">
          <Activity size={28} />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-surface-400 mb-8 font-medium">Sign in to access your terminal</p>
        
        <button
          onClick={handleLogin}
          className="w-full bg-white text-surface-900 py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-surface-200 transition-all group shadow-lg shadow-white/5"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>
      </motion.div>
    </div>
  );
};