import { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { MobileDashboard } from './MobileDashboard';

export function ResponsiveDashboard() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Use lg breakpoint for dashboard switch
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <MobileDashboard /> : <Dashboard />;
}
