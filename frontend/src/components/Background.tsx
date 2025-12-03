export const Background = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-surface-50">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
    <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
  </div>
);