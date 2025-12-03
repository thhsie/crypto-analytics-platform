import { Link } from 'react-router-dom';

export const NotFound = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
    <h1 className="text-9xl font-mono font-bold text-slate-200">404</h1>
    <h2 className="text-2xl font-bold text-slate-900 mt-4">Page Not Found</h2>
    <p className="text-slate-500 mt-2 mb-8">The requested data stream could not be located.</p>
    <Link 
      to="/" 
      className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
    >
      Return to Terminal
    </Link>
  </div>
);