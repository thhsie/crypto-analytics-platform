import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { motion } from 'framer-motion';

export const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, go to dashboard
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
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 rounded-3xl max-w-md w-full text-center shadow-2xl shadow-brand-900/5"
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
        <p className="text-slate-500 mb-8">Sign in to access your portfolio</p>
        
        <button
          onClick={handleLogin}
          className="w-full bg-white border border-slate-200 text-slate-700 py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all group"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
          <span>Continue with Google</span>
        </button>
      </motion.div>
    </div>
  );
};