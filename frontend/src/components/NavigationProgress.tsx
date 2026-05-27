import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationProgress() {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(false);
  const prevPath = useRef<string>(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      setLoading(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setLoading(false), 400);
      prevPath.current = pathname;
    }
    return () => clearTimeout(timerRef.current);
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none">
      <div
        className={`h-full bg-gradient-to-r from-royal-600 via-gold-500 to-royal-600 transition-all duration-[400ms] ease-out ${
          loading ? 'w-[70%] opacity-100' : 'w-0 opacity-0'
        }`}
        style={{ boxShadow: '0 0 12px rgba(139,92,246,0.6), 0 0 24px rgba(212,168,83,0.3)' }}
      />
    </div>
  );
}