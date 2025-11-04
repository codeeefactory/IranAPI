import { useEffect, useState } from "react";

export const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 animate-fade-out overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse [animation-delay:1000ms]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse [animation-delay:500ms]" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Main loading spinner with gradient */}
        <div className="relative">
          {/* Outer rotating rings */}
          <div className="absolute inset-0 w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/60 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-primary/40 border-l-primary/20 animate-spin [animation-duration:2s] [animation-direction:reverse]" />
          </div>

          {/* Glowing center orb */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute w-16 h-16 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-full animate-pulse shadow-[0_0_50px_rgba(var(--primary),0.5)]" />
            <div className="absolute w-12 h-12 bg-gradient-to-br from-primary/90 to-primary/70 rounded-full animate-pulse [animation-delay:300ms]" />
            <div className="absolute w-8 h-8 bg-primary rounded-full animate-pulse [animation-delay:600ms]" />
            
            {/* Sparkle effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-foreground rounded-full animate-ping" />
            </div>
          </div>

          {/* Orbiting particles */}
          <div className="absolute inset-0 w-32 h-32 animate-spin [animation-duration:3s]">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1/2 shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-primary/60 rounded-full -translate-x-1/2 shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          </div>
          <div className="absolute inset-0 w-32 h-32 animate-spin [animation-duration:2s] [animation-direction:reverse]">
            <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-primary/80 rounded-full -translate-y-1/2 shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
            <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-primary/40 rounded-full -translate-y-1/2 shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
          </div>
        </div>

        {/* Brand text with gradient */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent animate-pulse">
            ایران‌ای‌پی‌آی
          </h2>
          
          {/* Loading text with animated dots */}
          <div className="flex items-center gap-2">
            <span className="text-base text-muted-foreground">در حال بارگذاری</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-[shimmer_1.5s_ease-in-out_infinite] [animation-delay:200ms]" 
                 style={{ 
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 1.5s ease-in-out infinite'
                 }} 
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
