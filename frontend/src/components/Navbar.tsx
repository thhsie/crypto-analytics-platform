import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, User, LogOut, ChevronDown } from 'lucide-react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ConfirmDialog } from './ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  
  // States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignOutConfirm, setIsSignOutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setIsMenuOpen(false);
    navigate('/'); 
  };

  const NavItem = ({ to, label, active }: { to: string; label: string; active: boolean }) => (
    <Link
      to={to}
      className={clsx(
        "text-sm font-medium px-3 py-2 rounded-lg transition-colors",
        active 
          ? "bg-brand-500/10 text-brand-400" 
          : "text-surface-400 hover:bg-surface-800 hover:text-white"
      )}
    >
      {label}
    </Link>
  );

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 h-16 border-b border-white/5 bg-surface-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white p-1.5 rounded-lg shadow-lg shadow-brand-900/50">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white tracking-tight text-lg">
              Crypto<span className="text-brand-500">Terminal</span>
            </span>
          </Link>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            
            {user ? (
              <>
                <div className="hidden md:flex gap-1">
                  <NavItem to="/dashboard" label="Market" active={location.pathname === '/dashboard'} />
                </div>

                <div className="w-px h-6 bg-surface-800 mx-1" />

                {/* Profile Dropdown */}
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-surface-800 transition-colors border border-transparent hover:border-surface-700"
                  >
                    <div className="h-8 w-8 bg-surface-800 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-1 ring-white/10">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <ChevronDown size={14} className={`text-surface-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-surface-900 border border-surface-800 rounded-xl shadow-2xl overflow-hidden py-1 z-50"
                      >
                        <div className="px-4 py-3 border-b border-surface-800/50">
                          <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">Signed in as</p>
                          <p className="text-sm font-bold text-white truncate mt-0.5">{user.email}</p>
                        </div>
                        
                        <Link 
                          to="/profile" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-300 hover:bg-surface-800 transition-colors"
                        >
                          <User size={16} /> Portfolio Settings
                        </Link>

                        <div className="border-t border-surface-800/50 my-1" />
                        
                        <button 
                          onClick={() => setIsSignOutConfirm(true)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors font-medium"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="text-sm font-bold bg-white text-surface-950 px-5 py-2 rounded-lg hover:bg-surface-200 transition-colors shadow-lg shadow-white/5"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Sign Out Modal */}
      <ConfirmDialog
        isOpen={isSignOutConfirm}
        onClose={() => setIsSignOutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out?"
        message="Your active session will be closed."
        confirmText="Sign Out"
        isDestructive={true} 
      />
    </>
  );
};