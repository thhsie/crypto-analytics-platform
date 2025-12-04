export const Background = () => (
  <div className="fixed inset-0 -z-10 bg-surface-950">
    {/* 1. Grid Layer */}
    <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />

    {/* 2. Glow Layer */}
    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-900/20 rounded-full blur-[120px] animate-blob pointer-events-none" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-blob animation-delay-4000 pointer-events-none" />
  </div>
);