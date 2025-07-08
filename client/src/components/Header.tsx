import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import LiveClock from './LiveClock';
import ThemeSwitch from './ThemeSwitch';
import AdminLoginModal from './AdminLoginModal';

export default function Header() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [, setLocation] = useLocation();
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const pressStartTime = useRef<number>(0);

  const handleMouseDown = () => {
    pressStartTime.current = Date.now();
    pressTimer.current = setTimeout(() => {
      setShowAdminLogin(true);
    }, 1000); // 1 second long press
  };

  const handleMouseUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleTouchStart = () => {
    pressStartTime.current = Date.now();
    pressTimer.current = setTimeout(() => {
      setShowAdminLogin(true);
    }, 1000); // 1 second long press
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleAdminLoginSuccess = () => {
    setLocation('/admin');
  };

  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  return (
    <>
      <header className="w-full py-2 border-b theme-border">
        <div className="max-w-5xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-sequel">
              Noah{' '}
              <span 
                className="text-foreground/75 dark:text-foreground/90 cursor-pointer select-none"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                title="Long press for admin access"
              >
                Ojile
              </span>
            </h1>
            <div className="text-xs font-mono text-secondary border-l theme-border pl-2 ml-1">
              BSc Computer Science (2025)
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <LiveClock />
            <ThemeSwitch />
          </div>
        </div>
      </header>

      <AdminLoginModal 
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </>
  );
}