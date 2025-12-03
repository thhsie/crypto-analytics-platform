import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Background } from './Background';

export const MainLayout = () => {
  return (
    <div className="relative min-h-screen text-slate-900 font-sans">
      <Background />
      <Navbar />
      {/* pt-20 adds top padding equal to Navbar height + spacing */}
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        <Outlet />
      </main>
    </div>
  );
};