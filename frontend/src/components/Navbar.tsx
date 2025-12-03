import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LineChart, LogOut, User as UserIcon } from 'lucide-react';
import { auth } from '../config/firebase';
import clsx from 'clsx';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!auth.currentUser;

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/40 bg-white/70 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-brand-500 to-brand-400 p-2 rounded-lg text-white shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <LineChart size={20} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            Crypto<span className="text-brand-600">Flow</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <>
              <Link 
                to="/dashboard" 
                className={clsx(
                  "text-sm font-medium transition-colors hover:text-brand-600",
                  location.pathname === '/dashboard' ? "text-brand-600" : "text-slate-500"
                )}
              >
                Dashboard
              </Link>
              <div className="h-4 w-px bg-slate-200"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition group"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              <UserIcon size={16} />
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};