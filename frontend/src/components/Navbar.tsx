import { Link, useLocation } from 'react-router-dom';
import { Activity, User } from 'lucide-react';
import { auth } from '../config/firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import clsx from 'clsx';

export const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const NavItem = ({ to, label, active }: { to: string; label: string; active: boolean }) => (
    <Link
      to={to}
      className={clsx(
        "text-sm font-medium px-3 py-2 rounded-lg transition-colors",
        active 
          ? "bg-primary-50 text-primary-700" 
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      )}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <div className="bg-primary-600 text-white p-1.5 rounded-lg">
            <Activity size={18} />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">
            Crypto<span className="text-primary-600">Terminal</span>
          </span>
        </Link>
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NavItem to="/dashboard" label="Market" active={location.pathname === '/dashboard'} />
              <NavItem to="/profile" label="Portfolio" active={location.pathname === '/profile'} />
              <div className="w-px h-4 bg-slate-300 mx-2" />
              <div className="flex items-center gap-3 pl-2">
                <div className="text-xs text-right hidden sm:block">
                  <p className="font-medium text-slate-900">{user.email?.split('@')[0]}</p>
                  <p className="text-slate-500 text-[10px]">Pro Plan</p>
                </div>
                <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
                  <User size={16} />
                </div>
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className="text-sm font-semibold bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};