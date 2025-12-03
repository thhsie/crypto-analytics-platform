import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const MainLayout = () => {
  return (
    <div className="relative min-h-screen text-slate-900 font-sans selection:bg-primary-100 selection:text-primary-700">
      {/* Technical Grid Background */}
      <div className="fixed inset-0 -z-10 bg-slate-50">
         <div className="absolute inset-0 bg-grid-pattern opacity-[0.4]" />
      </div>
      
      <Navbar />
      
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <Outlet />
      </main>
    </div>
  );
};