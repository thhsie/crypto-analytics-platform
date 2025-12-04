import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Background } from './Background';

export const MainLayout = () => {
  return (
    <div className="relative min-h-screen font-sans selection:bg-brand-500/30 selection:text-brand-900 dark:selection:text-brand-100">
      <Background />
      <Navbar />
      
      {/* Content Container */}
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <Outlet />
      </main>
    </div>
  );
};